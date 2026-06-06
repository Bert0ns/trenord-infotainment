import CrowdingCard from "@/components/home-components/crowdCard";
import enHome from "@/lib/i18n/locales/en/home.json";
import { render } from "@testing-library/react-native";
import React from "react";

jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

jest.mock("@/hooks/use-theme-color", () => ({
  createStyleHook: () => () => ({
    card: {},
    iconContainer: {},
    label: {},
    value: {},
  }),
  useTheme: () => ({
    colors: {
      info: "blue",
      infoForeground: "white",
      warning: "orange",
      warningForeground: "white",
      destructive: "red",
      destructiveForeground: "white",
      muted: "gray",
      mutedForeground: "lightgray",
      foreground: "black",
    },
    spacing: { md: 8, sm: 4 },
    borderRadius: { lg: 8 },
  }),
}));

describe("CrowdingCard", () => {
  it("renders correctly with low crowding", () => {
    const { getByText } = render(<CrowdingCard level="low" />);
    expect(getByText(enHome.crowdingCard.lowCrowding)).toBeTruthy();
    expect(getByText(enHome.crowdingCard.currentCarriage)).toBeTruthy();
  });

  it("renders correctly with normal crowding", () => {
    const { getByText } = render(<CrowdingCard level="normal" />);
    expect(getByText(enHome.crowdingCard.normalCrowding)).toBeTruthy();
    expect(getByText(enHome.crowdingCard.currentCarriage)).toBeTruthy();
  });

  it("renders correctly with high crowding", () => {
    const { getByText } = render(<CrowdingCard level="high" />);
    expect(getByText(enHome.crowdingCard.highCrowding)).toBeTruthy();
    expect(getByText(enHome.crowdingCard.currentCarriage)).toBeTruthy();
  });
});
