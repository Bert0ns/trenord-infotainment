import React from "react";
import { render } from "@testing-library/react-native";
import { MasonryGrid } from "@/components/news-magazine-components/masonry-grid";

jest.mock("@/components/news-magazine-components/magazine-card", () => ({
  MagazineCard: ({ article, height }: any) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return <Text testID={`card-${article.id}`}>{height}</Text>;
  },
}));

describe("MasonryGrid", () => {
  const mockArticles = [
    { id: "1", title: "Article 1", url: "https://1" },
    { id: "2", title: "Article 2", url: "https://2" },
    { id: "3", title: "Article 3", url: "https://3" },
    { id: "4", title: "Article 4", url: "https://4" },
  ] as any;

  it("renders correctly and splits articles into columns", () => {
    const { getByTestId } = render(
      <MasonryGrid data={mockArticles} columns={2} />,
    );

    expect(getByTestId("card-1")).toBeTruthy();
    expect(getByTestId("card-2")).toBeTruthy();
    expect(getByTestId("card-3")).toBeTruthy();
    expect(getByTestId("card-4")).toBeTruthy();
  });

  it("handles empty data safely", () => {
    const { toJSON } = render(<MasonryGrid data={[]} columns={2} />);
    expect(toJSON()).toBeTruthy();
  });
});
