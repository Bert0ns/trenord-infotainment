import { render } from "@testing-library/react-native";
import Index from "../app/index";
import { useJourneyStore } from "../store/journeyStore";

// Mock Redirect component from expo-router
jest.mock("expo-router", () => ({
  Redirect: ({ href }: { href: string }) => {
    const { Text } = require("react-native");
    return <Text testID="redirect">{href}</Text>;
  },
}));

describe("Index Auth Guard", () => {
  beforeEach(() => {
    // Reset store before each test
    useJourneyStore.getState().clearJourney();
  });

  it("redirects to /login if trainId is null", () => {
    const { getByTestId } = render(<Index />);
    expect(getByTestId("redirect").props.children).toBe("/login");
  });

  it("redirects to /(tabs)/home if trainId is present", () => {
    // Mock user being logged in
    useJourneyStore.setState({ trainId: "12345" });

    const { getByTestId } = render(<Index />);
    expect(getByTestId("redirect").props.children).toBe("/(tabs)/home");
  });
});
