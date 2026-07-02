import {
  fetchLatestNews,
  fetchSearchNews,
} from "@/lib/api/currentsapi-news/currentsapi-news-service";

jest.mock("@/lib/logger", () => {
  const mLogger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    trace: jest.fn(),
    debug: jest.fn(),
  };
  return {
    logger: {
      ...mLogger,
      extend: () => mLogger,
      enable: jest.fn(),
      disable: jest.fn(),
    },
  };
});

describe("Currents API News Service", () => {
  const originalEnable = process.env.EXPO_PUBLIC_ENABLE_NEWS_API;
  const originalKey = process.env.EXPO_PUBLIC_NEWS_API_KEY;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_ENABLE_NEWS_API = "true";
    process.env.EXPO_PUBLIC_NEWS_API_KEY = "test_api_key";
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_ENABLE_NEWS_API = originalEnable;
    process.env.EXPO_PUBLIC_NEWS_API_KEY = originalKey;
    jest.restoreAllMocks();
  });

  describe("when API is disabled", () => {
    it("returns mock data", async () => {
      process.env.EXPO_PUBLIC_ENABLE_NEWS_API = "false";
      const result = await fetchLatestNews();

      expect(result.status).toBe("ok");
      expect(result.news.length).toBeGreaterThan(0);
      expect(result.news[0].title).toContain("[MOCK]");
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("when API is enabled", () => {
    it("throws error if API key is missing", async () => {
      delete process.env.EXPO_PUBLIC_NEWS_API_KEY;

      await expect(fetchLatestNews()).rejects.toThrow("Missing API Key");
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("fetches latest news successfully", async () => {
      const mockResponse = { status: "ok", news: [], page: 1 };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchLatestNews({
        language: "it",
        category: "science_technology",
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "https://api.currentsapi.services/v2/latest-news?language=it&page_size=15&category=science_technology&apiKey=test_api_key",
        ),
        expect.any(Object),
      );
    });

    it("fetches search news successfully with keywords", async () => {
      const mockResponse = {
        status: "ok",
        news: [],
        page: 1,
        next_cursor: "abc",
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchSearchNews({
        language: "en",
        keywords: "milan",
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "https://api.currentsapi.services/v2/search?language=en&page_size=15&keywords=milan&apiKey=test_api_key",
        ),
        expect.any(Object),
      );
    });

    it("handles 400 Bad Request error correctly", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      });

      try {
        await fetchLatestNews();
        fail("Should have thrown an error");
      } catch (e: any) {
        expect(e.name).toBe("NewsAPIError");
        expect(e.status).toBe(400);
      }
    });

    it("handles 429 Too Many Requests error correctly", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
      });

      try {
        await fetchSearchNews();
        fail("Should have thrown an error");
      } catch (e: any) {
        expect(e.name).toBe("NewsAPIError");
        expect(e.status).toBe(429);
      }
    });

    it("handles generic network errors correctly", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network Failure"),
      );

      await expect(fetchLatestNews()).rejects.toThrow(
        "Failed to fetch news data due to network error.",
      );
    });
  });
});
