# News Digital Magazine — Implementation Plan

## Overview

A slide-up "digital magazine" page that appears when the user taps **"See More"** in the home page news section. It displays **two sections**:

1. **City News** — The same destination-specific articles from the home carousel (already cached via `useNews`).
2. **Global News** — A fresh "latest news" feed without city keywords, providing broader world/Italy coverage.

Both sections are rendered in **masonry-style two-column grids**. The page reuses the same `SheetContainer` slide-up pattern already used by `report-issue-page`.

---

## Architecture

```
User taps "See More" on Home
       │
       ▼
router.push("/news-magazine")
       │
       ▼
app/news-magazine.tsx  (transparentModal, animation: "none")
  └── SheetContainer (spring-up + swipe-to-dismiss)
        └── MagazineHeader (title + close button)
        └── ScrollView
              ├── SectionLabel ("City News")
              ├── MasonryGrid (city articles from useNews)
              │     └── MagazineCard × N
              ├── SectionLabel ("Global News")
              └── MasonryGrid (global articles from useGlobalNews)
                    └── MagazineCard × N
```

---

## Tasks

### Task 1: Wire `SectionHeader` "See More" button

**Problem:** The `SectionHeader` component renders a "See More" `TouchableOpacity` for `type="home"`, but it has **no `onPress` handler** and the interface has **no `onPress` prop**.

**Changes to `components/sectionHeader.tsx`:**

- [ ] Add `onSeeMorePress?: () => void` to `SectionHeaderProps`.
- [ ] Pass it as `onPress` to the existing `TouchableOpacity` for `type="home"`.

**Changes to `app/(tabs)/home.tsx`:**

- [ ] Pass `onSeeMorePress={() => router.push("/news-magazine")}` to the news `SectionHeader`.

---

### Task 2: Register the new page in the root layout

**Changes to `app/_layout.tsx`:**

- [ ] Add a new `<Stack.Screen>` entry for `news-magazine`, following the exact same pattern as `report-issue-page`:
  ```tsx
  <Stack.Screen
    name="news-magazine"
    options={{
      presentation: "transparentModal",
      animation: "none",
      headerShown: false,
    }}
  />
  ```

---

### Task 3: Global news data layer

This task adds the data-fetching and caching infrastructure for global news, following the exact same patterns already established for city news.

#### 3a. Add `getGlobalNews` to `currentsapi-news-service.ts`

- [ ] Create a new function `getGlobalNews(language: string): Promise<NewsArticle[]>`.
- [ ] It calls `fetchLatestNews({ language, country: "IT", category: "general" })`.
- [ ] Cache key: `global-latest-${language}`.
- [ ] Check cache via `store.getValidLatestNews(cacheKey)` before fetching.
- [ ] Store result via `store.setLatestNews(cacheKey, result)` after fetching.
- [ ] This follows the exact same cache-first pattern as `getRelevantNews`.

#### 3b. Create `useGlobalNews` hook in `hooks/useGlobalNews.ts`

- [ ] New hook: `useGlobalNews() → { data: NewsArticle[], isLoading: boolean, error: Error | null }`.
- [ ] Same guards as `useNews`: checks `settings.enableNewsApi`, env flag, `trainId`.
- [ ] Calls `getGlobalNews(language)`, then `deduplicateNews()`.
- [ ] Depends on `cacheVersion` from `newsStore` so clearing cache triggers a re-fetch.
- [ ] **Does NOT depend on destination** — this is the key difference from `useNews`.

#### 3c. Deduplicate global news against city news

- [ ] In the magazine page, before rendering the global section, filter out any articles whose IDs already appear in the city news list. This prevents the same article from showing in both sections.

---

### Task 4: Create the magazine page (`app/news-magazine.tsx`)

**Structure:**

- [ ] Use `SheetContainer` with a `ref` for programmatic close (same pattern as `report-issue-page.tsx`).
- [ ] `onClose` → `router.back()`.
- [ ] Inside the sheet: render `MagazineHeader` + a `ScrollView` with two sections.
- [ ] **City News section:** Fetch via `useNews()` (data is already cached, instant).
- [ ] **Global News section:** Fetch via `useGlobalNews()` (cached or fresh fetch).
- [ ] Handle loading / empty states for each section independently.

---

### Task 5: Create magazine components

Create a new directory `components/news-magazine-components/` with:

