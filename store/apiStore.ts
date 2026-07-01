import { logger } from "@/lib/logger";
import { nowSec } from "@/utils/time";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const jwkRaw = process.env.EXPO_PUBLIC_TRENORD_PRIVATE_JWK!;
if (!jwkRaw) throw new Error("Missing EXPO_PUBLIC_TRENORD_PRIVATE_JWK");

const apiLogger = logger.extend("API Store");

export interface ApiStore {
  accessToken: string | null;
  tokenExpirationTime: number;
  setAccessToken: (token: string, expirationTime: number) => void;
  clearCache: () => void;
}

const apiStore = createStore<ApiStore>()(
  persist(
    (set) => ({
      accessToken: null,
      tokenExpirationTime: 0,
      setAccessToken: (token: string, expirationTime: number) => {
        apiLogger.info(
          `Setting access token with expiration time ${expirationTime}`,
        );
        set({ accessToken: token, tokenExpirationTime: expirationTime });
      },
      clearCache: () => {
        apiLogger.info("Clearing API cache");
        set({ accessToken: null, tokenExpirationTime: 0 });
      },
    }),
    {
      name: "api-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function getCachedAccessToken() {
  const { accessToken, tokenExpirationTime } = apiStore.getState();
  if (!accessToken) return null;
  const now = nowSec();
  if (now >= tokenExpirationTime - 30) {
    apiLogger.log("Access token expired or about to expire, clearing cache");
    apiStore.getState().clearCache();
    return null;
  }
  return accessToken;
}

export function setCachedAccessToken(token: string, expirationTime: number) {
  apiStore.getState().setAccessToken(token, expirationTime);
}
