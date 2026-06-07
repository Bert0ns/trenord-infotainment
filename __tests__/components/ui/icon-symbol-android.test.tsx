import React from "react";
import { render } from "@testing-library/react-native";

// Force import the non-iOS implementation
import { IconSymbol } from "@/components/ui/icon-symbol";

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");
jest.mock("expo-symbols", () => ({
  SFSymbol: "SFSymbol",
  SymbolWeight: "SymbolWeight",
}));

describe("IconSymbol (Non-iOS)", () => {
  it("renders MaterialIcons with correct name", () => {
    const { toJSON } = render(<IconSymbol name="house.fill" color="red" />);
    const json = toJSON();
    expect(json).toBeTruthy();
  });

  it("renders correctly with custom size", () => {
    const { toJSON } = render(
      <IconSymbol name="chevron.right" color="blue" size={32} />,
    );
    const json = toJSON();
    expect(json).toBeTruthy();
  });
});
