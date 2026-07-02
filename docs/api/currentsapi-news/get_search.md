# Currents API - Search

The **Search Endpoint** allows you to query through tens of millions of articles from over 14,000 news sources and blogs. This endpoint is designed for deep discovery, content analysis, and precise retrieval of historical or real-time news based on keywords or structured filters.

## Endpoints

- **V2 (Recommended):** `https://api.currentsapi.services/v2/search` (Supports keyset pagination `cursor`)
- **V1 (Stable):** `https://api.currentsapi.services/v1/search` (No cursor pagination)

_Note: You must provide your API key via the `apiKey` query parameter or `Authorization` header._

## Request Parameters

### Querying

- **`keywords`**: Standard term search (e.g., `technology`). Non-ASCII characters must be URL-encoded.
- **`query`**: Boolean syntax with `AND`, `OR`, `NOT`, quotes, and parentheses.
- _(Note: If both are provided, `keywords` takes priority over `query`)_.

### Filtering

- **`language`**: Filter by language code (default: `en`).
- **`country`**: Filter by 2-letter country code.
- **`category`**: Filter by one or more categories. **Important:** V2 endpoints require canonical V2 categories (e.g., `science_technology`). V1 endpoints require legacy categories (e.g., `technology`).
- **`type`**: `1` (news), `2` (articles), `3` (discussion).

### Time Window

- **`start_date`**: Search after this date (RFC 3339 / ISO-8601 parseable value).
- **`end_date`**: Search before this date (RFC 3339 / ISO-8601 parseable value).

### Domain Control

- **`domain`**: Restrict search to one domain (e.g., `reuters.com`).
- **`domain_not`**: Exclude specific domains from results.
- **`author`**: Case-insensitive exact author filter.

### Pagination

- **`page_number`**: The page index (starts at 1, max 180).
- **`page_size`**: Results per page (1 to 300, default 30).
- **`cursor`** (V2 Only): Keyset token for deep pagination without offsets.
- _(Note: Offset guardrail rejects requests where `(page_number - 1) * page_size > 5000`)_.

## Response Format (V2)

The API returns a JSON object containing the status, current page, next cursor, and an array of `news` articles.

```json
{
  "status": "ok",
  "page": 1,
  "next_cursor": "eyJwIjoiMjAyNi0wMy0yNFQxMjowNTowMCswMDowMCIsImlkIjoiNjFmNTBiYmQtMjBhZC00N2EzLTlkNzctOWY4ZTBhMDhmMGFkIn0",
  "news": [
    {
      "id": "61f50bbd-20ad-47a3-9d77-9f8e0a08f0ad",
      "title": "AI chip demand lifts quarterly guidance",
      "description": "Vendors reported stronger-than-expected demand...",
      "url": "https://example.com/markets/ai-chip-demand",
      "author": "Market Desk",
      "image": "https://example.com/images/ai-chip.jpg",
      "language": "en",
      "category": ["economy_business_finance", "science_technology"],
      "published": "2026-03-24 12:05:00 +0000"
    }
  ]
}
```

## Examples

### cURL (Basic Keyword Search)

```bash
curl "https://api.currentsapi.services/v2/search?keywords=technology&language=en&page_size=5&apiKey=YOUR_API_KEY"
```

### cURL (Boolean Query)

```bash
curl "https://api.currentsapi.services/v2/search?query=(%22AI%22%20OR%20%22Machine%20Learning%22)%20AND%20NOT%20%22Ethics%22&language=en&apiKey=YOUR_API_KEY"
```

### cURL (Cursor Pagination)

```bash
curl "https://api.currentsapi.services/v2/search?keywords=technology&language=en&page_size=5&cursor=NEXT_CURSOR_FROM_PREVIOUS_RESPONSE&apiKey=YOUR_API_KEY"
```

### TypeScript / JavaScript

```javascript
fetch(
  "https://api.currentsapi.services/v2/search?keywords=technology&language=en&page_size=5&apiKey=YOUR_API_KEY",
)
  .then((res) => res.json())
  .then((data) => console.log(data));
```
