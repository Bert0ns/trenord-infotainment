import { StationFull } from "@/lib/api/types";
import { useEffect, useState } from "react";
import { logger as l } from "@/lib/logger";
import { LatLng, Region } from "react-native-maps";

const logger = l.extend("Geom");

export type Coord = { lat: number; lon: number };
export type Way = { nodes: string[]; geometry: Coord[] };
export type OverpassResponse = { elements: Way[] };
export type Graph = {
  [nodeId: string]: { coord: Coord; neighbors: string[] };
};

export function getBbox(stations: StationFull[]) {
  const lats = stations.map((s) => s.Location.coordinates[1]);
  const lons = stations.map((s) => s.Location.coordinates[0]);
  const pad = 0.01; // ~1km padding
  return {
    south: Math.min(...lats) - pad,
    west: Math.min(...lons) - pad,
    north: Math.max(...lats) + pad,
    east: Math.max(...lons) + pad,
  };
}

export function bboxToRegion({
  north,
  south,
  west,
  east,
}: ReturnType<typeof getBbox>): Region {
  return {
    latitude: (north + south) / 2,
    longitude: (west + east) / 2,
    latitudeDelta: Math.abs(north - south),
    longitudeDelta: Math.abs(west - east),
  };
}

async function fetchRailwayWays(stations: StationFull[]) {
  if (stations.length < 2) return [];
  logger.trace(`Fetching railway ways for ${stations.length} stations`);

  // assured to exist since we exit when length < 2
  const first = stations.at(0)!.Location.coordinates;
  const last = stations.at(-1)!.Location.coordinates;

  const query = `
    [out:json][timeout:30];
    node(around:150, ${first[1]}, ${first[0]})["operator:short"="RFI"]["railway"~"station|halt|stop"]->.stA;
    node(around:150, ${last[1]}, ${last[0]})["operator:short"="RFI"]["railway"~"station|halt|stop"]->.stB;
    relation(bn.stA)["route"="train"]["operator"~"[Tt]renord"]->.relsA;
    relation.relsA(bn.stB)->.segmentRels;
    way(r.segmentRels)["railway"="rail"];
    out geom;
  `;
  logger.trace(`Overpass query: \n${query.replace(/\s+/g, " ")}\n`);
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
  });
  if (!res.ok) {
    logger.error(`Overpass request failed! Status: ${res.status}`);
    return [];
  }
  const reponse: OverpassResponse = await res.json();
  logger.trace(`Fetched ${reponse.elements.length} railway ways from Overpass`);
  return reponse.elements;
}

// Build adjacency: each OSM node ID → list of connected node IDs + coordinates
function buildGraph(ways: Way[]): Graph {
  const graph: Graph = {}; // nodeId → { coord, neighbors: [nodeId] }

  for (const way of ways) {
    const nodeIds = way.nodes; // array of OSM node IDs
    const geom = way.geometry; // array of {lat, lon}, same length

    for (let i = 0; i < nodeIds.length; i++) {
      const id = nodeIds[i];
      if (!graph[id]) graph[id] = { coord: geom[i], neighbors: [] };
      if (i > 0) {
        graph[id].neighbors.push(nodeIds[i - 1]);
        graph[nodeIds[i - 1]].neighbors.push(id);
      }
    }
  }
  logger.trace(`Built graph with ${Object.keys(graph).length} nodes`);
  return graph;
}

// Find the OSM node ID closest to a given coordinate
function nearestNode(graph: Graph, lat: number, lon: number) {
  let best = null;
  let bestDist = Infinity;
  for (const [id, { coord }] of Object.entries(graph)) {
    const d = (coord.lat - lat) ** 2 + (coord.lon - lon) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = id;
    }
  }
  logger.trace(`Nearest node to (${lat}, ${lon}) is ${best}`);
  return best;
}

// BFS to find connected path of node IDs
function bfsPath(graph: Graph, startId: string, endId: string) {
  logger.trace(`Finding path from ${startId} to ${endId} in graph`);
  const queue = [[startId]];
  const visited = new Set([startId]);
  let depth = 0;
  while (queue.length) {
    const path = queue.shift()!;
    const current = path.at(-1);
    if (!current) continue;
    if (current === endId) {
      logger.trace(`Found path from ${startId} to ${endId}`);
      return path;
    }
    depth++;
    for (const neighbor of graph[current].neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  logger.warn(`No path found from ${startId} to ${endId} after ${depth} steps`);
  return null;
}

// Get the lat/lon polyline for a segment
function getSegmentCoords(
  graph: Graph,
  stationA: StationFull,
  stationB: StationFull,
) {
  const startId = nearestNode(
    graph,
    stationA.Location.coordinates[1],
    stationA.Location.coordinates[0],
  );
  const endId = nearestNode(
    graph,
    stationB.Location.coordinates[1],
    stationB.Location.coordinates[0],
  );
  if (!startId || !endId) return [];
  const path = bfsPath(graph, startId, endId);
  return path?.map((id) => graph[id].coord) ?? [];
}

export async function fetchRailwayPolylines(stations: StationFull[]) {
  logger.trace(`Fetching railway polyline for ${stations.length} stations`);
  const ways = await fetchRailwayWays(stations);
  logger.trace(`Fetched railway polyline with ${ways.length} coordinates`);
  return ways.map((w) =>
    w.geometry.map((c) => ({ latitude: c.lat, longitude: c.lon })),
  );
}

export function useRailwayPolylines(stations: StationFull[] | null) {
  const [polylines, setPolylines] = useState<LatLng[][]>([]);

  useEffect(() => {
    if (!stations || stations.length < 2) {
      setPolylines([]);
      return;
    }
    if (!polylines.length) {
      fetchRailwayPolylines(stations)
        .then(setPolylines)
        .catch((err) =>
          console.error("Failed to fetch railway polylines:", err),
        );
    }
  }, [polylines.length, stations]);

  return polylines;
}
