# Weather Feature - Refactoring and Fixes Plan

## Goal Description

This plan addresses all the actionable findings and tasks outlined in the `docs/reports/branch-state-report.md`. The goal is to elevate the new weather feature to production-ready standards by fixing bugs, improving performance (caching & concurrent requests), adhering to DRY architecture, and maintaining codebase standards.

---

## Proposed Changes & Task Tracker

### Feature Hooks

- [x] **`hooks/use-weather-data.ts`**: Correctness fix
  - Check if `destinationMunicipality` is valid before passing it to `startWeatherUpdates`.
  - Return early to avoid sending the literal string `"None"` to the Geocoding API.

### Global State Management

- [x] **`store/weatherStore.ts`**: Performance & Caching
  - Change the sequential `fetchWeather` and `fetchAirQuality` calls into concurrent calls using `Promise.all()`.
  - Introduce a `lastFetchTimestamp` property in the store. Add logic to check if `Date.now() - lastFetchTimestamp < 5 * 60 * 1000`. If so, skip the network request unless a `force` flag is provided.

### UI Components & Architecture

- [x] **`utils/weather.ts`**: Extract Icon mapping
  - Extract the `getIcon()` function, which maps OpenMeteo weather codes to `MaterialIcons` strings, into this shared utility file.
- [ ] **`components/settings-componenents/clearWeatherCacheButton.tsx`**
  - Create a button to clear the weather store's cache (`lastFetchTimestamp`).
  - Render it in `app/(tabs)/settings.tsx` based on `EXPO_PUBLIC_ENABLE_DEBUG_MENU`.
- [x] **`components/home-components/weatherCard.tsx`**
  - Remove local `getIcon()` implementation and import from `utils/weather.ts`.
- [x] **`components/journey-components/weatherCurrentCard.tsx`**
  - Remove local `getIcon()` implementation and import from `utils/weather.ts`.
- [x] **`components/ui/card.tsx`**
  - Translate the Italian comment to English to maintain codebase consistency.

### Theme & Styling

- [x] **`constants/theme.types.ts`**: Typing cleanup
  - Create a `WeatherColors` type and extract `scaleGood`, `scaleFair`, `scaleModerate`, `scalePoor`, `scaleVeryPoor`, and `scaleExtreme` from the global `Colors` type.
  - Nest `WeatherColors` inside the root theme object and update component usages.

### API Clients

- [x] **`lib/api/weatherAPI.ts`**: Standards compliance
  - Add standard `try/catch` block wrapper. Ensure errors are logged using `weatherLogger.error()` before being thrown.
  - Return the cleanly parsed object instead of the raw response.
- [x] **`lib/api/airQuality.ts`**: Standards compliance
  - Add proper error logging using the logger instance. Ensure errors thrown match the standardized error format.
- [x] **`lib/api/geocoding.ts`**: Standards compliance
  - Instantiate a logger via `logger.extend("Geocoding")`. Log successful fetches and errors.

### Documentation

- [x] **`docs/api/weather/weather_api.md`**: New documentation
  - Create comprehensive API documentation explaining how the OpenMeteo Geocoding, Weather, and Air Quality endpoints are used in the app, detailing query parameters and response formats.

---

## Verification Plan

### Automated Tests

```bash
# Verify no TypeScript regressions from the theme and store changes
pnpm typecheck

# Verify formatting and linting
pnpm lint

# Ensure UI tests are still passing without leaks
pnpm test
```

### Manual Verification

1. Open the app and navigate to the Home screen with a valid destination.
2. Verify that the weather widget displays the correct weather data and icons.
3. Refresh the weather data (pull-to-refresh or re-navigate) and ensure the console logs indicate that the cached data was used if it's within the 5-minute window.
4. Verify that the app handles missing or undefined destinations without fetching data for "None".
