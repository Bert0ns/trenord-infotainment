import { useEffect, useState } from "react";
import { logger } from "../logger";
import { StationFull } from "./types";

const opLogger = logger.extend("Overpass");

function opQuery(departure: string, arrival: string) {
  return `
  [out:json][timeout:30];

  // Look up terminal station nodes by HAFAS/uic_ref
  node["uic_ref"="${departure}"]["railway"~"station|halt|stop"]->.stA;
  node["uic_ref"="${arrival}"]["railway"~"station|halt|stop"]->.stB;

  // Find route relations containing station A
  relation(bn.stA)["route"="train"]->.relsA;

  // Narrow to those also containing station B → these serve your segment
  relation.relsA(bn.stB)->.segmentRels;

  // Get the track geometry from those relations
  way(r.segmentRels)["railway"="rail"];
  out geom;
`;
}

export type OverpassResponse = {
  elements: {
    geometry: { latitude: number; longitude: number }[];
  }[];
};

export async function fetchOverpass(query: string) {
  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
      body: `data=${encodeURIComponent(query)}`,
    });
    const data = await response.json();
    return data as OverpassResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    opLogger.error("Failed to fetch Overpass data:", message);
  }
}

export async function fetchPolylines(
  departure: StationFull,
  arrival: StationFull,
) {
  const query = opQuery(departure.hafasCodes[0], arrival.hafasCodes[0]);
  const data = await fetchOverpass(query);
  if (!data || !data.elements) {
    opLogger.error("No elements found in Overpass response");
    return null;
  }
  return data.elements.map((way) => way.geometry);
}

export function usePolylines(
  departure: StationFull | null,
  arrival: StationFull | null,
) {
  const [polylines, setPolylines] = useState<
    { latitude: number; longitude: number }[][]
  >([]);

  useEffect(() => {
    if (!departure || !arrival) {
      setPolylines([]);
      return;
    }

    (async () => {
      const polylineData = await fetchPolylines(departure, arrival);
      setPolylines(polylineData ?? []);
    })();
  }, [departure, arrival]);

  return polylines;
}
