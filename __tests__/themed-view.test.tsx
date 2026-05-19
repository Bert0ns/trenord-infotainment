import { render } from "@testing-library/react-native";
import { Text } from "react-native";

import { ThemedView } from "@/components/themed-view";

jest.mock("@/hooks/use-theme-color", () => ({
  useThemeColor: () => "#0000ff",
}));

describe("ThemedView", () => {
  it("renders children", () => {
    const { getByText } = render(
      <ThemedView>
        <ThemedView>
          <Text>Nested</Text>
        </ThemedView>
      </ThemedView>,
    );

    expect(getByText("Nested")).toBeTruthy();
  });

  it("applies themed background color", () => {
    const { getByTestId } = render(
      <ThemedView testID="container">
        <ThemedView />
      </ThemedView>,
    );

    const instance = getByTestId("container");

    expect(instance.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: "#0000ff" }),
      ]),
    );
  });
});
