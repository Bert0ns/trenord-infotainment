import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { logger } from "@/lib/logger";

const storeLogger = logger.extend("NotificationRegistry");

export interface ScheduledNotificationInfo {
  id: string;
  timestamp: number;
}

export interface NotificationRegistryState {
  scheduledNotifications: Record<string, ScheduledNotificationInfo>;
  addScheduledNotification: (
    eventKey: string,
    info: ScheduledNotificationInfo,
  ) => void;
  removeScheduledNotification: (eventKey: string) => void;
  clearAllScheduledNotifications: () => void;
}

export const useNotificationRegistryStore = create<NotificationRegistryState>()(
  persist(
    (set) => ({
      scheduledNotifications: {},
      addScheduledNotification: (eventKey, info) => {
        storeLogger.info(
          `Adding scheduled notification for ${eventKey}: ${info.id} at ${info.timestamp}`,
        );
        set((state) => ({
          scheduledNotifications: {
            ...state.scheduledNotifications,
            [eventKey]: info,
          },
        }));
      },
      removeScheduledNotification: (eventKey) => {
        storeLogger.info(`Removing scheduled notification for ${eventKey}`);
        set((state) => {
          const newScheduledNotifications = { ...state.scheduledNotifications };
          delete newScheduledNotifications[eventKey];
          return { scheduledNotifications: newScheduledNotifications };
        });
      },
      clearAllScheduledNotifications: () => {
        storeLogger.info("Clearing all scheduled notifications");
        set({ scheduledNotifications: {} });
      },
    }),
    {
      name: "notification-registry-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
