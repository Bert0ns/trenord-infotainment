# Implementation Plan: Hybrid Notifications

## Overview

We are implementing an OS-level local notification system for the Trenord Infotainment app to deliver timely, relevant journey information to passengers. To bypass background execution unreliability and avoid backend requirements, the system uses a timer-based scheduler that calculates triggers based on the train's expected arrival time when the app is in the foreground.

## Architecture Decisions

- **Timer-based local scheduling:** We schedule standard OS notifications into the future using `expo-notifications` instead of relying on unreliable iOS background fetch tasks.
- **Zustand Persistence (Registry Only):** We create a dedicated registry store `useNotificationRegistryStore` to persist currently scheduled notification IDs so we can cancel and reschedule them.
- **No Preference Duplication:** We reuse and extend the existing `useSettings` hook/store for user notification preferences (`journeyProgress`, `delayAlerts`, `weatherAlerts`) instead of creating a duplicate preference state.
- **V1 MVP Scope:** We will focus entirely on standard alerts (V1) and defer Live Activities / Persistent UI to a fast-follow V2 to reduce initial risk.
- **Strict Localization:** All notification payloads are mapped to localized namespace files (`notifications.json`) and registered in `jest.setup.js` rather than hardcoded.

## Notification Triggers & Calculation Logic

To ensure notifications fire at the correct times under dynamic train conditions (delays, early arrivals), we establish the following calculation formulas:

| Notification Category    | Event Type                | Scheduling / Trigger Rule                                                                                                                  | Check Settings Preference                           | Cancel condition                                |
| :----------------------- | :------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------- | :---------------------------------------------- |
| **Journey Updates**      | **Approaching Stop**      | Scheduled for: `(scheduled_arr_time + delay) - 2 minutes`. <br>If target time is in the past (e.g. less than 1 min away), do not schedule. | `settings.journeyProgress === true`                 | Cancel if next stop changes or journey cleared. |
| **Journey Updates**      | **Delay Change**          | Fired immediately or scheduled when a poll detects that `delay` increased by $\ge 3$ minutes compared to previous state.                   | `settings.delayAlerts === true`                     | None (immediate alert).                         |
| **Contextual Updates**   | **Weather & Destination** | Scheduled for: `(destination_arr_time + delay) - 10 minutes`. <br>Displays the weather summary at the destination.                         | `settings.weatherAlerts === true`                   | Cancel if destination or arrival time shifts.   |
| **System Notifications** | **Issue Feedback Prompt** | Scheduled for: `Date.now() + 30 seconds` after issue submission.                                                                           | None (runs implicitly as a system feedback action). | None.                                           |

---

## Task List

### Phase 1: Foundation

#### Task 1: Install Dependencies & Setup Localization

**Description:** Install the required Expo package and add the English and Italian translation strings for the notification payloads.
**Acceptance criteria:**

- [x] `expo-notifications` is installed.
- [x] `lib/i18n/locales/en/notifications.json` contains the `notifications` keys.
- [x] `lib/i18n/locales/it/notifications.json` contains the translated `notifications` keys.
- [x] `jest.setup.js` is updated to mock the new `notifications` translation namespace.
      **Verification:**
- [x] Run `pnpm install` and verify it succeeds.
- [x] Build succeeds: `pnpm typecheck`
      **Dependencies:** None
      **Files likely touched:**
- `package.json`
- `lib/i18n/locales/en/notifications.json`
- `lib/i18n/locales/it/notifications.json`
- `lib/i18n/locales/en/index.ts`
- `lib/i18n/locales/it/index.ts`
- `jest.setup.js`
  **Estimated scope:** Small: 6 files

#### Task 2: Create Notifications Registry Store

**Description:** Create a Zustand store `useNotificationRegistryStore` to keep a registry of currently scheduled notification IDs (for easy cancellation and rescheduling).
**Acceptance criteria:**

- [x] Store contains a `scheduledIds` dictionary mapping event keys to OS notification IDs.
- [x] Store contains functions to add, remove, and clear scheduled IDs.
- [x] Store is persisted to AsyncStorage.
      **Verification:**
- [x] Tests pass: `pnpm test -- --grep "notificationRegistryStore"`
      **Dependencies:** None
      **Files likely touched:**
- `store/notificationRegistryStore.ts`
- `__tests__/store/notificationRegistryStore.test.ts`
  **Estimated scope:** Small: 2 files

#### Task 3: Create Timer-Based Scheduler Utility

**Description:** Create a utility service that requests OS permissions and uses `expo-notifications` to schedule timers. It must cancel any existing timer for a specific event before setting a new one, and avoid rescheduling if the target timestamp is identical.
**Acceptance criteria:**

