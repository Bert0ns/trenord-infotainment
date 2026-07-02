import { deduplicateNews, getLocalizedCityName } from "@/utils/news";
import { NewsArticle } from "@/lib/api/currentsapi-news/currentsapi-news-types";

describe("deduplicateNews", () => {
  it("should return an empty array when given an empty array", () => {
    expect(deduplicateNews([])).toEqual([]);
  });

  it("should keep unique articles", () => {
    const articles = [
      { id: "1", title: "Apple announces new iPhone" },
      { id: "2", title: "Global markets rally today" },
    ] as NewsArticle[];
    expect(deduplicateNews(articles)).toEqual(articles);
  });

  it("should remove near-duplicate articles with very similar titles", () => {
    const articlesExplicit = [
      {
        id: "1",
        title: "Apple announces new iPhone 16 with AI features - full review",
      },
      {
        id: "2",
        title: "Apple announces new iPhone 16 with AI features - quick look",
      },
    ] as NewsArticle[];

    const result = deduplicateNews(articlesExplicit);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("should not crash if title is undefined", () => {
    const articles = [
      { id: "1", title: "Some title" },
      { id: "2", title: undefined },
      { id: "3", title: undefined },
    ] as unknown as NewsArticle[];

    const result = deduplicateNews(articles);
    expect(result).toHaveLength(3);
  });
});

describe("getLocalizedCityName", () => {
  it("should translate Milano to Milan for English language", () => {
    expect(getLocalizedCityName("Milano", "en")).toBe("Milan");
    expect(getLocalizedCityName(" MILANO ", "en-US")).toBe("Milan");
  });

  it("should not translate if language is not English", () => {
    expect(getLocalizedCityName("Milano", "it")).toBe("Milano");
  });

  it("should return the original city if no translation is found", () => {
    expect(getLocalizedCityName("Como", "en")).toBe("Como");
  });

  it("should handle null or undefined safely", () => {
    expect(getLocalizedCityName(null, "en")).toBeNull();
    expect(getLocalizedCityName(undefined, "en")).toBeUndefined();
  });
});
