import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { NewsArticle } from "@/lib/api/currentsapi-news/currentsapi-news-types";
import { MagazineCard } from "./magazine-card";

type MasonryGridProps = {
  data: NewsArticle[];
  columns?: number;
};

// Generates a pseudo-random height between 150 and 260 based on the article's title
const getCardHeight = (title: string): number => {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const normalized = Math.abs(hash) % 110; // range 0 to 110
  return 150 + normalized; // range 150 to 260
};

export function MasonryGrid({ data, columns = 2 }: MasonryGridProps) {
  const { columnData } = useMemo(() => {
    const cols: NewsArticle[][] = Array.from({ length: columns }, () => []);
    const heights = Array.from({ length: columns }, () => 0);

    data.forEach((article) => {
      // Find shortest column to balance heights
      let shortestColIndex = 0;
      let minHeight = heights[0];

      for (let i = 1; i < columns; i++) {
        if (heights[i] < minHeight) {
          minHeight = heights[i];
          shortestColIndex = i;
        }
      }

      cols[shortestColIndex].push(article);
      // Rough approximation of height for the next iteration
      heights[shortestColIndex] += getCardHeight(article.title) + 12; // 12 is marginBottom
    });

    return { columnData: cols };
  }, [data, columns]);

  return (
    <View style={styles.container}>
      {columnData.map((colItems, colIndex) => (
        <View key={`col-${colIndex}`} style={styles.column}>
          {colItems.map((article, itemIndex) => (
            <MagazineCard
              key={`${article.id}-${itemIndex}`}
              article={article}
              height={getCardHeight(article.title)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
  },
  column: {
    flex: 1,
    flexDirection: "column",
  },
});
