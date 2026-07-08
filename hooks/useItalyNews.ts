import { useNewsFetcher } from "./useNewsFetcher";
import { getItalyNews } from "@/lib/api/currentsapi-news/currentsapi-news-service";

/**
 * Hook to fetch global/general news (not city-specific).
 * Follows the same pattern as useNews but does NOT depend on destination.
 */
export function useItalyNews() {
  return useNewsFetcher({
    fetchFunction: getItalyNews,
    hookName: "GlobalNewsAPI",
  });
}
