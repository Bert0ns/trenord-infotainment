# Trenord Infotainment - AI Agent Guidelines (`AGENTS.md`)

## 1. Project Context & Tooling

- **Name:** Trenord Infotainment
- **Stack:** React Native (0.83), Expo (SDK 55), Expo Router
- **State Management:** Zustand (preferred over Redux/Context for global state)
- **Testing:** Jest + `@testing-library/react-native`
- **Package Manager:** `pnpm` (Do not use `npm` or `yarn`)
- **Formatting/Linting:** Use `pnpm format` and `pnpm lint` to maintain code style via Prettier and ESLint.

## 2. Product Goals & Constraints

- Build a reliable, polished onboard app with a **Premium Look & Feel ✨**
- Responsive design, the app must be usable and accessible on all devices and screen sizes.
- Support English and Italian (localization) using `react-i18next`.
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

## 4. Coding Standards & Best Practices

- **Strict TypeScript:** Do not use `any`; define proper interfaces or types for all component props, API responses, and Zustand store states.
- **Localization:** Never hardcode user-facing strings in components. Always use the `useTranslation` hook from `react-i18next` and add keys to the appropriate language files.
- **Styling:** Use React Native `StyleSheet` for styling. Ensure all components respect safe areas using `react-native-safe-area-context`.
- **Security:** Never expose `EXPO_PUBLIC_TRENORD_PRIVATE_JWK` or other sensitive keys in public client code without proper security practices.

## 5. Project Structure

- **Navigation:** Use `expo-router` for all navigation. Create new screens as files within the `app/` directory following file-based routing conventions.
- **Components:** Place reusable, generic UI components in the `components/` directory.
- **State:** Zustand stores belong in the `store/` directory.
- **Hooks & Utils:** Custom hooks go in `hooks/` and helper functions go in `utils/`.
- **Testing:** Place tests either in the `__tests__` directory or alongside the files using `.test.ts` / `.test.tsx`.

## 6. Effectively Using Your AI Agent abilities

Do not start mindlessly writing code! Develop a full-fledged plan first.
Put it in `docs/plans`, you can either choose to write a `.md` file or an `.html` file.

- **Precision & Exhaustiveness:** The plan should always describe all features and changes with precision.
- **Task Tracking:** If you have to do a lot of work, split it into smaller tasks (Divide et impera principle). Use Markdown checkboxes (`[ ]` and `[x]`) in your plan file to track progress. Update the file as you complete each step.
- **Tests in Plan:** Always include a sketch of the required unit tests as part of your implementation plan. They should be written, but can be done at the end of the coding phase.
- **Confirmation:** After writing a first version of the plan, always ask for confirmation from the human. If there are ambiguities, do not invent a solution by yourself, but ask the human.
- **Simplicity:** Always prefer elegant simple solutions that achieve 95% of the goal, rather than complex and hard to understand solutions that might achieve 100% of the goal.
- **Verification:** After completing a coding task, always verify your work by running `pnpm lint`, `pnpm format`, `pnpm typecheck`, and/or the relevant tests to ensure you haven't broken existing features.
- **Subagents for Research:** If a task requires extensive reading of the codebase or searching the web, delegate the research phase to a background subagent to keep your main context clean and focused.
- **Feedback:** If the human is making a mistake, tell him what he is doing wrong and why, and propose a better solution.
- **Always put you plans in the docs/plans/ project directory**

## 7. Domain Knowledge & APIs

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

## 8. Reuse, Modularity & Component Independence

- **Prefer Reuse:** Reuse existing code and components whenever possible. Before creating a new component, search the repository for an existing one that can be extended or composed (for example, in `components/`, `report-issue-components/`, or `media-components/`). This reduces duplication, speeds implementation, and keeps the UI consistent.
- **Compose, Don't Duplicate:** Favor composition over copying: wrap or compose smaller shared primitives (buttons, cards, typography, layout containers) to create feature-specific UI rather than creating new ad-hoc implementations.
- **Modular & Independent:** New components should be small, focused, and independent:
  - Accept well-typed props and avoid implicit dependencies on global state.
  - Encapsulate styling and behavior so the component can be reused in different contexts.
  - Provide clear, minimal public APIs and avoid leaking internal implementation details.
- **Testability:** Design components so they can be unit-tested in isolation (pure rendering logic, injected dependencies, or mocked contexts).
- **Discoverability & Documentation:** Add new shared components to the appropriate index/export file and document intended usage and props in a short README or JSDoc comment so other engineers and agents can discover and reuse them.
- **When to Create New Components:** Create new shared components only when there's a clear, repeatable use case; prefer feature-local components for one-off UI that is unlikely to be reused.

## Fallow

- Use `pnpm fallow audit --format json --quiet` before committing AI-generated changes.
- Use `pnpm fallow dead-code --format json --quiet`, `pnpm fallow dupes --format json --quiet`, and `pnpm fallow health --format json --quiet` for targeted checks.
- Use `pnpm fallow list --entry-points --format json --quiet` and `pnpm fallow list --boundaries --format json --quiet` to inspect project shape.

<!-- generated:task-matrix:start -->

| When the agent is about to...     | Run                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------ |
| delete an "unused" export or file | `pnpm fallow dead-code --trace <file>:<export>`                                      |
| delete an "unused" dependency     | `pnpm fallow dead-code --trace-dependency <name>`                                    |
| commit or open a PR               | `pnpm fallow audit --base <ref>`                                                     |
| prioritize refactoring            | `pnpm fallow health --hotspots --targets`                                            |
| ask who owns code                 | `pnpm fallow health --ownership`                                                     |
| check untested-but-reachable code | `pnpm fallow health --coverage-gaps`                                                 |
| consolidate duplication           | `pnpm fallow dupes --trace dup:<fingerprint>`                                        |
| find feature flags                | `pnpm fallow flags`                                                                  |
| surface security candidates       | `pnpm fallow security`                                                               |
| understand a finding              | `pnpm fallow explain <issue-type>`                                                   |
| scope a monorepo                  | `--workspace <glob> / --changed-workspaces <ref>` (global flags, prefix any command) |

<!-- generated:task-matrix:end -->