#### 5a. `index.ts` — Barrel export

- [ ] Export all components from this directory.

#### 5b. `magazine-header.tsx` — Page header

- [ ] City-contextual title (e.g., "Milano News" or "Latest News"), same logic as the home section header.
- [ ] Close button (✕) on the right, calls `onClose`.
- [ ] Styled consistently with the report-issue `ReportHeader`.

#### 5c. `magazine-card.tsx` — Individual article card

- [ ] Vertical card layout (image on top, title + description below).
- [ ] Image takes ~60% of card height when present; newspaper icon fallback when absent.
- [ ] Displays: title (max 3 lines), description (max 2 lines), category badge, published date.
- [ ] On press → opens the article URL via `openMediaUrl` from `utils/link-handler.ts`.
- [ ] Cards have slightly randomized heights (based on content) to create the masonry feel.

#### 5d. `masonry-grid.tsx` — Two-column masonry layout

- [ ] Accepts `articles: NewsArticle[]` as a prop.
- [ ] Splits articles into two columns (odd/even index).
- [ ] Renders two `View` columns side by side with a gap.
- [ ] Each column renders `MagazineCard` components vertically.
- [ ] This approach avoids heavy third-party dependencies while achieving a natural masonry look.

#### 5e. `magazine-section-label.tsx` — Section divider

- [ ] Renders a styled section title (e.g., "🏙️ Milano News", "🌍 Global News").
- [ ] Icon + title text with bottom border/separator.

---

### Task 6: i18n — Add translation keys

**`lib/i18n/locales/en/home.json`:**

- [ ] `"magazine.citySection": "{{city}} News"`
- [ ] `"magazine.globalSection": "Global News"`
- [ ] `"magazine.empty": "No articles to display."`
- [ ] `"magazine.loading": "Loading articles..."`

**`lib/i18n/locales/it/home.json`:**

- [ ] `"magazine.citySection": "Notizie da {{city}}"`
- [ ] `"magazine.globalSection": "Notizie dal Mondo"`
- [ ] `"magazine.empty": "Nessun articolo da mostrare."`
- [ ] `"magazine.loading": "Caricamento articoli..."`

> Note: Some of these keys partially overlap with existing ones (`newsSuffix`, `latestNews`, `noNews`). We will reuse where appropriate rather than duplicate.

---

### Task 7: Tests

- [ ] **Unit test for `SectionHeader`:** Verify that `onSeeMorePress` is called when the "See More" button is pressed.
- [ ] **Unit test for `getGlobalNews`:** Verify it checks cache first, fetches on miss, and stores the result.
- [ ] **Unit test for `useGlobalNews`:** Verify it returns data and respects feature toggles.
- [ ] **Unit test for `MasonryGrid`:** Verify it splits articles into two columns correctly.
- [ ] **Smoke test for `news-magazine` page:** Verify it renders without crashing and displays article titles.

---

## Component Reuse

| Existing Component    | Reused? | Notes                                                               |
| --------------------- | ------- | ------------------------------------------------------------------- |
| `SheetContainer`      | ✅      | Slide-up animation + swipe-to-dismiss                               |
| `useNews` hook        | ✅      | City news, same cached data, no extra API call                      |
| `newsStore` (Zustand) | ✅      | `latestNewsCache` reused for global news caching                    |
| `fetchLatestNews`     | ✅      | Called by the new `getGlobalNews` function                          |
| `deduplicateNews`     | ✅      | Applied to both city and global news                                |
| `openMediaUrl`        | ✅      | From `utils/link-handler.ts`                                        |
| `SectionHeader`       | ✅      | Extended with `onSeeMorePress` prop                                 |
| `NewsCard`            | ❌      | We create `MagazineCard` with vertical layout instead of horizontal |

---

## Out of Scope

- Pagination / infinite scroll (the API already returns a fixed batch).
- Search or filtering within the magazine.
- Pull-to-refresh within the magazine sheet.

---

## Execution Order

1. Task 1 — Wire SectionHeader
2. Task 2 — Register page in layout
3. Task 3 — Global news data layer (service + hook + caching)
4. Task 4 + Task 5 — Create page + components (done together)
5. Task 6 — i18n keys (done alongside Task 4/5)
6. Task 7 — Tests
7. Final verification: `pnpm lint && pnpm format && pnpm typecheck && pnpm test`
