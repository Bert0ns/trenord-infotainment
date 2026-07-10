import {
  scheduleEventNotification,
  cancelEventNotification,
} from "@/utils/notifications";
import * as Notifications from "expo-notifications";
import { useNotificationRegistryStore } from "@/store/notificationRegistryStore";

describe("notificationsUtil", () => {
  beforeEach(() => {
    useNotificationRegistryStore.setState({ scheduledNotifications: {} });
    jest.clearAllMocks();
  });

  it("checks settings/preferences before scheduling (skips if disabled)", async () => {
    await scheduleEventNotification(
      "test-event",
      false,
      Date.now() + 10000,
      "Title",
      "Body",
    );
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("requests OS permissions when scheduled and status is not yet granted", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      granted: false,
      canAskAgain: true,
    });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      granted: true,
    });

    await scheduleEventNotification(
      "test-event",
      true,
      Date.now() + 10000,
      "Title",
      "Body",
    );

    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
  });

  it("does not fire / schedule if notification permission is denied", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      granted: false,
      canAskAgain: false,
    });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      granted: false,
    });

    await scheduleEventNotification(
      "test-event",
      true,
      Date.now() + 10000,
      "Title",
      "Body",
    );

    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("does not schedule if trigger time is in the past", async () => {
    await scheduleEventNotification(
      "test-event",
      true,
      Date.now() - 10000,
      "Title",
      "Body",
    );
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("cancels any existing scheduled notification for the same event key before scheduling a new one", async () => {
    const futureTime1 = Date.now() + 10000;
    const futureTime2 = Date.now() + 20000;

    // First schedule
    await scheduleEventNotification(
      "test-event",
      true,
      futureTime1,
      "Title",
      "Body",
    );

    // Second schedule with different time
    await scheduleEventNotification(
      "test-event",
      true,
      futureTime2,
      "Title",
      "Body",
    );

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      "mock-notification-id",
    );
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
  });

  it("optimizes scheduling: skips calling expo-notifications schedule API if target trigger timestamp is unchanged", async () => {
    const futureTime = Date.now() + 10000;

    // First schedule
    await scheduleEventNotification(
      "test-event",
      true,
      futureTime,
      "Title",
      "Body",
    );

    // Second schedule with same time
    await scheduleEventNotification(
      "test-event",
      true,
      futureTime,
      "Title",
      "Body",
    );

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(
      Notifications.cancelScheduledNotificationAsync,
    ).not.toHaveBeenCalled();
  });

  it("cancelEventNotification cancels OS notification and removes from registry", async () => {
    const futureTime = Date.now() + 10000;
    await scheduleEventNotification(
      "test-event",
      true,
      futureTime,
      "Title",
      "Body",
    );

    await cancelEventNotification("test-event");

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      "mock-notification-id",
    );
    expect(
      useNotificationRegistryStore.getState().scheduledNotifications[
        "test-event"
      ],
    ).toBeUndefined();
  });
});
