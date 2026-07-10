import { useSettings } from "@/hooks/settings";
import {
  selectIsJourneyCompleted,
  selectNextStop,
  selectTrainInfo,
  useJourneyStore,
} from "@/store/journeyStore";
import { selectPassList } from "@/store/journeySelectors";
import { useWeatherStore } from "@/store/weatherStore";
import {
  cancelEventNotification,
  scheduleEventNotification,
} from "@/utils/notifications";
import { parseAndAddDelay } from "@/utils/time";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSyncJourney } from "./use-sync-journey";

export function useJourneyNotifications() {
  const { trainId, destinationStation } = useSyncJourney();
  const isJourneyCompleted = useJourneyStore(selectIsJourneyCompleted);
  const nextStop = useJourneyStore(selectNextStop);
  const trainInfo = useJourneyStore(selectTrainInfo);
  const passListArray = useJourneyStore(selectPassList);
  const { settings } = useSettings();
  const { t: tNotif } = useTranslation("notifications");
  const weather = useWeatherStore((s) => s.weather);
  const previousDelayRef = useRef(trainInfo?.delay ?? 0);

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
}
