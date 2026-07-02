import { fetchAirQuality } from "@/lib/api/airQuality";
import { searchCity } from "@/lib/api/geocoding";
import { fetchWeather } from "@/lib/api/weatherAPI";
import { create } from "zustand";

interface WeatherData {
  temperature: number;
  isDay: number;
  weatherCode: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  aqi: number;
  uvIndex: number;
}

interface WeatherState {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;

  startWeatherUpdates: (city: string) => Promise<void>;

  stopWeatherUpdates: () => void;
}

let weatherInterval: NodeJS.Timeout | null = null;

export const useWeatherStore = create<WeatherState>((set) => ({
  weather: null,
  loading: false,
  error: null,

  startWeatherUpdates: async (city) => {
    async function loadWeather() {
      try {
        set({
          loading: true,
          error: null,
        });

        const location = await searchCity(city);

        const weather = await fetchWeather(
          location.latitude,
          location.longitude,
        );

        const air = await fetchAirQuality(
          location.latitude,
          location.longitude,
        );

        const currentWeather = weather.current();
        const currentAir = air.current();

        set({
          weather: {
            temperature: currentWeather?.variables(0)?.value() ?? 0,
            isDay: currentWeather?.variables(1)?.value() ?? 0,
            weatherCode: currentWeather?.variables(2)?.value() ?? 0,
            precipitation: currentWeather?.variables(3)?.value() ?? 0,
            humidity: currentWeather?.variables(4)?.value() ?? 0,
            windSpeed: currentWeather?.variables(5)?.value() ?? 0,
            aqi: currentAir?.variables(0)?.value() ?? 0,
            uvIndex: currentAir?.variables(1)?.value() ?? 0,
          },
          loading: false,
        });
      } catch {
        set({
          error: "Errore meteo",
          loading: false,
        });
      }
    }

    await loadWeather();

    if (weatherInterval) {
      clearInterval(weatherInterval);
    }

    weatherInterval = setInterval(
      () => {
        loadWeather();
      },
      10 * 60 * 1000,
    );
  },

  stopWeatherUpdates: () => {
    if (weatherInterval) {
      clearInterval(weatherInterval);
      weatherInterval = null;
    }
  },
}));
