import {
  FETCH_TRAIN_POLLING_RATE,
  useTrainPolling,
} from "@/hooks/use-train-polling";
import { fetchTrainData } from "@/lib/api/trenord/trenord";
import { useJourneyStore } from "@/store/journeyStore";
import { renderHook } from "@testing-library/react-native";

jest.mock("@/lib/api/trenord/trenord", () => ({
  fetchTrainData: jest.fn(),
  fetchStationMetadata: jest.fn().mockResolvedValue([]),
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

describe("useTrainPolling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    useJourneyStore.getState().clearJourney();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should not start polling if trainId is missing", () => {
    renderHook(() => useTrainPolling());

    jest.advanceTimersByTime(FETCH_TRAIN_POLLING_RATE + 1000);

    expect(fetchTrainData).not.toHaveBeenCalled();
  });

  it("should start polling if trainId and destination are present", async () => {
    const mockData = [{ journey_list: [] }];
    (fetchTrainData as jest.Mock).mockResolvedValue(mockData);

    const store = useJourneyStore.getState();
    store.setJourney(
      "12345",
      { station_id: "S1", station_ori_name: "Milan" },
      [] as any,
    );

    renderHook(() => useTrainPolling());

    // Initially, no fetch because it uses setInterval which waits for the first tick
    expect(fetchTrainData).not.toHaveBeenCalledWith("12345");

    // Fast forward 2 minutes
    jest.advanceTimersByTime(FETCH_TRAIN_POLLING_RATE);

    // It should now have been called
    expect(fetchTrainData).toHaveBeenCalledWith("12345");
  });

  it("should stop polling when unmounted", () => {
    const mockData = [{ journey_list: [] }];
    (fetchTrainData as jest.Mock).mockResolvedValue(mockData);

    const store = useJourneyStore.getState();
    store.setJourney(
      "12345",
      { station_id: "S1", station_ori_name: "Milan" },
      [] as any,
    );

    const { unmount } = renderHook(() => useTrainPolling());

    unmount();

    // Fast forward 2 minutes
    jest.advanceTimersByTime(FETCH_TRAIN_POLLING_RATE);

    // It should not have been called because the component unmounted and cleared the interval
    expect(fetchTrainData).not.toHaveBeenCalled();
  });
});
