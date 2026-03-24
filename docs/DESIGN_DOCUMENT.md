# Trenord Infotainment: Design Document (Exam-Focused)

## 1. Project Overview & Scope
**Project Name:** Trenord Infotainment App

**Team Size:** 3 Computer Science Master's Students

**Timeline:** 2 Months (Exam term project)

**Platform:** iOS and Android (via Expo + React Native)

### 1.1 Value Proposition
A smart, context-aware infotainment application designed to enhance the commuting experience on Trenord trains. It combines **real-time journey data** (delay, progress, crowding, stops) with **sensor-driven interactions** (shake/report, motion comfort) and **resilient offline behavior** for typical train connectivity issues.

### 1.2 Exam/Project Constraints (Non‑Negotiable)
- **2-month cap:** MVP must be ruthlessly scoped and demoable.
- **Polished UI:** strong Look & Feel, responsive layout, explicit states (loading/offline/error/cancelled).
- **Sensors required:** accelerometer/gyroscope, GPS, haptics (where appropriate).
- **Testing:** high coverage for non-UI code (helpers, hooks, parsing, view-model logic).
- **Demo reliability:** mocked providers + caching must allow a stable demo even when the Train API is flaky.

### 1.3 Data Capabilities (Grounded in Provided API Docs)
Confirmed external data capability:
- **Trenord Train API:** `GET https://cloud.mp.trenord.it/train/{train_id}` returning an array of journey candidates (typically the first element is the active/next journey).

Everything else (weather/news/AI) is optional stretch because it depends on additional APIs not described in the provided Trenord API material.

---

## 2. Feature Specification

## 2.0 Onboard Unlock (Mandatory, Per Journey) + Locked Teaser

### 2.0.1 Objective
The infotainment service must be **available only onboard** and **unlock post check-in** (as described in the onboard scenario). Since we do not have official Trenord ticketing/account APIs in our provided context, the unlock will be implemented as an **exam-grade, demoable gate**:
- **Per journey** (unlock applies only to one journey instance, not a global “logged-in” state).
- Uses real app capabilities (camera scan, state machine, persistence, validation via Train API).
- Explicitly documented as **mocked verification** where external services are not available.

### 2.0.2 Locked Mode (Read‑only Teaser)
When locked, the app shows a polished teaser rather than an empty wall:
- A **Preview Dashboard** rendered from static/mock data (clearly labeled “Preview”).
- Explains what becomes available once unlocked.
- CTA: **Unlock this journey** (leads to unlock flow).

This supports the exam’s “Look & Feel” requirement and creates a smooth demo narrative:
**Locked teaser → unlock → real dashboard → offline fallback**.

### 2.0.3 Unlock is Per Journey (Definition)
We define the journey key using fields present in Train API:
- `train_id` (request parameter used to fetch the journey)
- root journey `date` (`YYYYMMDD`)
- `dep_station.station_id`, `arr_station.station_id`
- `dep_time`, `arr_time`
- cancellation status `cancelled`

**Unlock scope rule:** unlocking binds to a specific journey candidate (typically index `0`).
Unlock is invalidated when:
- the app detects a different journey key (new date / different origin-destination / different train_id), or
- the journey ends, or
- user logs out / locks again.

### 2.0.4 Unlock Options Considered (Only)
We only consider:
- **Ticket Scan**
- **Login with mocked Trenord account**

### 2.0.5 MVP Implementation Details
We implement both methods, with deterministic fallback paths for demo reliability.

**Ticket Scan flow (MVP):**
1. Camera scan QR payload (demo schema), e.g.:
   `trenord-demo://ticket?train_id=1900832&date=20240117&from=S01933&to=S01066`
2. Fetch Train API: `GET /train/{train_id}`
3. Choose candidate journey (index `0` by default) and validate:
   - `date` matches
   - origin/destination station_id match (if provided)
   - if `cancelled=true`, do not unlock; show cancellation explanation
4. On success: store `unlockedJourneyKey` and allow access to the full app.

Fallback if camera permission denied: manual entry of the same code.

**Mocked Login flow (MVP):**
1. Login with demo credentials or “1-tap demo user”.
2. Enter/select `train_id` (with “recent trains” list).
3. Fetch Train API and unlock per journey key.
4. Store a mock session token locally; implement logout.

