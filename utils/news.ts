import { NewsArticle } from "@/lib/api/currentsapi-news/currentsapi-news-types";
import citiesData from "@/lib/i18n/locales/cities.json";

function getMiddleString(str: string, cutAmountPercentage: number) {
  return str.substring(
    Math.floor(str.length * (1 - cutAmountPercentage)),
    Math.floor(str.length * cutAmountPercentage),
  );
}

/**
 * Deduplicates an array of news articles based on their title.
 * Articles are considered duplicates if a middle portion of their titles overlaps,
 * preventing nearly identical articles from clustering in the UI.
 *
 * @param articles - The array of news articles to deduplicate
 * @returns A deduplicated array of news articles
 */
export function deduplicateNews(articles: NewsArticle[]): NewsArticle[] {
  const uniqueArticles: NewsArticle[] = [];

  for (const article of articles) {
    if (!article.title) {
      uniqueArticles.push(article);
      continue;
    }

    const headerMiddleString = getMiddleString(
      article.title,
      0.3,
    ).toLowerCase();

    const isDuplicate = uniqueArticles.some((newsArticle) => {
      if (!newsArticle.title) return false;
      const articleMiddleStringTitle = getMiddleString(
        newsArticle.title,
        0.4,
      ).toLowerCase();
      return headerMiddleString.includes(articleMiddleStringTitle);
    });

    if (!isDuplicate) {
      uniqueArticles.push(article);
    }
  }

  return uniqueArticles;
}

/**
 * Translates common Italian city names to English for better search results in English news.
 * @param city - The original city name (usually in Italian)
 * @param language - The target language code (e.g., "en")
 * @returns The localized city name or the original if no translation is found
 */
export function getLocalizedCityName(
  city: string | null | undefined,
  language: string,
): string | null | undefined {
  if (!city) return city;

  if (language.startsWith("en")) {
    const englishMap = Object.entries(citiesData).reduce(
      (acc, [key, val]) => {
        acc[key.toLowerCase()] = val;
        return acc;
      },
      {} as Record<string, string>,
    );

    const lowerCity = city.toLowerCase().trim();
    if (englishMap[lowerCity]) {
      return englishMap[lowerCity];
    }
  }

  return city;
}
