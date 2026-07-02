import { getRelevantNews } from "@/lib/api/currentsapi-news/currentsapi-news-service";
import { NewsArticle } from "@/lib/api/currentsapi-news/currentsapi-news-types";
import { logger } from "@/lib/logger";
import { useSettings } from "@/hooks/settings";
import { useJourneyStore } from "@/store/journeyStore";
import { useNewsStore } from "@/store/newsStore";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { deduplicateNews, getLocalizedCityName } from "@/utils/news";

const hookLogger = logger.extend("NewsAPI");

export function useNews() {
  const { settings } = useSettings();
  const {
    destinationStation,
    destinationMunicipality,
    isMunicipalityLoading,
    trainId,
  } = useJourneyStore();
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
    const rawKeyword =
      destinationMunicipality || destinationStation?.station_ori_name;
    const keyword = getLocalizedCityName(rawKeyword, language);
    // Wait until municipality is fetched (prevents double fetch)
    if (isMunicipalityLoading) {
      return;
    }

    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const articles = await getRelevantNews(keyword, language);
        if (isMounted) setData(deduplicateNews(articles));
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
  ]);

  return { data, isLoading, error };
}
