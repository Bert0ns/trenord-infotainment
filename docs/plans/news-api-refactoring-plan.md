# News API Refactoring Plan

Based on our recent additions to the `news-api-integration` branch, we need to refactor the codebase to adhere to SOLID principles and reduce cognitive complexity in key hotspots, while deferring the TanStack Query migration.

## 1. Refactor `hooks/useNews.ts` (SRP)

The current hook is heavily burdened with utility logic and fetching orchestration.

- [x] **Task 1.1: Extract `deduplicateNews`**
  - Create `utils/news.ts`.
  - Move the `deduplicateNews` function from `useNews.ts` to `utils/news.ts`.
  - Add unit tests for `deduplicateNews` in `__tests__/utils/news.test.ts`.
- [x] **Task 1.2: Extract Fetch Strategy**
  - In `lib/api/currentsapi-news/currentsapi-news-service.ts`, create a new function `getRelevantNews(keyword, language)` that handles the orchestration (Search vs General fallback) and leverages the store directly for caching if appropriate, or keep caching in the hook but simplify the logic.
  - Update `useNews.ts` to use this simplified orchestration.

## 2. Extract News Section from `home.tsx` (Component Independence)

`home.tsx` has a cognitive complexity of 42. Extracting the news section will dramatically simplify the main screen layout.

- [ ] **Task 2.1: Create `NewsSection` component**
  - Create `components/home-components/NewsSection.tsx`.
  - Move the `useNews()` hook call into this component.
  - Move the skeleton loading UI and empty states into this component.
  - Move the `FlatList` rendering `NewsCard`s into this component.
- [ ] **Task 2.2: Update `home.tsx`**
  - Import and render `<NewsSection />` in `home.tsx`.
  - Clean up unused imports (like `useNews`, `NewsCard`, skeleton styles).
- [ ] **Task 2.3: Update Tests**
  - Verify `__tests__/app/(tabs)/home.test.tsx` passes.
  - Create `__tests__/components/home-components/NewsSection.test.tsx`.

## 3. Decompose `newsCard.tsx` (SRP & Clean UI)

The card component handles UI rendering, click routing, and side-effects for video thumbnails.

- [ ] **Task 3.1: Extract `useVideoThumbnail` Hook**
  - Create `hooks/useVideoThumbnail.ts`.
  - Move the `expo-video-thumbnails` side-effect logic into this hook.
  - Update `newsCard.tsx` to use this hook: `const { thumbnailUri } = useVideoThumbnail(resolvedUrl, isVideo, hasImage);`
- [ ] **Task 3.2: Extract Link Handler Utility**
  - Create `utils/linkHandler.ts`.
  - Export a function `openNewsArticle(url, isVideo)` that handles the `Linking` vs `WebBrowser` logic with safe URL validation.
- [ ] **Task 3.3: Simplify UI Composition**
  - Create small internal components within `newsCard.tsx` (e.g., `NewsCardImageOverlay`, `NewsFallbackOverlay`) to reduce the nesting depth of the main return statement.
- [ ] **Task 3.4: Update Tests**
  - Ensure `__tests__/components/newsCard.test.tsx` passes.
  - Add tests for `useVideoThumbnail.test.ts` and `linkHandler.test.ts`.

## 4. Final Polish and Verification

- [ ] Run `pnpm format` and `pnpm lint`.
- [ ] Run `pnpm typecheck` (`pnpm tsc --noEmit`).
- [ ] Run all unit tests with `pnpm test` and ensure coverage is maintained.
- [ ] Run `pnpm fallow health --hotspots --targets` to verify `home.tsx` is no longer a hotspot.
