import React from "react";
import { render } from "@testing-library/react-native";
import NewsCard from "@/components/newsCard";

jest.mock("@/hooks/use-theme-color", () => ({
  createStyleHook: () => () => ({
    newsCard: {},
    title: {},
    newsText: {},
  }),
}));

describe("NewsCard", () => {
  it("renders correctly", () => {
    const { getByText } = render(
      <NewsCard title="Breaking News" text="Something happened today." />
    );
    expect(getByText("Breaking News")).toBeTruthy();
    expect(getByText("Something happened today.")).toBeTruthy();
  });
});