- [x] Utility checks user preferences from `useSettings` before scheduling.
- [x] Utility requests OS permissions if not already granted.
- [x] Utility cancels the previous `scheduledId` before setting a new one for the same event key.
- [x] Utility avoids calling schedule APIs if the new calculated trigger timestamp is identical to the previously scheduled one.
      **Verification:**
- [x] Tests pass: `pnpm test -- --grep "notificationsUtil"`
      **Dependencies:** Task 1, Task 2
      **Files likely touched:**
- `utils/notifications.ts`
- `__tests__/utils/notifications.test.ts`
  **Estimated scope:** Medium: 2 files

### Checkpoint: Foundation

- [ ] Core utilities and state management are fully unit-tested and pass.
- [ ] Build succeeds without errors.

---

### Phase 2: UI & Integration

#### Task 4: Hook Settings UI to Notification Permissions

**Description:** Update the existing Settings screen (which already has localized toggles) to request OS notification permissions automatically when a notification switch is toggled to `true` (if permission isn't already granted).
**Acceptance criteria:**

- [x] Switches are mapped to the existing `useSettings` store.
- [x] Automatically requests OS permissions when a switch is toggled to `true` and permissions are not yet granted.
      **Verification:**
- [x] Manual check: Open settings, toggle switches, verify permission prompt is triggered, verify state persists.
      **Dependencies:** Task 2
      **Files likely touched:**
- `app/(tabs)/settings.tsx`
  **Estimated scope:** Small: 1 file

#### Task 5: Hook Scheduler to Journey & System Events

**Description:** Trigger the utility functions from the actual components/hooks where data is loaded or actions are taken, and clean up on logout/journey clear.
**Acceptance criteria:**

- [x] Journey Updates (Approaching Stop, Delay Alert) are scheduled when journey data fetches.
- [x] Contextual Updates (Weather) are scheduled based on journey timestamps.
- [x] System Feedback prompt is scheduled exactly 30 seconds after the `report-issue-page.tsx` submission.
- [x] All scheduled notifications are canceled when the journey is ended or cleared.
- [x] Notifications are recalculated/rescheduled when the app state transitions back to `active`.
      **Verification:**
- [ ] Manual check: Load journey, verify in dev console that notifications are scheduled.
- [ ] Manual check: Submit an issue, verify the local OS notification pops up 30 seconds later.
      **Dependencies:** Task 3, Task 4
      **Files likely touched:**
- `app/(tabs)/journey.tsx`
- `app/report-issue-page.tsx`
- `hooks/use-train-polling.ts`
- `app/(tabs)/settings.tsx`
  **Estimated scope:** Medium: 4-5 files

### Checkpoint: Complete

- [ ] All acceptance criteria met.
- [ ] End-to-end flow works flawlessly on simulator/device.
- [ ] Ready for review.

## Testing Strategy & Mocking

`expo-notifications` contains native code that does not run in a standard Node environment (Jest). We must mock it for test isolation.

### Jest Mock Structure

We will use the following mock structure during tests:

```typescript
jest.mock("expo-notifications", () => ({
  scheduleNotificationAsync: jest
    .fn()
    .mockResolvedValue("mock-notification-id"),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  setNotificationHandler: jest.fn(),
}));
```

### Proposed Test Cases

- **Registry Store Tests (`notificationRegistryStore.test.ts`):**
  - [ ] Store initializes with empty `scheduledIds`.
  - [ ] Action to add a scheduled notification ID updates the store state correctly.
  - [ ] Action to remove a scheduled ID updates the store state correctly.
  - [ ] Action to clear all scheduled IDs resets the state.
  - [ ] Registry persistence functions correctly using AsyncStorage.
- **Scheduler Utility Tests (`notificationsUtil.test.ts`):**
  - [ ] Checks settings/preferences from `useSettings` before scheduling.
  - [ ] Requests OS permissions when scheduled and status is not yet granted.
  - [ ] Does not fire / schedule if notification permission is denied.
  - [ ] Cancels any existing scheduled notification for the same event key before scheduling a new one.
  - [ ] Optimizes scheduling: skips calling `expo-notifications` schedule API if target trigger timestamp is unchanged.
- **Integration & Event Hook Tests:**
  - [ ] Report issue page form submission schedules a feedback notification to trigger after 30 seconds.

---

## Risks and Mitigations

| Risk                         | Impact | Mitigation                                                                                                                                                                                                                      |
| ---------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| iOS Notification Permissions | High   | If a user denies permissions at the OS level, our internal switches might say "On" but no notifications fire. We must ensure `requestPermissionsAsync` is handled gracefully and the UI reflects the true OS state if possible. |
| Timezone / Clock Skew        | Med    | If the device clock is severely out of sync with the Train API timestamps, timers will fire early/late. We assume standard OS network time sync for the MVP.                                                                    |

## Open Questions

- Should we add a deep link to the notifications so tapping them opens a specific page (e.g., tapping the weather notification opens the destination POI page)? (We can do this as a fast-follow).
