import { StationFull, TrainInfoResponse } from "@/lib/api/types";
import { logger } from "@/lib/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const storeLogger = logger.extend("Store");

export interface Station {
  station_id: string;
  station_ori_name: string;
}

export interface JourneyStore {
  trainId: string | null;
  destinationStation: Station | null;
  trainData: TrainInfoResponse | null;
  stations: StationFull[];
  setJourney: (
    trainId: string,
    destinationStation: Station,
    trainData: TrainInfoResponse,
  ) => void;
  setStations: (stations: StationFull[]) => void;
  clearJourney: () => void;
}

export const useJourneyStore = create<JourneyStore>()(
  persist(
    (set) => ({
      trainId: null,
      destinationStation: null,
      trainData: null,
      stations: [],
      setJourney: (trainId, destinationStation, trainData) => {
        storeLogger.info(
          `Setting journey to train ${trainId} towards ${destinationStation.station_ori_name}`,
        );
        set({ trainId, destinationStation, trainData });
      },
      setStations: (stations) => {
        storeLogger.info(
          `Setting stations data with ${stations.length} stations`,
        );
        set({ stations });
      },
      clearJourney: () => {
        storeLogger.info("Clearing journey data");
        set({
          trainId: null,
          destinationStation: null,
          trainData: null,
          stations: [],
        });
      },
    }),
    {
      name: "journey-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// --- Selectors ---

export const selectOrigDestData = (state: JourneyStore) => state.trainData?.[0];

export const selectTrainInfo = (state: JourneyStore) =>
  selectOrigDestData(state)?.journey_list?.[0]?.train;

export const selectPassList = (state: JourneyStore) =>
  selectOrigDestData(state)?.journey_list?.[0]?.pass_list;

export const selectStations = (state: JourneyStore) => state.stations;

export const selectIsJourneyCompleted = (state: JourneyStore) => {
  const passList = selectPassList(state);
  if (!passList || passList.length === 0) return false;
  return (
    passList[passList.length - 1]?.actual_data?.arr_actual_time !== undefined
  );
};

export const selectNextStop = (state: JourneyStore) => {
  const passList = selectPassList(state);
  if (!passList) return undefined;

  const lastDepartedIndex = passList.findLastIndex(
    (pass: any) => pass.actual_data?.dep_actual_time !== undefined,
  );

  return passList
    .slice(lastDepartedIndex + 1)
    .find((pass: any) => pass.cancelled !== true);
};

export const selectIsAtStation = (state: JourneyStore) => {
  const nextStop = selectNextStop(state);
  if (!nextStop) return false;
  return (
    nextStop.actual_data?.arr_actual_time !== undefined &&
    nextStop.actual_data?.dep_actual_time === undefined &&
    !selectIsJourneyCompleted(state)
  );
};
