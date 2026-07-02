import { TrainInfoResponse } from "@/lib/api/trenord/trenord-types";
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
      setJourney: (trainId, destinationStation, trainData) => {
        storeLogger.info(
          `Setting journey to train ${trainId} towards ${destinationStation.station_ori_name}`,
        );
        set({ trainId, destinationStation, trainData });
      },
      clearJourney: () => {
        storeLogger.info("Clearing journey data");
        set({ trainId: null, destinationStation: null, trainData: null });
      },
    }),
    {
      name: "journey-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export * from "./journeySelectors";
