# Login Page Implementation Plan

## 1. Overview

The goal is to modify the `app/index.tsx` screen to dynamically fetch real train data from the Trenord API based on the user's input, instead of using hardcoded mock data.

## 2. Dependencies

To achieve this securely and efficiently, we will add the following libraries:

- **`jsrsasign`**: A pure JavaScript cryptography library used to sign the RS256 JWT assertion in environments where Web Crypto support may be limited.
- **`zustand`**: A minimal, pure-JavaScript state management library used to store the fetched train data so it can be accessed by the rest of the application (`/(tabs)` screens).

## 3. UI/UX Flow (app/index.tsx)

The login card will be split into two distinct phases:

### Phase 1: Search Train

- **Input:** The "Ticket code" input is modified to accept 4 to 7 digits.
- **Action:** The main button displays "Search Train". The destination dropdown is completely hidden.
- **Loading State:** When the user taps "Search Train", the button disables and shows a loading spinner.
- **Execution:**
  1. The app generates an OAuth JWT assertion using the private JWK.
  2. The app fetches a Bearer Access Token.
  3. The app fetches the train data from `GET https://preprod.mp.trenord.it/b2b/train/{train_id}`.

### Phase 2: Select Destination & Start

- **Data Parsing:** Upon a successful fetch, the app parses `journey_list[0].pass_list` to extract the `station_ori_name` and `station_id` of every stop the train makes.
- **UI Update:** The destination dropdown becomes visible, populated with the parsed stations.
- **Button Update:** The main button text changes from "Search Train" to "Start Journey" but remains disabled until the user selects a destination from the dropdown.
- **Final Action:** The user selects a station and taps "Start Journey".

## 4. State Management (Zustand)

When "Start Journey" is tapped, we will save the relevant journey context to a global store (`useJourneyStore`).
The store will track:

- `trainId`: The code entered by the user.
- `destinationStation`: The selected station object (name and MIR ID).
- `trainData`: The full JSON response of the train for use in the dashboard.

## 5. Development Steps

1. Install dependencies (`jose`, `zustand`).
2. Create the API service module (`lib/api/trenord.ts`) to handle authentication and fetching.
3. Create the global store (`store/journeyStore.ts`).
4. Update `app/index.tsx` to implement the 2-phase UI and integrate the API and Store.
