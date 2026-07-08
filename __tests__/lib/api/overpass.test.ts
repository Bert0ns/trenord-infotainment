import { renderHook, waitFor } from "@testing-library/react-native";
import {
  fetchRailwayPolylines,
  useRailwayPolylines,
} from "../../../lib/api/overpass";
import { StationFull } from "../../../lib/api/trenord/trenord-types";

// Mock the global fetch
global.fetch = jest.fn();

const mockStations: StationFull[] = [
  {
    CodiceMIR: "S1",
    NomeGeoStazioni: "A",
    Location: { coordinates: [9.0, 45.0] },
  } as any,
  {
    CodiceMIR: "S2",
    NomeGeoStazioni: "B",
    Location: { coordinates: [9.1, 45.1] },
  } as any,
];

describe("Overpass API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchRailwayPolylines", () => {
    it("returns empty array when given less than 2 stations", async () => {
      const result = await fetchRailwayPolylines([mockStations[0]]);
      expect(result).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("returns empty array on fetch failure", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 504,
      });

      const result = await fetchRailwayPolylines(mockStations);
      expect(result).toEqual([]);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("fetches and maps overpass geometries correctly", async () => {
      const mockOverpassResponse = {
        elements: [
          {
            geometry: [
              { lat: 45.01, lon: 9.01 },
              { lat: 45.05, lon: 9.05 },
            ],
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockOverpassResponse,
      });

      const result = await fetchRailwayPolylines(mockStations);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const fetchArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchArgs[0]).toBe("https://overpass-api.de/api/interpreter");
      expect(fetchArgs[1].method).toBe("POST");

      expect(result).toEqual([
        [
          { latitude: 45.01, longitude: 9.01 },
          { latitude: 45.05, longitude: 9.05 },
        ],
      ]);
    });
  });

  describe("useRailwayPolylines", () => {
    it("returns empty array immediately if stations is null", () => {
      const { result } = renderHook(() => useRailwayPolylines(null));
      expect(result.current).toEqual([]);
    });

    it("fetches polylines and updates state", async () => {
      const mockOverpassResponse = {
        elements: [{ geometry: [{ lat: 45.01, lon: 9.01 }] }],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockOverpassResponse,
      });

      const { result } = renderHook(() => useRailwayPolylines(mockStations));

      // Initially empty
      expect(result.current).toEqual([]);

      // Wait for fetch to complete
      await waitFor(() => {
        expect(result.current).toEqual([
          [{ latitude: 45.01, longitude: 9.01 }],
        ]);
      });
    });

    it("clears polylines when stations become null", async () => {
      const mockOverpassResponse = {
        elements: [{ geometry: [{ lat: 45.01, lon: 9.01 }] }],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockOverpassResponse,
      });

      const { result, rerender } = renderHook(
        (props: { stations: StationFull[] | null }) =>
          useRailwayPolylines(props.stations),
        {
          initialProps: { stations: mockStations },
        },
      );

      await waitFor(() => {
        expect(result.current).toEqual([
          [{ latitude: 45.01, longitude: 9.01 }],
        ]);
      });

      // Update props to null
      rerender({ stations: null });

      // Should instantly become empty
      expect(result.current).toEqual([]);
    });
  });
});
