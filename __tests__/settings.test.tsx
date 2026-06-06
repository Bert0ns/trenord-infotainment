import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";

import { SettingsProvider } from "@/hooks/settings";
import enSettings from "@/lib/i18n/locales/en/settings.json";
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

const renderWithProvider = async (component: React.ReactElement) => {
  const result = render(<SettingsProvider>{component}</SettingsProvider>);
  // Flush the microtask queue to allow SettingsProvider's async useEffect to complete
  await act(async () => {
    await Promise.resolve();
  });
  return result;
};

describe("SettingsScreen", () => {
  const mockPush = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renders headings and footer", async () => {
    const { getByText } = await renderWithProvider(<SettingsScreen />);

    expect(getByText(enSettings.title)).toBeTruthy();
    expect(getByText(enSettings.subtitle)).toBeTruthy();
    expect(getByText(/App Version 0.0.0/)).toBeTruthy();
  });

  it("initializes with default settings", async () => {
    const { getByTestId, getByText } = await renderWithProvider(
      <SettingsScreen />,
    );

    expect(
      getByTestId(`value-${enSettings.travelComfort.antiSickness.label}`).props
        .children,
    ).toBe("OFF");
    expect(
      getByTestId(`value-${enSettings.notifications.journeyProgress.title}`)
        .props.children,
    ).toBe("ON");
    expect(
      getByTestId(`value-${enSettings.notifications.delayAlerts.title}`).props
        .children,
    ).toBe("ON");
    expect(
      getByTestId(`value-${enSettings.notifications.weatherAlerts.title}`).props
        .children,
    ).toBe("OFF");
  });

  it("toggles all configuration switches correctly", async () => {
    const { getByTestId } = await renderWithProvider(<SettingsScreen />);

    fireEvent.press(getByTestId("toggle-Anti-Sickness Mode"));
    expect(getByTestId("value-Anti-Sickness Mode").props.children).toBe("ON");

    fireEvent.press(getByTestId("toggle-Journey Progress"));
    expect(getByTestId("value-Journey Progress").props.children).toBe("OFF");

    fireEvent.press(getByTestId("toggle-Delay Alerts"));
    expect(getByTestId("value-Delay Alerts").props.children).toBe("OFF");

    fireEvent.press(getByTestId("toggle-Weather & Disruptions"));
    expect(getByTestId("value-Weather & Disruptions").props.children).toBe(
      "ON",
    );
  });

  // it("selects language from dropdown", async () => {
  //   const { getByText } = await renderWithProvider(<SettingsScreen />);

  //   const trigger = getByText(enSettings.language.default);
  //   fireEvent.press(trigger);

  //   const option = getByText("Italiano");
  //   fireEvent.press(option);

  //   expect(getByText("Italiano")).toBeTruthy();
  // });

  it("changes theme across all options (Light, Dark, System)", async () => {
    const { getByText } = await renderWithProvider(<SettingsScreen />);

    const options = ["Light", "Dark", "System"];

    for (const option of options) {
      const themeBtn = getByText(option);
      fireEvent.press(themeBtn);

      const activeThemeBtn = getByText(option);
      // "themeBoxTextActive" explicitly adds fontWeight 600, checking for it verifies it's active
      expect(activeThemeBtn.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontWeight: "600" }),
        ]),
      );
    }
  });

  it("navigates to report page on Report Issue press", async () => {
    const { getByText } = await renderWithProvider(<SettingsScreen />);

    const reportBtn = getByText(enSettings.reportIssue);
    fireEvent.press(reportBtn);

    expect(mockPush).toHaveBeenCalledWith("/report-issue-page");
  });
});
