import { NewsArticle } from "@/lib/api/currentsapi-news/currentsapi-news-types";

/**
 * Deduplicates an array of news articles based on their title.
 * Articles are considered duplicates if the first 70% of their titles match,
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

    const headerPrefix = article.title
      .substring(0, Math.floor(article.title.length * 0.7))
      .toLowerCase();

    const isDuplicate = uniqueArticles.some((existing) => {
      if (!existing.title) return false;
      const existingPrefix = existing.title
        .substring(0, Math.floor(existing.title.length * 0.7))
        .toLowerCase();
      const minLen = Math.min(headerPrefix.length, existingPrefix.length);
      if (minLen < 5) return false; // Prevent overly aggressive matching on very short titles
      return (
        headerPrefix.substring(0, minLen) ===
        existingPrefix.substring(0, minLen)
      );
    });

    if (!isDuplicate) {
      uniqueArticles.push(article);
    }
  }

  return uniqueArticles;
}
