import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import React from "react";

import { THEME } from "@/constants/theme";
import SettingsScreen from "../app/(tabs)/settings";

// Mock the SettingSwitch component to make switch interaction testable.
jest.mock("@/components/settings-componenents/settingSwitch", () => {
  const React = require("react");
  const { View, Text, Pressable } = require("react-native");
  return {
    __esModule: true,
    default: ({ label, value, onValueChange }: any) =>
      React.createElement(
        View,
        null,
        React.createElement(Text, null, label),
        React.createElement(
          Text,
          { testID: `value-${label}` },
          value ? "ON" : "OFF",
        ),
        React.createElement(
          Pressable,
          { testID: `toggle-${label}`, onPress: () => onValueChange(!value) },
          React.createElement(Text, null, "Toggle"),
        ),
      ),
  };
});

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

// Mock vector icons to avoid transpilation/runtime issues in tests
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
  Ionicons: "Ionicons",
}));

describe("SettingsScreen", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renders headings and footer", () => {
    const { getByText } = render(<SettingsScreen />);

    expect(getByText("Settings")).toBeTruthy();
    expect(
      getByText("Manage your app preferences and travel experience."),
    ).toBeTruthy();
    expect(getByText("Report Issue")).toBeTruthy();
    expect(getByText("App Version 0.0.0")).toBeTruthy();
  });

  it("toggles Anti-Sickness switch", () => {
    const { getAllByText } = render(<SettingsScreen />);

    // Count how many 'ON' indicators exist before pressing
    const onBefore = getAllByText("ON").length;

    const toggleButtons = getAllByText("Toggle");
    fireEvent.press(toggleButtons[0]);

    const onAfter = getAllByText("ON").length;
    expect(onAfter).toBe(onBefore + 1);
  });

  it("selects language from dropdown", () => {
    const { getByText } = render(<SettingsScreen />);

    // initial language is English (UK)
    const trigger = getByText("English (UK)");
    fireEvent.press(trigger);

    // Italian option should appear
    const italian = getByText("Italiano");
    expect(italian).toBeTruthy();

    fireEvent.press(italian);

    // selected value should now be Italiano
    expect(getByText("Italiano")).toBeTruthy();
  });

  it("changes theme when ThemeOption pressed", () => {
    const { getByText } = render(<SettingsScreen />);

    const dark = getByText("Dark");
    fireEvent.press(dark);

    const instance = getByText("Dark");
    expect(instance.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: THEME.colors.primary }),
      ]),
    );
  });

  it("navigates to report page on Report Issue press", () => {
    const { getByText } = render(<SettingsScreen />);

    const reportBtn = getByText("Report Issue");
    fireEvent.press(reportBtn);

    expect(mockPush).toHaveBeenCalledWith("/report-issue-page");
  });
});
