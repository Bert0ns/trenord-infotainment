import { useJourneyStore } from "@/store/journeyStore";
import { useWeatherStore } from "@/store/weatherStore";
import { useCallback, useEffect } from "react";

interface WeatherDataOptions {
  manageLifecycle?: boolean;
}

export function useWeatherData({
  manageLifecycle = true,
}: WeatherDataOptions = {}) {
  const destinationMunicipality = useJourneyStore(
    (s) => s.destinationMunicipality,
  );
  const startWeatherUpdates = useWeatherStore(
    (state) => state.startWeatherUpdates,
  );
  const stopWeatherUpdates = useWeatherStore(
    (state) => state.stopWeatherUpdates,
  );

  const refreshWeather = useCallback(
    (force = false) => {
      if (
        !destinationMunicipality ||
        destinationMunicipality.toLowerCase() === "none"
      ) {
        return Promise.resolve();
      }
      return startWeatherUpdates(destinationMunicipality, force);
    },
    [destinationMunicipality, startWeatherUpdates],
  );

  useEffect(() => {
    if (!manageLifecycle) return;

    refreshWeather();

    return () => {
      stopWeatherUpdates();
    };
  }, [refreshWeather, stopWeatherUpdates, manageLifecycle]);

  return { refreshWeather };
}
