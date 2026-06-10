import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TrainInfoResponse } from "@/lib/api/types";

export interface Station {
  station_id: string;
  station_ori_name: string;
}

export interface JourneyStore {
  trainId: string | null;
  destinationStation: Station | null;
  trainData: TrainInfoResponse | null;
  setJourney: (
    trainId: string,
    destinationStation: Station,
    trainData: TrainInfoResponse,
  ) => void;
  clearJourney: () => void;
}

export const useJourneyStore = create<JourneyStore>()(
  persist(
    (set) => ({
      trainId: null,
      destinationStation: null,
      trainData: null,
      setJourney: (trainId, destinationStation, trainData) =>
        set({ trainId, destinationStation, trainData }),
      clearJourney: () =>
        set({ trainId: null, destinationStation: null, trainData: null }),
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
