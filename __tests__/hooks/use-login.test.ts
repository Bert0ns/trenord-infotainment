import { act, renderHook } from "@testing-library/react-native";
import { useLogin } from "../../hooks/use-login";
import * as api from "../../lib/api/trenord/trenord";
import { useJourneyStore } from "../../store/journeyStore";

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

// Mock the API
jest.mock("../../lib/api/trenord/trenord", () => ({
  fetchTrainData: jest.fn(),
}));

describe("useLogin hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useJourneyStore.getState().clearJourney();
  });

  it("initializes with default values", () => {
    const { result } = renderHook(() => useLogin());
    expect(result.current.ticketCode).toBe("");
    expect(result.current.destination).toBe("");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.errorMsg).toBeNull();
    expect(result.current.canSearch).toBe(false);
    expect(result.current.canStart).toBe(false);
  });

  it("handles code changes correctly and clears existing state", () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.handleCodeChange("123abc45");
    });

    // It should strip non-digits
    expect(result.current.ticketCode).toBe("12345");
    expect(result.current.canSearch).toBe(true);
  });

  it("handles successful train search", async () => {
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
            ],
          },
        ],
      },
    ];
    (api.fetchTrainData as jest.Mock).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.handleCodeChange("12345");
    });

    await act(async () => {
      await result.current.handleSearch();
    });

    expect(result.current.trainData).toEqual(mockData);
    expect(result.current.stations.length).toBe(1);
    expect(result.current.stations[0].station_ori_name).toBe("Milano Centrale");
    expect(result.current.errorMsg).toBeNull();
  });

  it("handles API failure gracefully", async () => {
    (api.fetchTrainData as jest.Mock).mockRejectedValueOnce(
      new Error("Network Error"),
    );

    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.handleCodeChange("12345");
    });

    await act(async () => {
      await result.current.handleSearch();
    });

    expect(result.current.trainData).toBeNull();
    expect(result.current.errorMsg).toBe(
      "Connection error. Could not reach the server.",
    );
    expect(result.current.isLoading).toBe(false);
  });

  it("handles valid QR scan with destination preset", async () => {
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
            ],
          },
        ],
      },
    ];
    (api.fetchTrainData as jest.Mock).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      // Simulate scanning a JSON payload
      result.current.handleQRScan(
        JSON.stringify({ ticketCode: "12345", destination: "Milano Centrale" }),
      );
      // Wait for internal handleSearch to finish its async work
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(result.current.ticketCode).toBe("12345");
    expect(result.current.trainData).toEqual(mockData);
    // Because it auto-logs in with preset destination, it shouldn't set errorMsg
    expect(result.current.errorMsg).toBeNull();
  });

  it("rejects invalid QR formats", () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.handleQRScan("Not JSON at all!");
    });

    expect(result.current.errorMsg).toBe(
      "Invalid QR code format. Expected JSON.",
    );
  });

  it("rejects QR payload missing ticket code", () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.handleQRScan(JSON.stringify({ someData: "yes" }));
    });

    expect(result.current.errorMsg).toBe("QR code is missing the ticket code.");
  });

  it("rejects QR payload with non-numeric ticket code", () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.handleQRScan(JSON.stringify({ ticketCode: "12A45" }));
    });

    expect(result.current.errorMsg).toBe(
      'Scanned ticket code "12A45" is invalid (must be 4-7 numbers).',
    );
  });
});
