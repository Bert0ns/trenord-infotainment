import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { logger } from "@/lib/logger";

const storeLogger = logger.extend("NotificationRegistry");

export interface NotificationRegistryState {
  scheduledIds: Record<string, string>;
  addScheduledId: (eventKey: string, notificationId: string) => void;
  removeScheduledId: (eventKey: string) => void;
  clearAllScheduledIds: () => void;
}

export const useNotificationRegistryStore = create<NotificationRegistryState>()(
  persist(
    (set) => ({
      scheduledIds: {},
      addScheduledId: (eventKey, notificationId) => {
        storeLogger.info(
          `Adding scheduled ID for ${eventKey}: ${notificationId}`,
        );
        set((state) => ({
          scheduledIds: {
            ...state.scheduledIds,
            [eventKey]: notificationId,
          },
        }));
      },
      removeScheduledId: (eventKey) => {
        storeLogger.info(`Removing scheduled ID for ${eventKey}`);
        set((state) => {
          const newScheduledIds = { ...state.scheduledIds };
          delete newScheduledIds[eventKey];
          return { scheduledIds: newScheduledIds };
        });
      },
      clearAllScheduledIds: () => {
        storeLogger.info("Clearing all scheduled notification IDs");
        set({ scheduledIds: {} });
      },
    }),
    {
      name: "notification-registry-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
