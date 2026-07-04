import { useNewsStore, CACHE_TTL_MS } from "@/store/newsStore";
import { NewsAPIResponse } from "@/lib/api/currentsapi-news/currentsapi-news-types";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Mock Logger
jest.mock("@/lib/logger", () => {
  const mLogger = {
    info: jest.fn(),
    error: jest.fn(),
  };
  return {
    logger: {
      extend: () => mLogger,
    },
  };
});

const mockData: NewsAPIResponse = {
  status: "ok",
  page: 1,
  news: [
    {
      id: "1",
      title: "Test News",
      description: "Desc",
      url: "http://test",
      author: null,
      image: null,
      language: "en",
      category: ["regional"],
      published: new Date().toISOString(),
    },
  ],
};

describe("NewsStore", () => {
  beforeEach(() => {
    useNewsStore.getState().clearCache();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should cache and return valid latest news", () => {
    const key = "en-regional";

    useNewsStore.getState().setLatestNews(key, mockData);

    const cached = useNewsStore.getState().getValidLatestNews(key);
    expect(cached).toEqual(mockData);
  });

  it("should return null for latest news if cache expired", () => {
    const key = "en-regional";

    useNewsStore.getState().setLatestNews(key, mockData);

    // Advance time beyond TTL
    jest.advanceTimersByTime(CACHE_TTL_MS + 1000);

    const cached = useNewsStore.getState().getValidLatestNews(key);
    expect(cached).toBeNull();
  });

  it("should cache and return valid search news", () => {
    const key = "milan-en";

    useNewsStore.getState().setSearchNews(key, mockData);

    const cached = useNewsStore.getState().getValidSearchNews(key);
    expect(cached).toEqual(mockData);
  });

  it("should return null for search news if cache expired", () => {
    const key = "milan-en";

    useNewsStore.getState().setSearchNews(key, mockData);

    // Advance time beyond TTL
    jest.advanceTimersByTime(CACHE_TTL_MS + 1000);

    const cached = useNewsStore.getState().getValidSearchNews(key);
    expect(cached).toBeNull();
  });

  it("should clear the cache properly", () => {
    const key = "test";
    useNewsStore.getState().setLatestNews(key, mockData);
    useNewsStore.getState().setSearchNews(key, mockData);

    useNewsStore.getState().clearCache();

    expect(useNewsStore.getState().getValidLatestNews(key)).toBeNull();
    expect(useNewsStore.getState().getValidSearchNews(key)).toBeNull();
  });
});
