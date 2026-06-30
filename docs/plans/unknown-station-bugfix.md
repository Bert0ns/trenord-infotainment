# Fix LiveStatusCard "Unknown" Bug

## Description

When the train reaches its destination, `nextStop` becomes `undefined` causing the UI to fallback to `"Unknown"`. Since the `LiveStatusCard` hides the right side destination when the journey is completed, we must pass the `destinationStation` name to the `nextStop` prop so that the UI correctly shows where the train has arrived.

## Tasks

- [x] Analyze the bug and report to the user
- [ ] Update `app/(tabs)/home.tsx` to handle `isJourneyCompleted` fallback for the `nextStop` prop.
- [ ] Verify using `pnpm lint`, `pnpm format`, `pnpm typecheck`, and tests.
