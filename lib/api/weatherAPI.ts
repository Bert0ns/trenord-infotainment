import { fetchWeatherApi } from "openmeteo";

export async function fetchWeather(latitude: number, longitude: number) {
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
    ],
    forecast_days: 1,
  };

  const url = "https://api.open-meteo.com/v1/forecast";
  const responses = await fetchWeatherApi(url, params);

  const response = responses[0];

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
      temperature_2m: current.variables(0)!.value(),
      is_day: current.variables(1)!.value(),
      weather_code: current.variables(2)!.value(),
      precipitation: current.variables(3)!.value(),
      relative_humidity_2m: current.variables(4)!.value(),
      wind_speed_10m: current.variables(5)!.value(),
    },
  };

  // The 'weatherData' object now contains a simple structure, with arrays of datetimes and weather information
  console.log(
    `\nCurrent time: ${weatherData.current.time}\n`,
    `\nCurrent temperature_2m: ${weatherData.current.temperature_2m}`,
    `\nCurrent is_day: ${weatherData.current.is_day}`,
    `\nCurrent weather_code: ${weatherData.current.weather_code}`,
    `\nCurrent precipitation: ${weatherData.current.precipitation}`,
    `\nCurrent relative_humidity_2m: ${weatherData.current.relative_humidity_2m}`,
    `\nCurrent wind_speed_10m: ${weatherData.current.wind_speed_10m}`,
  );

  if (!response) {
    throw new Error("Weather error");
  }

  return response;
}
