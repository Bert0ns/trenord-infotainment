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

function deduplicateNews(articles: NewsArticle[]) {
  const uniqueArticles: NewsArticle[] = [];

  for (const article of articles) {
    if (!article.title) {
      uniqueArticles.push(article);
      continue;
    }

    const headerPrefix = article.title
      .substring(0, Math.floor(article.title.length * 0.7))
      .toLowerCase();

    const isDuplicate = uniqueArticles.some((existing) => {
      if (!existing.title) return false;
      const existingPrefix = existing.title
        .substring(0, Math.floor(existing.title.length * 0.7))
        .toLowerCase();
      const minLen = Math.min(headerPrefix.length, existingPrefix.length);
      if (minLen < 5) return false; // Prevent overly aggressive matching on very short titles
      return (
        headerPrefix.substring(0, minLen) ===
        existingPrefix.substring(0, minLen)
      );
    });

    if (!isDuplicate) {
      uniqueArticles.push(article);
    }
  }

  return uniqueArticles;
}

export function useNews() {
  const { settings } = useSettings();
  const {
    destinationStation,
    destinationMunicipality,
    isMunicipalityLoading,
    trainId,
  } = useJourneyStore();
  const getValidLatestNews = useNewsStore((s) => s.getValidLatestNews);
  const getValidSearchNews = useNewsStore((s) => s.getValidSearchNews);
  const setLatestNews = useNewsStore((s) => s.setLatestNews);
  const setSearchNews = useNewsStore((s) => s.setSearchNews);
  const cacheVersion = useNewsStore((s) => s.cacheVersion);
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
    // Wait until municipality is fetched (prevents double fetch)
    if (isMunicipalityLoading) {
      return;
    }

    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (keyword) {
          const cacheKey = `search-${keyword}-${language}`;
          let result = getValidSearchNews(cacheKey);

          if (result) {
            hookLogger.log("Using cached search news");
          } else {
            hookLogger.log(`Fetching fresh search news for: ${keyword}`);
            result = await fetchSearchNews({
              language,
              keywords: keyword,
            });
            setSearchNews(cacheKey, result);
          }

          if (result.news.length === 0) {
            hookLogger.log(
              `0 contextual news for ${keyword}. Falling back to general latest news.`,
            );
            const fallbackCacheKey = `latest-${language}`;
            let fallbackResult = getValidLatestNews(fallbackCacheKey);

            if (!fallbackResult) {
              hookLogger.log("Fetching fresh fallback latest news");
              fallbackResult = await fetchLatestNews({
                language,
                category: "general",
              });
              setLatestNews(fallbackCacheKey, fallbackResult);
            } else {
              hookLogger.log("Using cached fallback latest news");
            }
            if (isMounted) setData(deduplicateNews(fallbackResult.news));
          } else {
            if (isMounted) setData(deduplicateNews(result.news));
          }
        } else {
          // General News
          const cacheKey = `latest-${language}`;
          let result = getValidLatestNews(cacheKey);

          if (result) {
            hookLogger.log("Using cached latest news");
          } else {
            hookLogger.log("Fetching fresh latest news");
            result = await fetchLatestNews({
              language,
              category: "general",
            });
            setLatestNews(cacheKey, result);
          }
          if (isMounted) setData(deduplicateNews(result.news));
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
    isMunicipalityLoading,
    i18n.language,
    trainId,
    cacheVersion,
    getValidLatestNews,
    getValidSearchNews,
    setLatestNews,
    setSearchNews,
  ]);

  return { data, isLoading, error };
}
