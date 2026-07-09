import JourneyScreen from "@/app/(tabs)/journey";
import { useJourneyStore } from "@/store/journeyStore";
import { render } from "@testing-library/react-native";

jest.mock("expo-router", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Redirect: () => React.createElement(Text, null, "Redirected to login"),
  };
});

jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

jest.mock("@/hooks/use-theme-color", () => ({
  createStyleHook: () => () => ({
    container: {},
    content: {},
    pageHeader: {},
    pageTitle: {},
    pageSubtitle: {},
    timelineContainer: {},
  }),
  useTheme: () => ({
    colors: {
      primary: "#000",
      mutedForeground: "#555",
      background: "#fff",
      border: "#eee",
      foreground: "#000",
    },
    spacing: { sm: 4, md: 8, lg: 16 },
    borderRadius: { sm: 4, md: 8, lg: 16, xl: 24 },
  }),
}));

jest.mock("@/store/journeyStore", () => ({
  ...jest.requireActual("@/store/journeyStore"),
  useJourneyStore: jest.fn(),
}));

describe("JourneyScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to login if trainId is null", () => {
    (useJourneyStore as unknown as jest.Mock).mockImplementation(
      (selector: any) => selector({ trainId: null }),
    );
    const { getByText } = render(<JourneyScreen />);
    expect(getByText("Redirected to login")).toBeTruthy();
  });

  it("renders the timeline correctly with train data", () => {
    (useJourneyStore as unknown as jest.Mock).mockImplementation(
      (selector: any) =>
        selector({
          trainId: "4567",
          destinationStation: { station_id: "S3", station_ori_name: "Bergamo" },
          trainData: [
            {
              dep_time: "10:00:00",
              arr_time: "11:00:00",
              journey_list: [
                {
                  train: {
                    train_category: "RE",
                    delay: 2,
                  },
                  pass_list: [
                    {
                      station: {
                        station_id: "S1",
                        station_ori_name: "Milano Porta Garibaldi",
                      },
                      actual_data: { dep_actual_time: "10:02:00" },
                      cancelled: false,
                      pass_count: 1,
                      type: "O",
                      dep_time: "10:00:00",
                    },
                    {
                      station: { station_id: "S2", station_ori_name: "Monza" },
                      actual_data: {},
                      cancelled: false,
                      type: "F",
                      arr_time: "10:20:00",
                    },
                    {
                      station: {
                        station_id: "S3",
                        station_ori_name: "Bergamo",
                      },
                      actual_data: {},
                      cancelled: false,
                      type: "D",
                      arr_time: "11:00:00",
                    },
                  ],
                },
              ],
            },
          ],
        }),
    );

    const { getAllByText } = render(<JourneyScreen />);
    expect(getAllByText("Milano Porta Garibaldi").length).toBeGreaterThan(0);
    expect(getAllByText("Monza").length).toBeGreaterThan(0);
    // Use getAllByText because it appears in the header and timeline
    expect(getAllByText("Bergamo").length).toBeGreaterThan(0);
  });
});
