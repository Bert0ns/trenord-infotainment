import { useNotificationRegistryStore } from "@/store/notificationRegistryStore";

describe("notificationRegistryStore", () => {
  beforeEach(() => {
    // Reset state before each test
    useNotificationRegistryStore.setState({ scheduledIds: {} });
    jest.clearAllMocks();
  });

  it("initializes with empty scheduledIds", () => {
    const { scheduledIds } = useNotificationRegistryStore.getState();
    expect(scheduledIds).toEqual({});
  });

  it("addScheduledId updates the store state correctly", () => {
    const { addScheduledId } = useNotificationRegistryStore.getState();
    addScheduledId("test-event", "test-id");
    const { scheduledIds } = useNotificationRegistryStore.getState();
    expect(scheduledIds).toEqual({ "test-event": "test-id" });
  });

  it("removeScheduledId updates the store state correctly", () => {
    const { addScheduledId, removeScheduledId } =
      useNotificationRegistryStore.getState();
    addScheduledId("test-event", "test-id");
    addScheduledId("test-event-2", "test-id-2");

    removeScheduledId("test-event");
    const { scheduledIds } = useNotificationRegistryStore.getState();

    expect(scheduledIds).toEqual({ "test-event-2": "test-id-2" });
  });

  it("clearAllScheduledIds resets the state", () => {
    const { addScheduledId, clearAllScheduledIds } =
      useNotificationRegistryStore.getState();
    addScheduledId("test-event", "test-id");
    addScheduledId("test-event-2", "test-id-2");

    clearAllScheduledIds();
    const { scheduledIds } = useNotificationRegistryStore.getState();

    expect(scheduledIds).toEqual({});
  });
});
