import { KJUR, KEYUTIL } from "jsrsasign";
import { logger } from "@/lib/logger";
import { TrainInfoResponse } from "./types";

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

let cachedPrivateKey: any = null;
let cachedAccessToken: string | null = null;
let tokenExpirationTime: number = 0;

try {
  // Eagerly compute the crypto key on app boot so the first login is instant
  const jwk = JSON.parse(jwkRaw);
  cachedPrivateKey = KEYUTIL.getKey(jwk);
} catch (error) {
  logger.error("Failed to eagerly parse JWK string or generate key", error);
}

export function clearTrenordApiCache() {
  cachedPrivateKey = null;
  cachedAccessToken = null;
  tokenExpirationTime = 0;
}

function getPrivateKey() {
  if (cachedPrivateKey) return cachedPrivateKey;

  if (!jwkRaw)
    throw new Error("Missing EXPO_PUBLIC_TRENORD_PRIVATE_JWK in environment");
  try {
    const jwk = JSON.parse(jwkRaw);
    cachedPrivateKey = KEYUTIL.getKey(jwk);
    return cachedPrivateKey;
  } catch (error) {
    logger.error("Failed to parse JWK string or generate key", error);
    throw new Error("Invalid JWK JSON format");
  }
}

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // Reuse token if it's still valid for at least 30 more seconds
  if (cachedAccessToken && now < tokenExpirationTime - 30) {
    return cachedAccessToken;
  }

  if (!cachedPrivateKey) {
    logger.log("[Trenord API] Getting private JWK for authentication...");
  }
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
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 300, // Expires in 5 minutes
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

  logger.log(
    "[Trenord API] Requesting Bearer Access Token from Trenord IDP...",
  );
  const tokenResponse = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    logger.error(
      `[Trenord API] Token Request Failed! Status: ${tokenResponse.status}`,
      errText,
    );
    throw new Error(`Failed to get token: ${tokenResponse.status} ${errText}`);
  }

  const tokenData = await tokenResponse.json();

  cachedAccessToken = tokenData.access_token;
  const expiresIn = tokenData.expires_in || 300;
  tokenExpirationTime = now + expiresIn;
  logger.log(
    `[Trenord API] Access Token acquired successfully, expires in ${expiresIn} seconds.`,
  );
  return cachedAccessToken!;
}

export async function fetchTrainData(
  trainId: string,
): Promise<TrainInfoResponse> {
  const accessToken = await getAccessToken();
  const url = `${apiUrl}/train/${trainId}`;

  logger.log(`[Trenord API] Fetching live data for train ${trainId}...`);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    logger.error(
      `[Trenord API] Train fetch failed with status ${response.status}`,
    );
    throw new Error(`Train API Call failed with status ${response.status}`);
  }

  logger.log(
    `[Trenord API] Train data retrieved successfully for train ${trainId}.`,
  );
  return response.json();
}
