import React from "react";
import { render } from "@testing-library/react-native";
import TabLayout from "@/app/(tabs)/_layout";

let mockFontsLoaded = true;

jest.mock("@expo-google-fonts/inter", () => ({
  Inter_700Bold: "Inter_700Bold",
  useFonts: () => [mockFontsLoaded, null],
}));

jest.mock("expo-router", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  const TabsScreen = (props: any) =>
    React.createElement(Text, props, props.name);
  const Tabs = (props: any) => {
    return React.createElement(View, props, [
      ...props.children,
      props.screenOptions?.header ? props.screenOptions.header() : null,
      props.tabBar
        ? props.tabBar({
            state: { routes: [] },
            navigation: {},
            descriptors: {},
          })
        : null,
    ]);
  };
  Tabs.Screen = TabsScreen;
  return { Tabs };
});

jest.mock("@/components/header", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return () => React.createElement(Text, null, "Mocked Header");
});

jest.mock("@/components/tabBar", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return () => React.createElement(Text, null, "Mocked TabBar");
});

describe("TabLayout", () => {
  afterEach(() => {
    mockFontsLoaded = true;
  });

  it("renders Loading if fonts are not loaded", () => {
    mockFontsLoaded = false;
    const { getByText } = render(<TabLayout />);
    expect(getByText("Loading...")).toBeTruthy();
  });

  it("renders Tabs if fonts are loaded", () => {
    mockFontsLoaded = true;
    const { getByText } = render(<TabLayout />);
    expect(getByText("home")).toBeTruthy();
    expect(getByText("journey")).toBeTruthy();
    expect(getByText("media")).toBeTruthy();
    expect(getByText("settings")).toBeTruthy();
    expect(getByText("Mocked Header")).toBeTruthy();
    expect(getByText("Mocked TabBar")).toBeTruthy();
  });
});
