import { useNotificationRegistryStore } from "@/store/notificationRegistryStore";

describe("notificationRegistryStore", () => {
  beforeEach(() => {
    // Reset state before each test
    useNotificationRegistryStore.setState({
      scheduledNotifications: {},
      history: [],
    });
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

  it("removeScheduledNotificationById updates the store state correctly", () => {
    const { addScheduledNotification, removeScheduledNotificationById } =
      useNotificationRegistryStore.getState();
    addScheduledNotification("test-event", { id: "test-id", timestamp: 1000 });
    addScheduledNotification("test-event-2", {
      id: "test-id-2",
      timestamp: 2000,
    });

    removeScheduledNotificationById("test-id");
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

  it("initializes with an empty history array", () => {
    const { history } = useNotificationRegistryStore.getState();
    expect(history).toEqual([]);
  });

  it("addHistoryItem updates the store state and prepends items, capped at 50", () => {
    const { addHistoryItem } = useNotificationRegistryStore.getState();

    // Add first item
    addHistoryItem({
      id: "id-1",
      timestamp: 1000,
      title: "Title 1",
      body: "Body 1",
    });
    let { history } = useNotificationRegistryStore.getState();
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual({
      id: "id-1",
      timestamp: 1000,
      title: "Title 1",
      body: "Body 1",
      isRead: false,
    });

    // Add second item, check prepend
    addHistoryItem({
      id: "id-2",
      timestamp: 2000,
      title: "Title 2",
      body: "Body 2",
    });
    history = useNotificationRegistryStore.getState().history;
    expect(history).toHaveLength(2);
    expect(history[0].id).toBe("id-2");
    expect(history[1].id).toBe("id-1");

    // Test cap at 50
    for (let i = 0; i < 55; i++) {
      useNotificationRegistryStore.getState().addHistoryItem({
        id: `id-loop-${i}`,
        timestamp: 3000,
        title: "T",
        body: "B",
      });
    }
    history = useNotificationRegistryStore.getState().history;
    expect(history).toHaveLength(50);
  });

  it("markAllAsRead marks all history items as read", () => {
    const { addHistoryItem, markAllAsRead } =
      useNotificationRegistryStore.getState();
    addHistoryItem({
      id: "id-1",
      timestamp: 1000,
      title: "Title 1",
      body: "Body 1",
    });
    addHistoryItem({
      id: "id-2",
      timestamp: 2000,
      title: "Title 2",
      body: "Body 2",
    });

    let { history } = useNotificationRegistryStore.getState();
    expect(history[0].isRead).toBe(false);
    expect(history[1].isRead).toBe(false);

    markAllAsRead();

    history = useNotificationRegistryStore.getState().history;
    expect(history[0].isRead).toBe(true);
    expect(history[1].isRead).toBe(true);
  });

  it("clearHistory empties the history array", () => {
    const { addHistoryItem, clearHistory } =
      useNotificationRegistryStore.getState();
    addHistoryItem({
      id: "id-1",
      timestamp: 1000,
      title: "Title 1",
      body: "Body 1",
    });

    expect(useNotificationRegistryStore.getState().history).toHaveLength(1);

    clearHistory();

    expect(useNotificationRegistryStore.getState().history).toHaveLength(0);
  });
});
