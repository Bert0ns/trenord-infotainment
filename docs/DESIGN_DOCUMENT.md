# Trenord Infotainment - Design Document (Exam Focused)

## 1. Overview

### 1.1 Project context

- Team: 3 CS Master's students
- Timeline: 2 months
- Platform: iOS and Android (Expo + React Native)

### 1.2 Goal

Build a reliable, polished onboard app that improves commuting with:

- real-time journey information (delay, progress, crowding, stops)
- sensor-based interaction (comfort mode, shake report)
- resilient offline behavior for weak train connectivity

### 1.3 Non-negotiable constraints

- MVP must be demoable in 2 months
- UI must look polished and clearly handle loading/offline/error/cancelled states
- Sensors must be used: accelerometer/gyroscope, GPS, haptics where useful
- Non-UI logic must be unit tested (parsing, helpers, view-model rules)
- Demo must remain stable if the Train API is slow/unavailable (mocking + cache)

### 1.4 Confirmed data source

- Trenord Train API: `GET https://cloud.mp.trenord.it/train/{train_id}`
- Other integrations:
    - weather
    - AI summarized news on the destination location

---

## 2. Product Scope

### 2.1 Access model (mandatory)

The app is locked by default and unlocks per journey.

Locked mode requirements:

- show a read-only preview dashboard (clearly labeled Preview)
- explain full features
- provide CTA: Unlock this journey

Unlock methods (MVP):

1. Ticket scan (QR) with manual code fallback
2. Mocked login + train selection

Validation rules:

- fetch `GET /train/{train_id}`

Definition of done:

- works on iOS and Android
- unlock is clearly bound to one journey and visible in UI
- locked teaser works offline
- tests cover key generation/matching, validation, invalidation, persistence

### 2.2 MVP features

Core dashboard:

- delay and cancellation status
- crowding info
- live hints: actual station/time when available
- compact stop list from `pass_list`
- derived values (unit tested): progress %, next stop, ETA

Sensors and interaction:

- Shake to Report modal with debounce + confirmation

Notifications:

- delay change alerts (local notifications)
- cancellation alerts
- arrival alarm 5 minutes before destination (best effort, rescheduled on ETA shifts)

Offline fallback:

- cache latest snapshot + derived view model
- keep app usable while disabling network-only actions

### 2.3 Stretch features

- contextual weather at ETA
- AI destination news search + summaries
- location-aware POIs (foreground only)

---

## 3. Technical Architecture

### 3.1 Stack

- React Native + Expo
- Expo Router
- Jest + React Native Testing Library

### 3.2 Quality gates

- each core feature has at least one business-logic unit test
- all user-visible states are explicitly rendered
- app remains demoable under API failure using cache/mock providers

---

## 4. Guide: Effectively Using AI Agents in Your Project

Use AI agents for narrow, testable tasks with explicit interfaces. Keep humans responsible for product decisions and final review.

Recommended usage:

- code scaffolding for isolated modules (parsers, hooks, view-model helpers)
- unit test generation for deterministic logic
- repetitive refactors with clear acceptance criteria
- documentation updates after features are completed

Guardrails:

- always provide strict input/output expectations
- require generated code to include tests for core logic paths
- avoid using agents for vague, cross-cutting product decisions
- review all generated code for API assumptions and error handling

---

## 6. Feasibility, Ownership, and Done Criteria

### 6.1 Scope decision matrix

| Feature                                      | Scope   | Risk                           | Decision |
| -------------------------------------------- | ------- | ------------------------------ | -------- |
| Per-journey unlock + locked teaser           | MVP     | medium (permissions/mock auth) | ship     |
| Core dashboard (delay/ETA/crowding/progress) | MVP     | medium (payload variability)   | ship     |
| Comfort Mode (global)                        | MVP     | low/medium (UX consistency)    | ship     |
| Shake to Report                              | MVP     | low (false triggers)           | ship     |
| Journey alerts + arrival alarm               | MVP     | medium (background limits)     | ship     |
| Offline fallback cache                       | MVP     | medium (cache invalidation)    | ship     |
| Weather at ETA                               | Stretch | medium (station coordinates)   | optional |
| AI destination news summaries                | Stretch | high (latency/cost/quality)    | optional |
| Location-aware POIs                          | Stretch | medium (battery/noise)         | optional |

### 6.2 Ownership split

- Developer A: API wrapper, parsing, view models, unlock validation, caching
- Developer B: UI implementation, comfort mode policy, shake UX, haptics
- Developer C: notifications, alarm scheduling, offline UX, stretch integrations

### 6.3 Definition of done (per feature)

- type-safe integration with internal models
- visible offline/error/loading handling
- at least one unit test for core business logic path
- demo-ready fallback under network/API instability
- for unlock: deterministic, journey-bound behavior clearly communicated in UI