### 2.0.6 Definition of Done (Unlock)
- Works on iOS and Android.
- Locked teaser is polished and functional offline.
- Unlock binds to a journey key and visibly indicates the unlocked journey (train + date + direction).
- Unit tests cover:
  - journey key creation/matching
  - validation rules
  - invalidation rules (journey end / journey mismatch)
  - mocked session persistence

---

## 2.1 Core Journey Dashboard (The “Home Page”)
Primary interface for the commuter: glanceable, relevant information driven by current trip context.

### 2.1.1 What we show (MVP)
From the **Train API** response:
- **Delay:** use root `delay` when `delay_defined=true`; otherwise show “Delay not confirmed” and fall back to train-level delay if present.
- **Cancellation:** if `cancelled=true`, show a clear cancelled state and suppress arrival alarm.
- **Crowding:** `journey_list[0].train.crowding` (`percentage`, `level`, `source`).
- **Current position hints:** `journey_list[0].train.actual_station`, `actual_station_mir`, `actual_time` (if `has_live_info=true`).
- **Stops overview:** compact render from `pass_list[]` (do not render large `schedule` arrays).

### 2.1.2 Derived values (must be unit-tested)
- **Progress %:** computed from `train.pass_id` vs `pass_list.length` (guard for missing fields).
- **Next stop:** derived from `pass_list` and `pass_id`.
- **ETA:** based on schedule + confirmed delay; if live info is missing, mark as estimate/unknown.

### 2.1.3 UX states (required)
- Loading (first fetch)
- Live (fresh API data)
- Partial (no live info / missing fields)
- Cancelled
- Offline (cached snapshot + “last updated at” banner)

---

## 2.2 Interactive & Sensor-Driven Features (The “Wow” Factor)
Features designed to leverage modern smartphone sensors and demonstrate technical proficiency.

### 2.2.1 Motion Comfort Mode (Anti‑sickness, iOS-like, global)
**Goal:** reduce nausea and cognitive load during travel **without changing screen context**.  
This feature is **not a separate screen**. It is a **global UI adaptation layer** applied across all screens (Locked teaser, Unlock flow, Dashboard, Settings).

**Activation (MVP):**
- Primary: **manual toggle in Settings** (`Comfort Mode: On/Off`).
- Persisted locally and applied app-wide on startup.
- Sensor data is still collected to satisfy sensor requirements and for potential future “suggestion” UX, but MVP behavior remains user-controlled for predictability.

**iOS-like behavior model (what changes globally when enabled):**
1. **Reduce Motion**
   - Disable/simplify non-essential animations and transitions (prefer opacity fades over translation/scale).
   - Avoid looping decorative animations.
2. **Reduce Transparency / Layer Complexity**
   - Reduce/disable heavy glass/blur surfaces (Reduce Transparency equivalent).
   - Continue following DESIGN.md “No-Line Rule”: separate content via tonal depth tokens rather than borders.
3. **Increase Readability**
   - Slightly increase typography scale for key metrics and labels (keep **Manrope** per DESIGN.md).
   - Add whitespace between dense blocks; collapse secondary content where appropriate.

**Design System Alignment (DESIGN.md: “Kinetic Precision”):**
- Comfort Mode preserves the HUD-like aesthetic, but simplifies to more stable tonal surfaces.
- No 1px borders; use `surface` / `surface-container-low` / `surface-container-high` layering.
- Avoid harsh contrast and visual noise during motion; maintain `on-surface-variant` for secondary text.

**Testing focus:**
- Unit test “comfort policy” functions (e.g., mapping comfort mode → animation/blur/typography tokens).
- Unit test motion-score math as pure functions (optional), without coupling it to the toggle.

### 2.2.2 “Shake to Report” System (MVP)
Uses shake detection to open an issue reporting modal:
- categories: “Air conditioning”, “Too crowded”, “Dirty seats”, “Other”
- optional text note
- store locally; optionally export/share for demo
- protect against accidental triggers via debounce + confirmation step

### 2.2.3 Location-Aware POIs (Stretch)
Foreground-only POIs/trivia while the app is open (battery-aware; avoid background tracking in MVP).

