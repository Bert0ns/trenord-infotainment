import React from "react";
import { render } from "@testing-library/react-native";
import SectionHeader from "@/components/sectionHeader";

jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

jest.mock("@/hooks/use-theme-color", () => ({
  createStyleHook: () => () => ({
    container: {},
    firstContainer: {},
    title: {},
    titleHome: {},
    seeAll: {},
    iconColor: { color: "#000" },
    seeMore: {},
  }),
}));

describe("SectionHeader", () => {
  it("renders correctly with default props", () => {
    const { getByText } = render(<SectionHeader title="Test Title" />);
    expect(getByText("Test Title")).toBeTruthy();
  });

  it("renders correctly for home type", () => {
    const { getByText } = render(
      <SectionHeader title="Home Title" type="home" />,
    );
    expect(getByText("Home Title")).toBeTruthy();
    expect(getByText("See more")).toBeTruthy();
  });

  it("renders correctly for media type", () => {
    const { getByText } = render(
      <SectionHeader title="Media Title" type="media" isFirst />,
    );
    expect(getByText("Media Title")).toBeTruthy();
    expect(getByText("See all")).toBeTruthy();
  });
});
