# Trenord Infotainment - Design Document (Exam Focused)

## 1. Overview

### 1.1 Project context

- Team: 3 CS Master's students
- Timeline: 2 months
- Platform: iOS and Android (Expo + React Native)

### 1.2 Goal

Build a reliable, polished onboard app that improves commuting with:

- real-time journey information (delay, progress, crowding, stops)
- advanced integrations (weather, AI news, media)
- sensor-based interaction (anti-sickness mode, shake to report)
- location tracking (GPS map with railways)
- resilient offline behavior for weak train connectivity

### 1.3 Non-negotiable constraints

- MVP must be demoable in 2 months
- Responsive design and Premium Look & Feel ✨
- Sensors must be used: accelerometer (anti-sickness), GPS (map tracking), shake detection (reporting)
- Non-UI logic must be unit tested
- Support both Italian and English (localization)
- Demo must remain stable if APIs are unavailable (mocking + cache)

### 1.4 Confirmed data source and integrations

- Trenord Train API: `GET https://cloud.mp.trenord.it/train/{train_id}`
- Weather APIs (destination weather, air quality, UV)
- AI Services (destination news summarization)
- Google Maps (real-time position tracking)
- Media partners (podcasts, films)

---

## 2. Product Scope (Pages & Features)

### 2.1 Locked Page
The default screen upon opening the app without an active journey.
- **Features:** 
  - Access to Settings.
  - Login by manual insertion of the ticket code and selecting the destination station.
  - Once logged in, grants access to the full application starting from the Home Page.

### 2.2 Home Page (Dashboard)
The main overview of the current journey.
- **Features:**
  - Train status (delays, crowding levels, etc.).
  - ETA and journey progress percentage.
  - Destination weather explicitly at the time of arrival.
  - AI-summarized news related to the destination.

### 2.3 Journey Page
Detailed tracking of the trip.
- **Features:**
  - Detailed timeline of all train stops.
  - Embedded Google Maps showing the user's real-time position with the railway path highlighted.

### 2.4 Journey Destination Page
Information tailored to the arrival city/station.
- **Features:**
  - Relevant AI-summarized destination news.
  - Points of Interest (POIs) with a button for direct navigation/directions.
  - Public transport connections and local services.
  - Environmental overview: weather state, air quality, UV index.

### 2.5 Media Page
Entertainment options exclusively unlocked during the journey.
- **Features:**
  - Sponsored or partner media access.
  - Movies, podcasts, music to enjoy during the ride.

### 2.6 Shake to Report Page
A global interrupter / modal triggered by shaking the mobile device.
- **Features:**
  - Lets users rapidly report an issue: Train is too crowded, air conditioning broken, dirty seats, app bugs, etc.

### 2.7 Settings Page
General app configurations accessible even from the Locked Page.
- **Features:**
  - Alternative button to trigger "Shake to report".
  - Button to select Dark, White or System color theme
  - Notification management (journey progress changes, train delays/cancellations, arrival alarms, weather shifts).
  - Language management (Italian and English).
  - Toggle Accelerometer-based anti-sickness mode (IOS style, applying visual mitigations for long train rides).

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

### 6.1 Definition of done (per feature)

- type-safe integration with internal models
- visible offline/error/loading handling
- at least one unit test for core business logic path
- demo-ready fallback under network/API instability
- responsive design across devices
