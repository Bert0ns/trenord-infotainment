import React from "react";
import { render } from "@testing-library/react-native";
import JourneyScreen from "@/app/(tabs)/journey";
import { useJourneyStore } from "@/store/journeyStore";
import { Text } from "react-native";

jest.mock("expo-router", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Redirect: () => React.createElement(Text, null, "Redirected to login")
  };
});

jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

jest.mock("@/hooks/use-theme-color", () => ({
  createStyleHook: () => () => ({
    iconColor: { color: "#000" },
    titleHome: {}, title: {}, seeAll: {}, seeMore: {},
    container: {}, content: {}, pageHeader: {}, pageTitle: {}, pageSubtitle: {},
    themeRow: {}, themeBox: {}, themeBoxActive: {}, themeBoxText: {}, themeBoxTextActive: {},
    dropdown: {}, dropdownText: {}, footer: {}, reportButton: {}, reportButtonText: {},
    versionText: {}, linksRow: {}, link: {}, card: {}, timelineContainer: {},
    newsCard: {}, tag: {}, newsText: {}, discoverCard: {}, image: {}, info: {},
    discoverTitle: {}, discoverSubtitle: {}, button: {}, buttonText: {},
    timelineItem: {}, timelineContent: {}, timelineTimeContainer: {}, timeText: {},
    stationText: {}, delayText: {}, platformText: {}, timelineDot: {}, timelineLine: {}
  }),
  useTheme: () => ({
    colors: { primary: "#000", mutedForeground: "#555", background: "#fff", border: "#eee", foreground: "#000", muted: "#ccc" },
    spacing: { sm: 4, md: 8, lg: 16 },
    borderRadius: { sm: 4, md: 8, lg: 16, xl: 24 }
  })
}));

jest.mock("@/store/journeyStore", () => ({
  useJourneyStore: jest.fn(),
}));

describe("JourneyScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to login if trainId is null", () => {
    (useJourneyStore as unknown as jest.Mock).mockImplementation((selector: any) => selector({ trainId: null }));
    const { getByText } = render(<JourneyScreen />);
    expect(getByText("Redirected to login")).toBeTruthy();
  });

  it("renders correctly if trainId is present", () => {
    (useJourneyStore as unknown as jest.Mock).mockImplementation((selector: any) => selector({ trainId: "12345" }));
    const { getByText } = render(<JourneyScreen />);
    
    expect(getByText("Lecco - R 2564")).toBeTruthy();
    expect(getByText("08:30 - 10:15")).toBeTruthy();
    expect(getByText("Milano Centrale")).toBeTruthy();
    expect(getByText("Monza")).toBeTruthy();
  });
});
