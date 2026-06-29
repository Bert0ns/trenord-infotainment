import { useEffect } from "react";
import { fetchTrainData } from "@/lib/api/trenord";
import { logger } from "@/lib/logger";
import {
  useJourneyStore,
  selectIsJourneyCompleted,
  selectNextStop,
  selectTrainInfo,
  selectIsAtStation,
} from "@/store/journeyStore";
import { parseAndAddDelay } from "@/utils/time";

const pollingLogger = logger.extend("Polling");
export const FETCH_TRAIN_POLLING_RATE = 120000; // 2 min (exported for tests)
export const MICRO_RETRY_RATE = 30000; // 30s

export function useTrainPolling() {
  const trainId = useJourneyStore((s) => s.trainId);
  const destinationStation = useJourneyStore((s) => s.destinationStation);
  const setJourney = useJourneyStore((s) => s.setJourney);
  const isJourneyCompleted = useJourneyStore(selectIsJourneyCompleted);

  const nextStop = useJourneyStore(selectNextStop);
  const trainInfo = useJourneyStore(selectTrainInfo);
  const isAtStation = useJourneyStore(selectIsAtStation);

  useEffect(() => {
    if (!trainId || !destinationStation || isJourneyCompleted) return;

    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const scheduleNextFetch = (delayMs: number) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(pollTrainData, delayMs);
      pollingLogger.trace(
        `Next fetch scheduled in ${Math.round(delayMs / 1000)}s`,
      );
    };

    const pollTrainData = async () => {
      try {
        pollingLogger.trace(`Background fetch for train ${trainId}...`);
        const data = await fetchTrainData(trainId);
        if (isMounted && data && data.length > 0) {
          setJourney(trainId, destinationStation, data);
        }
      } catch (err) {
        pollingLogger.error(`Failed to fetch train data:`, err);
        if (isMounted) scheduleNextFetch(FETCH_TRAIN_POLLING_RATE);
      }
    };

    // Calculate when the next critical event is
    let nextCriticalTime: Date | null = null;
    const delayMinutes = trainInfo?.delay || 0;

    if (nextStop) {
      if (isAtStation) {
        // Waiting for departure
        nextCriticalTime = parseAndAddDelay(nextStop.dep_time, delayMinutes);
      } else {
        // Waiting for arrival
        nextCriticalTime = parseAndAddDelay(nextStop.arr_time, delayMinutes);
      }
    }

    const now = new Date();
    let delayMs = FETCH_TRAIN_POLLING_RATE;

    if (nextCriticalTime) {
      const msUntilCritical = nextCriticalTime.getTime() - now.getTime();

      if (msUntilCritical > 0 && msUntilCritical < FETCH_TRAIN_POLLING_RATE) {
        delayMs = msUntilCritical;
      } else if (
        msUntilCritical <= 0 &&
        msUntilCritical > -FETCH_TRAIN_POLLING_RATE
      ) {
        // We are PAST the critical time, but the state hasn't updated yet!
        // This is the "Blackout" fix: The train should have arrived/departed,
        // but the API still says it hasn't. We do a micro-retry.
        delayMs = MICRO_RETRY_RATE;
      }
    }

    scheduleNextFetch(delayMs);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [
    trainId,
    destinationStation,
    isJourneyCompleted,
    setJourney,
    nextStop,
    trainInfo?.delay,
    isAtStation,
  ]);
}
