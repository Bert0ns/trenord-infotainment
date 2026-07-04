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

export * from "./journeySelectors";
