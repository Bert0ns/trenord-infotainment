import React from "react";
import { render } from "@testing-library/react-native";
import CrowdingCard from "@/components/home-components/crowdCard";

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
    expect(getByText("Low Crowding")).toBeTruthy();
    expect(getByText("Current Carriage")).toBeTruthy();
  });

  it("renders correctly with normal crowding", () => {
    const { getByText } = render(<CrowdingCard level="normal" />);
    expect(getByText("Normal Crowding")).toBeTruthy();
  });

  it("renders correctly with high crowding", () => {
    const { getByText } = render(<CrowdingCard level="high" />);
    expect(getByText("High Crowding")).toBeTruthy();
  });
});
