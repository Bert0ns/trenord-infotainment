import HomeScreen from "@/app/(tabs)/home/home";
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
    iconColor: { color: "#000" },
    titleHome: {},
    title: {},
    seeAll: {},
    seeMore: {},
    container: {},
    content: {},
    pageHeader: {},
    pageTitle: {},
    pageSubtitle: {},
    themeRow: {},
    themeBox: {},
    themeBoxActive: {},
    themeBoxText: {},
    themeBoxTextActive: {},
    dropdown: {},
    dropdownText: {},
    footer: {},
    reportButton: {},
    reportButtonText: {},
    versionText: {},
    linksRow: {},
    link: {},
    card: {},
    timelineContainer: {},
    newsCard: {},
    tag: {},
    newsText: {},
    discoverCard: {},
    image: {},
    info: {},
    discoverTitle: {},
    discoverSubtitle: {},
    button: {},
    buttonText: {},
    timelineItem: {},
    timelineContent: {},
    timelineTimeContainer: {},
    timeText: {},
    stationText: {},
    delayText: {},
    platformText: {},
    timelineDot: {},
    timelineLine: {},
  }),
  useTheme: () => ({
    colors: {
      primary: "#000",
      mutedForeground: "#555",
      primaryForeground: "#fff",
      background: "#fff",
      border: "#eee",
      foreground: "#000",
      muted: "#ccc",
      destructive: "#f00",
    },
    spacing: { sm: 4, md: 8, lg: 16 },
    borderRadius: { sm: 4, md: 8, lg: 16, xl: 24 },
  }),
}));

jest.mock("@/store/journeyStore", () => ({
  ...jest.requireActual("@/store/journeyStore"),
  useJourneyStore: jest.fn(),
}));

jest.mock("@/hooks/settings", () => ({
  useSettings: () => ({
    settings: { enableNewsApi: true },
    set: jest.fn(),
  }),
}));

jest.mock("@/hooks/useNews", () => ({
  useNews: () => ({
    data: [
      {
        id: "1",
        title: "Test News",
        description: "Desc",
        image: null,
        url: "https://example.com",
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to login if trainId is null", () => {
    (useJourneyStore as unknown as jest.Mock).mockImplementation(
      (selector: any) => selector({ trainId: null }),
    );
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Redirected to login")).toBeTruthy();
  });

  it("renders train info and destination successfully", () => {
    (useJourneyStore as unknown as jest.Mock).mockImplementation(
      (selector: any) =>
        selector({
          trainId: "1234",
          destinationStation: {
            station_id: "S02",
            station_ori_name: "Milano Centrale",
          },
          trainData: [
            {
              dep_time: "08:00:00",
              arr_time: "09:00:00",
              journey_list: [
                {
                  train: {
                    train_category: "REG",
                    delay: 5,
                    crowding: { level: "low" },
                  },
                  pass_list: [
                    {
                      station: { station_id: "S01", station_ori_name: "Como" },
                      actual_data: { dep_actual_time: "08:05:00" },
                      cancelled: false,
                      pass_count: 1,
                    },
                    {
                      station: {
                        station_id: "S02",
                        station_ori_name: "Milano Centrale",
                      },
                      arr_time: "09:00:00",
                      actual_data: {},
                      cancelled: false,
                    },
                  ],
                },
              ],
            },
          ],
        }),
    );
    const { getByText, getAllByText } = render(<HomeScreen />);
    expect(getAllByText("Milano Centrale").length).toBeGreaterThan(0);
    expect(getByText("REG 1234")).toBeTruthy();
  });
});
