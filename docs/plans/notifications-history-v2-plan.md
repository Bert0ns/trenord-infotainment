# Implementation Plan: V2 Notifications Timeline Slider

## Overview

Develop a persistent "Future & Past" in-app notifications timeline panel. This panel will act as a lifeline for commuters, allowing them to review all past alerts (train delays, approaching stops) that have fired during their journey, and preview _upcoming_ scheduled notifications (e.g. destination weather). The UI will utilize a slide-out panel accessible via a Bell icon in the global header, reusing the smooth animation logic currently found in the News Magazine and Report Issue pages.

## Architecture Decisions

- **State Expansion:** We will extend the existing `useNotificationRegistryStore` (which currently tracks scheduled OS IDs) to also track an array of `NotificationEvent` objects. This leverages our existing `AsyncStorage` persistence automatically.
- **Event Interception:** We will use Expo's `Notifications.addNotificationReceivedListener` inside a top-level component (e.g., the root layout) to listen for native notification triggers and append them to the history store as "past" events.
- **UI & Animation Parity:** A bell icon with a dynamic unread badge will be added to the global `Header`. Tapping it will open a dedicated sliding sheet panel. We will extract the shared slider animation logic (currently duplicated/used in the News Magazine and Report Issue pages) into a reusable `<SlideSheet>` or `<BottomSheet>` UI primitive.

## Task List

### Phase 1: Foundation (Data Layer & Interception)

- [x] **Task 1: Extend Notification Store**
  - **Description:** Update `notificationRegistryStore` to support history and unread counts.
  - **Acceptance criteria:**
    - [x] Store contains `history: NotificationEvent[]` array.
    - [x] Actions added: `addHistoryItem`, `markAllAsRead`, `clearHistory`.
    - [x] Unread count is correctly derived from `history`.
  - **Verification:**
    - [x] Tests pass: `pnpm test -- --grep "notificationRegistryStore"`
  - **Dependencies:** None
  - **Files likely touched:**
    - `store/notificationRegistryStore.ts`
    - `__tests__/store/notificationRegistryStore.test.ts`
  - **Estimated scope:** Small

- [x] **Task 2: Setup OS Notification Listeners**
  - **Description:** Intercept notifications as they fire from the OS and route them into our Zustand store.
  - **Acceptance criteria:**
    - [x] `addNotificationReceivedListener` is mounted in a global context (e.g. `_layout.tsx` or a custom `NotificationObserver` component).
    - [x] When a notification fires natively, its payload (title, body, date) is dispatched to `addHistoryItem`.
  - **Verification:**
    - [x] Manual check: Using a dev build, fire a test notification and verify the Zustand store logs the new history entry.
  - **Dependencies:** Task 1
  - **Files likely touched:**
    - `app/_layout.tsx`
  - **Estimated scope:** Small

### Checkpoint: Foundation

- [x] Tests pass, builds clean
- [x] Captured notifications correctly persist across app restarts when manually tested.

### Phase 2: Core UI (Slider & Bell)

- [x] **Task 3: Refactor Slide-Sheet Animation Primitive**
  - **Description:** Extract the sliding sheet animation logic currently used in the News Magazine and Report Issue pages into a unified, reusable UI primitive.
  - **Acceptance criteria:**
    - [x] Create `components/ui/SlideSheet.tsx` (or similar).
    - [x] Component accepts `isVisible`, `onClose`, and `children`.
    - [x] News Magazine and Report Issue pages are updated to use this new primitive.
  - **Verification:**
    - [x] Manual check: News and Report pages still open and animate smoothly.
  - **Dependencies:** None (can be parallelized)
  - **Files likely touched:**
    - `components/ui/SlideSheet.tsx`
    - `app/news-magazine.tsx`
    - `app/report-issue-page.tsx`
  - **Estimated scope:** Medium

- [x] **Task 4: Notification Bell Component**
  - **Description:** Create a reusable UI component that displays a bell icon and an unread badge.
  - **Acceptance criteria:**
    - [x] Component subscribes to `notificationRegistryStore` to get the unread count.
    - [x] If `unread > 0`, a red dot/badge with the number is visible.
    - [x] Placed inside the app's primary `Header`.
  - **Verification:**
    - [x] Tests pass for header and bell component.
  - **Dependencies:** Task 1
  - **Files likely touched:**
    - `components/ui/NotificationBell.tsx`
    - `components/header.tsx`
  - **Estimated scope:** Small

- [x] **Task 5: Notification Timeline Panel UI**
  - **Description:** Build the sliding UI to list all captured (past) and scheduled (future) notifications.
  - **Acceptance criteria:**
    - [x] Uses the `SlideSheet` component.
    - [x] Renders a unified chronological `FlatList` of notifications (merging `history` and `scheduledNotifications`).
    - [x] Includes UI to "Mark all as read" and "Clear history".
    - [x] Strong visual distinction between "Past" (grayed out/standard) and "Future" (glowing/active) notifications.
  - **Verification:**
    - [x] Tests pass for the new component.
    - [x] Manual check: Tapping the bell opens the slide sheet, showing past and future events correctly styled.
  - **Dependencies:** Task 3, Task 4
  - **Files likely touched:**
    - `components/notifications/TimelinePanel.tsx` (or similar)
  - **Estimated scope:** Medium

### Checkpoint: Core Features

- [x] End-to-end flow works: OS notification fires -> bell badge increments -> tapping bell slides out panel -> user sees timeline.

### Phase 3: Polish

- [x] **Task 6: Localization & Empty States**
  - **Description:** Ensure the feature supports English and Italian and looks polished when empty.
  - **Acceptance criteria:**
    - [x] All static strings ("Clear all", "No recent notifications", "Future", "Past") use `react-i18next`.
    - [x] Strings added to `lib/i18n/locales/en/notifications.json` and `/it/notifications.json`.
    - [x] Empty state UI is beautiful and centered, encouraging interaction.
  - **Verification:**
    - [x] Tests pass.
  - **Dependencies:** Task 5
  - **Files likely touched:**
    - `lib/i18n/locales/en/notifications.json`
    - `lib/i18n/locales/it/notifications.json`
    - `components/notifications/TimelinePanel.tsx`
  - **Estimated scope:** Small

### Checkpoint: Complete

- [x] All acceptance criteria met
- [x] Ready for review

## Risks and Mitigations

| Risk                                                                         | Impact | Mitigation                                                                                                                                                               |
| ---------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Background execution** OS kills listener when app is totally terminated    | High   | iOS/Android background states usually support `expo-notifications` receipt handling, but if they are wiped, the "Future" list will repopulate on next app launch anyway. |
| **Store Bloat** Unlimited history causes `AsyncStorage` to hit memory limits | Med    | We will enforce a strict cap (e.g., `slice(0, 50)`) inside the `addHistoryItem` action to prevent memory leaks.                                                          |
| **Refactoring Risk** Breaking the News/Report animations                     | Low    | We will rigorously test the new `<SlideSheet>` primitive manually before merging, ensuring the exact same animation params are used.                                     |

## Not Doing (and Why)

- **Pinning notifications to the Journey Map:** While visually cool, it limits the user to only seeing notifications if they navigate to the specific Journey tab. A global Bell Icon panel is accessible from anywhere in the app.
- **Historical punctuality data:** We only care about the _active_ journey right now. Cross-day punctuality tracking is a massive scope increase.
