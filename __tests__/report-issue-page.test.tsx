import { act, fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import React from "react";

import ReportIssuePage from "@/app/report-issue-page";
import { SettingsProvider } from "@/hooks/settings";
import enReportIssue from "@/lib/i18n/locales/en/reportIssue.json";

declare const global: any;

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 20, left: 0, right: 0 }),
  SafeAreaView: ({ children }: any) => children,
}));

// Mock Reanimated manually to prevent initialization and Worklets errors
jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: jest.fn((component) => component),
    },
    runOnJS: jest.fn((fn) => fn),
    useAnimatedStyle: jest.fn(() => ({})),
    useSharedValue: jest.fn((val) => ({ value: val })),
    withSpring: jest.fn((val) => val),
    withTiming: jest.fn((val, config, callback) => {
      if (callback) {
        callback(true);
      }
      return val;
    }),
  };
});

// Mock Gesture Handler
jest.mock("react-native-gesture-handler", () => {
  return {
    GestureDetector: ({ children }: any) => children,
    Gesture: {
      Pan: () => ({
        activeOffsetY: jest.fn().mockReturnThis(),
        onChange: jest.fn().mockReturnThis(),
        onFinalize: jest.fn().mockReturnThis(),
      }),
    },
  };
});

// Mock Expo Vector Icons to avoid ES module transpilation errors
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

describe("ReportIssuePage", () => {
  const mockBack = jest.fn();

  const renderWithProvider = async (component: React.ReactElement) => {
    const result = render(<SettingsProvider>{component}</SettingsProvider>);
    await act(async () => {
      await Promise.resolve();
    });
    return result;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
    });
    global.alert = jest.fn(); // Mock window.alert
  });

  it("renders the page and its main elements", async () => {
    const { getByText, getByPlaceholderText } = await renderWithProvider(
      <ReportIssuePage />,
    );

    expect(getByText(enReportIssue.reportAnIssue)).toBeTruthy();
    expect(getByText(enReportIssue.whatSeemsToBeTheProblem)).toBeTruthy();
    expect(
      getByPlaceholderText(enReportIssue.detailsInput.placeholder),
    ).toBeTruthy();
    expect(getByText(enReportIssue.actionButtons.submitReport)).toBeTruthy();
  });

  it("updates the details input text correctly when user types", async () => {
    const { getByPlaceholderText } = await renderWithProvider(
      <ReportIssuePage />,
    );

    const input = getByPlaceholderText(enReportIssue.detailsInput.placeholder);

    fireEvent.changeText(input, "The AC is broken in carriage 3.");

    expect(input.props.value).toBe("The AC is broken in carriage 3.");
  });

  it("triggers a success alert on submit", async () => {
    const { getByText } = await renderWithProvider(<ReportIssuePage />);
    const submitBtn = getByText(enReportIssue.actionButtons.submitReport);

    fireEvent.press(submitBtn);

    expect(global.alert).toHaveBeenCalledWith(
      enReportIssue.reportSubmittedSuccessfully,
    );
  });
});
