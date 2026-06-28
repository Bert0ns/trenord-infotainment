# Plan: Swipe-to-Refresh Live Train Data on Journey & Home Pages

## 1. Overview

The Journey and Home pages display real-time train data (delay, timeline of stops, actual arrival/departure times, etc.) loaded into the `JourneyStore` upon login.
We want to allow users to swipe down (pull-to-refresh) to fetch the latest live data from the Trenord API and seamlessly update the UI on **both** pages.

## 2. Changes to be made

### Step 2.1: Abstract Logic into a Custom Hook (DRY & SRP Principles)

- **File:** Create `hooks/use-refresh-train-data.ts`
- **Logic:**
  - Create and export a custom hook `useRefreshTrainData`.
  - Import `useState` and `useCallback`.
  - Import `fetchTrainData` from `@/lib/api/trenord`.
  - Extract the store data: `trainId`, `destinationStation`, and the `setJourney` function from `useJourneyStore`.
  - Implement an asynchronous `onRefresh` callback:
    1. Set `isRefreshing(true)`.
    2. Try fetching the latest data: `const newData = await fetchTrainData(trainId);`
    3. Update the global state: `setJourney(trainId, destinationStation, newData);`
    4. Handle errors (log them via `logger.error`).
    5. Set `isRefreshing(false)` in a `finally` block.
  - Return `{ isRefreshing, onRefresh }`.

### Step 2.2: Update the UI Components

- **Files:** `app/(tabs)/journey.tsx` and `app/(tabs)/home.tsx`
- **Logic:**
  - Import `RefreshControl` from `react-native`.
  - Import the new `useRefreshTrainData` hook.
  - Consume the hook: `const { isRefreshing, onRefresh } = useRefreshTrainData();`
  - Attach the refresh control to the existing `ScrollView` in both files:
    ```tsx
    <ScrollView
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      ...
    >
    ```

### Step 2.3: Update Unit Tests

- **Files:** `__tests__/hooks/use-refresh-train-data.test.ts` (create new test) and update `home.test.tsx` / `journey.test.tsx`.
- **Logic:**
  - Test the hook in isolation to ensure it calls the API and updates the store correctly.
  - In the component tests, mock the hook and optionally fire the `refresh` event on the `ScrollView` to ensure the hook's returned function is correctly bound to the UI.

## 3. Adherence to Guidelines

- **SOLID & DRY:** Moving the refresh logic into a single reusable custom hook ensures we don't duplicate code across the Home and Journey pages.
- **Tests in Plan:** Unit testing the isolated hook makes verifying the business logic much simpler and respects the testing requirement.
- **Task Tracking:**
  - [x] Implement `useRefreshTrainData` hook.
  - [x] Implement hook unit tests.
  - [x] Attach `RefreshControl` to `journey.tsx`.
  - [x] Attach `RefreshControl` to `home.tsx`.
  - [x] Update component tests (if necessary).
  - [x] Run `pnpm lint` and `pnpm test` to verify.
