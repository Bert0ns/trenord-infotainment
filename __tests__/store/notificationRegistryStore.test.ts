import { useNotificationRegistryStore } from "@/store/notificationRegistryStore";

describe("notificationRegistryStore", () => {
  beforeEach(() => {
    // Reset state before each test
    useNotificationRegistryStore.setState({ scheduledNotifications: {} });
    jest.clearAllMocks();
  });

  it("initializes with empty scheduledNotifications", () => {
    const { scheduledNotifications } = useNotificationRegistryStore.getState();
    expect(scheduledNotifications).toEqual({});
  });

  it("addScheduledNotification updates the store state correctly", () => {
    const { addScheduledNotification } =
      useNotificationRegistryStore.getState();
    addScheduledNotification("test-event", { id: "test-id", timestamp: 1000 });
    const { scheduledNotifications } = useNotificationRegistryStore.getState();
    expect(scheduledNotifications).toEqual({
      "test-event": { id: "test-id", timestamp: 1000 },
    });
  });

  it("removeScheduledNotification updates the store state correctly", () => {
    const { addScheduledNotification, removeScheduledNotification } =
      useNotificationRegistryStore.getState();
    addScheduledNotification("test-event", { id: "test-id", timestamp: 1000 });
    addScheduledNotification("test-event-2", {
      id: "test-id-2",
      timestamp: 2000,
    });

    removeScheduledNotification("test-event");
    const { scheduledNotifications } = useNotificationRegistryStore.getState();

    expect(scheduledNotifications).toEqual({
      "test-event-2": { id: "test-id-2", timestamp: 2000 },
    });
  });

  it("clearAllScheduledNotifications resets the state", () => {
    const { addScheduledNotification, clearAllScheduledNotifications } =
      useNotificationRegistryStore.getState();
    addScheduledNotification("test-event", { id: "test-id", timestamp: 1000 });
    addScheduledNotification("test-event-2", {
      id: "test-id-2",
      timestamp: 2000,
    });

    clearAllScheduledNotifications();
    const { scheduledNotifications } = useNotificationRegistryStore.getState();

    expect(scheduledNotifications).toEqual({});
  });
});
