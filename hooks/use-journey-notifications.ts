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
  cancelAllEventNotifications,
  scheduleEventNotification,
} from "@/utils/notifications";
import { parseAndAddDelay } from "@/utils/time";
import { getWeatherIcon } from "@/utils/weather";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

// Helper function to find the arrival time at the destination station
function getDestinationArrivalTime(
  passList: any[] | undefined | null,
  destinationName: string | undefined,
  delay: number,
): Date | null {
  if (!passList || !destinationName) return null;
  const destStop = passList.find(
    (s) => s.station.station_ori_name === destinationName,
  );
  if (!destStop) return null;
  const timeStr = destStop.arr_time || destStop.dep_time;
  return timeStr ? parseAndAddDelay(timeStr, delay) : null;
}

export function useJourneyNotifications() {
  const trainId = useJourneyStore((s) => s.trainId);
  const destinationStation = useJourneyStore((s) => s.destinationStation);
  const isJourneyCompleted = useJourneyStore(selectIsJourneyCompleted);
  const nextStop = useJourneyStore(selectNextStop);
  const trainInfo = useJourneyStore(selectTrainInfo);
  const passListArray = useJourneyStore(selectPassList);
  const { settings } = useSettings();
  const { t: tNotif } = useTranslation("notifications");
  const { t: tHome } = useTranslation("home");
  const weather = useWeatherStore((s) => s.weather);
  const previousDelayRef = useRef<number | null>(null);

  // Handle journey completion / clean up
  useEffect(() => {
    if (trainId && isJourneyCompleted) {
      cancelAllEventNotifications();
    }
  }, [trainId, isJourneyCompleted]);

  // 1. Approaching Stop Notification
  useEffect(() => {
    if (!trainId || isJourneyCompleted) return;

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
  }, [
    trainId,
    isJourneyCompleted,
    nextStop,
    trainInfo?.delay,
    settings.journeyProgress,
    tNotif,
  ]);

  // 2. Delay Change Notification
  useEffect(() => {
    if (!trainId || isJourneyCompleted || !trainInfo) return;

    const currentDelay = trainInfo.delay ?? 0;

    if (previousDelayRef.current === null) {
      // Initialize the ref on the first load of trainInfo
      previousDelayRef.current = currentDelay;
      return;
    }

    const previousDelay = previousDelayRef.current;
    if (currentDelay - previousDelay >= 3 && settings.delayAlerts) {
      scheduleEventNotification(
        "journey.delay",
        true, // Already checked settings in if condition
        Date.now() + 1000,
        tNotif("delayAlerts.delayIncreasedTitle"),
        tNotif("delayAlerts.delayIncreasedBody", { delay: currentDelay }),
      );
    }
    previousDelayRef.current = currentDelay;
  }, [trainId, isJourneyCompleted, trainInfo, settings.delayAlerts, tNotif]);

  // 3. Destination Weather Notification
  useEffect(() => {
    if (!trainId || isJourneyCompleted || !destinationStation || !weather) {
      cancelEventNotification("journey.destinationWeather");
      return;
    }

    const arrivalTime = getDestinationArrivalTime(
      passListArray,
      destinationStation.station_ori_name,
      trainInfo?.delay ?? 0,
    );

    if (!arrivalTime) {
      cancelEventNotification("journey.destinationWeather");
      return;
    }

    const triggerTimestamp = arrivalTime.getTime() - 10 * 60 * 1000;
    const conditionKey = getWeatherIcon(weather.weatherCode, true, {
      colors: {
        warning: "",
        cloud: "",
        mutedForeground: "",
        info: "",
        primary: "",
      },
    } as any).conditionKey;
    const condition = tHome(`weatherCard.${conditionKey}`);

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
  }, [
    trainId,
    isJourneyCompleted,
    destinationStation,
    weather,
    trainInfo?.delay,
    passListArray,
    settings.weatherAlerts,
    tNotif,
    tHome,
  ]);
}
