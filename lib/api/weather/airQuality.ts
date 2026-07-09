import { logger } from "@/lib/logger";
import { fetchWeatherApi } from "openmeteo";

const weatherLogger = logger.extend("Weather");

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

    weatherLogger.info(
      `Coordinates: ${lat}°N ${long}°E, Elevation: ${elevation}m asl, Timezone difference to GMT+0: ${utcOffsetSeconds}s`,
    );

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

    weatherLogger.info(
      `Current time: ${weatherData.current.time}, european_aqi: ${weatherData.current.european_aqi}, uv_index: ${weatherData.current.uv_index}`,
    );

    return weatherData;
  } catch (error: any) {
    weatherLogger.error("Failed to fetch air quality data:", error);
    throw new Error(error.message || "Failed to fetch air quality data");
  }
}
