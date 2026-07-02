# Free News APIs Comparison for Trenord Infotainment

This report evaluates the top free News APIs based on the specific requirements of the **Trenord Infotainment** mobile application.

## Key Requirements Evaluated:

1. **Localization:** Must support querying by language (English and Italian).
2. **Content:** Must provide strong coverage of local Italian news (Lombardy/Milan) and global headlines.
3. **Usage Restrictions:** Must allow API calls directly from a mobile application (some APIs block non-localhost requests on free tiers).
4. **Rate Limits:** Since we are querying directly from the client without a proxy yet, higher daily limits are heavily preferred to avoid service interruption during testing and demos.

---

## 1. Currents API

**Best for:** High Traffic Demos (Winner for Rate Limits)

- **Free Tier Limit:** 1,000 requests per day.
- **Language Support:** English, Italian, and 15+ others.
- **Pros:**
  - Most generous free tier available, which is crucial since we are making client-side requests directly from the Expo app.
  - No restrictions on production or mobile environments.
- **Cons:**
  - Regional filtering for specific local Italian news (e.g., Lombardy-specific) is slightly weaker than NewsData.io.

## 2. NewsData.io

**Best for:** Local/Regional Content Quality

- **Free Tier Limit:** 200 requests per day.
- **Language Support:** Full support for Italian and English.
- **Pros:**
  - Exceptional coverage of local and regional news sources, which is great for a Lombardy-based railway app.
  - Includes advanced features like image URLs and full descriptions in the free tier.
- **Cons:**
  - The 200/day limit is still quite restrictive for client-side mobile calling.
  - 12 hour article delay

---

## Disqualified APIs

## 3. GNews API (Disqualified)

- **Free Tier Limit:** 100 requests per day.
- **The Dealbreaker:** The free tier explicitly restricts usage to `localhost` domains. Since we are running the app on physical devices and Expo Go, this will result in immediate API errors for mobile clients.

## 4. NewsAPI.org (Disqualified)

- **Free Tier Limit:** 100 requests per day.
- **The Dealbreaker:** The free tier explicitly blocks CORS and mobile requests; it only works on `localhost`. Since we need to run this on Expo Go or physical devices for the onboard infotainment system, it will immediately fail.

## 5. MediaStack (Disqualified)

- **Free Tier Limit:** 500 requests per **month** (~16/day).
- **The Dealbreaker:** The monthly limit is far too low for any practical use or testing.

---

## Recommendation & Conclusion

For the **Trenord Infotainment App**, the choice depends heavily on how soon you plan to implement the Backend Web Proxy:

1. **If using a Backend Proxy soon:** Go with **NewsData.io**. It provides the best local Italian content, and the 200/day limit is perfectly fine if the backend is caching the results for all train passengers.
2. **If keeping Direct Client-Side Calls (Current Plan):** Go with **Currents API**. The 1,000 requests per day limit is the only way to ensure the news feed doesn't crash during a demo with multiple devices.
