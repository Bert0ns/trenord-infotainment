import enReportIssue from "@/lib/i18n/locales/en/reportIssue.json";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import ReportIssuePage from "../../app/report-issue-page";

jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ bottom: 20 }),
}));

jest.mock("@/components/ui/slide-sheet", () => {
  const React = require("react");
  const { View } = require("react-native");
  const SlideSheet = React.forwardRef(function SlideSheet(
    { children, header, onClose }: any,
    ref: any,
  ) {
    React.useImperativeHandle(ref, () => ({
      close: () => onClose && onClose(),
    }));
    return (
      <View testID="sheet-container">
        {header}
        {children}
      </View>
    );
  });
  return { SlideSheet };
});

jest.mock("@/components/report-issue-components", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity, TextInput } = require("react-native");
  return {
    ActionButtons: ({ onSubmit, onCancel }: any) => (
      <View>
        <TouchableOpacity testID="submit-btn" onPress={onSubmit}>
          <Text>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="cancel-btn" onPress={onCancel}>
          <Text>Cancel</Text>
        </TouchableOpacity>
      </View>
    ),
    DetailsInput: ({ value, onChange }: any) => (
      <TextInput testID="details-input" value={value} onChangeText={onChange} />
    ),
    IssueGrid: ({ onToggle }: any) => (
      <TouchableOpacity
        testID="issue-grid-item"
        onPress={() => onToggle("cleanliness")}
      >
        <Text>Grid Item</Text>
      </TouchableOpacity>
    ),
    IssueOptionCard: ({ onPress, selected }: any) => (
      <TouchableOpacity testID="other-issue" onPress={onPress}>
        <Text>{selected ? "Selected" : "Not Selected"}</Text>
      </TouchableOpacity>
    ),
    ReportHeader: ({ onClose }: any) => (
      <TouchableOpacity testID="header-close" onPress={onClose}>
        <Text>Close</Text>
      </TouchableOpacity>
    ),
    SectionTitle: ({ children }: any) => <Text>{children}</Text>,
    issueOptions: [
      { id: "delay", label: "Delay" },
      { id: "cleanliness", label: "Cleanliness" },
      { id: "temperature", label: "Temperature" },
      { id: "noise", label: "Noise" },
      { id: "other-issue", label: "Other" },
    ],
  };
});

describe("ReportIssuePage", () => {
  it("renders correctly and handles toggling issues", () => {
    const { getByTestId, getByText } = render(<ReportIssuePage />);

    // Initially other-issue should be selected
    expect(getByText("Selected")).toBeTruthy();

    // Toggle other-issue
    fireEvent.press(getByTestId("other-issue"));
    expect(getByText("Not Selected")).toBeTruthy();

    // Toggle cleanliness
    fireEvent.press(getByTestId("issue-grid-item"));
  });

  it("handles input change", () => {
    const { getByTestId } = render(<ReportIssuePage />);
    const input = getByTestId("details-input");
    fireEvent.changeText(input, "Very dirty");
    expect(input.props.value).toBe("Very dirty");
  });

  it("handles cancel button", () => {
    const { getByTestId } = render(<ReportIssuePage />);
    fireEvent.press(getByTestId("cancel-btn"));
    // We expect requestClose to be called, which calls sheetRef.current.close() which calls router.back() via onClose
  });

  it("handles submit button", () => {
    // Mock global.alert
    global.alert = jest.fn();

    const { getByTestId } = render(<ReportIssuePage />);
    fireEvent.press(getByTestId("submit-btn"));

    expect(global.alert).toHaveBeenCalledWith(
      enReportIssue.reportSubmittedSuccessfully,
    );
  });

  it("handles header close button", () => {
    const { getByTestId } = render(<ReportIssuePage />);
    fireEvent.press(getByTestId("header-close"));
  });
});
