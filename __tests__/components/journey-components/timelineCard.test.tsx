import React from "react";
import { render } from "@testing-library/react-native";
import TimelineCard from "@/components/journey-components/timelineCard";

jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

jest.mock("@/hooks/use-theme-color", () => ({
  createStyleHook: () => () => ({
    container: {},
    timelineColumn: {},
    line: {},
    dot: {},
    dotCurrent: {},
    contentColumn: {},
    card: {},
    currentCard: {},
    headerRow: {},
    stationName: {},
    currentStationName: {},
    textMuted: {},
    subInfoRow: {},
    subInfoText: {},
    onTimeRow: {},
    arrivingText: {},
    delayBadge: {},
    delayText: {},
    timeContainer: {},
    scheduledTime: {},
    timeStrikethrough: {},
    timeCurrent: {},
    statusText: {},
    inMinsText: {},
  }),
  useTheme: () => ({
    colors: {
      border: "gray",
      primary: "blue",
      destructive: "red",
      background: "white",
      secondary: "lightblue",
      foreground: "black",
      mutedForeground: "lightgray",
      destructiveForeground: "white",
    },
    spacing: { sm: 4, md: 8, xl: 24 },
    borderRadius: { lg: 8, xl: 12 },
  }),
}));

describe("TimelineCard", () => {
  it("renders correctly as a past station", () => {
    const { getByText } = render(
      <TimelineCard
        status="past"
        stationName="Milano Centrale"
        scheduledTime="10:00"
        actualTime="10:05"
        platform="3"
      />
    );
    expect(getByText("Milano Centrale")).toBeTruthy();
    expect(getByText("10:00")).toBeTruthy();
    expect(getByText("Departed at 10:05")).toBeTruthy();
    expect(getByText("Platform 3")).toBeTruthy();
  });

  it("renders correctly as a current station with delay", () => {
    const { getByText } = render(
      <TimelineCard
        status="current"
        stationName="Monza"
        scheduledTime="10:30"
        actualTime="10:30"
        platform="2"
        delayMinutes={5}
      />
    );
    expect(getByText("Monza")).toBeTruthy();
    expect(getByText("10:30")).toBeTruthy();
    expect(getByText("Arriving in 5 min • Platform 2")).toBeTruthy();
    expect(getByText("+ 5 min delay")).toBeTruthy();
  });

  it("renders correctly as a future station", () => {
    const { getByText } = render(
      <TimelineCard
        status="future"
        stationName="Lecco"
        scheduledTime="11:00"
        estimatedTime="11:02"
      />
    );
    expect(getByText("Lecco")).toBeTruthy();
    expect(getByText("11:00")).toBeTruthy();
    expect(getByText("11:02")).toBeTruthy();
  });

  it("renders correctly when cancelled", () => {
    const { getByText } = render(
      <TimelineCard
        status="future"
        stationName="Como"
        scheduledTime="12:00"
        isCancelled={true}
      />
    );
    expect(getByText("Como")).toBeTruthy();
    expect(getByText("12:00")).toBeTruthy();
    expect(getByText("Cancelled")).toBeTruthy();
  });
});
