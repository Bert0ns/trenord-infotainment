import { useEffect } from "react";
import { fetchTrainData } from "@/lib/api/trenord";
import { logger } from "@/lib/logger";
import {
  useJourneyStore,
  selectIsJourneyCompleted,
} from "@/store/journeyStore";

const pollingLogger = logger.extend("Polling");
export const FETCH_TRAIN_POLLING_RATE = 120000; // 2 min (exported for tests)

export function useTrainPolling() {
  const trainId = useJourneyStore((s) => s.trainId);
  const destinationStation = useJourneyStore((s) => s.destinationStation);
  const setJourney = useJourneyStore((s) => s.setJourney);
  const isJourneyCompleted = useJourneyStore(selectIsJourneyCompleted);

  useEffect(() => {
    if (!trainId || !destinationStation || isJourneyCompleted) return;

    let isMounted = true;

    const pollTrainData = async () => {
      try {
        pollingLogger.trace(`Background fetch for train ${trainId}...`);
        const data = await fetchTrainData(trainId);
        if (isMounted && data && data.length > 0) {
          setJourney(trainId, destinationStation, data);
        }
      } catch (err) {
        pollingLogger.error(`Failed to fetch train data:`, err);
      }
    };

    const interval = setInterval(pollTrainData, FETCH_TRAIN_POLLING_RATE);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [trainId, destinationStation, isJourneyCompleted, setJourney]);
}
