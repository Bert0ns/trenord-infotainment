import React from "react";
import { render } from "@testing-library/react-native";
import TabLayout from "@/app/(tabs)/_layout";

let mockFontsLoaded = true;

jest.mock("@expo-google-fonts/inter", () => ({
  Inter_700Bold: "Inter_700Bold",
  useFonts: () => [mockFontsLoaded, null],
}));

jest.mock("@/hooks/use-train-polling", () => ({
  useTrainPolling: jest.fn(),
}));

jest.mock("@/hooks/use-journey-notifications", () => ({
  useJourneyNotifications: jest.fn(),
}));

jest.mock("expo-router", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text } = require("react-native");
  const TabsScreen = (props: any) => <Text {...props}>{props.name}</Text>;
  TabsScreen.displayName = "TabsScreen";

  const Tabs = (props: any) => {
    return (
      <View testID="tabs-container" {...props}>
        {props.children}
        {props.screenOptions?.header ? (
          <View key="header">{props.screenOptions.header()}</View>
        ) : null}
        {props.tabBar ? (
          <View key="tabbar">
            {props.tabBar({
              state: { routes: [] },
              navigation: {},
              descriptors: {},
            })}
          </View>
        ) : null}
      </View>
    );
  };
  Tabs.displayName = "Tabs";
  Tabs.Screen = TabsScreen;
  return { Tabs };
});

jest.mock("@/components/header", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require("react-native");
  const MockHeader = () => <Text>Mocked Header</Text>;
  MockHeader.displayName = "MockHeader";
  return MockHeader;
});

jest.mock("@/components/tabBar", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require("react-native");
  const MockTabBar = () => <Text>Mocked TabBar</Text>;
  MockTabBar.displayName = "MockTabBar";
  return MockTabBar;
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
