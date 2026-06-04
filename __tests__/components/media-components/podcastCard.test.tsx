import React from "react";
import { render } from "@testing-library/react-native";
import PodcastCard from "@/components/media-components/podcastCard";

jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

jest.mock("@/hooks/use-theme-color", () => ({
  createStyleHook: () => () => ({
    container: {},
    image: {},
    textContainer: {},
    title: {},
    episode: {},
    plusButton: {},
    iconColor: { color: "blue" },
  }),
  useTheme: () => ({
    colors: {
      muted: "gray",
      foreground: "black",
      mutedForeground: "lightgray",
      primary: "blue",
    },
    spacing: { sm: 4, md: 8 },
    borderRadius: { lg: 8, sm: 4 },
  }),
}));

describe("PodcastCard", () => {
  it("renders correctly", () => {
    const { getByText } = render(
      <PodcastCard
        imageSource={{ uri: "test-podcast.jpg" }}
        title="Tech Talk"
        episode="Episode 42: The Future"
      />
    );
    expect(getByText("Tech Talk")).toBeTruthy();
    expect(getByText("Episode 42: The Future")).toBeTruthy();
  });
});
