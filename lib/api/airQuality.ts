import { fetchWeatherApi } from "openmeteo";

export async function fetchAirQuality(latitude: number, longitude: number) {
  const params = {
    latitude: latitude,
    longitude: longitude,
    current: ["european_aqi", "uv_index"],
    forecast_days: 1,
  };
  const url = "https://air-quality-api.open-meteo.com/v1/air-quality";
  const responses = await fetchWeatherApi(url, params);

  // Process first location. Add a for-loop for multiple locations or weather models
  const response = responses[0];

  // Attributes for timezone and location
  const lat = response.latitude();
  const long = response.longitude();
  const elevation = response.elevation();
  const utcOffsetSeconds = response.utcOffsetSeconds();

  console.log(
    `\nCoordinates: ${lat}°N ${long}°E`,
    `\nElevation: ${elevation}m asl`,
    `\nTimezone difference to GMT+0: ${utcOffsetSeconds}s`,
  );

  const current = response.current()!;

  // Note: The order of weather variables in the URL query and the indices below need to match!
  const weatherData = {
    current: {
      time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
      european_aqi: current.variables(0)!.value(),
      uv_index: current.variables(1)!.value(),
    },
  };

  // The 'weatherData' object now contains a simple structure, with arrays of datetimes and weather information
  console.log(
    `\nCurrent time: ${weatherData.current.time}\n`,
    `\nCurrent european_aqi: ${weatherData.current.european_aqi}`,
    `\nCurrent uv_index: ${weatherData.current.uv_index}`,
  );

  if (!response) {
    throw new Error("Errore qualità aria");
  }

  return response;
}
