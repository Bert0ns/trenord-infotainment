# Trenord Infotainment: Design Document

## 1. Project Overview & Scope
**Project Name:** Trenord Infotainment App

**Team Size:** 3 Computer Science Master's Students

**Timeline:** 2 Months (Exam term project)

**Platform:** iOS and Android (via Expo + React Native)

### 1.1 Value Proposition
A smart, context-aware infotainment application designed to enhance the commuting experience on Trenord trains. It combining real-time journey data with personalized content, sensor-driven interactions, and AI-powered insights to provide a frictionless, more enjoyable ride.

---

## 2. Feature Specification (Brainstorming & Polished Ideas)

### 2.1 Core Journey Dashboard (The "Home Page")
The primary interface for the commuter, offering glanceable, relevant information dynamically based on the current trip context.
*   **Journey Tracking:** Real-time train status, delays, crowding levels, percent progress, and ETA.
*   **Contextual Weather:** Weather forecast for the destination *at the exact time of arrival*.
*   **Dynamic Route Map:** Live map showing the current location along the route.
*   **Smart Feed:** Curated news related to the destination or journey, summarized using AI for quick reading.
*   *(New Idea)* **Smart Connections:** Upon approaching the destination, automatically suggest optimal transit connections (metro, buses, bike-sharing availability) based on live schedules.

### 2.2 Interactive & Sensor-Driven Features (The "Wow" Factor)
Features designed to leverage modern smartphone sensors and UX patterns to demonstrate technical proficiency.
*   **Accelerometer-based Anti-sickness Mode:** Detects train sway/movement using the accelerometer/gyroscope. The UI adapts by displaying a stabilizing visual horizon or switching to audio-first content to mitigate motion sickness during long reads.
*   **"Shake to Report" System:** Uses shake detection to quickly open an issue reporting modal (e.g., "Air conditioning broken", "Car too crowded", "Dirty seats").
*   **Location-Aware POIs:** As the train moves, push background points of interest or historical trivia about the areas being passed.
*   *(New Idea)* **Crowd-sourced Carriage Capacity:** App utilizes Bluetooth Low Energy (BLE) scanning (or simple crowdsourced manual inputs) to map which specific carriages are the most empty, and shares this with users waiting at the next stations.

### 2.3 Media & Notifications
*   **Journey Alerts:** Push notifications for critical changes (delays, platform changes, sudden weather shifts at destination).
*   **Arrival Alarms:** Wake-up/prepare notifications when exactly 5 minutes away from the destination.
*   **Partner Media Hub:** Integration with sponsored media (podcasts, music, audiobooks) specifically tailored to the journey's duration.
*   *(New Idea)* **Offline Mode Fallback:** Since train routes often suffer from cellular dead zones, the app proactively caches the AI news summaries, current media, and ETA projections for offline viewing.

---

## 3. Technical Architecture & Constraints

### 3.1 Tech Stack
*   **Framework:** React Native with Expo (cross-platform support out-of-the-box).
*   **Navigation:** Expo Router for deep-linkable, file-based routing.
*   **External APIs:** 
    *   Trenord/Open Data APIs (Train schedules/status).
    *   OpenWeather / Similar API (Weather).
    *   OpenAI API / Local LLM (News summarization).

### 3.2 Evaluation Criteria (Exam Requirements)
*   **Responsive & Polished UI:** High focus on _Look & Feel_. Needs to handle diverse screen sizes gracefully.
*   **Sensor Integration:** Accelerometer, Gyroscope, GPS, and Haptics are mandatory to fulfill technical complexity.
*   **Testing:** High code coverage required for non-UI code (business logic, helpers, hooks). Use `Jest` + `React Native Testing Library`.
*   **Deliverables:** This Design Document, a Real-Time Demo (on actual devices if possible), and a Technical Presentation.

---

## 4. Development Timeline (2 Months | 3 Developers)

*   **Weeks 1-2: Architecture & PoC.** Setup Expo, CI/CD, routing. Create mocked API wrappers (crucial since external APIs like Trenord might be unreliable).
*   **Weeks 3-4: Core UI & Data Binding.** Build the layout, Dashboard, connection to live data mappings.
*   **Weeks 5-6: Sensors & AI.** Implement Anti-sickness mode, Shake-to-report, location tracking, and AI news summaries.
*   **Week 7: Polish & Testing.** Write Jest tests. Refine animations (Reanimated), fix layout bugs, error handling for offline states.
*   **Week 8: Pitch Prep.** Finalize the presentation, practice the live demo.

---

## 5. Guide: Effectively Using AI Agents in Your Project

As a team of 3 Master's students under a tight deadline, AI coding agents can drastically speed up velocity. Here is how to use them effectively:

### 5.1 Best Practices for AI Interaction
1.  **Isolate Tasks:** Don't ask an agent to "build the dashboard". Ask it to "Create a `WeatherWidget.tsx` component that takes an ETA and a coordinates prop, fetches data from the `useWeather` hook, and displays an animated icon."
2.  **Define Contracts First:** Write your TypeScript interfaces/types (`api/types.ts`) first. Then, tell the AI: "Implement this function to match this exact interface."
3.  **Use for Scaffolding & Boilerplate:** Let AI write your UI boilerplate (Tailwind classes/StyleSheets), navigation structure, and standard forms.
4.  **Test Generation:** AI is excellent at writing repetitive Jest tests. Provide the business logic file and say: "Generate a Jest test suite for this file aiming for 100% path coverage, mocking the API calls."

### 5.2 What Files to Provide (Context Strategy)
When prompting an AI agent, you must provide the right context. Overloading it makes it confused; underloading it leads to hallucinations.

*   **For New UI Components:**
    *   `constants/theme.ts` (so it uses your app's exact color palette).
    *   `components/ThemedText.tsx` and `components/ThemedView.tsx` (so it uses your base UI elements instead of raw generic React Native ones).
*   **For Business Logic / Hooks:**
    *   `api/types.ts` (to ensure strict typing).
    *   The specific utility or mock data file you want it to process.
*   **For Debugging Expo/Native issues:**
    *   `package.json` (so it knows exactly which versions of Reanimated/Gesture Handler/Expo you are using).
    *   The exact error trace.
*   **For Team Alignment:**
    *   Keep maintaining an updating an `.instructions.md` or a `prompt.md` in the root of your project that contains your preferred code style (e.g., "Always use functional components, prefer arrow functions, use Expo Router for navigation, rely on Reanimated for animations"). Modern IDE AI tools will read this globally.