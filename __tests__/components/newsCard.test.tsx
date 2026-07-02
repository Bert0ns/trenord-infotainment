import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import NewsCard from "@/components/newsCard";
import * as WebBrowser from "expo-web-browser";

jest.mock("expo-blur", () => ({
  BlurView: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("expo-web-browser", () => ({
  openBrowserAsync: jest.fn(),
}));

jest.mock("expo-video-thumbnails", () => ({
  getThumbnailAsync: jest.fn().mockResolvedValue({ uri: "mock-thumbnail.jpg" }),
}));

jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

jest.mock("@/lib/logger", () => ({
  logger: {
    extend: () => ({
      log: jest.fn(),
      error: jest.fn(),
    }),
  },
}));

// We don't need to mock createStyleHook if the theme context is provided,
// but since this is a simple unit test, we can mock it to avoid needing the full provider.
jest.mock("@/hooks/use-theme-color", () => ({
  createStyleHook: () => () => ({
    cardContainer: {},
    imageContainer: {},
    imageBackground: {},
    imageStyle: {},
    fallbackBackground: {},
    overlayContainer: {},
    blurView: {},
    fallbackBlurView: {},
    title: {},
    description: {},
  }),
}));

describe("NewsCard", () => {
  const mockArticle = {
    id: "123",
    title: "Breaking News",
    description: "Something happened today.",
    url: "https://example.com/news",
    author: null,
    image: "https://example.com/image.jpg",
    language: "en",
    category: ["world"],
    published: "2024-01-01T00:00:00.000Z",
  };

  it("renders correctly with image", () => {
    const { getByText } = render(<NewsCard article={mockArticle} />);
    expect(getByText("Breaking News")).toBeTruthy();
    expect(getByText("Something happened today.")).toBeTruthy();
  });

  it("renders correctly without image", () => {
    const noImageArticle = { ...mockArticle, image: null };
    const { getByText } = render(<NewsCard article={noImageArticle} />);
    expect(getByText("Breaking News")).toBeTruthy();
  });

  it("opens browser on press", () => {
    const { getByText } = render(<NewsCard article={mockArticle} />);

    fireEvent.press(getByText("Breaking News"));

    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      "https://example.com/news",
      expect.any(Object),
    );
  });

  it("opens video links externally using Linking when URL is embedded in description", () => {
    const videoArticle = {
      ...mockArticle,
      url: "https://www.liberoquotidiano.it/news/48398933/undefined/",
      description: "https://video.italpress.com/play/mp4/video/7xy8",
    };
    const { getByText } = render(<NewsCard article={videoArticle} />);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Linking } = require("react-native");
    const openURLSpy = jest
      .spyOn(Linking, "openURL")
      .mockImplementation(() => Promise.resolve());

    fireEvent.press(getByText("Breaking News"));

    expect(openURLSpy).toHaveBeenCalledWith(
      "https://video.italpress.com/play/mp4/video/7xy8",
    );

    openURLSpy.mockRestore();
  });
});
