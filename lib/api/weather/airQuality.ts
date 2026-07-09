import { logger } from "@/lib/logger";
import { fetchWeatherApi } from "openmeteo";

const airQualityLogger = logger.extend("AirQualityAPI");

export async function fetchAirQuality(latitude: number, longitude: number) {
  try {
    const params = {
      latitude: latitude,
      longitude: longitude,
      current: ["european_aqi", "uv_index"],
      forecast_days: 1,
    };
    const url = "https://air-quality-api.open-meteo.com/v1/air-quality";
    const responses = await fetchWeatherApi(url, params);

    const response = responses[0];
    if (!response) {
      throw new Error("No response from OpenMeteo Air Quality");
    }

    const lat = response.latitude();
    const long = response.longitude();
    const elevation = response.elevation();
    const utcOffsetSeconds = response.utcOffsetSeconds();

    const current = response.current();
    if (!current) {
      throw new Error("No current air quality data available");
    }

    const weatherData = {
      current: {
        time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
        european_aqi: current.variables(0)!.value(),
        uv_index: current.variables(1)!.value(),
      },
    };

    airQualityLogger.info({
      currentWeatherData: weatherData.current,
      lat,
      long,
      elevation,
      utcOffsetSeconds,
    });

    return weatherData;
  } catch (error: any) {
    airQualityLogger.error("Failed to fetch air quality data:", error);
    throw new Error(error.message || "Failed to fetch air quality data");
  }
}
