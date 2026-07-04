import { useJourneyStore } from "@/store/journeyStore";
import { fetchStationData, fetchTrainData } from "@/lib/api/trenord";
import { logger } from "@/lib/logger";

const syncLogger = logger.extend("Sync");

export function useSyncJourney() {
  const trainId = useJourneyStore((s) => s.trainId);
  const destinationStation = useJourneyStore((s) => s.destinationStation);
  const setJourney = useJourneyStore((s) => s.setJourney);
  const setStations = useJourneyStore((s) => s.setStations);

  const syncJourney = async () => {
    if (!trainId || !destinationStation) return false;

    try {
      syncLogger.trace(`Fetching latest live data for train ${trainId}...`);
      const newData = await fetchTrainData(trainId);
      if (newData && newData.length > 0) {
        setJourney(trainId, destinationStation, newData);
        const stationIDs =
          newData[0].journey_list?.[0]?.pass_list?.map(
            (stop) => stop.station.station_id,
          ) || [];
        const stationData = await fetchStationData(stationIDs);
        setStations(stationData);
        return true;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      syncLogger.error("Failed to sync train data:", message);
      throw error;
    }
    return false;
  };

  return { trainId, destinationStation, setJourney, syncJourney };
}
