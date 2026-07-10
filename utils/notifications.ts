import * as Notifications from "expo-notifications";
import { useNotificationRegistryStore } from "@/store/notificationRegistryStore";
import { logger } from "@/lib/logger";

const utilLogger = logger.extend("NotificationsUtil");

export async function requestNotificationPermissionsAsync(): Promise<boolean> {
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
    trigger: {
      type: "date",
      date: triggerDate,
    } as Notifications.NotificationTriggerInput,
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
  const { scheduledNotifications, removeScheduledNotification } =
    useNotificationRegistryStore.getState();
  const existing = scheduledNotifications[eventKey];

  if (existing) {
    utilLogger.log(`Canceling notification for ${eventKey}: ${existing.id}`);
    await Notifications.cancelScheduledNotificationAsync(existing.id);
    removeScheduledNotification(eventKey);
  }
}

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
