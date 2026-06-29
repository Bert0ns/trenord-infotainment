import { renderHook, act } from "@testing-library/react-native";
import { useRefreshTrainData } from "@/hooks/use-refresh-train-data";
import { useJourneyStore } from "@/store/journeyStore";
import { fetchTrainData } from "@/lib/api/trenord";

jest.mock("@/lib/api/trenord", () => ({
  fetchTrainData: jest.fn(),
}));

jest.mock("@/lib/logger", () => {
  const mLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };
  return {
    logger: {
      ...mLogger,
      extend: () => mLogger,
    },
  };
});

describe("useRefreshTrainData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const store = useJourneyStore.getState();
    store.clearJourney();
  });

  it("should do nothing if trainId or destinationStation is missing", async () => {
    const { result } = renderHook(() => useRefreshTrainData());

    await act(async () => {
      await result.current.onRefresh();
    });

    expect(fetchTrainData).not.toHaveBeenCalled();
  });

  it("should fetch new data and update the store", async () => {
    const mockTrainData = [{ journey_list: [] }];
    (fetchTrainData as jest.Mock).mockResolvedValue(mockTrainData);

    const store = useJourneyStore.getState();
    act(() => {
      store.setJourney(
        "12345",
        { station_id: "S1", station_ori_name: "Milan" },
        [] as unknown as import("@/lib/api/types").TrainInfoResponse,
      );
    });

    const { result } = renderHook(() => useRefreshTrainData());

    await act(async () => {
      await result.current.onRefresh();
    });

    expect(fetchTrainData).toHaveBeenCalledWith("12345");
    expect(useJourneyStore.getState().trainData).toEqual(mockTrainData);
  });
});
