import { KJUR, KEYUTIL } from "jsrsasign";

// Read configuration from Expo environment (EXPO_PUBLIC_* are bundled into the app)
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} in environment`);
  return value;
}

const clientId = requireEnv("EXPO_PUBLIC_TRENORD_CLIENT_ID");
const issuer = requireEnv("EXPO_PUBLIC_TRENORD_ISSUER");
const audience = requireEnv("EXPO_PUBLIC_TRENORD_AUDIENCE");
const tokenUrl = requireEnv("EXPO_PUBLIC_TRENORD_TOKEN_URL");
const apiUrl = requireEnv("EXPO_PUBLIC_TRENORD_API_URL");
// In Expo, EXPO_PUBLIC variables are stringified into the bundle
const jwkRaw = requireEnv("EXPO_PUBLIC_TRENORD_PRIVATE_JWK");

let cachedJwk: any = null;

function getJwk() {
  if (cachedJwk) return cachedJwk;
  if (!jwkRaw)
    throw new Error("Missing EXPO_PUBLIC_TRENORD_PRIVATE_JWK in environment");
  try {
    cachedJwk = JSON.parse(jwkRaw);
    return cachedJwk;
  } catch (error) {
    console.error("Failed to parse JWK string", error);
    throw new Error("Invalid JWK JSON format");
  }
}

async function getAccessToken(): Promise<string> {
  console.log("[Trenord API] Getting private JWK for authentication...");
  const jwk = getJwk();

  // Parse JWK into an RSA key object compatible with jsrsasign
  const privateKey = KEYUTIL.getKey(jwk);

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

  console.log(
    "[Trenord API] Requesting Bearer Access Token from Trenord IDP...",
  );
  const tokenResponse = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    console.error(
      `[Trenord API] Token Request Failed! Status: ${tokenResponse.status}`,
      errText,
    );
    throw new Error(`Failed to get token: ${tokenResponse.status} ${errText}`);
  }

  const tokenData = await tokenResponse.json();
  console.log("[Trenord API] Access Token acquired successfully!)");
  return tokenData.access_token;
}

export async function fetchTrainData(trainId: string) {
  const accessToken = await getAccessToken();
  const url = `${apiUrl}/train/${trainId}`;

  console.log(`[Trenord API] Fetching live data for train ${trainId}...`);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.error(
      `[Trenord API] Train fetch failed with status ${response.status}`,
    );
    throw new Error(`Train API Call failed with status ${response.status}`);
  }

  console.log(
    `[Trenord API] Train data retrieved successfully for train ${trainId}.`,
  );
  return response.json();
}
