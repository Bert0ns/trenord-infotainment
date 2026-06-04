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
const { fetchTrainData } = require("../../lib/api/trenord");

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
});
