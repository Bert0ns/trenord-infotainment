import { renderHook, waitFor } from "@testing-library/react-native";
import { useNews } from "@/hooks/useNews";
import { getRelevantNews } from "@/lib/api/currentsapi-news/currentsapi-news-service";
import { useSettingsStore } from "@/store/settingsStore";
import { useJourneyStore } from "@/store/journeyStore";
import { useNewsStore } from "@/store/newsStore";

jest.mock("@/lib/api/currentsapi-news/currentsapi-news-service");
jest.mock("@/store/settingsStore");
jest.mock("@/store/journeyStore");
jest.mock("@/store/newsStore");

jest.mock("@/lib/logger", () => {
  const mLogger = { log: jest.fn(), error: jest.fn() };
  return { logger: { extend: () => mLogger } };
});

describe("useNews Hook", () => {
  const mockNewsData = [{ id: "1", title: "Test News" }];

  beforeEach(() => {
    jest.clearAllMocks();

    (useSettingsStore as unknown as jest.Mock).mockImplementation(
      (selector) => {
        if (selector) return selector({ settings: { enableNewsApi: true } });
        return { settings: { enableNewsApi: true } };
      },
    );

    (useJourneyStore as unknown as jest.Mock).mockReturnValue({
      destinationStation: null,
      destinationMunicipality: null,
      isMunicipalityLoading: false,
      trainId: "1234",
    });

    const mockStoreState = {
      cacheVersion: 0,
    };

    (useNewsStore as unknown as jest.Mock).mockImplementation((selector) => {
      if (selector) {
        return selector(mockStoreState);
      }
      return mockStoreState;
    });

    (getRelevantNews as jest.Mock).mockResolvedValue(mockNewsData);

    process.env.EXPO_PUBLIC_ENABLE_NEWS_API = "true";
  });

  it("should return empty array if enableNewsApi setting is false", async () => {
    (useSettingsStore as unknown as jest.Mock).mockImplementation(
      (selector) => {
        if (selector) return selector({ settings: { enableNewsApi: false } });
        return { settings: { enableNewsApi: false } };
      },
    );

    const { result } = renderHook(() => useNews());

    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(getRelevantNews).not.toHaveBeenCalled();
  });

  it("should call getRelevantNews and return data", async () => {
    const { result } = renderHook(() => useNews());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getRelevantNews).toHaveBeenCalledWith(undefined, "en");
    expect(result.current.data).toEqual(mockNewsData);
  });

  it("should call getRelevantNews with keywords if destination station is set", async () => {
    (useJourneyStore as unknown as jest.Mock).mockReturnValue({
      destinationStation: { station_ori_name: "Milano Centrale" },
      destinationMunicipality: null,
      isMunicipalityLoading: false,
      trainId: "1234",
    });

    const { result } = renderHook(() => useNews());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getRelevantNews).toHaveBeenCalledWith("Milano Centrale", "en");
    expect(result.current.data).toEqual(mockNewsData);
  });

  it("should prefer destinationMunicipality over station_ori_name for search", async () => {
    (useJourneyStore as unknown as jest.Mock).mockReturnValue({
      destinationStation: { station_ori_name: "MILANO GRECO PIRELLI" },
      destinationMunicipality: "Milano",
      isMunicipalityLoading: false,
      trainId: "1234",
    });

    const { result } = renderHook(() => useNews());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getRelevantNews).toHaveBeenCalledWith("Milan", "en");
  });

  it("should handle API errors gracefully", async () => {
    const mockError = new Error("API Failure");
    (getRelevantNews as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useNews());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toEqual([]);
  });
});
