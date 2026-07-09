import { fetchAirQuality } from "@/lib/api/weather/airQuality";
import { searchCity } from "@/lib/api/weather/geocoding";
import { fetchWeather } from "@/lib/api/weather/weatherAPI";
import { create } from "zustand";

interface WeatherData {
  temperature: number;
  isDay: number;
  weatherCode: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  apparentTemperature: number;
  windDirection: number;
  cloudCover: number;
  aqi: number;
  uvIndex: number;
}

interface WeatherState {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  lastFetchTimestamp: number | null;
  lastCity: string | null;

  startWeatherUpdates: (city: string) => Promise<void>;

  stopWeatherUpdates: () => void;
  clearCache: () => void;
}

let weatherInterval: NodeJS.Timeout | null = null;

const WEATHER_CACHE_TTL = 5 * 60 * 1000;

export const useWeatherStore = create<WeatherState>((set, get) => ({
  weather: null,
  loading: false,
  error: null,
  lastFetchTimestamp: null,
  lastCity: null,

  startWeatherUpdates: async (city) => {
    const store = get();
    if (
      store.weather &&
      store.lastCity === city &&
      store.lastFetchTimestamp &&
      Date.now() - store.lastFetchTimestamp < WEATHER_CACHE_TTL
    ) {
      if (!weatherInterval) {
        weatherInterval = setInterval(() => {
          get().startWeatherUpdates(city);
        }, WEATHER_CACHE_TTL);
      }
      return;
    }

    async function loadWeather() {
      try {
        set({
          loading: true,
          error: null,
        });

        const location = await searchCity(city);

        const [weather, air] = await Promise.all([
          fetchWeather(location.latitude, location.longitude),
          fetchAirQuality(location.latitude, location.longitude),
        ]);

        const currentWeather = weather.current;
        const currentAir = air.current;

        set({
          weather: {
            temperature: currentWeather?.temperature_2m ?? 0,
            isDay: currentWeather?.is_day ?? 0,
            weatherCode: currentWeather?.weather_code ?? 0,
            precipitation: currentWeather?.precipitation ?? 0,
            humidity: currentWeather?.relative_humidity_2m ?? 0,
            windSpeed: currentWeather?.wind_speed_10m ?? 0,
            apparentTemperature: currentWeather?.apparent_temperature ?? 0,
            windDirection: currentWeather?.wind_direction_10m ?? 0,
            cloudCover: currentWeather?.cloud_cover ?? 0,
            aqi: currentAir?.european_aqi ?? 0,
            uvIndex: currentAir?.uv_index ?? 0,
          },
          loading: false,
          lastFetchTimestamp: Date.now(),
          lastCity: city,
        });
      } catch {
        set({
          error: "Weather error",
          loading: false,
        });
      }
    }

    await loadWeather();

    if (weatherInterval) {
      clearInterval(weatherInterval);
    }

    weatherInterval = setInterval(() => {
      loadWeather();
    }, WEATHER_CACHE_TTL);
  },

  stopWeatherUpdates: () => {
    if (weatherInterval) {
      clearInterval(weatherInterval);
      weatherInterval = null;
    }
  },

  clearCache: () => {
    set({ lastFetchTimestamp: null, lastCity: null, weather: null });
  },
}));
