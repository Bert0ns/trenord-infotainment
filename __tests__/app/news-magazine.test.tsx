import React from "react";
import { render } from "@testing-library/react-native";
import NewsMagazinePage from "@/app/news-magazine";
import { useNews } from "@/hooks/useNews";
import { useItalyNews } from "@/hooks/useItalyNews";
import { useWorldNews } from "@/hooks/useWorldNews";
import { useJourneyStore } from "@/store/journeyStore";

jest.mock("@/hooks/useNews");
jest.mock("@/hooks/useItalyNews");
jest.mock("@/hooks/useWorldNews");
jest.mock("@/store/journeyStore");
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

jest.mock("@/hooks/settings", () => ({
  useSettings: () => ({
    settings: {
      theme: "light",
      enableNewsApi: true,
    },
  }),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
  MaterialIcons: "MaterialIcons",
}));

jest.mock("@/components/report-issue-components/sheet-container", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    SheetContainer: React.forwardRef(function SheetContainer(
      { children, header, onClose }: any,
      ref: any,
    ) {
      React.useImperativeHandle(ref, () => ({
        close: () => onClose && onClose(),
      }));
      return (
        <View testID="sheet-container">
          {header}
          {children}
        </View>
      );
    }),
  };
});

// Default translation mock is handled in jest.setup.js

describe("NewsMagazinePage", () => {
  beforeEach(() => {
    (useJourneyStore as unknown as jest.Mock).mockReturnValue({
      destinationStation: { station_ori_name: "Milano" },
      destinationMunicipality: "Milano",
    });

    (useNews as jest.Mock).mockReturnValue({
      data: [{ id: "local1", title: "Local News", url: "https://1" }],
      isLoading: false,
    });

    (useItalyNews as jest.Mock).mockReturnValue({
      data: [{ id: "italy1", title: "Italy News", url: "https://2" }],
      isLoading: false,
    });

    (useWorldNews as jest.Mock).mockReturnValue({
      data: [{ id: "world1", title: "World News", url: "https://3" }],
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with local, italy and world news", () => {
    const { getByText, getAllByText } = render(<NewsMagazinePage />);

    // Check if labels appear
    expect(getByText("Milan")).toBeTruthy();
    expect(getAllByText("Italy News").length).toBeGreaterThanOrEqual(1);
    expect(getAllByText("World News").length).toBeGreaterThanOrEqual(1);

    // The MasonryGrid is rendering the cards. Since MagazineCard uses the real component
    // it will render the titles.
    expect(getByText("Local News")).toBeTruthy();
  });

  it("renders empty state if no news", () => {
    (useNews as jest.Mock).mockReturnValue({ data: [], isLoading: false });
    (useItalyNews as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
    (useWorldNews as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    const { getByText } = render(<NewsMagazinePage />);

    expect(getByText("No news available at the moment.")).toBeTruthy();
  });
});
