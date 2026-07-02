import { useRefreshTrainData } from "@/hooks/use-refresh-train-data";
import { fetchTrainData } from "@/lib/api/trenord/trenord";
import { useJourneyStore } from "@/store/journeyStore";
import { act, renderHook } from "@testing-library/react-native";

jest.mock("@/lib/api/trenord/trenord", () => ({
  fetchTrainData: jest.fn(),
}));

jest.mock("@/lib/logger", () => {
  const mLogger = {
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
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
        [] as unknown as import("@/lib/api/trenord/trenord-types").TrainInfoResponse,
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
