import { nowSec, wait, parseAndAddDelay } from "../../utils/time";

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

  describe("parseAndAddDelay", () => {
    it("returns null if timeStr is undefined", () => {
      expect(parseAndAddDelay(undefined, 5)).toBeNull();
    });

    it("parses normal daytime hours and adds delay", () => {
      jest.useFakeTimers().setSystemTime(new Date("2023-11-14T10:00:00Z"));
      const result = parseAndAddDelay("14:30:00", 15);
      expect(result?.getHours()).toBe(14);
      expect(result?.getMinutes()).toBe(45);
      expect(result?.getDate()).toBe(14);
      jest.useRealTimers();
    });

    it("handles overnight edge case where scheduled time is past midnight but current time is late night", () => {
      // Current time is 23:30 (late night)
      jest.useFakeTimers().setSystemTime(new Date("2023-11-14T23:30:00"));
      // Scheduled time is 01:15 (next day)
      const result = parseAndAddDelay("01:15:00", 5);
      expect(result?.getHours()).toBe(1);
      expect(result?.getMinutes()).toBe(20);
      expect(result?.getDate()).toBe(15); // should move to next day
      jest.useRealTimers();
    });

    it("handles overnight edge case where scheduled time is late night but current time is past midnight", () => {
      // Current time is 01:30 (past midnight)
      jest.useFakeTimers().setSystemTime(new Date("2023-11-15T01:30:00"));
      // Scheduled time is 23:45 (previous day)
      const result = parseAndAddDelay("23:45:00", 15);
      expect(result?.getHours()).toBe(0); // 23:45 + 15 min = 00:00
      expect(result?.getMinutes()).toBe(0);
      expect(result?.getDate()).toBe(15); // moved to current day due to overflow
      // actually, let's verify without overflowing the day to be safe:
      const result2 = parseAndAddDelay("23:45:00", 5);
      expect(result2?.getHours()).toBe(23);
      expect(result2?.getMinutes()).toBe(50);
      expect(result2?.getDate()).toBe(14); // should move to previous day
      jest.useRealTimers();
    });
  });
});
