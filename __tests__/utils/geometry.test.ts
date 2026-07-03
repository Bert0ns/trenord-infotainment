import { StationFull } from "@/lib/api/types";
import { bboxToRegion, getBbox, stationLatLng } from "../../utils/geometry";

function createStation(coordinates: [number, number]): StationFull {
  return {
    _id: "id",
    creatorId: "creator",
    createdAt: "2026-01-01",
    updaterId: "updater",
    updatedAt: "2026-01-01",
    Cap: 0,
    CodiceMIR: "MIR",
    Comune: "Milano",
    Direttrici: [],
    Indirizzo: "Address",
    NomeGeoStazioni: "STATION",
    Note: "",
    Prov: "MI",
    Location: {
      coordinates,
      type: "Point",
    },
    locIdSbme: 1,
    MetaStazione: false,
    country: "IT",
    tariff_zone: "A",
    __STATE__: "active",
    Regione: "Lombardia",
    hafasCodes: [],
    soglia: 0,
    ignore_during_search: false,
    is_metro_station: false,
    station_classification: [],
    platforms: [],
  };
}

describe("geometry utils", () => {
  it("stationLatLng maps [longitude, latitude] to LatLng", () => {
    const station = createStation([9.19, 45.4642]);

    expect(stationLatLng(station)).toEqual({
      latitude: 45.4642,
      longitude: 9.19,
    });
  });

  it("getBbox computes min/max bounds with padding", () => {
    const stations = [
      createStation([9.1, 45.1]),
      createStation([9.4, 45.5]),
      createStation([9.2, 45.3]),
    ];

    expect(getBbox(stations)).toEqual({
      south: 45.0,
      west: 9.0,
      north: 45.6,
      east: 9.5,
    });
  });

  it("bboxToRegion converts bounds into map region center and deltas", () => {
    const bbox = {
      north: 45.6,
      south: 45.0,
      west: 9.0,
      east: 9.5,
    };

    const region = bboxToRegion(bbox);

    expect(region.latitude).toBeCloseTo(45.3, 10);
    expect(region.longitude).toBeCloseTo(9.25, 10);
    expect(region.latitudeDelta).toBeCloseTo(0.6, 10);
    expect(region.longitudeDelta).toBeCloseTo(0.5, 10);
  });
});
