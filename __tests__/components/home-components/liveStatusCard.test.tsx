import React from "react";
import { render } from "@testing-library/react-native";
import LiveStatusCard from "@/components/home-components/liveStatusCard";

jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

jest.mock("@/hooks/use-theme-color", () => ({
  createStyleHook: () => () => ({
    card: {},
    topRow: {},
    label: {},
    delayBadge: {},
    delayText: {},
    onTimeText: {},
    stationName: {},
    arrTime: {},
    divider: {},
    bottomRow: {},
    infoBlock: {},
    valueRow: {},
    icon: {},
    valueText: {},
  }),
  useTheme: () => ({
    colors: {
      homeLiveStatus: "blue",
      homeSecondary: "gray",
      destructive: "red",
      destructiveForeground: "white",
      info: "green",
      infoForeground: "white",
    },
    spacing: { lg: 16, md: 8, xl: 24 },
    borderRadius: { xl: 12 },
  }),
}));

describe("LiveStatusCard", () => {
  it("renders correctly with delay", () => {
    const { getByText } = render(
      <LiveStatusCard
        nextStop="Milano Centrale"
        arrivalTime="10:30"
        destination="Rome"
        destinationArrivalTime="11:30"
        speed="120 km/h"
        trainNumber="1234"
        delayMinutes={5}
      />,
    );
    expect(getByText("Milano Centrale")).toBeTruthy();
    expect(getByText("Arr: 10:30")).toBeTruthy();
    expect(getByText("+ 5 min delay")).toBeTruthy();
    expect(getByText("Rome")).toBeTruthy();
    expect(getByText("Arr: 11:30")).toBeTruthy();
    expect(getByText("120 km/h")).toBeTruthy();
    expect(getByText("1234")).toBeTruthy();
  });

  it("renders correctly without delay", () => {
    const { getByText, queryByText } = render(
      <LiveStatusCard
        nextStop="Lecco"
        arrivalTime="11:15"
        destination="Sondrio"
        destinationArrivalTime="12:00"
        speed="80 km/h"
        trainNumber="5678"
        delayMinutes={0}
      />,
    );
    expect(getByText("Lecco")).toBeTruthy();
    expect(getByText("Arr: 11:15")).toBeTruthy();
    expect(getByText("On Time")).toBeTruthy();
    expect(queryByText("delay")).toBeFalsy();
  });
});
