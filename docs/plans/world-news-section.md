# World News Section Refactoring Plan

## 1. Goal

Rename the current "Global News" section (which is restricted to Italy) to "Italy News" and introduce a new "World News" section that fetches international news without country restrictions.

## 2. API Service (`lib/api/currentsapi-news/currentsapi-news-service.ts`)

- [x] Rename `getGlobalNews` to `getItalyNews`.
  - Update its cache key to `italy-latest-${language}`.
  - Keep the parameter `country: "IT"`.
- [x] Create a new function `getWorldNews`.
  - Fetch from `/latest-news` with `language` and `category: "general"`, but **omit** the `country` parameter.
  - Set its cache key to `world-latest-${language}`.

## 3. Custom Hooks (`hooks/`)

- [x] Rename `useGlobalNews.ts` to `useItalyNews.ts`.
  - Update it to call `getItalyNews`.
- [x] Create a new hook `useWorldNews.ts`.
  - Implement similar cache-first and feature-flag logic as the other hooks, but it calls `getWorldNews`.

## 4. Translations (`lib/i18n/locales/*/home.json`)

- [x] Rename the `globalNewsTitle` key to `italyNewsTitle`.
  - English: "Italy News"
  - Italian: "Notizie Italia"
- [x] Add a new `worldNewsTitle` key.
  - English: "World News"
  - Italian: "Notizie dal Mondo"

## 5. UI Updates (`app/news-magazine.tsx`)

- [x] Import `useItalyNews` and `useWorldNews`.
- [x] Update the UI to render up to 3 sections instead of 2:
  - Local/City News (Icon: `location-on`)
  - Italy News (Icon: `map` or similar)
  - World News (Icon: `public`)
- [x] Update the loading state to wait for all three feeds before showing the magazine.

## 6. Testing Updates (`__tests__/`)

- [x] Update `currentsapi-news-service.test.ts` to include `getItalyNews` and `getWorldNews`.
- [x] Rename `useGlobalNews.test.ts` to `useItalyNews.test.ts` and update it.
- [x] Create `useWorldNews.test.ts`.
- [x] Update `app/news-magazine.test.tsx` to assert the rendering of all three news sections.
