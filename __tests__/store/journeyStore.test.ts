import {
  useJourneyStore,
  selectDestinationPass,
  selectIsJourneyCompleted,
  selectNextStop,
} from "@/store/journeyStore";
import { fetchStationMetadata } from "@/lib/api/trenord/trenord";

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
    expect(state.destinationMunicipality).toBeNull();
    expect(state.trainData).toBeNull();
  });

  it("should set journey data correctly", () => {
    const mockTrainId = "12345";
    const mockStation = {
      station_id: "S01",
      station_ori_name: "Milano Centrale",
    };
    const mockTrainData = { someData: true, journeys: [] };

    (fetchStationMetadata as jest.Mock).mockResolvedValueOnce([
      { Comune: "Milano" },
    ]);

    useJourneyStore
      .getState()
      .setJourney(mockTrainId, mockStation, mockTrainData as any);

    const state = useJourneyStore.getState();
    expect(state.trainId).toBe(mockTrainId);
    expect(state.destinationStation).toEqual(mockStation);
    expect(state.trainData).toEqual(mockTrainData);
    expect(state.destinationMunicipality).toBeNull(); // Still null initially before async completes
  });

  it("should update destinationMunicipality after fetch completes", async () => {
    const mockTrainId = "12345";
    const mockStation = {
      station_id: "S01",
      station_ori_name: "Milano Centrale",
    };
    const mockTrainData = { someData: true, journeys: [] };

    let resolveFetch: any;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    (fetchStationMetadata as jest.Mock).mockReturnValueOnce(fetchPromise);

    useJourneyStore
      .getState()
      .setJourney(mockTrainId, mockStation, mockTrainData as any);

    expect(useJourneyStore.getState().destinationMunicipality).toBeNull();

    resolveFetch([{ Comune: "Milano" }]);
    await fetchPromise;
    // Wait a tick for the microtask queue to process the .then() in setJourney
    await new Promise(process.nextTick);

    expect(useJourneyStore.getState().destinationMunicipality).toBe("Milano");
  });

  it("should clear journey data correctly", () => {
    const mockTrainId = "12345";
    const mockStation = {
      station_id: "S01",
      station_ori_name: "Milano Centrale",
    };

    (fetchStationMetadata as jest.Mock).mockResolvedValueOnce([
      { Comune: "Milano" },
    ]);

    // First set the data
    useJourneyStore.getState().setJourney(mockTrainId, mockStation, {} as any);
    expect(useJourneyStore.getState().trainId).toBe(mockTrainId);

    // Then clear it
    useJourneyStore.getState().clearJourney();

    const state = useJourneyStore.getState();
    expect(state.trainId).toBeNull();
    expect(state.destinationStation).toBeNull();
    expect(state.destinationMunicipality).toBeNull();
    expect(state.trainData).toBeNull();
  });

  describe("Selectors", () => {
    const mockState = {
      trainId: "123",
      destinationStation: {
        station_id: "S02",
        station_ori_name: "Station 2",
      },
      trainData: [
        {
          journey_list: [
            {
              train: { delay: 0 },
              pass_list: [
                {
                  station: { station_id: "S01", station_ori_name: "Station 1" },
                  actual_data: { dep_actual_time: "10:00:00" },
                  cancelled: false,
                },
                {
                  station: { station_id: "S02", station_ori_name: "Station 2" },
                  actual_data: {},
                  cancelled: false,
                },
                {
                  station: { station_id: "S03", station_ori_name: "Station 3" },
                  actual_data: {},
                  cancelled: false,
                },
              ],
            },
          ],
        },
      ],
    };

    it("should select the correct destination pass", () => {
      const destPass = selectDestinationPass(mockState as any);
      expect(destPass?.station.station_id).toBe("S02");
    });

    it("should return false for isJourneyCompleted when destination is not reached", () => {
      expect(selectIsJourneyCompleted(mockState as any)).toBe(false);
    });

    it("should return true for isJourneyCompleted when destination is reached", () => {
      const completedState = {
        ...mockState,
        trainData: [
          {
            journey_list: [
              {
                pass_list: [
                  { ...mockState.trainData[0].journey_list[0].pass_list[0] },
                  {
                    station: {
                      station_id: "S02",
                      station_ori_name: "Station 2",
                    },
                    actual_data: { arr_actual_time: "10:15:00" },
                    cancelled: false,
                  },
                ],
              },
            ],
          },
        ],
      };
      expect(selectIsJourneyCompleted(completedState as any)).toBe(true);
    });

    it("should return undefined for nextStop when journey is completed", () => {
      const completedState = {
        ...mockState,
        trainData: [
          {
            journey_list: [
              {
                pass_list: [
                  { ...mockState.trainData[0].journey_list[0].pass_list[0] },
                  {
                    station: {
                      station_id: "S02",
                      station_ori_name: "Station 2",
                    },
                    actual_data: { arr_actual_time: "10:15:00" },
                    cancelled: false,
                  },
                ],
              },
            ],
          },
        ],
      };
      expect(selectNextStop(completedState as any)).toBeUndefined();
    });
  });
});
