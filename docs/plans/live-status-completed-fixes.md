# Fix LiveStatusCard Completed State

## Description

There are two remaining issues in the completed state of the `LiveStatusCard`:

1. `arrivalTime` evaluates to "Unknown" because it only looks at `nextStop.arr_time`. It should fall back to `destinationPass.arr_time` when the journey is completed.
2. The delay popup ("On Time") is explicitly hidden when `isCompleted` is true, but the delay badge (for `> 0`) is still shown. We should make this consistent by showing the "On Time" badge even when the journey is completed, so the user knows if they arrived on time. We should also handle negative delays (early arrivals) gracefully.

## Tasks

- [x] Update `app/(tabs)/home.tsx` to handle `isJourneyCompleted` fallback for the `arrivalTime` prop.
- [x] Update `components/home-components/liveStatusCard.tsx` to make delay popup visibility consistent when `isCompleted` is true.
- [ ] Verify using `pnpm lint`, `pnpm format`, `pnpm typecheck`, and tests.
