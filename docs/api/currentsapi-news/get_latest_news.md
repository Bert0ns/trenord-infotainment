# Currents API - Latest News

The **Latest News API endpoint** returns newly indexed news articles in JSON format. It is designed for applications that need fresh headlines, source links, publication times, and available metadata without running a keyword search.

## Endpoints

- **V2 (Recommended):** `https://api.currentsapi.services/v2/latest-news`
- **V1 (Stable):** `https://api.currentsapi.services/v1/latest-news`

_Note: You must provide your API key via the `apiKey` query parameter or `Authorization` header._

## Request Parameters

### Core Filters

- **`language`**: Language of the news (e.g., `en`, `it`).
- **`country`**: 2-letter country code (e.g., `us`, `it`).
- **`category`**: One or multiple categories. V2 canonical categories include: `general`, `society`, `science_technology`, `politics_government`, `economy_business_finance`, `arts_culture_entertainment`, `lifestyle_leisure`, `human_interest`, `sport`, `crime_law_justice`, `education`, `environment`, `labour`, `health`, `automotive`, `real_estate`.
- **`type`**: `1` (news), `2` (articles), `3` (discussion).

### Structured Filters

- **`domain`**: Include only sources from a specific domain (e.g., `reuters.com`).
- **`domain_not`**: Exclude sources from a specific domain.
- **`author`**: Case-insensitive exact author match.

### Pagination

- **`page_number`**: The page index to retrieve. Range: 1 to 180 (Default: `1`).
- **`page_size`**: The number of articles per page. Range: 1 to 300 (Default: `30`).

> **Warning:** Search-only parameters like `keywords`, `start_date`, `end_date`, and `cursor` are **NOT** supported on this endpoint and will return a `400 Bad Request`. Use the Search API for these.

## Response Format

The API returns a JSON object containing the status, current page, and an array of `news` articles.

```json
{
  "status": "ok",
  "page": 1,
  "news": [
    {
      "id": "f8f18e4b-c66e-47ca-9f7d-54f03e431a77",
      "title": "Chipmaker expands data-center investment",
      "description": "The company announced a new multi-year expansion plan...",
      "url": "https://example.com/business/chipmaker-expands",
      "author": "Editorial Desk",
      "image": "https://example.com/images/chipmaker.jpg",
      "language": "en",
      "category": ["science_technology", "economy_business_finance"],
      "published": "2026-03-24 11:10:00 +0000"
    }
  ]
}
```

### Response Object Fields

- **`id`**: Unique identifier for the article.
- **`title`**: The headline of the news article.
- **`description`**: A brief summary of the article.
- **`url`**: The direct link to the original article.
- **`author`**: The author of the news article, if available.
- **`image`**: URL of the associated image, if available.
- **`language`**: Language code of the article.
- **`category`**: List of categories associated with the article.
- **`published`**: The publication date and time.

## Examples

### cURL

```bash
curl "https://api.currentsapi.services/v2/latest-news?language=en&page_size=5&apiKey=YOUR_API_KEY"
```

### JavaScript / TypeScript

```javascript
fetch(
  "https://api.currentsapi.services/v2/latest-news?language=en&page_size=5&apiKey=YOUR_API_KEY",
)
  .then((res) => res.json())
  .then((data) => console.log(data));
```

### Auxiliary Endpoints

You can fetch valid filter codes from the following endpoints:

- `/v2/available/categories`
- `/v2/available/regions`
- `/v2/available/languages`
