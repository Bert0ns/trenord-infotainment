import React from "react";
import { render } from "@testing-library/react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";

jest.mock("expo-symbols", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    SymbolView: (props: any) => React.createElement(Text, { testID: "symbol-icon", ...props }, props.name)
  };
});

describe("IconSymbol", () => {
  it("renders correctly with mapped name", () => {
    const { getByTestId } = render(<IconSymbol name="house.fill" color="red" />);
    const icon = getByTestId("symbol-icon");
    expect(icon).toBeTruthy();
    expect(icon.props.name).toBe("house.fill");
    expect(icon.props.tintColor).toBe("red");
  });

  it("renders correctly with custom size", () => {
    const { getByTestId } = render(<IconSymbol name="chevron.right" color="blue" size={32} />);
    const icon = getByTestId("symbol-icon");
    expect(icon.props.name).toBe("chevron.right");
    expect(icon.props.tintColor).toBe("blue");
  });
});
