import React from "react";
import { render } from "@testing-library/react-native";
import WeatherCard from "@/components/home-components/weatherCard";

jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

jest.mock("@/hooks/use-theme-color", () => ({
  createStyleHook: () => () => ({
    card: {},
    icon: {},
    label: {},
    value: {},
  }),
  useTheme: () => ({
    colors: {
      warning: "yellow",
      cloud: "gray",
      info: "blue",
      primary: "red",
      muted: "lightgray",
      mutedForeground: "gray",
      foreground: "black",
    },
    spacing: { md: 8, lg: 16 },
    borderRadius: { lg: 8 },
  }),
}));

describe("WeatherCard", () => {
  it("renders loading state when data is null", () => {
    const { getByText } = render(<WeatherCard data={null} />);
    expect(getByText("Loading weather...")).toBeTruthy();
  });

  it("renders correctly with sunny weather", () => {
    const data = {
      city: "Milano",
      time: "10:00",
      temperature: 25,
      condition: "Sunny",
    };
    const { getByText } = render(<WeatherCard data={data} />);
    expect(getByText("Milano at 10:00")).toBeTruthy();
    expect(getByText("25°C, Sunny")).toBeTruthy();
  });

  it("renders correctly with cloudy weather", () => {
    const data = {
      city: "Monza",
      time: "11:00",
      temperature: 20,
      condition: "Cloudy",
    };
    const { getByText } = render(<WeatherCard data={data} />);
    expect(getByText("Monza at 11:00")).toBeTruthy();
    expect(getByText("20°C, Cloudy")).toBeTruthy();
  });

  it("renders correctly with rainy weather", () => {
    const data = {
      city: "Lecco",
      time: "12:00",
      temperature: 15,
      condition: "Rain",
    };
    const { getByText } = render(<WeatherCard data={data} />);
    expect(getByText("Lecco at 12:00")).toBeTruthy();
    expect(getByText("15°C, Rain")).toBeTruthy();
  });

  it("renders correctly with other weather", () => {
    const data = {
      city: "Como",
      time: "13:00",
      temperature: 10,
      condition: "Snow",
    };
    const { getByText } = render(<WeatherCard data={data} />);
    expect(getByText("Como at 13:00")).toBeTruthy();
    expect(getByText("10°C, Snow")).toBeTruthy();
  });
});
