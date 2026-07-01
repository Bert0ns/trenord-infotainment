import { fetchStationData, fetchTrainData } from "@/lib/api/trenord";
import { logger } from "@/lib/logger";
import { useJourneyStore } from "@/store/journeyStore";
import { useCallback, useState } from "react";

const syncLogger = logger.extend("Sync");

export function useRefreshTrainData() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const trainId = useJourneyStore((s) => s.trainId);
  const destinationStation = useJourneyStore((s) => s.destinationStation);
  const setJourney = useJourneyStore((s) => s.setJourney);
  const setStations = useJourneyStore((s) => s.setStations);

  const onRefresh = useCallback(async () => {
    if (!trainId || !destinationStation) return;

    setIsRefreshing(true);
    try {
      syncLogger.log(`Fetching latest live data for train ${trainId}...`);
      const newData = await fetchTrainData(trainId);
      if (newData && newData.length > 0) {
        setJourney(trainId, destinationStation, newData);
        const stationIDs =
          newData[0].journey_list?.[0]?.pass_list?.map(
            (stop) => stop.station.station_id,
          ) || [];
        const stationData = await fetchStationData(stationIDs);
        setStations(stationData);
        syncLogger.log(`Journey store updated successfully.`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      syncLogger.error("Failed to refresh train data:", message);
    } finally {
      setIsRefreshing(false);
    }
  }, [trainId, destinationStation, setJourney, setStations]);

  return { isRefreshing, onRefresh };
}
