# Smart Hybrid Polling Strategy

## Problem Statement

Currently, the app relies on a static 2-minute interval to fetch live train data. This creates an unacceptable latency at the most critical moments of the journey: arrivals and departures. A user might wait up to 1m 59s to see the UI update after their train physically arrives at a station.

## Proposed Solution: Event-Driven + Polling Hybrid

We will move to a smart polling strategy that guarantees low latency during critical state changes while maintaining a low-bandwidth safety net during long transit segments.

The system will:

1. Dynamically calculate the precise expected arrival and departure times for the `nextStop`.
2. Schedule targeted network requests for those exact moments.
3. Maintain the 2-minute polling interval as a backup.
4. Use a debouncer/timer-reset mechanism to prevent redundant fetches if a targeted fetch fires near a backup poll.

## Edge Cases Handled

- **Dynamic Delays:** "Expected" times will be recalculated every time we fetch data, incorporating the latest known delay minutes.
- **The "Station Blackout" Problem:** If the train loses network connection pulling into the station, or if the API is slow to update its status, the system will execute a "micro-burst" retry (e.g., fetch again 30 seconds later if the expected arrival wasn't confirmed).
- **Fetch Collisions:** Any successful targeted fetch will reset the background 2-minute timer to prevent wasteful back-to-back API calls.

## MVP Implementation Plan

### 1. Update `journeyStore` / Utilities

- [ ] Create a utility function `calculateExpectedTimes(nextStop, currentDelay)` that parses the scheduled strings, adds the delay, and returns precise `Date` objects for expected arrival and departure.

### 2. Refactor `use-train-polling.ts`

- [ ] Convert the static `setInterval` into a manageable timeout system.
- [ ] Create a centralized `triggerFetch` function that:
  - Executes the Trenord API call.
  - Updates the Zustand store.
  - Calculates the time until the _next_ critical event (arrival or departure).
  - Determines if the next critical event is less than 2 minutes away.
  - Schedules the next `triggerFetch` for either the critical event time OR 2 minutes from now (whichever is sooner).

### 3. Implement Micro-Retries (The Blackout Fix)

- [ ] If a fetch is triggered by an `expectedArrival` event, but the API payload does _not_ show the train as arrived (`actual_arr_time === undefined`), schedule a retry in 30 seconds instead of defaulting back to 2 minutes.

### 4. Unit Testing

he next critical event is less than 2 minutes away.

- Schedules the next `triggerFetch` for either the critical event time OR 2 minutes from now (whichever is sooner).

### 3. Implement Micro-Retries (The Blackout Fix)

- [ ] If a fetch is triggered by an `expectedArrival` event, but the API payload does _not_ show the train as arrived (`actual_arr_time === undefined`), schedule a retry in 30 seconds instead of defaulting back to 2 minutes.

### 4. Unit Testing

- [ ] Update `use-train-polling.test.ts`.
- [ ] Use `jest.useFakeTimers()` to simulate time passing.
- [ ] Assert that the fetch is triggered at the scheduled time + delay.
- [ ] Assert that a 30s retry is triggered if the arrival is unconfirmed.
- [ ] Assert that the 2-minute backup poll does not fire if a targeted fetch just occurred.
