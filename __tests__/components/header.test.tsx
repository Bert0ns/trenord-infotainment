import React from "react";
import { render } from "@testing-library/react-native";
import Header from "@/components/header";

jest.mock("@/hooks/use-theme-color", () => ({
  createStyleHook: () => () => ({
    headerContainer: {},
    headerContent: {},
    headerTitle: {},
    iconButton: {},
    iconColor: {},
    centerContent: {},
    logo: {},
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 40 }),
}));

describe("Header", () => {
  it("renders correctly", () => {
    const { getByText } = render(<Header />);
    expect(getByText("TRENORD")).toBeTruthy();
  });
});
