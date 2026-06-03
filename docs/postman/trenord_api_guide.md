# Trenord B2B API - Preprod Integration Guide

This document contains everything discovered about the Trenord B2B Preprod API, including how to configure Postman and how to authenticate programmatically in your own application.

## Included Postman Files

In this directory, you will find:

1. `MIA services v.2 - sharable PREPROD [DIMA].postman_collection.json`: The Postman Collection containing available API endpoints.
2. `Trenord B2B Environment - Sharable PREPROD [DIMA].postman_environment.json`: The Postman Environment configuring URLs and variables.

## Postman Setup Guide

To use the API via Postman, follow these steps:

1. **Import the files:**
   Open Postman and import both the Collection and Environment files from this directory.

2. **Generate your JWK:**
   You must convert your private RSA key (`.pem` or `.key` file) into a JSON Web Key (JWK) to sign requests.
   - Go to [JWK Creator](https://russelldavies.github.io/jwk-creator/)
   - Paste the contents of your private key.
   - Set **Public Key Use** to `Signing`.
   - Set **Algorithm** to `RS256`.
   - Set **Key ID** to `dima`.
   - Generate and copy the JSON output.

3. **Configure Postman Environment:**
   - Select the imported `Trenord B2B Environment` in Postman.
   - Check that `clientId` is correctly set (e.g., `GbLkYjtRcmiTKvhPxsaynbClIWHjXWgr` for Bertoni).
   - Edit the `CLIENT_PRIVATE_JWT_CREDENTIALS` variable and replace `{YOUR-PRIVATE-KEY-IN-JWK}` with the JWK JSON you just generated.

4. **Making Requests:**
   The Postman collection is configured with a Pre-request Script. Whenever you run a request, it automatically uses your JWK to generate a signed JWT Assertion, fetches the Bearer Token from the OAuth endpoint, and applies it to your request.

---

## Authentication Flow Details

Trenord's API uses OAuth 2.0 with the **Client Credentials** grant type and a **Private Key JWT** for client authentication.

**Token Endpoint:** `POST https://preprod.mp.trenord.it/b2b/oauth/token`

The request requires the following URL-encoded parameters:

- `grant_type`: `client_credentials`
- `client_assertion_type`: `urn:ietf:params:oauth:client-assertion-type:jwt-bearer`
- `client_assertion`: A dynamically signed JWT (Assertion Token)
- `client_id`: Your Client ID
- `token_endpoint_auth_method`: `private_key_jwt`

### The JWT Assertion Token

The `client_assertion` must be a JWT signed with your RS256 private key. It must include:

- **Header:** `{ "alg": "RS256", "typ": "JWT", "kid": "dima" }` _(The `kid` must exactly match)_
- **Payload:**
  - `iss`: Your Client ID
  - `sub`: Your Client ID
  - `aud`: `trenord-idp`
  - `jti`: A unique random string (e.g., 16 random bytes)
  - `requested_audiences`: `["b2b"]`
  - `iat`: Issued At timestamp (critical)
  - `exp`: Expiration timestamp (e.g., 5 minutes from `iat`)

---

## Minimal Node.js Reference Implementation

Below is a minimal Node.js script demonstrating how to authenticate and fetch data. It uses the modern `jose` library to handle the JWK and JWT generation natively.

```javascript
import fs from "fs";
import { importJWK, SignJWT } from "jose";
import crypto from "crypto";

// Configuration
const clientId = "GbLkYjtRcmiTKvhPxsaynbClIWHjXWgr";
const issuer = "trenord-idp";
const audience = "b2b";
const tokenUrl = "https://preprod.mp.trenord.it/b2b/oauth/token";

async function main() {
  // 1. Read the JWK file
  const jwkRaw = fs.readFileSync("./bertoni_jwt.json", "utf-8");
  const jwk = JSON.parse(jwkRaw);

  // 2. Import the JWK into the jose library
  const privateKey = await importJWK(jwk, "RS256");

  // 3. Create and sign the JWT Assertion Token
  const jwt = await new SignJWT({
    iss: clientId,
    sub: clientId,
    aud: issuer,
    jti: crypto.randomBytes(16).toString("hex"), // Unique identifier
    requested_audiences: [audience],
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT", kid: "dima" })
    .setIssuedAt()
    .setExpirationTime("5m") // Must not be expired
    .sign(privateKey);

  // 4. Request the Access Token from the OAuth endpoint
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append(
    "client_assertion_type",
    "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
  );
  params.append("client_assertion", jwt);
  params.append("client_id", clientId);
  params.append("token_endpoint_auth_method", "private_key_jwt");

  const tokenResponse = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!tokenResponse.ok) {
    throw new Error(`Failed to get token: ${await tokenResponse.text()}`);
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  // 5. Make a basic API Call using the token (fetching MILANO CADORNA station)
  const apiUrl =
    "https://preprod.mp.trenord.it/b2b/stazioni_v2?NomeGeoStazioni=MILANO%20CADORNA";
  const apiResponse = await fetch(apiUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const apiData = await apiResponse.json();
  console.log("API Call Success! Data:", apiData);
}

main().catch(console.error);
```
