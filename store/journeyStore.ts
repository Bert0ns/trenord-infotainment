import { TrainInfoResponse } from "@/lib/api/trenord/trenord-types";
import { fetchStationMetadata } from "@/lib/api/trenord/trenord";
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
  destinationMunicipality: string | null;
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
      destinationMunicipality: null,
      trainData: null,
      setJourney: (trainId, destinationStation, trainData) => {
        storeLogger.info(
          `Setting journey to train ${trainId} towards ${destinationStation.station_ori_name}`,
        );

        // Reset old municipality while we fetch the new one
        set({
          trainId,
          destinationStation,
          trainData,
          destinationMunicipality: null,
        });

        // Fire-and-forget metadata fetch for the destination municipality
        fetchStationMetadata(destinationStation.station_ori_name)
          .then((metadataList) => {
            if (
              metadataList &&
              metadataList.length > 0 &&
              metadataList[0].Comune
            ) {
              set({ destinationMunicipality: metadataList[0].Comune });
            }
          })
          .catch((err) => {
            storeLogger.warn(
              "Failed to fetch station metadata for municipality fallback",
              err,
            );
          });
      },
      clearJourney: () => {
        storeLogger.info("Clearing journey data");
        set({
          trainId: null,
          destinationStation: null,
          destinationMunicipality: null,
          trainData: null,
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
