import { useEffect, useState } from "react";
import { logger as l } from "../logger";
import { StationFull } from "./types";
import { LatLng } from "react-native-maps";
import { stationLatLng } from "@/utils/geometry";

const logger = l.extend("Overpass");

export type Coord = { lat: number; lon: number };
export type Way = { nodes: string[]; geometry: Coord[] };
export type OverpassResponse = { elements: Way[] };
export type Graph = {
  [nodeId: string]: { coord: Coord; neighbors: string[] };
};

async function fetchRailwayWays(stations: StationFull[]) {
  if (stations.length < 2) return [];
  logger.trace(`Fetching railway ways for ${stations.length} stations`);

  // assured to exist since we exit when length < 2
  const first = stationLatLng(stations.at(0)!);
  const last = stationLatLng(stations.at(-1)!);

  const query = `
    [out:json][timeout:30];
    node(around:150, ${first.latitude}, ${first.longitude})["operator:short"="RFI"]["railway"~"station|halt|stop"]->.stA;
    node(around:150, ${last.latitude}, ${last.longitude})["operator:short"="RFI"]["railway"~"station|halt|stop"]->.stB;
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
