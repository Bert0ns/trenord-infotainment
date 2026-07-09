# Weather API Documentation

This document describes the OpenMeteo endpoints utilized by the Trenord Infotainment app for the weather feature.

## 1. Geocoding API

Used to search for a city by name and retrieve its latitude and longitude coordinates.

**Endpoint:** `GET https://geocoding-api.open-meteo.com/v1/search`

### Parameters

| Name       | Type   | Description                                   |
| ---------- | ------ | --------------------------------------------- |
| `name`     | string | The name of the city to search for.           |
| `count`    | number | The number of results to return (we use `1`). |
| `language` | string | Language for results (we use `it`).           |

### Implementation

See `lib/api/weather/geocoding.ts`.

---

## 2. Weather Forecast API

Used to fetch current weather conditions based on latitude and longitude coordinates.

**Endpoint:** `GET https://api.open-meteo.com/v1/forecast`

### Parameters

| Name            | Type   | Description                                                                 |
| --------------- | ------ | --------------------------------------------------------------------------- |
| `latitude`      | number | City latitude.                                                              |
| `longitude`     | number | City longitude.                                                             |
| `models`        | string | The weather model to use (we use `italia_meteo_arpae_icon_2i`).             |
| `current`       | array  | Requested metrics (e.g., `temperature_2m`, `is_day`, `weather_code`, etc.). |
| `forecast_days` | number | Number of days (we use `1` for current conditions).                         |

### Implementation

See `lib/api/weather/weatherAPI.ts`.

---

## 3. Air Quality API

Used to fetch the current air quality index (AQI) and UV index based on latitude and longitude.

**Endpoint:** `GET https://air-quality-api.open-meteo.com/v1/air-quality`

### Parameters

| Name            | Type   | Description                                         |
| --------------- | ------ | --------------------------------------------------- |
| `latitude`      | number | City latitude.                                      |
| `longitude`     | number | City longitude.                                     |
| `current`       | array  | Requested metrics (`european_aqi`, `uv_index`).     |
| `forecast_days` | number | Number of days (we use `1` for current conditions). |

### Implementation

See `lib/api/weather/airQuality.ts`.

---

## Error Handling & Caching

- Errors are logged via a localized `logger.extend` and a standard JavaScript `Error` is thrown.
- The `weatherStore.ts` layer caches API responses for **5 minutes** (in-memory) to prevent unnecessary repeated requests.
- API calls to Weather and Air Quality are triggered in parallel via `Promise.all` for better performance.
