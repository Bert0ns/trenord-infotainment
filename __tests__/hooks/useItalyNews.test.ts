import { renderHook, waitFor } from "@testing-library/react-native";
import { useItalyNews } from "@/hooks/useItalyNews";
import { getItalyNews } from "@/lib/api/currentsapi-news/currentsapi-news-service";
import { useSettingsStore } from "@/store/settingsStore";
import { useJourneyStore } from "@/store/journeyStore";

jest.mock("@/lib/api/currentsapi-news/currentsapi-news-service");
jest.mock("@/store/settingsStore");
jest.mock("@/store/journeyStore");

// Default translation mock is handled in jest.setup.js

describe("useItalyNews", () => {
  const originalEnv = process.env.EXPO_PUBLIC_ENABLE_NEWS_API;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_ENABLE_NEWS_API = "true";
    (useSettingsStore as unknown as jest.Mock).mockImplementation(
      (selector) => {
        if (selector) return selector({ settings: { enableNewsApi: true } });
        return { settings: { enableNewsApi: true } };
      },
    );
    (useJourneyStore as unknown as jest.Mock).mockImplementation(
      (selector: any) => {
        // simulate returning a valid trainId
        return selector({ trainId: "12345" });
      },
    );
    (getItalyNews as jest.Mock).mockResolvedValue([
      { id: "1", title: "Global Article 1" },
    ]);
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_ENABLE_NEWS_API = originalEnv;
    jest.clearAllMocks();
  });

  it("should fetch italy news when enabled and train is selected", async () => {
    const { result } = renderHook(() => useItalyNews());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toEqual([]);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data.length).toBe(1);
    expect(getItalyNews).toHaveBeenCalledWith("en");
  });

  it("should not fetch if settings.enableNewsApi is false", async () => {
    (useSettingsStore as unknown as jest.Mock).mockImplementation(
      (selector) => {
        if (selector) return selector({ settings: { enableNewsApi: false } });
        return { settings: { enableNewsApi: false } };
      },
    );

    const { result } = renderHook(() => useItalyNews());

    expect(result.current.isLoading).toBe(false);
    expect(getItalyNews).not.toHaveBeenCalled();
  });

  it("should not fetch if trainId is missing", async () => {
    (useJourneyStore as unknown as jest.Mock).mockImplementation(
      (selector: any) => {
        return selector({ trainId: null });
      },
    );

    const { result } = renderHook(() => useItalyNews());

    expect(result.current.isLoading).toBe(false);
    expect(getItalyNews).not.toHaveBeenCalled();
  });
});
