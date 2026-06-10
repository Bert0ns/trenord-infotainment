import { useJourneyStore } from "../../store/journeyStore";

// Get initial state to reset between tests
const initialStoreState = useJourneyStore.getState();

describe("JourneyStore", () => {
  beforeEach(() => {
    // Reset state before each test
    useJourneyStore.setState(initialStoreState, true);
    jest.clearAllMocks();
  });

  it("should initialize with null values", () => {
    const state = useJourneyStore.getState();
    expect(state.trainId).toBeNull();
    expect(state.destinationStation).toBeNull();
    expect(state.trainData).toBeNull();
  });

  it("should set journey data correctly", () => {
    const mockTrainId = "12345";
    const mockStation = {
      station_id: "S01",
      station_ori_name: "Milano Centrale",
    };
    const mockTrainData = { someData: true, journeys: [] };

    useJourneyStore
      .getState()
      .setJourney(mockTrainId, mockStation, mockTrainData as any);

    const state = useJourneyStore.getState();
    expect(state.trainId).toBe(mockTrainId);
    expect(state.destinationStation).toEqual(mockStation);
    expect(state.trainData).toEqual(mockTrainData);
  });

  it("should clear journey data correctly", () => {
    const mockTrainId = "12345";
    const mockStation = {
      station_id: "S01",
      station_ori_name: "Milano Centrale",
    };

    // First set the data
    useJourneyStore.getState().setJourney(mockTrainId, mockStation, {} as any);
    expect(useJourneyStore.getState().trainId).toBe(mockTrainId);

    // Then clear it
    useJourneyStore.getState().clearJourney();

    const state = useJourneyStore.getState();
    expect(state.trainId).toBeNull();
    expect(state.destinationStation).toBeNull();
    expect(state.trainData).toBeNull();
  });
});
