import { logger } from "@/lib/logger";
import { getCachedAccessToken, setCachedAccessToken } from "@/store/apiStore";
import { nowSec } from "@/utils/time";
import { KJUR, KEYUTIL } from "jsrsasign";
import { Platform } from "react-native";
import { StationResponse, TrainInfoResponse } from "./types";

const apiLogger = logger.extend("API");

async function proxiedFetch(url: string, options: RequestInit = {}) {
  if (Platform.OS === "web") {
    return fetch("/api/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        method: options.method || "GET",
        headers: options.headers || {},
        body: options.body || undefined,
      }),
    });
  }
  return fetch(url, options);
}

// In Expo, EXPO_PUBLIC variables are stringified into the bundle
const clientId = process.env.EXPO_PUBLIC_TRENORD_CLIENT_ID!;
const issuer = process.env.EXPO_PUBLIC_TRENORD_ISSUER!;
const audience = process.env.EXPO_PUBLIC_TRENORD_AUDIENCE!;
const tokenUrl = process.env.EXPO_PUBLIC_TRENORD_TOKEN_URL!;
const apiUrl = process.env.EXPO_PUBLIC_TRENORD_API_URL!;
const jwkRaw = process.env.EXPO_PUBLIC_TRENORD_PRIVATE_JWK!;

if (!clientId) throw new Error("Missing EXPO_PUBLIC_TRENORD_CLIENT_ID");
if (!issuer) throw new Error("Missing EXPO_PUBLIC_TRENORD_ISSUER");
if (!audience) throw new Error("Missing EXPO_PUBLIC_TRENORD_AUDIENCE");
if (!tokenUrl) throw new Error("Missing EXPO_PUBLIC_TRENORD_TOKEN_URL");
if (!apiUrl) throw new Error("Missing EXPO_PUBLIC_TRENORD_API_URL");
if (!jwkRaw) throw new Error("Missing EXPO_PUBLIC_TRENORD_PRIVATE_JWK");

function getPrivateKey() {
  try {
    // Eagerly compute the crypto key on app boot so the first login is instant
    const jwk = JSON.parse(jwkRaw);
    return KEYUTIL.getKey(jwk) as jsrsasign.RSAKey;
  } catch (error) {
    apiLogger.error(
      "Failed to eagerly parse JWK string or generate key",
      error,
    );
    return null;
  }
}

async function getAccessToken(): Promise<string> {
  const cachedToken = getCachedAccessToken();
  if (cachedToken) {
    return cachedToken;
  }
  apiLogger.log("No valid cached access token found, generating a new one...");
  const privateKey = getPrivateKey();

  // Generate a random UUID for the JWT ID
  const jti =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15);

  const header = { alg: "RS256", typ: "JWT", kid: "dima" };
  const payload = {
    iss: clientId,
    sub: clientId,
    aud: issuer,
    jti: jti,
    requested_audiences: [audience],
    iat: nowSec(),
    exp: nowSec() + 300, // Expires in 5 minutes
  };

  const jwt = KJUR.jws.JWS.sign(
    "RS256",
    JSON.stringify(header),
    JSON.stringify(payload),
    privateKey as any,
  );

  const params = [
    "grant_type=client_credentials",
    `client_assertion_type=${encodeURIComponent(
      "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    )}`,
    `client_assertion=${encodeURIComponent(jwt)}`,
    `client_id=${encodeURIComponent(clientId)}`,
    "token_endpoint_auth_method=private_key_jwt",
  ].join("&");

  apiLogger.log("Requesting Bearer Access Token from Trenord IDP...");
  const tokenResponse = await proxiedFetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    apiLogger.error(
      `Token Request Failed! Status: ${tokenResponse.status}`,
      errText,
    );
    throw new Error(`Failed to get token: ${tokenResponse.status} ${errText}`);
  }

  const tokenData = await tokenResponse.json();

  const token = tokenData.access_token;
  if (!token) {
    apiLogger.error("Token response did not contain an access_token");
    throw new Error("Token response did not contain an access_token");
  }
  setCachedAccessToken(token, nowSec() + (tokenData.expires_in || 300));
  apiLogger.trace(
    `Access Token acquired successfully, expires in ${tokenData.expires_in || 300} seconds.`,
  );
  return token;
}

export async function fetchTrainData(
  trainId: string,
): Promise<TrainInfoResponse> {
  const accessToken = await getAccessToken();
  const url = `${apiUrl}/train/${trainId}`;

  apiLogger.trace(`Fetching live data for train ${trainId}...`);
  const response = await proxiedFetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    apiLogger.error(`Train fetch failed with status ${response.status}`);
    throw new Error(`Train API Call failed with status ${response.status}`);
  }

  apiLogger.trace(`Train data retrieved successfully for train ${trainId}.`);
  return response.json();
}

export async function fetchStationData(
  stationIDs: string[],
): Promise<StationResponse> {
  // since i have no idea how to filter for multiple stations in the API (i
  // don't thinkg it's possible and if it is it's not documented) it is easier
  // and more practical to just fetch all stations and filter them quickly in JS
  // For this reason this function should be called sparingly

  const accessToken = await getAccessToken();
  const url = `${apiUrl}/stazioni_v2`;

  apiLogger.trace(`Fetching data for stations ${stationIDs.join(", ")}...`);
  const response = await proxiedFetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    apiLogger.error(`Station fetch failed with status ${response.status}`);
    throw new Error(`Station API Call failed with status ${response.status}`);
  }

  apiLogger.trace(
    `Station data retrieved successfully for stations ${stationIDs.join(", ")}.`,
  );

  const stationData: StationResponse = await response.json();
  const filteredData = stationData
    .filter((station) => stationIDs.includes(station.CodiceMIR))
    .toSorted(
      (a, b) =>
        stationIDs.indexOf(a.CodiceMIR) - stationIDs.indexOf(b.CodiceMIR),
    );
  return filteredData;
}
