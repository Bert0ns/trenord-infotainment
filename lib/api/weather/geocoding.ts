import { logger } from "@/lib/logger";

const geocodingLogger = logger.extend("Geocoding");

export async function searchCity(city: string) {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        city,
      )}&count=1&language=it`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results?.length) {
      throw new Error("City not found");
    }

    geocodingLogger.info(`Successfully fetched coordinates for ${city}`);
    return data.results[0];
  } catch (error: any) {
    geocodingLogger.error(`Failed to geocode city ${city}:`, error);
    throw new Error(error.message || "Geocoding error");
  }
}