### 2.2.4 BLE Carriage Capacity Mapping (Defer)
Not MVP: iOS/background BLE constraints + privacy and reliability risk.

---

## 2.3 Media, Notifications & AI (Enrichment)

### 2.3.1 Journey Alerts (MVP subset)
- Local notifications for critical changes:
  - delay change threshold
  - cancellation changes
  - (platform changes only if reliably present)

**Constraint note:** “true push” needs backend. MVP uses foreground polling + local notifications; background delivery is best-effort only.

### 2.3.2 Arrival Alarm (MVP)
- Notify exactly 5 minutes before destination (best-effort based on ETA logic).
- Reschedule if ETA changes significantly.

### 2.3.3 AI Destination News Search + Summaries (Stretch)
Provide an “AI-powered destination briefing” for the journey destination:
- **Input context:** destination station name (`arr_station.station_ori_name`) and optionally the destination city/area if derivable.
- **News retrieval:** query an external news/search API (or a curated feed) for recent articles related to the destination location.
- **AI summarization:** produce a short, commuter-friendly summary (bullets) highlighting only actionable/relevant information (events, disruptions, major local news).
- **Latency/cost controls:**
  - strict timeouts and fallbacks (“News unavailable”)
  - caching per destination for a limited time window
  - optional “summarize on demand” button to avoid background token usage
- **Offline behavior:** show cached summaries when network is unavailable.

> Note: this depends on external services (news + AI) not included in the Trenord Train API, therefore it is treated as a Stretch feature. For demo reliability, we can ship with a mocked news provider and/or precomputed summaries for a small set of destinations.

### 2.3.4 Offline Mode Fallback (MVP)
Because trains have dead zones:
- Cache the latest Train API snapshot + derived dashboard view model.
- When offline:
  - show cached dashboard + last updated timestamp
  - disable actions that require network, but keep UI usable

### 2.3.5 Partner Media Hub (Stretch)
Demo with mock catalog only, no licensing complexity.

---

## 3. Technical Architecture & Constraints

### 3.1 Tech Stack
- **Framework:** React Native with Expo
- **Navigation:** Expo Router
- **External APIs:**
  - **Trenord Train API:** `GET https://cloud.mp.trenord.it/train/{train_id}`
  - (Stretch) Weather API
  - (Stretch) AI summarization API
  - (Stretch) News/Search API for destination news retrieval

### 3.2 Architecture Outline (Exam-grade, testable)
- **API layer:** fetch + strict parsing to typed DTOs
- **Normalization:** convert raw API payload → stable internal models:
  - `JourneySnapshot` (raw + timestamp)
  - `JourneyViewModel` (derived fields for UI)
- **State:** a single source of truth for:
  - `UnlockState` (per journey)
  - `ComfortMode` global toggle
  - `JourneyState` (loading/live/offline/error)
- **Caching:** local persistence for snapshots + settings + unlock/session state
- **Mock providers:** deterministic demo mode for API failures and stretch integrations

### 3.3 Evaluation Criteria (Exam Requirements)
- Responsive & polished UI
- Sensors: accelerometer, gyroscope, GPS, haptics
- Testing: Jest + React Native Testing Library
- Deliverables: design doc, real-time demo, technical presentation

---

## 4. Development Timeline (2 Months | 3 Developers)
**Weeks 1–2: Architecture & PoC**
- Expo setup, routing, CI checks
- Typed Train API wrapper + mocked provider
- Locked teaser UI + unlock state machine skeleton
- Comfort Mode global toggle wiring (UI tokens + persistence)

**Weeks 3–4: Core UI & Data Binding**
- Dashboard UI + view model (ETA/progress/next stop)
- Offline caching + offline UX states
- Mocked Login unlock end-to-end (journey-bound)

**Weeks 5–6: Sensors + Ticket Scan + Notifications**
- Shake detection + report modal + persistence
- Motion comfort: global reduction policy applied across screens
- Ticket Scan unlock (camera scan + parsing + journey validation)
- Arrival alarm + delay alerts (local notifications)

**Week 7: Polish & Testing**
- Unit tests: journey matching, ETA/progress logic, caching, notification decisions, comfort policy
- UI polish: accessibility, edge cases, cancelled journey state
- Demo hardening: “API flaky” fallback

