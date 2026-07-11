import { i18n } from "@/lib/i18n";
import { logger } from "@/lib/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const settingsLogger = logger.extend("Settings");

export type LanguageCode = "en" | "it" | "--";

export type AppSettings = {
  theme: "light" | "dark" | "system";
  antiSickness: boolean;
  journeyProgress: boolean;
  delayAlerts: boolean;
  weatherAlerts: boolean;
  language: LanguageCode;
  enableNewsApi: boolean;
};

const DEFAULTS: AppSettings = {
  theme: "system",
  antiSickness: false,
  journeyProgress: false,
  delayAlerts: false,
  weatherAlerts: false,
  language: "--",
  enableNewsApi: process.env.EXPO_PUBLIC_ENABLE_NEWS_API === "true",
};

export interface SettingsStore {
  settings: AppSettings;
  setSetting: <K extends keyof AppSettings>(
    key: K,
    val: AppSettings[K],
  ) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULTS,
      setSetting: (key, val) => {
        if (
          key === "enableNewsApi" &&
          process.env.EXPO_PUBLIC_ENABLE_NEWS_API !== "true"
        ) {
          val = false as AppSettings[typeof key];
        }
        settingsLogger.log(`Setting ${key} to ${val}`);
        set((state) => ({
          settings: { ...state.settings, [key]: val },
        }));
      },
      resetSettings: () => {
        set({ settings: DEFAULTS });
      },
    }),
    {
      name: "app:settings",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Enforce the environment variable as a master switch on load
        if (state && process.env.EXPO_PUBLIC_ENABLE_NEWS_API !== "true") {
          state.settings.enableNewsApi = false;
        }
      },
    },
  ),
);

// Subscribe to language changes outside of React to sync with i18n
useSettingsStore.subscribe((state, prevState) => {
  if (state.settings.language !== prevState?.settings?.language) {
    const lang = state.settings.language;
    if (["en", "it"].includes(lang)) {
      i18n.changeLanguage(lang);
    } else {
      i18n.changeLanguage(getLocales()[0].languageTag);
    }
  }
});
