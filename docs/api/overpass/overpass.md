# Overpass API Integration

## Overview

[Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) is a powerful, read-only API that serves up custom selected parts of the OpenStreetMap (OSM) data. Unlike traditional mapping APIs that serve pre-rendered map tiles, Overpass API acts as a web-based database query engine. You send it a query written in its own language (Overpass QL), and it returns the raw geographical data (nodes, ways, and relations) that match your criteria.

In the **Trenord Infotainment** app, we use the Overpass API to dynamically fetch the exact geographical railway tracks (polylines) between train stations. This allows us to draw accurate train paths on the live journey map rather than just drawing a straight line between the start and end stations.

## Endpoint & Infrastructure

- **Main Endpoint:** `https://overpass-api.de/api/interpreter`
- **Method:** `POST` (Preferred for complex queries to avoid URL length limits)
- **Data Format:** JSON (specified via `[out:json]` in the query)

### Important HTTP Headers

The official Overpass API public instances are hosted on Apache servers with strict `mod_negotiation` and `mod_security` rules. To ensure reliable responses:

- **`Content-Type`**: Must be `application/x-www-form-urlencoded`. The query itself must be passed as a URL-encoded string under the `data=` key in the POST body.
- **`Accept`**: React Native's default `fetch` headers (`application/json, text/plain, */*`) can trigger a `406 Not Acceptable` error. We must explicitly set `Accept: application/osm3s+xml, application/json, */*` or `*/*`.
- **`User-Agent`**: Required by the API's acceptable use policy. Requests lacking a descriptive User-Agent may be rate-limited, delayed, or outright rejected (`403 Forbidden`).

## How We Use Overpass QL

Overpass QL (Query Language) is used to find our railway geometries. Here is the breakdown of the query we generate in `lib/api/overpass.ts`:

```overpass
[out:json][timeout:30];
// 1. Find the starting station (within 150 meters of Trenord's provided coordinates)
node(around:150, START_LAT, START_LON)["operator"~"RFI|Rete Ferroviaria Italiana"]["railway"~"station|halt|stop"]->.stA;

// 2. Find the destination station
node(around:150, END_LAT, END_LON)["operator"~"RFI|Rete Ferroviaria Italiana"]["railway"~"station|halt|stop"]->.stB;

// 3. Find the OSM relation (the train route) that passes through the starting station
relation(bn.stA)["route"="train"]["operator"~"[Tt]renord"]->.relsA;

// 4. Filter those relations to only the one that ALSO passes through the destination station
relation.relsA(bn.stB)->.segmentRels;

// 5. Extract the physical ways (railway tracks) from that specific relation
way(r.segmentRels)["railway"="rail"];

// 6. Output the geometry (coordinates) of the resulting tracks
out geom;
```

### Steps Explained:

1. **`[out:json][timeout:30]`**: Tells the API to return JSON data and abort if the query takes longer than 30 seconds.
2. **`node(around:...)`**: Since Trenord's API coordinates might not exactly match OpenStreetMap's nodes, we search in a 150m radius for a railway station operated by RFI.
3. **`relation` and `way`**: In OSM, a train route is a `relation` made up of multiple `way`s (physical tracks). We intersect the relations of Station A and Station B to find the exact route connecting them, then extract the tracks.
4. **`out geom`**: Ensures the response includes the latitude and longitude points needed to draw the polyline.

## Handling the Response

The Overpass API returns an array of `elements` (the OSM ways). Each `element` contains a `geometry` array with `lat` and `lon` objects.

In `hooks/use-railway-polylines.ts`, we map over these elements and format them into an array of `{ latitude, longitude }` objects that `react-native-maps` can natively understand and draw via the `<Polyline>` component.

## Limitations and Best Practices

- **Rate Limiting:** Public Overpass API instances are heavily rate-limited. We mitigate this by:
  - Caching the fetched polylines.
  - Using strict timeouts (`[timeout:30]`).
- **Data Availability:** Sometimes, OSM data might be incomplete. If the Overpass API fails to find a connecting relation, the app falls back gracefully (e.g., drawing a direct line or logging a warning without crashing the map).
- **Timeouts (504 Errors):** The Overpass server can occasionally be overloaded. 504 Gateway Timeout errors are handled safely by our fetch wrapper, ensuring the app remains responsive.
