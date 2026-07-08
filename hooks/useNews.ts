import { useCallback } from "react";
import { useNewsFetcher } from "./useNewsFetcher";
import { useJourneyStore } from "@/store/journeyStore";
import { getLocalizedCityName } from "@/utils/news";
import { getRelevantNews } from "@/lib/api/currentsapi-news/currentsapi-news-service";

export function useNews() {
  const { destinationStation, destinationMunicipality, isMunicipalityLoading } =
    useJourneyStore();

  const fetchFunction = useCallback(
    (language: string) => {
      const rawKeyword =
        destinationMunicipality || destinationStation?.station_ori_name;
      const keyword = getLocalizedCityName(rawKeyword, language);
      return getRelevantNews(keyword, language);
    },
    [destinationStation, destinationMunicipality],
  );

  return useNewsFetcher({
    fetchFunction,
    hookName: "NewsAPI",
    skip: isMunicipalityLoading,
    extraDependencies: [destinationStation, destinationMunicipality],
  });
}