**Week 8: Pitch Prep**
- Demo script: locked teaser → unlock → live dashboard → shake report → offline mode
- Presentation: architecture, tradeoffs, test strategy, constraints

---

## 5. Guide: Effectively Using AI Agents in Your Project
As a team of 3 Master's students under a tight deadline, AI coding agents can drastically speed up velocity. Use them for isolated tasks, strict interfaces, scaffolding, and test generation (keep the existing section and keep it updated).

---

## 6. Feasibility Matrix & Delivery Plan

### 6.1 Feature Feasibility Matrix (Updated)
| Feature | Feasible in 2 Months | Data/Dependencies | Effort (Dev-Weeks) | Main Risks | Recommendation |
| --- | --- | --- | --- | --- | --- |
| **Onboard Unlock (per journey, ticket scan + mocked login) + locked teaser** | Yes | Camera + local storage + Train API validation | 1.0 - 1.5 | mocked ticket/login; permissions | **Include in MVP** |
| Core Journey Dashboard (status, delays, ETA, crowding, progress) | Yes | Train API | 1.5 - 2.0 | API payload variability | Include in MVP |
| Motion Comfort Mode (global, settings-toggle) | Yes | Sensors + UI token policy | 0.75 - 1.25 | UX tuning, consistency | Include in MVP |
| Shake to Report | Yes | Shake detection + modal + persistence | 0.5 - 0.75 | accidental triggers | Include in MVP |
| Journey Alerts | Yes (foreground reliable) | Polling + local notifications | 0.75 - 1.25 | background limits | Include core alerts |
| Arrival Alarm (5-minute warning) | Yes | ETA computation + notifications | 0.25 - 0.5 | ETA drift | Include in MVP |
| Offline Mode Fallback | Yes | local cache | 0.75 - 1.25 | invalidation | Include in MVP |
| Contextual Weather at ETA | Yes | weather API + station coords table | 0.5 - 1.0 | missing coordinates | Stretch |
| **AI destination news search + summaries** | Yes (prototype) | News/search API + LLM + cache | 1.0 - 1.5 | latency/cost, content quality | Stretch |
| Location-aware POIs | Yes, simplified | GPS + POI dataset | 0.75 - 1.25 | battery | Stretch |
| BLE Carriage Capacity Mapping | No | BLE scanning | 2.0+ | iOS limits/privacy | Defer |

### 6.2 MVP vs Stretch Scope
**MVP (must ship):**
- Onboard Unlock (per journey: ticket scan + mocked login)
- Locked read-only teaser
- Core Journey Dashboard
- Arrival Alarm
- Journey Alerts (delay-focused, foreground-reliable)
- Motion Comfort Mode (global, settings toggle)
- Shake to Report
- Offline Mode Fallback (basic cache)

**Stretch (if schedule allows):**
- Contextual Weather at ETA
- **AI destination news search + summaries**
- Location-aware POIs
- Smart Connections (single-city pilot)
- Dynamic Route Map enhancements

**Defer / reframe:**
- BLE carriage capacity mapping (replace with manual crowd input and confidence indicator)

### 6.3 API Gap Mitigations
- Optional/missing fields: strict parsing + safe defaults.
- No station coordinates: local station metadata table (only if weather/map require it).
- API instability: mock provider + cached last-good snapshot for demos.
- AI/news instability: strict timeouts + cached summaries + mocked providers for demo.

### 6.4 Suggested Ownership Split (3 Developers)
- **Developer A (Core Data + API):** API wrapper, parsing, view models, caching, unlock validation logic.
- **Developer B (Mobile UX + Sensors):** dashboard UI, motion comfort policy integration, shake-to-report UX, haptics.
- **Developer C (Notifications + Enrichment):** arrival alarm, delay alerts, offline UX states, AI/news prototype if time.

### 6.5 Definition of Done (Per Feature)
- Type-safe integration with internal models (`api/types.ts` or equivalent)
- Offline/error state handled and visible in UI
- At least one unit test for each core business logic path
- Demo-ready behavior under mocked network failure
- For unlock: journey-bound, deterministic, and clearly communicated to the user