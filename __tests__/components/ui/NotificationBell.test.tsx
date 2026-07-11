import React from "react";
import { render } from "@testing-library/react-native";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { useNotificationRegistryStore } from "@/store/notificationRegistryStore";

describe("NotificationBell", () => {
  beforeEach(() => {
    useNotificationRegistryStore.setState({
      history: [],
      scheduledNotifications: {},
    });
    jest.clearAllMocks();
  });

  it("does not render a badge when there are 0 unread notifications", () => {
    const { queryByText } = render(<NotificationBell onPress={jest.fn()} />);
    expect(queryByText("0")).toBeNull();
  });

  it("renders the exact number when unread count is between 1 and 9", () => {
    useNotificationRegistryStore.setState({
      history: [
        { id: "1", title: "T1", body: "B1", timestamp: 100, isRead: false },
        { id: "2", title: "T2", body: "B2", timestamp: 200, isRead: false },
        { id: "3", title: "T3", body: "B3", timestamp: 300, isRead: true },
      ],
    });

    const { getByText } = render(<NotificationBell onPress={jest.fn()} />);
    expect(getByText("2")).toBeTruthy();
  });

  it("renders '9+' when unread count exceeds 9", () => {
    const manyUnread = Array.from({ length: 15 }).map((_, i) => ({
      id: String(i),
      title: "Title",
      body: "Body",
      timestamp: 100,
      isRead: false,
    }));
    useNotificationRegistryStore.setState({ history: manyUnread });

    const { getByText } = render(<NotificationBell onPress={jest.fn()} />);
    expect(getByText("9+")).toBeTruthy();
  });
});
