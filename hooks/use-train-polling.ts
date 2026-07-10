import { logger } from "@/lib/logger";
import {
  selectIsAtStation,
  selectIsJourneyCompleted,
  selectNextStop,
  selectTrainInfo,
  useJourneyStore,
} from "@/store/journeyStore";
import { selectPassList } from "@/store/journeySelectors";
import { parseAndAddDelay } from "@/utils/time";
import { useEffect, useRef } from "react";
import { useSyncJourney } from "./use-sync-journey";
import {
  scheduleEventNotification,
  cancelEventNotification,
} from "@/utils/notifications";
import { useSettings } from "@/hooks/settings";
import { useTranslation } from "react-i18next";
import { useWeatherStore } from "@/store/weatherStore";

const pollingLogger = logger.extend("Polling");
export const FETCH_TRAIN_POLLING_RATE = 120000; // 2 min (exported for tests)
export const MICRO_RETRY_RATE = 30000; // 30s

export function useTrainPolling() {
  const { trainId, destinationStation, setJourney, syncJourney } =
    useSyncJourney();
  const isJourneyCompleted = useJourneyStore(selectIsJourneyCompleted);

  const nextStop = useJourneyStore(selectNextStop);
  const trainInfo = useJourneyStore(selectTrainInfo);
  const isAtStation = useJourneyStore(selectIsAtStation);
  const passListArray = useJourneyStore(selectPassList);
  const { settings } = useSettings();
  const { t: tNotif } = useTranslation("notifications");
  const weather = useWeatherStore((s) => s.weather);
  const previousDelayRef = useRef(trainInfo?.delay ?? 0);

  // Scheduling journey updates
  useEffect(() => {
    if (!trainId || isJourneyCompleted) return;

    // 1. Approaching Stop Notification
    if (nextStop) {
      const delayMinutes = trainInfo?.delay || 0;
      const arrTimeStr = nextStop.arr_time || nextStop.dep_time;
      const arrivalDate = arrTimeStr
        ? parseAndAddDelay(arrTimeStr, delayMinutes)
        : null;
      if (arrivalDate) {
        const triggerTimestamp = arrivalDate.getTime() - 2 * 60 * 1000;

        scheduleEventNotification(
          "journey.approachingStop",
          settings.journeyProgress,
          triggerTimestamp,
          tNotif("journeyProgress.approachingStopTitle"),
          tNotif("journeyProgress.approachingStopBody", {
            stationName: nextStop.station.station_ori_name,
          }),
        );
      }
    } else {
      cancelEventNotification("journey.approachingStop");
    }

    // 2. Delay Change Notification
    const currentDelay = trainInfo?.delay ?? 0;
    const previousDelay = previousDelayRef.current;
    if (currentDelay - previousDelay >= 3 && settings.delayAlerts) {
      scheduleEventNotification(
        `journey.delay.${Date.now()}`,
        true, // Already checked settings
        Date.now() + 1000,
        tNotif("delayAlerts.delayIncreasedTitle"),
        tNotif("delayAlerts.delayIncreasedBody", { delay: currentDelay }),
      );
    }
    previousDelayRef.current = currentDelay;

    // 3. Destination Weather Notification
    if (destinationStation && weather) {
      let destArrTime: Date | null = null;
      if (passListArray && passListArray.length > 0) {
        const destStop = passListArray.find(
          (s) =>
            s.station.station_ori_name === destinationStation.station_ori_name,
        );
        if (destStop) {
          const timeStr = destStop.arr_time || destStop.dep_time;
          destArrTime = timeStr
            ? parseAndAddDelay(timeStr, currentDelay)
            : null;
        }
      }

      if (destArrTime) {
        // Schedule 10 mins before arrival
        const triggerTimestamp = destArrTime.getTime() - 10 * 60 * 1000;
        const condition = "weather"; // Basic placeholder

        scheduleEventNotification(
          "journey.destinationWeather",
          settings.weatherAlerts,
          triggerTimestamp,
          tNotif("weatherAlerts.destinationWeatherTitle", {
            stationName: destinationStation.station_ori_name,
          }),
          tNotif("weatherAlerts.destinationWeatherBody", {
            weatherCondition: condition,
            temperature: weather.temperature.toFixed(0),
          }),
        );
      }
    }
  }, [
    trainId,
    isJourneyCompleted,
    nextStop,
    trainInfo,
    settings.journeyProgress,
    settings.delayAlerts,
    settings.weatherAlerts,
    tNotif,
    weather,
    destinationStation,
    passListArray,
  ]);

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
        await syncJourney();
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
        if (nextStop.dep_time) {
          nextCriticalTime = parseAndAddDelay(nextStop.dep_time, delayMinutes);
        }
      } else {
        // Waiting for arrival
        if (nextStop.arr_time) {
          nextCriticalTime = parseAndAddDelay(nextStop.arr_time, delayMinutes);
        }
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
    syncJourney,
  ]);
}
