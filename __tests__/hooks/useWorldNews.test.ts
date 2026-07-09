import { renderHook, waitFor } from "@testing-library/react-native";
import { useWorldNews } from "@/hooks/useWorldNews";
import { getWorldNews } from "@/lib/api/currentsapi-news/currentsapi-news-service";
import { useSettings } from "@/hooks/settings";
import { useJourneyStore } from "@/store/journeyStore";

jest.mock("@/lib/api/currentsapi-news/currentsapi-news-service");
jest.mock("@/hooks/settings");
jest.mock("@/store/journeyStore");

// Default translation mock is handled in jest.setup.js

describe("useWorldNews", () => {
  const originalEnv = process.env.EXPO_PUBLIC_ENABLE_NEWS_API;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_ENABLE_NEWS_API = "true";
    (useSettings as jest.Mock).mockReturnValue({
      settings: { enableNewsApi: true },
    });
    (useJourneyStore as unknown as jest.Mock).mockImplementation(
      (selector: any) => {
        // simulate returning a valid trainId
        return selector({ trainId: "12345" });
      },
    );
    (getWorldNews as jest.Mock).mockResolvedValue([
      { id: "1", title: "World Article 1" },
    ]);
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_ENABLE_NEWS_API = originalEnv;
    jest.clearAllMocks();
  });

  it("should fetch world news when enabled and train is selected", async () => {
    const { result } = renderHook(() => useWorldNews());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toEqual([]);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data.length).toBe(1);
    expect(getWorldNews).toHaveBeenCalledWith("en");
  });

  it("should not fetch if settings.enableNewsApi is false", async () => {
    (useSettings as jest.Mock).mockReturnValue({
      settings: { enableNewsApi: false },
    });

    const { result } = renderHook(() => useWorldNews());

    expect(result.current.isLoading).toBe(false);
    expect(getWorldNews).not.toHaveBeenCalled();
  });

  it("should not fetch if trainId is missing", async () => {
    (useJourneyStore as unknown as jest.Mock).mockImplementation(
      (selector: any) => {
        return selector({ trainId: null });
      },
    );

    const { result } = renderHook(() => useWorldNews());

    expect(result.current.isLoading).toBe(false);
    expect(getWorldNews).not.toHaveBeenCalled();
  });
});
