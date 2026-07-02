import {
  fetchLatestNews,
  fetchSearchNews,
} from "@/lib/api/currentsapi-news/currentsapi-news-service";
import { NewsArticle } from "@/lib/api/currentsapi-news/currentsapi-news-types";
import { logger } from "@/lib/logger";
import { useSettings } from "@/hooks/settings";
import { useJourneyStore } from "@/store/journeyStore";
import { useNewsStore } from "@/store/newsStore";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const hookLogger = logger.extend("NewsAPI");

export function useNews() {
  const { settings } = useSettings();
  const { destinationStation } = useJourneyStore();
  const newsStore = useNewsStore();
  const { i18n } = useTranslation();

  const [data, setData] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Feature Toggle Check
    if (
      !settings.enableNewsApi ||
      process.env.EXPO_PUBLIC_ENABLE_NEWS_API !== "true"
    ) {
      hookLogger.log(
        "News API is disabled via settings or environment variable.",
      );
      setData([]);
      setIsLoading(false);
      return;
    }

    const language = i18n.language.substring(0, 2); // e.g. "en-US" -> "en"
    const keyword = destinationStation?.station_ori_name;
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (keyword) {
          // Contextual News
          const cacheKey = `${keyword}-${language}`;
          const cached = newsStore.getValidSearchNews(cacheKey);

          if (cached) {
            hookLogger.log("Using cached search news");
            if (isMounted) setData(cached.news);
          } else {
            hookLogger.log(`Fetching fresh search news for: ${keyword}`);
            const result = await fetchSearchNews({
              language,
              keywords: keyword,
            });
            newsStore.setSearchNews(cacheKey, result);
            if (isMounted) setData(result.news);
          }
        } else {
          // General News
          const cacheKey = `latest-${language}`;
          const cached = newsStore.getValidLatestNews(cacheKey);

          if (cached) {
            hookLogger.log("Using cached latest news");
            if (isMounted) setData(cached.news);
          } else {
            hookLogger.log("Fetching fresh latest news");
            const result = await fetchLatestNews({
              language,
              category: "regional",
            });
            newsStore.setLatestNews(cacheKey, result);
            if (isMounted) setData(result.news);
          }
        }
      } catch (err: any) {
        hookLogger.error("Error in useNews hook:", err);
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchNews();

    return () => {
      isMounted = false;
    };
  }, [settings.enableNewsApi, destinationStation, i18n.language]); // Intentionally omitting newsStore functions to prevent infinite loops

  return { data, isLoading, error };
}
