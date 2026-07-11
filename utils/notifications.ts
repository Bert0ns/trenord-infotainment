import { Platform } from "react-native";
import { useNotificationRegistryStore } from "@/store/notificationRegistryStore";
import { logger } from "@/lib/logger";

const utilLogger = logger.extend("NotificationsUtil");

// In-memory lock to prevent race conditions during React Strict Mode double-renders
const pendingSchedules = new Map<string, number>();

let Notifications: any;
if (Platform.OS !== "web") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Notifications = require("expo-notifications");

    // Global handler behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch {
    utilLogger.warn(
      "expo-notifications is not available (likely running in Expo Go on Android). Notifications will be disabled.",
    );
    Notifications = null;
  }
}

export async function requestNotificationPermissionsAsync(): Promise<boolean> {
  if (!Notifications) return false;
  try {
    const permissions: any = await Notifications.getPermissionsAsync();
    let isGranted = permissions?.granted;

    if (!isGranted && permissions?.canAskAgain) {
      const requested: any = await Notifications.requestPermissionsAsync();
      isGranted = requested?.granted;
    }

    return Boolean(isGranted);
  } catch (error) {
    utilLogger.warn("Failed to request notification permissions:", error);
    return false;
  }
}

export async function scheduleEventNotification(
  eventKey: string,
  isEnabled: boolean,
  triggerTimestamp: number,
  title: string,
  body: string,
) {
  if (!Notifications) {
    utilLogger.warn("Notifications module unavailable, cannot schedule.");
    return;
  }

  if (!isEnabled) {
    utilLogger.log(
      `Skipping notification for ${eventKey} because it is disabled in settings.`,
    );
    await cancelEventNotification(eventKey);
    return;
  }

  const {
    scheduledNotifications,
    addScheduledNotification,
    removeScheduledNotification,
  } = useNotificationRegistryStore.getState();
  const existing = scheduledNotifications[eventKey];

  // Prevent concurrent identical schedules
  if (
    (existing && existing.timestamp === triggerTimestamp) ||
    pendingSchedules.get(eventKey) === triggerTimestamp
  ) {
    utilLogger.log(
      `Trigger timestamp for ${eventKey} is unchanged or already pending (${triggerTimestamp}). Skipping schedule.`,
    );
    return;
  }

  // Lock this specific event + timestamp
  pendingSchedules.set(eventKey, triggerTimestamp);

  try {
    const hasPermission = await requestNotificationPermissionsAsync();
    if (!hasPermission) {
      utilLogger.warn(
        "Notification permissions not granted, skipping schedule.",
      );
      return;
    }

    if (existing) {
      // Target time changed, cancel the old one
      utilLogger.log(
        `Target time changed for ${eventKey}, canceling previous notification: ${existing.id}`,
      );
      await Notifications.cancelScheduledNotificationAsync?.(existing.id);
      removeScheduledNotification(eventKey);
    }

    const triggerDate = new Date(triggerTimestamp);

    if (triggerDate.getTime() <= Date.now()) {
      utilLogger.log(`Trigger date for ${eventKey} is in the past. Skipping.`);
      return;
    }

    const notificationId = await Notifications.scheduleNotificationAsync?.({
      content: {
        title,
        body,
      },
      trigger: { type: "date", date: new Date(triggerTimestamp) } as any,
    });

    utilLogger.log(
      `Scheduled new notification for ${eventKey} with ID ${notificationId} at ${triggerDate.toISOString()}`,
    );
    addScheduledNotification(eventKey, {
      id: notificationId,
      timestamp: triggerTimestamp,
    });
  } finally {
    // Release lock if it hasn't been overwritten by a newer request
    if (pendingSchedules.get(eventKey) === triggerTimestamp) {
      pendingSchedules.delete(eventKey);
    }
  }
}

export async function cancelEventNotification(eventKey: string) {
  if (!Notifications) {
    utilLogger.warn("Notifications module unavailable, cannot cancel.");
    return;
  }

  const { scheduledNotifications, removeScheduledNotification } =
    useNotificationRegistryStore.getState();
  const existing = scheduledNotifications[eventKey];

  if (existing) {
    utilLogger.log(`Canceling notification for ${eventKey}: ${existing.id}`);
    await Notifications.cancelScheduledNotificationAsync?.(existing.id);
    removeScheduledNotification(eventKey);
  }

  pendingSchedules.delete(eventKey);
}

export async function cancelAllEventNotifications() {
  if (!Notifications) {
    utilLogger.warn("Notifications module unavailable, cannot cancel all.");
    return;
  }

  utilLogger.log("Canceling all scheduled notifications.");
  await Notifications.cancelAllScheduledNotificationsAsync?.();

  const { clearAllScheduledNotifications } =
    useNotificationRegistryStore.getState();
  clearAllScheduledNotifications();
  pendingSchedules.clear();
}
