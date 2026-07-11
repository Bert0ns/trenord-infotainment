import { StationFull } from "@/lib/api/trenord/trenord-types";
import { LatLng, Region } from "react-native-maps";

/** coordinates object from a station full info */
export function stationLatLng(station: StationFull): LatLng {
  return {
    latitude: station.Location.coordinates[1],
    longitude: station.Location.coordinates[0],
  };
}

/**
 * Creates a bounding box from the array of stations, with south/north bounds as
 * latitudes and east/west bounds as longitudes
 */
export function getBbox(stations: StationFull[]) {
  const lats = stations.map((s) => s.Location.coordinates[1]);
  const lons = stations.map((s) => s.Location.coordinates[0]);
  const pad = 0.1; // ~10km padding
  return {
    south: Math.min(...lats) - pad,
    west: Math.min(...lons) - pad,
    north: Math.max(...lats) + pad,
    east: Math.max(...lons) + pad,
  };
}

/** converts a bounding box to a region with deltas, for the map zoom level */
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
