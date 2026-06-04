import React from "react";
import { render } from "@testing-library/react-native";
import DiscoverCard from "@/components/discoveryCard";

jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

jest.mock("@/hooks/use-theme-color", () => ({
  createStyleHook: () => () => ({
    newsCard: {},
    tag: {},
    newsText: {},
    discoverCard: {},
    image: {},
    info: {},
    discoverTitle: {},
    discoverSubtitle: {},
    button: {},
    buttonText: {},
  }),
  useTheme: () => ({
    colors: { primaryForeground: "#fff" }
  })
}));

describe("DiscoverCard", () => {
  it("renders correctly", () => {
    const { getByText } = render(
      <DiscoverCard 
        title="Duomo di Milano" 
        category="Landmark" 
        distance="2 km" 
        imageSource={{ uri: "https://example.com/duomo.jpg" }} 
      />
    );
    expect(getByText("Duomo di Milano")).toBeTruthy();
    expect(getByText("Landmark • 2 km")).toBeTruthy();
    expect(getByText("Directions")).toBeTruthy();
  });
});
