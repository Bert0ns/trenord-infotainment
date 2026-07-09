# Hybrid Notifications - Implementation Plan

## Problem Statement

How might we deliver timely, relevant information to onboard passengers without requiring them to stare at their screens, while avoiding notification fatigue?

## Recommended Direction

A **Hybrid Notification System** powered by lightweight, timer-based scheduling:

1. **Standard Alerts (The "Taps on the shoulder"):** Traditional OS notifications for critical, time-sensitive events (e.g., "Approaching Milano Centrale", "Weather Alert at destination"). To maximize reliability and save battery, these are scheduled via local timers based on expected arrival times.
2. **The Silent Dashboard (The "Glance"):** A persistent notification (Android) and Live Activity (iOS) showing live journey progress.

## MVP Scope (V1) & Fast-Follow (V2)

- **V1 Scope (MVP):** Focus purely on the Standard Alerts using `expo-notifications` and timer-based scheduling. Implement the Settings UI so users can toggle preferences. Fully localized in English and Italian.
- **V2 Scope (Not Doing in V1):** The Silent Dashboard (Live Activities / Persistent Notifications). Native UI extensions are risky and complex. We will prove the standard notification timers work perfectly in V1, then add the Live Activity UI as a fast-follow in V2.

## User Review Required

> [!IMPORTANT]  
> Please review the merged **Notification Types & Triggers** section below. I have taken your custom triggers (the 30-second delay for the report confirmation, and the POI text) and added the Italian localization mapping to them!

---

## Notification Types & Triggers (Functional Scope & Localization)

All notifications will be localized in English and Italian using `react-i18next`. Below are the English values that will be mapped into `lib/i18n/locales/en/translation.json` and their Italian equivalents in `it/translation.json`.

### 1. Journey Updates (Category: `journeyUpdates`)

- **Approaching Stop** (Trigger: Scheduled for exactly **5 minutes before** the expected arrival time)
  - **Title:** Arriving Soon | _In arrivo_
  - **Body:** "You will arrive at {{station}} in 5 minutes." | _"Arriverai a {{station}} tra 5 minuti."_
- **Delay Alert** (Trigger: Fired immediately if the app is opened/refreshed and detects the delay has increased by >5 minutes compared to the previous state. Reschedules future timers)
  - **Title:** Delay Update | _Aggiornamento ritardo_
  - **Body:** "Your train is delayed. New expected arrival at {{station}} is {{time}}." | _"Il tuo treno è in ritardo. Il nuovo arrivo previsto a {{station}} è alle {{time}}."_

### 2. Contextual & Infotainment (Category: `contextual`)

- **Weather at Destination** (Trigger: Scheduled for **10 minutes before** expected arrival time)
  - **Title:** Weather at {{station}} | _Meteo a {{station}}_
  - **Body:** "It's currently {{condition}} at your destination. Check the app for POIs nearby." | _"Attualmente c'è {{condition}} a destinazione. Controlla l'app per i POI vicini."_
- **Trip Content Ready** (Trigger: Scheduled for **15 minutes after** the actual departure time)
  - **Title:** Enjoy your ride | _Goditi il viaggio_
  - **Body:** "Explore the POIs of your destination..." | _"Esplora i POI della tua destinazione..."_

### 3. System (Category: `system`)

- **Feedback / Shake to Report Prompt** (Trigger: Scheduled for **30 seconds after** the submission of an issue report)
  - **Title:** report received | _segnalazione ricevuta_
  - **Body:** "We have received your report, thanks" | _"Abbiamo ricevuto la tua segnalazione, grazie"_

---

## Proposed Tasks (Implementation)

- [ ] **Task 1: Install Dependencies**
  - Run `pnpm install expo-notifications`

- [ ] **Task 2: Localization Configuration**
  - Modify `lib/i18n/locales/en/translation.json` and `it/translation.json` to add the new translation keys for notifications inside a `"notifications"` namespace.

- [ ] **Task 3: State Management (Zustand)**
  - Create `store/notificationsStore.ts` to manage user preferences and keep track of scheduled notification IDs so we can cancel/reschedule them if train times change.

- [ ] **Task 4: Settings UI Updates**
  - Modify `app/(tabs)/settings.tsx` to include `useNotificationsStore` and `useTranslation`.
  - Add a localized "Notifications" section with `Switch` components.
  - When a switch is toggled to `true`, request OS notification permissions using `expo-notifications`.

- [ ] **Task 5: Timer-Based Scheduler Utility**
  - Create `utils/notifications.ts` to export utility functions: `requestNotificationPermissions`, `scheduleEventNotification`, and `cancelEventNotification`.
  - Configure the notification handler (`Notifications.setNotificationHandler`).

- [ ] **Task 6: Hooking it to the Journey & System Events**
  - Modify `app/(tabs)/journey.tsx` (or wherever journey data is fetched) to call `scheduleEventNotification` using localized strings via `i18n.t()` whenever the train status is successfully fetched.
  - Modify `app/report-issue-page.tsx` (or similar) to call `scheduleEventNotification` 30 seconds after the user successfully submits a report.

- [ ] **Task 7: Automated Tests**
  - Write `store/notificationsStore.test.ts` to verify preferences and scheduled IDs are saved correctly.
  - Write `utils/notifications.test.ts` to mock `expo-notifications` and verify that `scheduleEventNotification` works properly.

---

## Verification Plan

### Manual Verification

1. Open Settings, ensure the app language is set to Italian.
2. Load a journey. Ensure notifications are successfully scheduled.
3. Submit an issue report. Verify the confirmation notification fires exactly 30 seconds later in Italian.
