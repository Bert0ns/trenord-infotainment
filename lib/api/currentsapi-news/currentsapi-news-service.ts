import { logger } from "@/lib/logger";
import { NewsAPIResponse, NewsArticle } from "./currentsapi-news-types";
import { useNewsStore } from "@/store/newsStore";

const newsLogger = logger.extend("NewsAPI");

const BASE_URL = "https://api.currentsapi.services/v2";

interface FetchNewsOptions {
  language?: string;
  country?: string;
  page_size?: number;
  category?: string;
  keywords?: string; // Only for search
}

const isApiEnabled = () => process.env.EXPO_PUBLIC_ENABLE_NEWS_API === "true";

export class NewsAPIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = "NewsAPIError";
    this.status = status;
  }
}

function getMockResponse(): NewsAPIResponse {
  return {
    status: "ok",
    page: 1,
    news: [
      {
        id: "mock-1",
        title: "[MOCK] Trenord announces new high-speed routes",
        description:
          "Mock description for the new routes starting next year...",
        url: "https://www.trenord.it",
        author: "Trenord Press",
        image: null,
        language: "en",
        category: ["transportation"],
        published: new Date().toISOString(),
      },
      {
        id: "mock-2",
        title: "[MOCK] Milan weather hits record highs",
        description: "Residents advised to stay hydrated...",
        url: "https://example.com",
        author: "Meteo Local",
        image: null,
        language: "en",
        category: ["weather"],
        published: new Date().toISOString(),
      },
    ],
  };
}

async function fetchFromCurrentsApi(
  endpoint: string,
  params: Record<string, any>,
): Promise<NewsAPIResponse> {
  if (!isApiEnabled()) {
    newsLogger.log(
      `API disabled. Returning mock data for endpoint: ${endpoint}`,
    );
    return getMockResponse();
  }

  const apiKey = process.env.EXPO_PUBLIC_NEWS_API_KEY;
  if (!apiKey) {
    newsLogger.error(
      "API Key is missing (EXPO_PUBLIC_NEWS_API_KEY is not defined)",
    );
    throw new Error("Missing API Key");
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }
  searchParams.append("apiKey", apiKey);

  const url = `${BASE_URL}${endpoint}?${searchParams.toString()}`;

  newsLogger.log(`Fetching news from ${endpoint}...`, { params });

  try {
    const response = await fetch(url, {
      method: "GET",
      // Set a reasonable timeout by standard practice, though fetch doesn't natively support it without AbortController
    });

    if (!response.ok) {
      if (response.status === 400) {
        newsLogger.error(
          `Bad Request (400) - Parameter mismatch for ${endpoint}. Did you pass keywords to latest-news or use legacy categories?`,
        );
      } else if (response.status === 429) {
        newsLogger.error("Too Many Requests (429) - API rate limit exceeded.");
      } else {
        newsLogger.error(
          `API Error (${response.status}) - ${response.statusText}`,
        );
      }
      throw new NewsAPIError(
        `API request failed with status ${response.status}`,
        response.status,
      );
    }

    const data: NewsAPIResponse = await response.json();
    newsLogger.log(
      `Successfully fetched ${data.news?.length || 0} articles from ${endpoint}.`,
    );
    return data;
  } catch (error: any) {
    if (error.name === "NewsAPIError") {
      throw error;
    }
    newsLogger.error(
      `Network or Parsing error while fetching ${endpoint}`,
      error,
    );
    throw new Error("Failed to fetch news data due to network error.");
  }
}

/**
 * Fetches the latest news. Perfect for general "World News" or broad category feeds.
 * NOTE: Does NOT support 'keywords'. Use fetchSearchNews for keyword searches.
 */
export async function fetchLatestNews(
  options?: Omit<FetchNewsOptions, "keywords">,
): Promise<NewsAPIResponse> {
  return fetchFromCurrentsApi("/latest-news", {
    language: options?.language || "en",
    page_size: options?.page_size || 15,
    ...(options?.country ? { country: options.country } : {}),
    ...(options?.category ? { category: options.category } : {}),
  });
}

/**
 * Fetches news using search. Used for contextual destination-based queries.
 */
export async function fetchSearchNews(
  options?: FetchNewsOptions,
): Promise<NewsAPIResponse> {
  return fetchFromCurrentsApi("/search", {
    language: options?.language || "en",
    page_size: options?.page_size || 15,
    ...(options?.country ? { country: options.country } : {}),
    ...(options?.category ? { category: options.category } : {}),
    ...(options?.keywords ? { keywords: options.keywords } : {}),
  });
}

/**
 * Orchestrates fetching contextual news (by keyword) with a fallback to general latest news.
 * Checks the zustand store for valid cached entries before hitting the API.
 */
export async function getRelevantNews(
  keyword: string | null | undefined,
  language: string,
): Promise<NewsArticle[]> {
  const store = useNewsStore.getState();

  if (keyword) {
    const cacheKey = `search-${keyword}-${language}`;
    let result = store.getValidSearchNews(cacheKey);

    if (result) {
      newsLogger.log("Using cached search news");
    } else {
      newsLogger.log(`Fetching fresh search news for: ${keyword}`);
      result = await fetchSearchNews({
        language,
        keywords: keyword,
      });
      store.setSearchNews(cacheKey, result);
    }

    if (result.news.length === 0) {
      newsLogger.log(
        `0 contextual news for ${keyword}. Falling back to general latest news.`,
      );
      const fallbackCacheKey = `latest-${language}`;
      let fallbackResult = store.getValidLatestNews(fallbackCacheKey);

      if (!fallbackResult) {
        newsLogger.log("Fetching fresh fallback latest news");
        fallbackResult = await fetchLatestNews({
          language,
          country: "IT",
          category: "general",
        });
        store.setLatestNews(fallbackCacheKey, fallbackResult);
      } else {
        newsLogger.log("Using cached fallback latest news");
      }
      return fallbackResult.news;
    } else {
      return result.news;
    }
  } else {
    // General News
    const cacheKey = `latest-${language}`;
    let result = store.getValidLatestNews(cacheKey);

    if (result) {
      newsLogger.log("Using cached latest news");
    } else {
      newsLogger.log("Fetching fresh latest news");
      result = await fetchLatestNews({
        language,
        country: "IT",
        category: "general",
      });
      store.setLatestNews(cacheKey, result);
    }
    return result.news;
  }
}

/**
 * Fetches Italy news.
 * Uses the latestNewsCache with a distinct key to avoid collisions.
 */
export async function getItalyNews(language: string): Promise<NewsArticle[]> {
  const store = useNewsStore.getState();
  const cacheKey = `italy-latest-${language}`;

  let result = store.getValidLatestNews(cacheKey);

  if (result) {
    newsLogger.log("Using cached italy news");
  } else {
    newsLogger.log("Fetching fresh italy news");
    result = await fetchLatestNews({
      language,
      country: "IT",
      category: "general",
    });
    store.setLatestNews(cacheKey, result);
  }

  return result.news;
}

/**
 * Fetches world news (no country constraint).
 * Uses the latestNewsCache with a distinct key.
 */
export async function getWorldNews(language: string): Promise<NewsArticle[]> {
  const store = useNewsStore.getState();
  const cacheKey = `world-latest-${language}`;

  let result = store.getValidLatestNews(cacheKey);

  if (result) {
    newsLogger.log("Using cached world news");
  } else {
    newsLogger.log("Fetching fresh world news");
    const keywords = language === "it" ? "esteri" : "world";

    result = await fetchSearchNews({
      language,
      keywords,
      category: "general",
    });
    store.setLatestNews(cacheKey, result);
  }

  return result.news;
}
