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

  const refreshWeather = useCallback(() => {
    const city = destinationMunicipality || "None";
    startWeatherUpdates(city);
  }, [destinationMunicipality, startWeatherUpdates]);

  useEffect(() => {
    if (!manageLifecycle) return;

    refreshWeather();

    return () => {
      stopWeatherUpdates();
    };
  }, [refreshWeather, stopWeatherUpdates, manageLifecycle]);

  return { refreshWeather };
}
