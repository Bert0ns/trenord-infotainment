import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { logger } from "@/lib/logger";

const storeLogger = logger.extend("NotificationRegistry");

export interface ScheduledNotificationInfo {
  id: string;
  timestamp: number;
}

export interface NotificationEvent {
  id: string;
  timestamp: number;
  title: string;
  body: string;
  isRead: boolean;
}

export interface NotificationRegistryState {
  scheduledNotifications: Record<string, ScheduledNotificationInfo>;
  addScheduledNotification: (
    eventKey: string,
    info: ScheduledNotificationInfo,
  ) => void;
  removeScheduledNotification: (eventKey: string) => void;
  clearAllScheduledNotifications: () => void;

  // History
  history: NotificationEvent[];
  addHistoryItem: (event: Omit<NotificationEvent, "isRead">) => void;
  markAllAsRead: () => void;
  clearHistory: () => void;
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

      history: [],
      addHistoryItem: (event) => {
        storeLogger.info(`Adding history item: ${event.title}`);
        set((state) => {
          const newItem: NotificationEvent = { ...event, isRead: false };
          // Keep only the 50 most recent items to avoid memory bloat
          const newHistory = [newItem, ...state.history].slice(0, 50);
          return { history: newHistory };
        });
      },
      markAllAsRead: () => {
        storeLogger.info("Marking all history items as read");
        set((state) => ({
          history: state.history.map((item) => ({ ...item, isRead: true })),
        }));
      },
      clearHistory: () => {
        storeLogger.info("Clearing notification history");
        set({ history: [] });
      },
    }),
    {
      name: "notification-registry-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
