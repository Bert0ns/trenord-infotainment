import { nowSec, wait } from "../../utils/time";

describe("time utils", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("wait resolves after the provided delay", async () => {
    const start = Date.now();
    await wait(10);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(8);
  });

  it("nowSec returns the current unix timestamp in seconds", () => {
    jest.spyOn(Date, "now").mockReturnValue(1_699_999_999_123);

    expect(nowSec()).toBe(1_699_999_999);
  });
});
