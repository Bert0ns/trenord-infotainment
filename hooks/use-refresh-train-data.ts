import { useState, useCallback } from "react";
import { useJourneyStore } from "@/store/journeyStore";
import { fetchTrainData } from "@/lib/api/trenord";
import { logger } from "@/lib/logger";

const syncLogger = logger.extend("Sync");

export function useRefreshTrainData() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const trainId = useJourneyStore((s) => s.trainId);
  const destinationStation = useJourneyStore((s) => s.destinationStation);
  const setJourney = useJourneyStore((s) => s.setJourney);

  const onRefresh = useCallback(async () => {
    if (!trainId || !destinationStation) return;

    setIsRefreshing(true);
    try {
      syncLogger.log(`Fetching latest live data for train ${trainId}...`);
      const newData = await fetchTrainData(trainId);
      if (newData && newData.length > 0) {
        setJourney(trainId, destinationStation, newData);
        syncLogger.log(`Journey store updated successfully.`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      syncLogger.error("Failed to refresh train data:", message);
    } finally {
      setIsRefreshing(false);
    }
  }, [trainId, destinationStation, setJourney]);

  return { isRefreshing, onRefresh };
}
