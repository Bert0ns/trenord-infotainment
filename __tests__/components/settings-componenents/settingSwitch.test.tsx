import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SettingSwitch from "@/components/settings-componenents/settingSwitch";

jest.mock("@/hooks/use-theme-color", () => ({
  createStyleHook: () => () => ({
    container: {},
    textContainer: {},
    label: {},
    description: {},
    switchTrackTrue: { color: "#000" },
  }),
}));

describe("SettingSwitch", () => {
  it("renders correctly with description", () => {
    const { getByText } = render(
      <SettingSwitch
        label="Test Label"
        description="Test Description"
        value={true}
        onValueChange={() => {}}
      />,
    );
    expect(getByText("Test Label")).toBeTruthy();
    expect(getByText("Test Description")).toBeTruthy();
  });

  it("calls onValueChange when switched", () => {
    const onValueChangeMock = jest.fn();
    const { getByRole } = render(
      <SettingSwitch
        label="Test Label"
        value={false}
        onValueChange={onValueChangeMock}
      />,
    );

    // In React Native Testing Library, switch role is "switch"
    fireEvent(getByRole("switch"), "valueChange", true);
    expect(onValueChangeMock).toHaveBeenCalledWith(true);
  });
});
