import { renderHook, waitFor } from "@testing-library/react-native";
import { useNews } from "@/hooks/useNews";
import {
  fetchLatestNews,
  fetchSearchNews,
} from "@/lib/api/currentsapi-news/currentsapi-news-service";
import { useSettings } from "@/hooks/settings";
import { useJourneyStore } from "@/store/journeyStore";
import { useNewsStore } from "@/store/newsStore";

jest.mock("@/lib/api/currentsapi-news/currentsapi-news-service");
jest.mock("@/hooks/settings");
jest.mock("@/store/journeyStore");
jest.mock("@/store/newsStore");

jest.mock("@/lib/logger", () => {
  const mLogger = { log: jest.fn(), error: jest.fn() };
  return { logger: { extend: () => mLogger } };
});

describe("useNews Hook", () => {
  const mockSetLatestNews = jest.fn();
  const mockSetSearchNews = jest.fn();
  const mockGetValidLatestNews = jest.fn();
  const mockGetValidSearchNews = jest.fn();

  const mockNewsData = { news: [{ id: "1", title: "Test News" }] };

  beforeEach(() => {
    jest.clearAllMocks();

    (useSettings as jest.Mock).mockReturnValue({
      settings: { enableNewsApi: true },
    });

    (useJourneyStore as unknown as jest.Mock).mockReturnValue({
      destinationStation: null,
      trainId: "1234",
    });

    (useNewsStore as unknown as jest.Mock).mockReturnValue({
      getValidLatestNews: mockGetValidLatestNews,
      getValidSearchNews: mockGetValidSearchNews,
      setLatestNews: mockSetLatestNews,
      setSearchNews: mockSetSearchNews,
    });

    (fetchLatestNews as jest.Mock).mockResolvedValue(mockNewsData);
    (fetchSearchNews as jest.Mock).mockResolvedValue(mockNewsData);

    process.env.EXPO_PUBLIC_ENABLE_NEWS_API = "true";
  });

  it("should return empty array if enableNewsApi setting is false", async () => {
    (useSettings as jest.Mock).mockReturnValue({
      settings: { enableNewsApi: false },
    });

    const { result } = renderHook(() => useNews());

    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(fetchLatestNews).not.toHaveBeenCalled();
    expect(fetchSearchNews).not.toHaveBeenCalled();
  });

  it("should fetch latest news if no destination station is set and cache misses", async () => {
    mockGetValidLatestNews.mockReturnValue(null);

    const { result } = renderHook(() => useNews());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchLatestNews).toHaveBeenCalledWith({
      language: "en",
      category: "general",
    });
    expect(mockSetLatestNews).toHaveBeenCalledWith("latest-en", mockNewsData);
    expect(result.current.data).toEqual(mockNewsData.news);
  });

  it("should return cached latest news if cache hits without calling api", async () => {
    mockGetValidLatestNews.mockReturnValue(mockNewsData);

    const { result } = renderHook(() => useNews());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchLatestNews).not.toHaveBeenCalled();
    expect(result.current.data).toEqual(mockNewsData.news);
  });

  it("should fetch search news with keyword if destination station is set and cache misses", async () => {
    (useJourneyStore as unknown as jest.Mock).mockReturnValue({
      destinationStation: { station_ori_name: "Milano Centrale" },
      trainId: "1234",
    });
    mockGetValidSearchNews.mockReturnValue(null);

    const { result } = renderHook(() => useNews());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchSearchNews).toHaveBeenCalledWith({
      language: "en",
      keywords: "Milano Centrale",
    });
    expect(mockSetSearchNews).toHaveBeenCalledWith(
      "Milano Centrale-en",
      mockNewsData,
    );
    expect(result.current.data).toEqual(mockNewsData.news);
  });

  it("should fallback to latest news if search news returns 0 articles", async () => {
    (useJourneyStore as unknown as jest.Mock).mockReturnValue({
      destinationStation: { station_ori_name: "Nowhere Station" },
      trainId: "1234",
    });

    // Simulate cache miss for search
    mockGetValidSearchNews.mockReturnValue(null);
    // Simulate search api returning 0 articles
    (fetchSearchNews as jest.Mock).mockResolvedValue({ news: [] });

    // Simulate cache miss for fallback latest news
    mockGetValidLatestNews.mockReturnValue(null);
    const mockFallbackData = {
      news: [{ id: "1", title: "General News fallback" }],
    };
    (fetchLatestNews as jest.Mock).mockResolvedValue(mockFallbackData);

    const { result } = renderHook(() => useNews());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // It should have called search first
    expect(fetchSearchNews).toHaveBeenCalledWith({
      language: "en",
      keywords: "Nowhere Station",
    });

    // And then fallback to latest
    expect(fetchLatestNews).toHaveBeenCalledWith({
      language: "en",
      category: "general",
    });

    expect(result.current.data).toEqual(mockFallbackData.news);
  });

  it("should handle API errors gracefully", async () => {
    mockGetValidLatestNews.mockReturnValue(null);
    const mockError = new Error("API Failure");
    (fetchLatestNews as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useNews());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toEqual([]);
  });
});
