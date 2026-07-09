import { logger } from "@/lib/logger";
import { fetchWeatherApi } from "openmeteo";

const weatherLogger = logger.extend("WeatherAPI");

export async function fetchWeather(latitude: number, longitude: number) {
  try {
    const params = {
      latitude: latitude,
      longitude: longitude,
      models: "italia_meteo_arpae_icon_2i",
      current: [
        "temperature_2m",
        "is_day",
        "weather_code",
        "precipitation",
        "relative_humidity_2m",
        "wind_speed_10m",
        "apparent_temperature",
        "wind_direction_10m",
        "cloud_cover",
      ],
      forecast_days: 1,
    };

    const url = "https://api.open-meteo.com/v1/forecast";
    const responses = await fetchWeatherApi(url, params);

    const response = responses[0];
    if (!response) {
      throw new Error("No response from OpenMeteo");
    }

    const lat = response.latitude();
    const long = response.longitude();
    const utcOffsetSeconds = response.utcOffsetSeconds();

    weatherLogger.info(`Coordinates: ${lat}°N ${long}°E`);

    const current = response.current();
    if (!current) {
      throw new Error("No current weather data available");
    }

    const weatherData = {
      current: {
        time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
        temperature_2m: current.variables(0)!.value(),
        is_day: current.variables(1)!.value(),
        weather_code: current.variables(2)!.value(),
        precipitation: current.variables(3)!.value(),
        relative_humidity_2m: current.variables(4)!.value(),
        wind_speed_10m: current.variables(5)!.value(),
        apparent_temperature: current.variables(6)!.value(),
        wind_direction_10m: current.variables(7)!.value(),
        cloud_cover: current.variables(8)!.value(),
      },
    };

    weatherLogger.info(
      `Current time: ${weatherData.current.time}, temperature_2m: ${weatherData.current.temperature_2m}, is_day: ${weatherData.current.is_day}, weather_code: ${weatherData.current.weather_code}, precipitation: ${weatherData.current.precipitation}, relative_humidity_2m: ${weatherData.current.relative_humidity_2m}, wind_speed_10m: ${weatherData.current.wind_speed_10m}, apparent_temperature: ${weatherData.current.apparent_temperature}, wind_direction_10m: ${weatherData.current.wind_direction_10m}, cloud_cover: ${weatherData.current.cloud_cover}`,
    );

    return weatherData;
  } catch (error: any) {
    weatherLogger.error("Failed to fetch weather data:", error);
    throw new Error(error.message || "Failed to fetch weather data");
  }
}
