# News API Integration - Refactoring & Polish Report

This report outlines strategies to refactor, polish, and improve the maintainability of the newly added News API integration, adhering strictly to the SOLID principles and component independence guidelines defined in `AGENTS.md`.

## 1. Adopt TanStack Query for State and Cache Management (SRP & OCP)

**Current State:**
We built a custom manual caching layer in `store/newsStore.ts` using Zustand and `AsyncStorage`, along with complex logic in `hooks/useNews.ts` to manage cache misses, expiry (TTL), race conditions, and reactivity (e.g., `cacheVersion`).
**The Problem:**
This violates the **Single Responsibility Principle (SRP)** by mixing data-fetching orchestration with UI hook logic. Manual caching is error-prone, hard to scale, and introduces bugs like the double-fetch and cache-clear staleness we just patched.
**Refactoring Plan:**

- Replace the `useNewsStore` completely with **TanStack React Query**.
- React Query handles caching, stale-while-revalidate, TTL, background deduplication, and garbage collection natively.
- This will reduce `useNews.ts` from 150 lines to ~20 lines, making it incredibly easy to maintain and test.

## 2. Refactor `hooks/useNews.ts` (SRP)

**Current State:**
Even if we delay adopting React Query, the current hook is doing too much. It handles:

1. Checking settings / toggles.
2. Deduplicating news.
3. Managing fallback search logic (Municipality -> Station -> General).
4. Interacting with the store.

**Refactoring Plan:**

- **Extract Deduplication:** Move the `deduplicateNews` function into `utils/news.ts`. This makes it independently unit-testable (SRP).
- **Extract Fetch Strategy:** Move the "Search vs Fallback" orchestrator into a pure asynchronous function in `lib/api/currentsapi-news-service.ts`. The UI hook should only ask for `getRelevantNews(location)` and receive the final array.

## 3. Extract News Section from `home.tsx` (Component Independence)

**Current State:**
The Fallow health check flagged `app/(tabs)/home.tsx` as a major hotspot (Cognitive Complexity of 42, >200 lines). The file is bloated because it directly manages the state and rendering for Weather, Live Status, and now News.
**Refactoring Plan:**

- Create a new component: `components/home-components/NewsSection.tsx`.
- Move the `useNews()` hook call, the loading skeletons, the empty states, and the `FlatList` for rendering `NewsCard`s into this component.
- `home.tsx` should only compose high-level sections, adhering to the **Dependency Inversion** and **SRP** principles.

## 4. Decompose `newsCard.tsx` (SRP & Component Independence)

**Current State:**
`NewsCard` handles UI rendering, conditional blur overlays, click routing (`Linking` vs `WebBrowser`), and on-the-fly Video Thumbnail generation (`expo-video-thumbnails`).
**Refactoring Plan:**

- **Extract Thumbnail Hook:** Move the `expo-video-thumbnails` side-effect into a custom hook `hooks/useVideoThumbnail.ts`. This cleans up the component and allows thumbnail logic to be reused elsewhere.
- **Extract Press Handler:** Abstract the URL handling (Video vs Article, deep-link vs WebBrowser) into a generic utility `utils/linkHandler.ts`.
- **UI Composition:** The card is visually stunning but the JSX is deeply nested. We can extract the `FallbackImage` and `BlurOverlay` into internal micro-components to improve readability.

## 5. Summary of Benefits

Implementing these refactoring steps will achieve the following:

1. **Fewer Bugs:** Offloading cache management to a standard library like React Query removes a whole class of state synchronization bugs.
2. **Better Testability:** Pure functions (`deduplicateNews`, `getRelevantNews`) and custom hooks (`useVideoThumbnail`) can be easily tested in isolation without mocking large Zustands stores.
3. **Cleaner UI Code:** `home.tsx` and `newsCard.tsx` will become declarative and focused entirely on rendering, significantly dropping their cognitive complexity.

---

_Ready to proceed? We can start by extracting `deduplicateNews` and decomposing the `home.tsx` screen as immediate quick wins._
