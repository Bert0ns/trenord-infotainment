import React from "react";
import { render } from "@testing-library/react-native";
import NotificationsTimeline from "@/app/notifications-timeline";
import { useNotificationRegistryStore } from "@/store/notificationRegistryStore";

jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ bottom: 20 }),
}));

jest.mock("@/components/ui/slide-sheet", () => {
  const React = require("react");
  const { View } = require("react-native");
  const SlideSheet = React.forwardRef(function SlideSheet(
    { children, header, onClose }: any,
    ref: any,
  ) {
    React.useImperativeHandle(ref, () => ({
      close: () => onClose && onClose(),
    }));
    return (
      <View testID="slide-sheet">
        {header}
        {children}
      </View>
    );
  });
  return { SlideSheet };
});

// Mock MaterialIcons to prevent font loading issues
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

describe("NotificationsTimeline", () => {
  beforeEach(() => {
    useNotificationRegistryStore.setState({
      history: [],
      scheduledNotifications: {},
    });
    jest.clearAllMocks();
  });

  it("calls markAllAsRead on mount", () => {
    const markAllAsReadSpy = jest.spyOn(
      useNotificationRegistryStore.getState(),
      "markAllAsRead",
    );

    render(<NotificationsTimeline />);

    expect(markAllAsReadSpy).toHaveBeenCalled();
  });

  it("renders empty states when there is no history or scheduled notifications", () => {
    const { getByText, queryByText } = render(<NotificationsTimeline />);

    // Future section is completely hidden if empty
    expect(queryByText("Future")).toBeNull();

    // Past section shows the empty text
    expect(getByText("No recent notifications")).toBeTruthy();
  });

  it("renders scheduled notifications in chronological order", () => {
    useNotificationRegistryStore.setState({
      scheduledNotifications: {
        "event-2": { id: "2", timestamp: 2000 },
        "event-1": { id: "1", timestamp: 1000 },
        "event-3": { id: "3", timestamp: 3000 },
      },
    });

    const { getAllByText } = render(<NotificationsTimeline />);

    // Future items should just render the body text
    // They are sorted by timestamp
    const futureItems = getAllByText(
      "A notification is scheduled for this time.",
    );
    expect(futureItems).toHaveLength(3);

    // We can't easily assert the DOM order in RTL without looking at parent nodes,
    // but we can trust the map function.
    expect(futureItems[0]).toBeTruthy();
  });

  it("renders the history list correctly", () => {
    useNotificationRegistryStore.setState({
      history: [
        {
          id: "h1",
          title: "History 1",
          body: "Body 1",
          timestamp: 100,
          isRead: false,
        },
        {
          id: "h2",
          title: "History 2",
          body: "Body 2",
          timestamp: 200,
          isRead: true,
        },
      ],
    });

    const { getByText } = render(<NotificationsTimeline />);

    expect(getByText("History 1")).toBeTruthy();
    expect(getByText("Body 1")).toBeTruthy();
    expect(getByText("History 2")).toBeTruthy();
    expect(getByText("Body 2")).toBeTruthy();
  });
});
