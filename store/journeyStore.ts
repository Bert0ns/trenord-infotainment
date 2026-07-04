import {
  StationFull,
  TrainInfoResponse,
} from "@/lib/api/trenord/trenord-types";
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
  isMunicipalityLoading: boolean;
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
    (set, get) => ({
      trainId: null,
      destinationStation: null,
      destinationMunicipality: null,
      isMunicipalityLoading: false,
      trainData: null,
      stations: [],
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
          isMunicipalityLoading: true,
        });

        // Fire-and-forget metadata fetch for the destination municipality
        fetchStationMetadata(destinationStation.station_ori_name)
          .then((metadataList) => {
            if (get().trainId === trainId) {
              if (
                metadataList &&
                metadataList.length > 0 &&
                metadataList[0].Comune
              ) {
                set({
                  destinationMunicipality: metadataList[0].Comune,
                  isMunicipalityLoading: false,
                });
              } else {
                set({ isMunicipalityLoading: false });
              }
            }
          })
          .catch((err) => {
            if (get().trainId === trainId) {
              storeLogger.warn(
                "Failed to fetch station metadata for municipality fallback",
                err,
              );
              set({ isMunicipalityLoading: false });
            }
          });
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
          destinationMunicipality: null,
          isMunicipalityLoading: false,
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
