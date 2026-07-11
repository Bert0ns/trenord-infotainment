import RootLayout from "@/app/_layout";
import { render } from "@testing-library/react-native";
import React from "react";

jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  RN.Platform.OS = "web";
  return RN;
});

// Mock expo-router
jest.mock("expo-router", () => ({
  Stack: Object.assign(
    ({ children }: { children: React.ReactNode }) => <>{children}</>,
    {
      Screen: ({ name }: { name: string }) => {
        const { Text } = require("react-native");
        return <Text>{name}</Text>;
      },
    },
  ),
  usePathname: () => "/",
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

// Mock expo-status-bar
jest.mock("expo-status-bar", () => ({
  StatusBar: () => "StatusBar",
}));

// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => ({
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock useSettings
jest.mock("@/store/settingsStore", () => ({
  useSettingsStore: (selector: any) => {
    if (selector) return selector({ settings: { antiSickness: false } });
    return { settings: { antiSickness: false } };
  },
}));

describe("RootLayout", () => {
  it("renders correctly", () => {
    const { getByText } = render(<RootLayout />);
    // Check that some of the Stack.Screen names render
    expect(getByText("index")).toBeTruthy();
    expect(getByText("login")).toBeTruthy();
    expect(getByText("(tabs)")).toBeTruthy();
    expect(getByText("report-issue-page")).toBeTruthy();
  });
});
