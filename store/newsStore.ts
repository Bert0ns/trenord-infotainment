import { NewsAPIResponse } from "@/lib/api/currentsapi-news/currentsapi-news-types";
import { logger } from "@/lib/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const storeLogger = logger.extend("NewsStore");

export const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
export const MAX_CACHE_KEYS = 10;

export interface NewsCacheItem {
  data: NewsAPIResponse;
  timestamp: number;
}

export interface NewsStore {
  latestNewsCache: Record<string, NewsCacheItem>;
  searchNewsCache: Record<string, NewsCacheItem>;
  setLatestNews: (key: string, data: NewsAPIResponse) => void;
  setSearchNews: (key: string, data: NewsAPIResponse) => void;
  clearCache: () => void;
  getValidLatestNews: (key: string) => NewsAPIResponse | null;
  getValidSearchNews: (key: string) => NewsAPIResponse | null;
}

export const useNewsStore = create<NewsStore>()(
  persist(
    (set, get) => ({
      latestNewsCache: {},
      searchNewsCache: {},

      setLatestNews: (key, data) => {
        storeLogger.info(`Caching latest news for key: ${key}`);
        set((state) => {
          const newCache = {
            ...state.latestNewsCache,
            [key]: { data, timestamp: Date.now() },
          };
          // Enforce max cache size
          const keys = Object.keys(newCache);
          if (keys.length > MAX_CACHE_KEYS) {
            const oldestKey = keys.sort(
              (a, b) => newCache[a].timestamp - newCache[b].timestamp,
            )[0];
            delete newCache[oldestKey];
          }
          return { latestNewsCache: newCache };
        });
      },

      setSearchNews: (key, data) => {
        storeLogger.info(`Caching search news for key: ${key}`);
        set((state) => {
          const newCache = {
            ...state.searchNewsCache,
            [key]: { data, timestamp: Date.now() },
          };
          // Enforce max cache size
          const keys = Object.keys(newCache);
          if (keys.length > MAX_CACHE_KEYS) {
            const oldestKey = keys.sort(
              (a, b) => newCache[a].timestamp - newCache[b].timestamp,
            )[0];
            delete newCache[oldestKey];
          }
          return { searchNewsCache: newCache };
        });
      },

      clearCache: () => {
        storeLogger.info("Clearing news cache");
        set({ latestNewsCache: {}, searchNewsCache: {} });
      },

      getValidLatestNews: (key: string) => {
        const item = get().latestNewsCache[key];
        if (!item) return null;
        if (Date.now() - item.timestamp > CACHE_TTL_MS) {
          storeLogger.info(`Cache expired for latest news key: ${key}`);
          set((state) => {
            const nextCache = { ...state.latestNewsCache };
            delete nextCache[key];
            return { latestNewsCache: nextCache };
          });
          return null;
        }
        storeLogger.info(`Cache hit for latest news key: ${key}`);
        return item.data;
      },

      getValidSearchNews: (key: string) => {
        const item = get().searchNewsCache[key];
        if (!item) return null;
        if (Date.now() - item.timestamp > CACHE_TTL_MS) {
          storeLogger.info(`Cache expired for search news key: ${key}`);
          set((state) => {
            const nextCache = { ...state.searchNewsCache };
            delete nextCache[key];
            return { searchNewsCache: nextCache };
          });
          return null;
        }
        storeLogger.info(`Cache hit for search news key: ${key}`);
        return item.data;
      },
    }),
    {
      name: "news-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
