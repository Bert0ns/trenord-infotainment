# Plan: Real API on Web via Local Proxy & DIP

## 1. Overview

The goal is to build a standalone mobile app that communicates directly with Trenord APIs. However, for local Web development and testing, we want the ability to hit the **real** Trenord API without running into CORS errors. Additionally, we must still respect `AGENTS.md` by providing a Mock fallback for offline resilience.

We will achieve this by creating a **Development CORS Proxy** using Expo API Routes strictly for Web usage, while preserving direct communication on Mobile. We will also implement the DIP (Dependency Inversion Principle) structure to easily swap in the Mock API when needed.

## 2. Changes to be made

### Step 2.1: Create the Web CORS Proxy (Server-Side)

- **File**: Create `app/api/proxy+api.ts`.
- **Logic**: This will be a generic proxy endpoint. It will accept a `POST` request containing a `targetUrl`, `method`, `headers`, and `body`. It will make the request to Trenord from the Node.js environment (which ignores CORS) and pipe the response back to the web client.

### Step 2.2: Define the API Interface (DIP)

- **File**: `lib/api/types.ts`
- **Logic**: Define `ITrenordApiService` with `fetchTrainData(trainId: string)`.

### Step 2.3: Implement the Real API Service

- **File**: Rename `lib/api/trenord.ts` to `lib/api/trenord-real.ts`.
- **Logic**: Implement `ITrenordApiService`.
  - We will introduce a smart `fetch` wrapper.
  - If `Platform.OS === 'web'`, the wrapper will forward the request through our new `/api/proxy` endpoint.
  - If `Platform.OS !== 'web'` (Mobile), it will fetch directly from Trenord.

### Step 2.4: Implement the Mock API Service

- **File**: Create `lib/api/trenord-mock.ts`.
- **Logic**: Implement `ITrenordApiService` returning realistic hardcoded JSON data. This fulfills the `AGENTS.md` requirement for offline resilience and demoability.

### Step 2.5: Create the API Locator / Toggle

- **File**: `lib/api/index.ts`.
- **Logic**:
  - By default, use `RealTrenordApi` so the web browser hits the real API via the proxy.
  - Allow toggling to `MockTrenordApi` using an environment variable (e.g., `EXPO_PUBLIC_USE_MOCKS=true`) to satisfy the offline demo requirement.
  - Update `hooks/use-login.ts` to use this new exported service.

## 3. Benefits of this Approach

1. **Real API on Web**: You can fully test the real Trenord integration directly in your browser.
2. **Standalone Mobile**: The compiled mobile apps remain completely independent with no backend requirements, communicating directly with Trenord.
3. **Offline Resilience**: The Mock API is cleanly separated and ready to be used if the real API goes down or for offline demos.
