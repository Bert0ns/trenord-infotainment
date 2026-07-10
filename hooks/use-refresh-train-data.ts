import { useState, useCallback } from "react";
import { useSyncJourney } from "./use-sync-journey";

export function useRefreshTrainData() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { trainId, destinationStation, syncJourney } = useSyncJourney();

  const onRefresh = useCallback(async () => {
    if (!trainId || !destinationStation) return;

    setIsRefreshing(true);
    try {
      await syncJourney();
    } catch {
      // The error is already logged in useSyncJourney
    } finally {
      setIsRefreshing(false);
    }
  }, [trainId, destinationStation, syncJourney]);

  return { isRefreshing, onRefresh };
}
