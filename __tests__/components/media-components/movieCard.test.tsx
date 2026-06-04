import React from "react";
import { render } from "@testing-library/react-native";
import MovieCard from "@/components/media-components/movieCard";

jest.mock("@/hooks/use-theme-color", () => ({
  createStyleHook: () => () => ({
    cardContainer: {},
    image: {},
    imageRadius: {},
    overlay: {},
    badge: {},
    badgeText: {},
    title: {},
    subtitle: {},
  }),
  useTheme: () => ({
    colors: {},
    spacing: { md: 8, sm: 4 },
    borderRadius: { lg: 8 },
  }),
}));

describe("MovieCard", () => {
  it("renders correctly", () => {
    const { getByText } = render(
      <MovieCard
        imageSource={{ uri: "test-image.jpg" }}
        title="Inception"
        category="Sci-Fi"
        duration="2h 28m"
      />
    );
    expect(getByText("Inception")).toBeTruthy();
    expect(getByText("Sci-Fi • 2h 28m")).toBeTruthy();
  });
});
