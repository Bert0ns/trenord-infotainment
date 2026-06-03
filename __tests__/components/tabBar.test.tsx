import React from "react";
import { render } from "@testing-library/react-native";
import CustomTabBar from "../../components/tabBar";
import { useJourneyStore } from "../../store/journeyStore";
import { SettingsProvider } from "../../hooks/settings";

// Mock the BlurView since it requires native modules in Jest
jest.mock("expo-blur", () => ({
  BlurView: ({ children }: any) => {
    const { View } = require("react-native");
    return <View testID="blur-view">{children}</View>;
  },
}));

// Mock vector icons to prevent Jest parsing errors
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: () => {
    const { Text } = require("react-native");
    return <Text>Icon</Text>;
  },
}));

const mockProps = {
  state: {
    routes: [
      { key: "1", name: "home" },
      { key: "2", name: "settings" },
    ],
    index: 0,
  },
  descriptors: {
    "1": { options: { title: "Home" } },
    "2": { options: { title: "Settings" } },
  },
  navigation: { emit: jest.fn(), navigate: jest.fn() },
};

describe("CustomTabBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null and completely hides tabs when trainId is null (logged out)", () => {
    useJourneyStore.getState().clearJourney(); // Ensure logged out

    const { queryByTestId } = render(
      <SettingsProvider>
        <CustomTabBar {...(mockProps as any)} />
      </SettingsProvider>,
    );

    expect(queryByTestId("blur-view")).toBeNull();
  });

  it("renders the tab bar correctly when trainId exists (logged in)", () => {
    useJourneyStore.setState({ trainId: "12345" }); // Simulate logged in

    const { getByTestId, getByText } = render(
      <SettingsProvider>
        <CustomTabBar {...(mockProps as any)} />
      </SettingsProvider>,
    );

    // Ensure the container is rendered
    expect(getByTestId("blur-view")).toBeTruthy();

    // Ensure the actual tabs are mapped and rendered based on our descriptors
    expect(getByText("Home")).toBeTruthy();
    expect(getByText("Settings")).toBeTruthy();
  });
});
