# UI & Data Incoherence Fix Plan

## Objective

To align the application's data presentation with the _user's specific journey_ rather than the _train's full route_. This involves fixing arrival times, journey completion logic, and fixing fallback data rendering in the UI.

## Phase 1: Update Store Selectors (`store/journeyStore.ts`)

The `journeyStore` is the source of truth. By fixing the selectors, the UI components will naturally inherit the correct data.

- [x] **Create `selectDestinationPass`:** Add a new selector that finds the stop within `passList` that matches the user's `destinationStation.station_id`.
- [x] **Update `selectIsJourneyCompleted`:** Refactor this to check if the user's destination stop (via `selectDestinationPass`) has an `arr_actual_time` defined, rather than checking the very last stop of the train.
- [x] **Update `selectNextStop`:** Modify the logic to ensure that if the journey is completed (user reached their destination), it returns `undefined` instead of showing stops further down the train's line.

## Phase 2: Fix UI Headers (`app/(tabs)/home.tsx` & `app/(tabs)/journey.tsx`)

- [x] **Fix Arrival Time Display:** Replace the use of `origDestData.arr_time` (the train's absolute final stop) with the scheduled arrival time (`arr_time`) from the user's `selectDestinationPass`.
- [x] **Fix Ternary Typo:** Correct the typo where the arrival time is guarded by a check against `origDestData.dep_time`.

## Phase 3: Fix `LiveStatusCard` Logic (`app/(tabs)/home.tsx`)

- [x] **Remove Hardcoded Speed:** Remove the fake `"120 km/h"` string. If speed isn't available from the API, we will either omit it from the card or pass `undefined`/`"N/A"` so the component can handle the empty state.
- [x] **Fix `departureTime` Fallback:** Instead of falling back to the train's very first origin time (`origDestData.dep_time`) when traveling between stations, we will update the logic. If the train is in transit (`!isAtStation`), it should either display the departure time of the _previous_ station or just hide the `departureTime` to avoid confusion.

## Phase 4: Unit Testing

As per SOLID and testing guidelines, we must verify the business logic.

- [x] **Update `__tests__/store/journeyStore.test.ts`:**
  - Write a test for `selectDestinationPass` to ensure it correctly maps the user's destination station to the `passList`.
  - Write a test for `selectIsJourneyCompleted` where the user's destination is halfway through the route, and ensure it returns `true` when that halfway stop is reached.
  - Write a test for `selectNextStop` to ensure it stops returning future stops once the user's destination is reached.
- [x] **Verify UI Tests:** Run existing tests for `home.tsx` and `journey.tsx` to ensure the new selectors don't break rendering.

---

**Status:** Waiting for human confirmation before beginning Phase 1.
