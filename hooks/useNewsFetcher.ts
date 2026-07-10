import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/hooks/settings";
import { useJourneyStore } from "@/store/journeyStore";
import { useNewsStore } from "@/store/newsStore";
import { logger } from "@/lib/logger";
import { deduplicateNews } from "@/utils/news";
import { NewsArticle } from "@/lib/api/currentsapi-news/currentsapi-news-types";

type FetchFunction = (language: string) => Promise<NewsArticle[]>;

interface UseNewsFetcherOptions {
  fetchFunction: FetchFunction;
  hookName?: string;
  skip?: boolean;
  extraDependencies?: any[];
}

export function useNewsFetcher({
  fetchFunction,
  hookName = "useNewsFetcher",
  skip = false,
  extraDependencies = [],
}: UseNewsFetcherOptions) {
  const { settings } = useSettings();
  const trainId = useJourneyStore((s) => s.trainId);
  const cacheVersion = useNewsStore((s) => s.cacheVersion);
  const { i18n } = useTranslation();
  const hookLogger = logger.extend(hookName);

  const [data, setData] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

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

    if (skip) {
      setData([]);
      return;
    }

    const language = i18n.language.substring(0, 2);

    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const articles = await fetchFunction(language);
        if (isMounted) setData(deduplicateNews(articles));
      } catch (err: any) {
        hookLogger.error(`Error in ${hookName} hook:`, err);
        if (isMounted) setError(err as Error);
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
    trainId,
    cacheVersion,
    i18n.language,
    skip,
    fetchFunction,
    hookLogger,
    hookName,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...extraDependencies,
  ]);

  return { data, isLoading, error };
}
