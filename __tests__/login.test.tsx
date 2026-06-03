import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginScreen from "../app/login";
import * as api from "../lib/api/trenord";
import { useJourneyStore } from "../store/journeyStore";
import { SettingsProvider } from "../hooks/settings";

// Mock expo-router
const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
}));

// Mock vector icons to avoid transpilation issues in node_modules
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

// Mock the API
jest.mock("../lib/api/trenord", () => ({
  fetchTrainData: jest.fn(),
}));

// Mock the DropDownSelector to easily simulate selecting an option
jest.mock("../components/ui/dropDownSelector", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return ({ options, onSelect }: any) => (
    <TouchableOpacity
      testID="mock-dropdown"
      onPress={() => onSelect(options[0])}
    >
      <Text>Mock Dropdown</Text>
    </TouchableOpacity>
  );
});

// Mock SafeAreaInsets
jest.mock("react-native-safe-area-context", () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: jest.fn().mockImplementation(({ children }) => children),
    SafeAreaConsumer: jest
      .fn()
      .mockImplementation(({ children }) => children(inset)),
    useSafeAreaInsets: jest.fn().mockReturnValue(inset),
  };
});

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useJourneyStore.getState().clearJourney();
  });

  it("renders correctly and disables search button initially", () => {
    const { getByPlaceholderText, getByText } = render(
      <SettingsProvider>
        <LoginScreen />
      </SettingsProvider>,
    );

    expect(getByPlaceholderText("Enter 4-7 digit code")).toBeTruthy();
    expect(getByText("Search Train")).toBeTruthy();
  });

  it("displays an error if the train API fails", async () => {
    (api.fetchTrainData as jest.Mock).mockRejectedValueOnce(
      new Error("Network Error"),
    );

    const { getByPlaceholderText, getByText, findByText } = render(
      <SettingsProvider>
        <LoginScreen />
      </SettingsProvider>,
    );

    const input = getByPlaceholderText("Enter 4-7 digit code");
    fireEvent.changeText(input, "12345"); // valid length

    const searchButton = getByText("Search Train");
    fireEvent.press(searchButton);

    const errorText = await findByText(
      "Connection error. Could not reach the server.",
    );
    expect(errorText).toBeTruthy();
  });

  it("displays an error if train is not found", async () => {
    (api.fetchTrainData as jest.Mock).mockResolvedValueOnce([]); // Empty response

    const { getByPlaceholderText, getByText, findByText } = render(
      <SettingsProvider>
        <LoginScreen />
      </SettingsProvider>,
    );

    const input = getByPlaceholderText("Enter 4-7 digit code");
    fireEvent.changeText(input, "12345");

    const searchButton = getByText("Search Train");
    fireEvent.press(searchButton);

    const errorText = await findByText(
      "We couldn't find any active train with this code. Please verify the number.",
    );
    expect(errorText).toBeTruthy();
  });

  it("fetches data, selects a destination, and starts journey successfully", async () => {
    const mockData = [
      {
        journey_list: [
          {
            pass_list: [
              {
                station: {
                  station_id: "S01",
                  station_ori_name: "Milano Centrale",
                },
              },
              {
                station: {
                  station_id: "S02",
                  station_ori_name: "Como San Giovanni",
                },
              },
            ],
          },
        ],
      },
    ];
    (api.fetchTrainData as jest.Mock).mockResolvedValueOnce(mockData);

    const { getByPlaceholderText, getByText, getByTestId, findByText } = render(
      <SettingsProvider>
        <LoginScreen />
      </SettingsProvider>,
    );

    // Type code
    const input = getByPlaceholderText("Enter 4-7 digit code");
    fireEvent.changeText(input, "12345");

    // Press Search
    fireEvent.press(getByText("Search Train"));

    // Wait for API response and for dropdown to appear
    await findByText("Destination station");

    // Simulate selecting the first station from the mocked dropdown
    fireEvent.press(getByTestId("mock-dropdown"));

    // Press Start Journey
    const startButton = getByText("Start Journey");
    fireEvent.press(startButton);

    // Verify Zustand store was updated correctly
    const state = useJourneyStore.getState();
    expect(state.trainId).toBe("12345");
    expect(state.destinationStation?.station_ori_name).toBe("Milano Centrale");
    expect(state.trainData).toEqual(mockData);

    // Verify router replacement
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)/home");
  });
});
