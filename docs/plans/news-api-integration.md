# News API Integration Plan

This document outlines the detailed design and implementation plan for integrating live news into the Trenord Infotainment app using the **Currents API**, strictly adhering to SOLID principles and project guidelines.

## 1. Selected API

We are using the **Currents API** using a dual-endpoint strategy to satisfy both contextual and general news needs:

- **General News:** `https://api.currentsapi.services/v2/latest-news` (Used for "World News" or broad categories).
- **Contextual News:** `https://api.currentsapi.services/v2/search` (Used for keyword-specific searches, like the user's destination station).
- **Taxonomy Rule:** We MUST use **V2 Canonical Categories** (e.g., `science_technology`, not `technology`) since we are using V2 endpoints. Passing keywords to `latest-news` will result in a `400 Bad Request`.
- **Environment:** Key is already placed in `.env` and `example.env` as `EXPO_PUBLIC_NEWS_API_KEY`.
- **Full Docs:** Available locally in `docs/api/currentsAPI_NEWS/latest_news.md` and `search.md`.

## 2. Feature Toggling & Control

To ensure stability during development and deployment, the News API feature must be fully toggleable:

- **Environment Variable:** We will introduce `EXPO_PUBLIC_ENABLE_NEWS_API` (boolean). If false, the app will fall back to mocked news data or hide the component entirely.
- **User Settings Toggle:** We will add a toggle in the Settings screen allowing the user to manually enable/disable the news feed. The environment variable takes precedence, meaning that even if the user toggle is enabled but the env variable is false, fetches will not be made.

## 3. API Contract & Interfaces

We will define strict TypeScript interfaces reflecting the API response to uphold the **Liskov Substitution Principle (LSP)** and ensure type safety.

```typescript
// types/news.ts
export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  author: string | null;
  image: string | null;
  language: string;
  category: string[];
  published: string;
}

export interface NewsAPIResponse {
  status: string;
  news: NewsArticle[];
  page: number;
  next_cursor?: string; // Only present in V2 /search responses
}
```

## 4. Observability & Logging

Integration with the existing custom logging system (`@/lib/logger`) is mandatory for all layers of this feature:

- **Logger Initialization:** Extend the base logger using `const newsLogger = logger.extend("NewsAPI");` in the API service, hooks, and store.
- **API Logging:** Log the start of requests (`newsLogger.log("Fetching news...", { lang, endpoint })`), successful parses (`newsLogger.log("Fetched X articles")`), and full errors (`newsLogger.error("Failed to fetch news", err)`).
- **Error Specifics:** Explicitly log `429 Too Many Requests` (rate limits hit) and `400 Bad Request` (parameter mismatch).
- **State Logging:** Log state transitions in the Zustand store (e.g., when falling back to cached data vs. making a fresh network request).

## 5. State Management & Architecture

To uphold the **Single Responsibility Principle (SRP)** and **Dependency Inversion Principle (DIP)**:

1. **Data Fetching Layer (`api/news.ts`):** Create a standalone fetcher containing two methods: `fetchLatestNews(params)` and `fetchSearchNews(params)`. Includes try/catch blocks with robust error logging and timeout handling.
2. **State Management (`store/newsStore.ts`):** Create a Zustand store to cache results, preventing unnecessary re-fetches when navigating back to the Home page. It will store localized news separately (e.g., caching `it` and `en` payloads independently) and timestamp them to enforce a staleness TTL (e.g., 30 minutes).
3. **Custom Hook (`hooks/useNews.ts`):** Encapsulates the store logic, the feature toggle state, and automatically uses `react-i18next`'s current language to fetch/retrieve the correct cached news. Returns structured data `{ data, isLoading, error }`.

## 6. UI Updates & Experimentation

We will upgrade the existing `NewsCard` component (`components/newsCard.tsx`), but the final presentation is open to **experimentation**.

- **Data Displayed:** Article Image, Title, Description, Published Date.
- **Interaction:** Tapping the card opens the `url` in the system browser using `expo-web-browser` or `Linking.openURL()`.
- **Layout Exploration:** We will experiment with different ways to present the news. The contextual "Smart Stack" (card swiping) is one strong possibility, but we will test various layouts to discover the best UX for our passengers.
- **Error Boundaries:** Wrap the news section in an Error Boundary so that if the News feature crashes, the rest of the Home page remains functional.

## 7. Testing

We will ensure high test coverage for the business logic:

- **`newsStore.test.ts`**: Test the caching mechanism, ensuring that fetching news populates the cache, adheres to TTL, and handles language switches correctly.
- **`useNews.test.ts`**: Mock the API fetcher and verify the hook integrates correctly with language changes, feature toggles, and logs appropriately.
- **`api/news.test.ts`**: Test the raw fetcher, simulating network timeouts, `429` errors, and `400` errors to ensure graceful fallback.

## Task Breakdown

- [x] **Task 1: Docs & Interfaces**
  - Download and review Currents API docs to `docs/api/currentsAPI_NEWS/`.
  - Define `EXPO_PUBLIC_ENABLE_NEWS_API` in `.env` and `example.env`.
  - Create `types/news.ts` with strict interfaces (including `next_cursor`).
- [x] **Task 2: API Service & Logging**
  - Create `api/news.ts` implementing `fetchLatestNews` and `fetchSearchNews` with mock fallbacks and `@/lib/logger` integration.
  - Write `api/news.test.ts` to verify error handling for `400` and `429` status codes.
- [x] **Task 3: Implement Zustand Store & Settings**
  - Create `store/newsStore.ts` for caching (with TTL) and state management.
  - Add a News Toggle to the Settings page (falling back to Env var).
  - Write `newsStore.test.ts`.
- [ ] **Task 4: Create Custom Hook**
  - Implement `hooks/useNews.ts` connecting language changes, toggles, and store cache.
  - Write `useNews.test.ts`.
- [ ] **Task 5: Update UI Components (Experimental)**
  - Refactor `components/newsCard.tsx` to accept the new data structure.
  - Experiment with the UI layout (e.g., swiping stack vs single static card).
  - Implement `Linking` or `expo-web-browser` for card presses.
- [ ] **Task 6: Integrate into Screens**
  - Update `app/(tabs)/home.tsx` to use the `useNews` hook and conditionally render based on the toggle.
  - Implement Error Boundary around the News UI section.
