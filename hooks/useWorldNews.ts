import { useNewsFetcher } from "./useNewsFetcher";
import { getWorldNews } from "@/lib/api/currentsapi-news/currentsapi-news-service";

/**
 * Hook to fetch world/international news.
 * Follows the same pattern as useNews but does NOT depend on destination.
 */
export function useWorldNews() {
  return useNewsFetcher({
    fetchFunction: getWorldNews,
    hookName: "GlobalNewsAPI",
  });
}
