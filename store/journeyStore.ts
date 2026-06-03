import { create } from "zustand";

export interface Station {
  station_id: string;
  station_ori_name: string;
}

export interface JourneyStore {
  trainId: string | null;
  destinationStation: Station | null;
  trainData: any | null;
  setJourney: (
    trainId: string,
    destinationStation: Station,
    trainData: any,
  ) => void;
  clearJourney: () => void;
}

export const useJourneyStore = create<JourneyStore>((set) => ({
  trainId: null,
  destinationStation: null,
  trainData: null,
  setJourney: (trainId, destinationStation, trainData) =>
    set({ trainId, destinationStation, trainData }),
  clearJourney: () =>
    set({ trainId: null, destinationStation: null, trainData: null }),
}));
