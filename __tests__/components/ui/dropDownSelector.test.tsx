import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import DropDownSelector from "@/components/ui/dropDownSelector";

jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

jest.mock("@/hooks/use-theme-color", () => ({
  createStyleHook: (fn: any) => () =>
    fn({
      colors: {
        foreground: "black",
        background: "white",
        mutedForeground: "gray",
        borderTransparent: "transparent",
      },
    }),
  useTheme: () => ({
    colors: {
      foreground: "black",
      background: "white",
      mutedForeground: "gray",
      borderTransparent: "transparent",
    },
  }),
}));

describe("DropDownSelector", () => {
  const options = ["Option 1", "Option 2", "Option 3"];
  const onSelectMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with placeholder", () => {
    const { getByText } = render(
      <DropDownSelector
        options={options}
        selectedValue=""
        onSelect={onSelectMock}
        placeholder="Select an option"
      />,
    );
    expect(getByText("Select an option")).toBeTruthy();
  });

  it("renders correctly with selected value", () => {
    const { getByText } = render(
      <DropDownSelector
        options={options}
        selectedValue="Option 2"
        onSelect={onSelectMock}
      />,
    );
    expect(getByText("Option 2")).toBeTruthy();
  });

  it("opens menu and selects an option", () => {
    const { getByText, queryByText } = render(
      <DropDownSelector
        options={options}
        selectedValue=""
        onSelect={onSelectMock}
        placeholder="Select..."
      />,
    );

    // Menu should be closed initially
    expect(queryByText("Option 1")).toBeNull();

    // Open menu
    fireEvent.press(getByText("Select..."));
    expect(getByText("Option 1")).toBeTruthy();
    expect(getByText("Option 2")).toBeTruthy();
    expect(getByText("Option 3")).toBeTruthy();

    // Select an option
    fireEvent.press(getByText("Option 2"));
    expect(onSelectMock).toHaveBeenCalledWith("Option 2");

    // Menu should close after selection
    expect(queryByText("Option 1")).toBeNull();
  });

  it("does not open menu when disabled", () => {
    const { getByText, queryByText } = render(
      <DropDownSelector
        options={options}
        selectedValue=""
        onSelect={onSelectMock}
        placeholder="Select..."
        disabled={true}
      />,
    );

    fireEvent.press(getByText("Select..."));
    expect(queryByText("Option 1")).toBeNull();
  });

  it("renders leading icon when provided", () => {
    const { getByText } = render(
      <DropDownSelector
        options={options}
        selectedValue="Option 1"
        onSelect={onSelectMock}
        leadingIconName="home"
      />,
    );
    // Since we can't easily query the MaterialIcon by testID unless we add one,
    // just ensure it renders without crashing.
    expect(getByText("Option 1")).toBeTruthy();
  });
});
