import { getItalyNews } from "@/lib/api/currentsapi-news/currentsapi-news-service";
import { NewsArticle } from "@/lib/api/currentsapi-news/currentsapi-news-types";
import { logger } from "@/lib/logger";
import { useSettings } from "@/hooks/settings";
import { useJourneyStore } from "@/store/journeyStore";
import { useNewsStore } from "@/store/newsStore";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { deduplicateNews } from "@/utils/news";

const hookLogger = logger.extend("GlobalNewsAPI");

/**
 * Hook to fetch global/general news (not city-specific).
 * Follows the same pattern as useNews but does NOT depend on destination.
 */
export function useItalyNews() {
  const { settings } = useSettings();
  const trainId = useJourneyStore((s) => s.trainId);
  const cacheVersion = useNewsStore((s) => s.cacheVersion);
  const { i18n } = useTranslation();

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
      hookLogger.log("No train selected, skipping global news fetch.");
      setData([]);
      setIsLoading(false);
      return;
    }

    const language = i18n.language.substring(0, 2);

    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const articles = await getItalyNews(language);
        if (isMounted) setData(deduplicateNews(articles));
      } catch (err: unknown) {
        hookLogger.error("Error in useItalyNews hook:", err);
        if (isMounted) setError(err as Error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchNews();

    return () => {
      isMounted = false;
    };
  }, [settings.enableNewsApi, i18n.language, trainId, cacheVersion]);

  return { data, isLoading, error };
}
