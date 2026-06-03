# Trenord Infotainment - AI Agent Guidelines (`agent.md`)

## 1. Project Context

- **Name:** Trenord Infotainment
- **Stack:** React Native, Expo, Expo Router
- **Testing:** Jest + React Native Testing Library
- **Package Manager:** pnpm

## 2. Product Goals & Constraints

- Build a reliable, polished onboard app with a **Premium Look & Feel ✨** and responsive design.
- The app must use device sensors:
  - **GPS:** Real-time map tracking.
  - **Shake Detection:** "Shake to report" issue page.
- The app must support offline resilience and remain demoable even if APIs fail (using caching and mocking).
- Support English and Italian (localization).
- Ensure high test coverage for all non-UI logic. Each core feature must have at least one business-logic unit test.

## 3. SOLID Principles

All code written for this project must strictly respect **SOLID principles**:

- **S - Single Responsibility Principle (SRP):**
  - Each module, hook, or component should have one, and only one, reason to change.
  - _Example:_ Separate data fetching (e.g., calling the Trenord API) from UI rendering. Use custom hooks (`useTrainData`) for state management and keep components focused on the View.
- **O - Open/Closed Principle (OCP):**
  - Software entities should be open for extension but closed for modification.
  - _Example:_ Create extensible UI components (like a generic `Card` or `Button`) that accept props for styling and behavior rather than hardcoding specific use cases inside them.
- **L - Liskov Substitution Principle (LSP):**
  - Subtypes must be substitutable for their base types.
  - _Example:_ When defining Typescript interfaces for external services (like Weather or Train APIs), ensure that any mock implementations or cached variants adhere strictly to the exact same contract.

- **I - Interface Segregation Principle (ISP):**
  - Do not force components to depend on interfaces they do not use.
  - _Example:_ Instead of passing the entire bloated `Train` object to a small `TrainDelay` component, pass only the `delay` and `status` props.

- **D - Dependency Inversion Principle (DIP):**
  - High-level modules should not depend on low-level modules. Both should depend on abstractions.
  - _Example:_ Use dependency injection or React Context for accessing services (like the API client or storage). This makes it trivial to swap the real API with a Mock API for the offline-ready demo.

## 4. Effectively Using AI Agents

_(From Design Document Section 4)_

- **Role:** AI agents should be used for narrow, testable tasks with explicit interfaces (e.g., parsers, hooks, view-model helpers). Humans are responsible for product decisions.
- **Testing:** Generated code must include tests for core logic paths.
- **Constraints:**
  - Provide strict input/output expectations.
  - Do not use agents for vague, cross-cutting product decisions.
  - Review all generated code for API assumptions and error handling.

## 5. Domain Knowledge & APIs

- **Trenord API:** `GET https://cloud.mp.trenord.it/train/{train_id}`
  - Expects a highly nested JSON. Create strict TypeScript interfaces and map the raw payload to a clean internal model.
- **Integrations:**
  - Weather APIs for destination weather.
  - AI Services for news summarization.
  - Google Maps for live location tracking and railways.
  - Media partners for podcasts and films.
- **Core Pages:**
  - **Locked Page:** Login (ticket code + destination).
  - **Home Page:** Dashboard, train status, weather, AI news.
  - **Journey Page:** Map with railways, detailed stop timeline.
  - **Destination Page:** POIs, connections, environmental data.
  - **Media Page:** Partner entertainment.
  - **Shake to Report:** Triggered by shake gesture.
  - **Settings:** Themes, notifications, language, anti-sickness toggle.

  ## 6. Reuse, Modularity & Component Independence
  - **Prefer Reuse:** Reuse existing code and components whenever possible. Before creating a new component, search the repository for an existing one that can be extended or composed (for example, in `components/`, `report-issue-components/`, or `media-components/`). This reduces duplication, speeds implementation, and keeps the UI consistent.
  - **Compose, Don't Duplicate:** Favor composition over copying: wrap or compose smaller shared primitives (buttons, cards, typography, layout containers) to create feature-specific UI rather than creating new ad-hoc implementations.
  - **Modular & Independent:** New components should be small, focused, and independent:
    - Accept well-typed props and avoid implicit dependencies on global state.
    - Encapsulate styling and behavior so the component can be reused in different contexts.
    - Provide clear, minimal public APIs and avoid leaking internal implementation details.
  - **Testability:** Design components so they can be unit-tested in isolation (pure rendering logic, injected dependencies, or mocked contexts).
  - **Discoverability & Documentation:** Add new shared components to the appropriate index/export file and document intended usage and props in a short README or JSDoc comment so other engineers and agents can discover and reuse them.
  - **When to Create New Components:** Create new shared components only when there's a clear, repeatable use case; prefer feature-local components for one-off UI that is unlikely to be reused.
