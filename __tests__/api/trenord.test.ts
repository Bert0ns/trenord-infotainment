// Setup dummy environment variables before requiring the module
process.env.EXPO_PUBLIC_TRENORD_CLIENT_ID = "test-client";
process.env.EXPO_PUBLIC_TRENORD_ISSUER = "test-issuer";
process.env.EXPO_PUBLIC_TRENORD_AUDIENCE = "test-aud";
process.env.EXPO_PUBLIC_TRENORD_TOKEN_URL = "https://test.token.url";
process.env.EXPO_PUBLIC_TRENORD_API_URL = "https://test.api.url";
process.env.EXPO_PUBLIC_TRENORD_PRIVATE_JWK = JSON.stringify({
  kty: "RSA",
  n: "test",
  e: "AQAB",
});

// Use require to ensure env variables are set before execution
jest.unmock("@/lib/api/trenord/trenord");
jest.unmock("../../lib/api/trenord/trenord");
const {
  fetchTrainData,
  fetchStationMetadata,
  fetchStationData,
  clearTrenordApiCache,
} = require("../../lib/api/trenord/trenord");

// Mock `jsrsasign` package to avoid real crypto in tests
jest.mock("jsrsasign", () => {
  return {
    KEYUTIL: {
      getKey: jest.fn().mockReturnValue("mockPrivateKey"),
    },
    KJUR: {
      jws: {
        JWS: {
          sign: jest.fn().mockReturnValue("mock-signed-jwt"),
        },
      },
    },
  };
});

describe("Trenord API", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    clearTrenordApiCache();
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    jest.clearAllMocks();

    // Clear console output in tests to keep the log clean
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should fetch train data successfully", async () => {
    // 1st fetch: access token
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: "mock-access-token" }),
    });

    // 2nd fetch: train data
    const mockTrainData = [{ journey_list: [{ pass_list: [] }] }];
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTrainData,
    });

    const data = await fetchTrainData("1234");

    expect(data).toEqual(mockTrainData);

    // Verify sequence
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Token request validation
    const tokenCallArgs = fetchMock.mock.calls[0];
    expect(tokenCallArgs[0]).toBe("https://test.token.url");
    expect(tokenCallArgs[1].method).toBe("POST");
    expect(tokenCallArgs[1].body).toContain("client_assertion=mock-signed-jwt");
    expect(tokenCallArgs[1].body).toContain("client_id=test-client");

    // API request validation
    const apiCallArgs = fetchMock.mock.calls[1];
    expect(apiCallArgs[0]).toBe("https://test.api.url/train/1234");
    expect(apiCallArgs[1].method).toBe("GET");
    expect(apiCallArgs[1].headers.Authorization).toBe(
      "Bearer mock-access-token",
    );
  });

  it("should throw an error if token request fails", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });

    await expect(fetchTrainData("1234")).rejects.toThrow(
      "Failed to get token: 401 Unauthorized",
    );
  });

  it("should throw an error if train data request fails", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: "mock-access-token" }),
    });

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(fetchTrainData("1234")).rejects.toThrow(
      "Train API Call failed with status 404",
    );
  });

  it("should fetch station metadata successfully", async () => {
    // 1st fetch: access token
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: "mock-access-token" }),
    });

    // 2nd fetch: metadata
    const mockMetadata = [{ Comune: "Milano" }];
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMetadata,
    });

    const data = await fetchStationMetadata("MILANO CADORNA");
    expect(data).toEqual(mockMetadata);

    const apiCallArgs = fetchMock.mock.calls[1];
    expect(apiCallArgs[0]).toBe(
      "https://test.api.url/stazioni_v2?NomeGeoStazioni=MILANO%20CADORNA",
    );
  });

  it("should throw an error if station metadata request fails", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: "mock-access-token" }),
    });

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
    });

    await expect(fetchStationMetadata("INVALID")).rejects.toThrow(
      "Station API Call failed with status 400",
    );
  });

  describe("fetchStationData", () => {
    const AsyncStorage = require("@react-native-async-storage/async-storage");

    beforeEach(() => {
      AsyncStorage.getItem.mockClear();
      AsyncStorage.setItem.mockClear();
    });

    it("returns empty array if stationIDs is empty", async () => {
      const data = await fetchStationData([]);
      expect(data).toEqual([]);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("fetches from API when cache is empty and saves to cache", async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null); // No cache

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "mock-access-token" }),
      });

      const mockApiResponse = [
        { CodiceMIR: "S2", NomeGeoStazioni: "Station 2" },
        { CodiceMIR: "S1", NomeGeoStazioni: "Station 1" },
        { CodiceMIR: "S3", NomeGeoStazioni: "Station 3" },
      ];
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const data = await fetchStationData(["S1", "S2"]);

      // Should filter and sort correctly to match ["S1", "S2"]
      expect(data).toEqual([
        { CodiceMIR: "S1", NomeGeoStazioni: "Station 1" },
        { CodiceMIR: "S2", NomeGeoStazioni: "Station 2" },
      ]);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith("stazioni_v2_cache");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "stazioni_v2_cache",
        expect.stringContaining('"data":[{'),
      );
    });

    it("uses cache if valid and skips API call", async () => {
      const now = Math.floor(Date.now() / 1000);
      const mockCachedData = {
        timestamp: now, // recent
        data: [
          { CodiceMIR: "S3", NomeGeoStazioni: "Station 3" },
          { CodiceMIR: "S1", NomeGeoStazioni: "Station 1" },
          { CodiceMIR: "S2", NomeGeoStazioni: "Station 2" },
        ],
      };

      AsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify(mockCachedData),
      );

      const data = await fetchStationData(["S2", "S1"]);

      expect(fetchMock).not.toHaveBeenCalled(); // No API call!
      expect(data).toEqual([
        { CodiceMIR: "S2", NomeGeoStazioni: "Station 2" },
        { CodiceMIR: "S1", NomeGeoStazioni: "Station 1" },
      ]);
    });

    it("fetches from API if cache is expired", async () => {
      const oldTimestamp = Math.floor(Date.now() / 1000) - 25 * 60 * 60; // 25 hours ago
      const mockCachedData = {
        timestamp: oldTimestamp,
        data: [],
      };

      AsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify(mockCachedData),
      );

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "mock-access-token" }),
      });

      const mockApiResponse = [
        { CodiceMIR: "S1", NomeGeoStazioni: "Station 1" },
      ];
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const data = await fetchStationData(["S1"]);
      expect(fetchMock).toHaveBeenCalledTimes(2); // token + data
      expect(data).toEqual(mockApiResponse);
    });

    it("throws error if API call fails", async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null); // No cache

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "mock-access-token" }),
      });

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(fetchStationData(["S1"])).rejects.toThrow(
        "Station API Call failed with status 500",
      );
    });
  });
});
