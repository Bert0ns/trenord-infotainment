import { useEffect } from "react";
import { Platform } from "react-native";
import { useNotificationRegistryStore } from "@/store/notificationRegistryStore";
import { logger } from "@/lib/logger";

const obsLogger = logger.extend("NotificationObserver");

export function useNotificationObserver() {
  useEffect(() => {
    if (Platform.OS === "web") return;

    let Notifications: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      Notifications = require("expo-notifications");
    } catch {
      obsLogger.warn("expo-notifications is not available. Skipping observer.");
      return;
    }

    const subscription = Notifications.addNotificationReceivedListener(
      (notification: any) => {
        const { title, body } = notification.request.content;
        const timestamp = notification.date || Date.now();
        const id = notification.request.identifier;

        obsLogger.info(
          `Received notification in foreground/background: ${title}`,
        );

        useNotificationRegistryStore.getState().addHistoryItem({
          id,
          timestamp,
          title: title || "New Notification",
          body: body || "",
        });

        useNotificationRegistryStore
          .getState()
          .removeScheduledNotificationById(id);
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);
}
