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
  const { destinationStation, destinationMunicipality, trainId } =
    useJourneyStore();
  const newsStore = useNewsStore();
  const { i18n } = useTranslation();

  const [data, setData] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Feature Toggle Check & Active Train Check
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

    if (!trainId) {
      hookLogger.log("No train selected, skipping news fetch.");
      setData([]);
      setIsLoading(false);
      return;
    }

    const language = i18n.language.substring(0, 2); // e.g. "en-US" -> "en"
    const keyword =
      destinationMunicipality || destinationStation?.station_ori_name;
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (keyword) {
          // Contextual News
          const cacheKey = `${keyword}-${language}`;
          let result = newsStore.getValidSearchNews(cacheKey);

          if (result) {
            hookLogger.log("Using cached search news");
          } else {
            hookLogger.log(`Fetching fresh search news for: ${keyword}`);
            result = await fetchSearchNews({
              language,
              keywords: keyword,
            });
            newsStore.setSearchNews(cacheKey, result);
          }

          if (result.news.length === 0) {
            hookLogger.log(
              `0 contextual news for ${keyword}. Falling back to general latest news.`,
            );
            const fallbackCacheKey = `latest-${language}`;
            let fallbackResult = newsStore.getValidLatestNews(fallbackCacheKey);

            if (!fallbackResult) {
              hookLogger.log("Fetching fresh fallback latest news");
              fallbackResult = await fetchLatestNews({
                language,
                category: "general",
              });
              newsStore.setLatestNews(fallbackCacheKey, fallbackResult);
            } else {
              hookLogger.log("Using cached fallback latest news");
            }
            if (isMounted) setData(fallbackResult.news);
          } else {
            if (isMounted) setData(result.news);
          }
        } else {
          // General News
          const cacheKey = `latest-${language}`;
          let result = newsStore.getValidLatestNews(cacheKey);

          if (result) {
            hookLogger.log("Using cached latest news");
          } else {
            hookLogger.log("Fetching fresh latest news");
            result = await fetchLatestNews({
              language,
              category: "general",
            });
            newsStore.setLatestNews(cacheKey, result);
          }
          if (isMounted) setData(result.news);
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
  }, [
    settings.enableNewsApi,
    destinationStation,
    destinationMunicipality,
    i18n.language,
    trainId,
  ]); // Intentionally omitting newsStore functions to prevent infinite loops

  return { data, isLoading, error };
}
