import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "@/lib/logger";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

/**
 * Shape for the global app settings.
 * Modify this to add new settings, and they will automatically be persisted and available via the `useSettings` hook.
 */
export type AppSettings = {
  theme: "light" | "dark" | "system";
  antiSickness: boolean;
  journeyProgress: boolean;
  delayAlerts: boolean;
  weatherAlerts: boolean;
  language: string;
};

/**
 * Default values for global app settings.
 */
const DEFAULTS: AppSettings = {
  theme: "system",
  antiSickness: false,
  journeyProgress: true,
  delayAlerts: true,
  weatherAlerts: false,
  language: "English (UK)",
};

const KEY = "app:settings";

export type SettingsCtx = {
  settings: AppSettings;
  set: <K extends keyof AppSettings>(key: K, val: AppSettings[K]) => void;
  reset: () => void;
};

const SettingsContext = createContext<SettingsCtx | null>(null);

/**
 * Provider component that wraps the app and provides access to global settings.
 *
 * Settings are persisted in AsyncStorage under the key "app:settings". When the provider mounts, it loads settings from storage and merges them with defaults.
 * The `set` function allows updating individual settings, which also updates storage. The `reset` function clears storage and resets to defaults.
 *
 * To access settings in any component, use the `useSettings` hook.
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw) {
        try {
          setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
        } catch (e) {
          logger.error("Failed to parse settings:", e);
        }
      }
    });
  }, []);

  const set = useCallback(
    <K extends keyof AppSettings>(key: K, val: AppSettings[K]) => {
      logger.log(`Setting ${key} to ${val}`);
      setSettings((prev) => {
        const next = { ...prev, [key]: val };
        AsyncStorage.setItem(KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const reset = useCallback(() => {
    AsyncStorage.removeItem(KEY);
    setSettings(DEFAULTS);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, set, reset }}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Hook to access global app settings. Must be used within a `SettingsProvider`.
 *
 * Returns an object with the current `settings`, a `set` function to update individual settings,
 * and a `reset` function to clear all settings back to defaults.
 */
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be inside <SettingsProvider>");
  return ctx;
}
