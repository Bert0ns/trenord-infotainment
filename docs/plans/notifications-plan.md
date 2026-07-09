# Implementation Plan: Hybrid Notifications

## Overview

We are implementing an OS-level local notification system for the Trenord Infotainment app to deliver timely, relevant journey information to passengers. To bypass background execution unreliability and avoid backend requirements, the system uses a timer-based scheduler that calculates triggers based on the train's expected arrival time when the app is in the foreground.

## Architecture Decisions

- **Timer-based local scheduling:** We schedule standard OS notifications into the future using `expo-notifications` instead of relying on unreliable iOS background fetch tasks.
- **Zustand Persistence:** User preferences and currently scheduled notification IDs are persisted so we can easily cancel and reschedule them if the train is delayed.
- **V1 MVP Scope:** We will focus entirely on standard alerts (V1) and defer Live Activities / Persistent UI to a fast-follow V2 to reduce initial risk.
- **Strict Localization:** All notification payloads are mapped to `react-i18next` JSON files rather than hardcoded.

---

## Task List

### Phase 1: Foundation

#### Task 1: Install Dependencies & Setup Localization

**Description:** Install the required Expo package and add the English and Italian translation strings for the notification payloads.
**Acceptance criteria:**

- [ ] `expo-notifications` is installed.
- [ ] `lib/i18n/locales/en/translation.json` contains the `notifications` keys.
- [ ] `lib/i18n/locales/it/translation.json` contains the translated `notifications` keys.
      **Verification:**
- [ ] Run `pnpm install` and verify it succeeds.
- [ ] Build succeeds: `pnpm typecheck`
      **Dependencies:** None
      **Files likely touched:**
- `package.json`
- `lib/i18n/locales/en/translation.json`
- `lib/i18n/locales/it/translation.json`
  **Estimated scope:** Small: 3 files

#### Task 2: Create Notifications State Store

**Description:** Create a Zustand store to persist user notification preferences and keep a registry of currently scheduled notification IDs (for easy cancellation).
**Acceptance criteria:**

- [ ] Store contains `preferences` (journeyUpdates, contextual, system).
- [ ] Store contains `scheduledIds` dictionary.
- [ ] Store is persisted to AsyncStorage.
      **Verification:**
- [ ] Tests pass: `pnpm test -- --grep "notificationsStore"`
      **Dependencies:** None
      **Files likely touched:**
- `store/notificationsStore.ts`
- `__tests__/store/notificationsStore.test.ts`
  **Estimated scope:** Small: 2 files

#### Task 3: Create Timer-Based Scheduler Utility

**Description:** Create a utility service that requests OS permissions and uses `expo-notifications` to schedule timers. It must cancel any existing timer for a specific event before setting a new one.
**Acceptance criteria:**

- [ ] Utility checks user preferences before scheduling.
- [ ] Utility requests OS permissions if not already granted.
- [ ] Utility cancels the previous `scheduledId` before setting a new one for the same event key.
      **Verification:**
- [ ] Tests pass: `pnpm test -- --grep "notificationsUtil"`
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

#### Task 4: Build Settings UI for Notifications

**Description:** Update the existing Settings screen to include localized toggles so the user can opt-in/out of the three notification categories.
**Acceptance criteria:**

- [ ] Renders 3 switches mapped to the `notificationsStore` preferences.
- [ ] Automatically requests OS permissions when a switch is toggled to `true`.
      **Verification:**
- [ ] Manual check: Open settings, toggle switches, verify state persists across app reload.
      **Dependencies:** Task 2
      **Files likely touched:**
- `app/(tabs)/settings.tsx`
  **Estimated scope:** Small: 1 file

#### Task 5: Hook Scheduler to Journey & System Events

**Description:** Trigger the utility functions from the actual UI components where data is loaded or actions are taken.
**Acceptance criteria:**

- [ ] Journey Updates (Approaching Stop, Delay Alert) are scheduled when journey data fetches.
- [ ] Contextual Updates (Weather, Content Ready) are scheduled based on journey timestamps.
- [ ] System Feedback prompt is scheduled exactly 30 seconds after the `report-issue-page.tsx` submission.
      **Verification:**
- [ ] Manual check: Load journey, verify in dev console that notifications are scheduled.
- [ ] Manual check: Submit an issue, verify the local OS notification pops up 30 seconds later.
      **Dependencies:** Task 3, Task 4
      **Files likely touched:**
- `app/(tabs)/journey.tsx`
- `app/report-issue-page.tsx`
  **Estimated scope:** Medium: 2-3 files

### Checkpoint: Complete

- [ ] All acceptance criteria met.
- [ ] End-to-end flow works flawlessly on simulator/device.
- [ ] Ready for review.

---

## Risks and Mitigations

| Risk                         | Impact | Mitigation                                                                                                                                                                                                                      |
| ---------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| iOS Notification Permissions | High   | If a user denies permissions at the OS level, our internal switches might say "On" but no notifications fire. We must ensure `requestPermissionsAsync` is handled gracefully and the UI reflects the true OS state if possible. |
| Timezone / Clock Skew        | Med    | If the device clock is severely out of sync with the Train API timestamps, timers will fire early/late. We assume standard OS network time sync for the MVP.                                                                    |

## Open Questions

- Should we add a deep link to the notifications so tapping them opens a specific page (e.g., tapping the weather notification opens the destination POI page)? (We can do this as a fast-follow).
