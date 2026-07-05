# Geo-News Fallback Plan

This plan details the implementation of a **Smart Geographical Fallback Strategy** to improve contextual news results by leveraging the Trenord `stazioni_v2` API to extract a station's actual Municipality (Comune).

## 1. Context & Motivation

Currently, the `useNews` hook searches the Currents API using the raw station name (e.g., "MILANO GRECO PIRELLI"). Because news APIs rarely tag articles with hyper-specific train stations, this often results in 0 matches, forcing a fallback to generic world news.
By fetching the station's metadata via `stazioni_v2`, we can extract its `Comune` (e.g., "Milano") and perform a search that yields relevant local news.

## 2. SOLID Design Principles applied

- **SRP (Single Responsibility):** The `useNews` hook shouldn't be responsible for fetching station metadata. We will abstract the `stazioni_v2` API call into `lib/api/trenord/trenord.ts` and let `journeyStore.ts` orchestrate saving the municipality when a train is selected.
- **LSP (Liskov Substitution):** Strict TypeScript interfaces will be defined for the `stazioni_v2` payload in `trenord-types.ts`.
- **DIP (Dependency Inversion):** The components relying on news will remain completely unaware of this geographic fallback logic; they simply consume the `data` array provided by `useNews`.

## 3. Task Matrix (Divide et Impera)

- [x] **Task 1: Documentation Extraction**
  - Extract the `stazioni_v2` documentation from the Postman collection.
  - Create a new markdown file `docs/api/trenord/get_stazioni.md` detailing the GET endpoint, parameters, and expected response object (highlighting `Comune`).

- [x] **Task 2: Strict Typing & API Service Implementation**
  - Define `StationMetadata` and `StazioniV2Response` interfaces in `lib/api/trenord/trenord-types.ts`.
  - Implement a strongly-typed `fetchStationMetadata(stationName: string)` function inside `lib/api/trenord/trenord.ts`.
  - Ensure API calls are routed through the custom logger (`logger.extend("TrenordAPI")`).

- [x] **Task 3: Zustand Store Updates**
  - Update `store/journeyStore.ts` to add a new state property: `destinationMunicipality: string | null`.
  - Update the `setDestinationStation` (or equivalent initialization action) to automatically trigger an asynchronous fetch for the station metadata using `fetchStationMetadata`, and populate `destinationMunicipality` upon success.
  - Ensure error states (e.g., failed metadata fetch) do not crash the app, but simply leave the municipality as `null`.

- [x] **Task 4: Custom Hook Refactoring (`useNews.ts`)**
  - Refactor `hooks/useNews.ts` to consume `destinationMunicipality` instead of the raw `destinationStation.station_ori_name`.
  - If `destinationMunicipality` is missing (due to network failure or initialization delay), cleanly skip fetching or fallback to General News.
  - Retain the existing 0-article fallback logic as a safety net.

- [x] **Task 5: Unit Testing (Sketch)**
  - **`trenord.test.ts`**: Verify `fetchStationMetadata` constructs the correct URL and handles HTTP errors (400/500).
  - **`journeyStore.test.ts`**: Verify that setting a destination station fires off the metadata fetch and correctly updates the `destinationMunicipality` state.
  - **`useNews.test.ts`**: Verify that `useNews` respects the new `destinationMunicipality` variable when making calls to the Currents API search endpoint.

## 4. Rollback Strategy

If the `stazioni_v2` endpoint is rate-limited or fails, `destinationMunicipality` will simply remain `null`. The `useNews` hook will treat it as "no context available" and gracefully fall back to displaying the General News feed, ensuring zero UI breakage.
