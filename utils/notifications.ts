import { useNotificationRegistryStore } from "@/store/notificationRegistryStore";
import { logger } from "@/lib/logger";

const utilLogger = logger.extend("NotificationsUtil");

let Notifications: any;
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

export async function requestNotificationPermissionsAsync(): Promise<boolean> {
  if (!Notifications) return false;
  const permissions: any = await Notifications.getPermissionsAsync();
  let isGranted = permissions.granted;

  if (!isGranted && permissions.canAskAgain) {
    const requested: any = await Notifications.requestPermissionsAsync();
    isGranted = requested.granted;
  }

  return Boolean(isGranted);
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
    return;
  }

  const hasPermission = await requestNotificationPermissionsAsync();
  if (!hasPermission) {
    utilLogger.warn("Notification permissions not granted, skipping schedule.");
    return;
  }

  const {
    scheduledNotifications,
    addScheduledNotification,
    removeScheduledNotification,
  } = useNotificationRegistryStore.getState();
  const existing = scheduledNotifications[eventKey];

  if (existing) {
    if (existing.timestamp === triggerTimestamp) {
      utilLogger.log(
        `Trigger timestamp for ${eventKey} is unchanged (${triggerTimestamp}). Skipping schedule.`,
      );
      return;
    }

    // Target time changed, cancel the old one
    utilLogger.log(
      `Target time changed for ${eventKey}, canceling previous notification: ${existing.id}`,
    );
    await Notifications.cancelScheduledNotificationAsync(existing.id);
    removeScheduledNotification(eventKey);
  }

  const triggerDate = new Date(triggerTimestamp);

  if (triggerDate.getTime() <= Date.now()) {
    utilLogger.log(`Trigger date for ${eventKey} is in the past. Skipping.`);
    return;
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
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
    await Notifications.cancelScheduledNotificationAsync(existing.id);
    removeScheduledNotification(eventKey);
  }
}

export async function cancelAllEventNotifications() {
  if (!Notifications) {
    utilLogger.warn("Notifications module unavailable, cannot cancel all.");
    return;
  }

  utilLogger.log("Canceling all scheduled notifications.");
  await Notifications.cancelAllScheduledNotificationsAsync();

  const { clearAllScheduledNotifications } =
    useNotificationRegistryStore.getState();
  clearAllScheduledNotifications();
}
