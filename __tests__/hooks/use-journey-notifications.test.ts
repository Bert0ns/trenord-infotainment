import { useJourneyNotifications } from "@/hooks/use-journey-notifications";
import { useJourneyStore } from "@/store/journeyStore";
import { useWeatherStore } from "@/store/weatherStore";
import { act, renderHook } from "@testing-library/react-native";
import {
  scheduleEventNotification,
  cancelEventNotification,
  cancelAllEventNotifications,
} from "@/utils/notifications";

const mockSettings = {
  theme: "system",
  antiSickness: false,
  journeyProgress: true,
  delayAlerts: true,
  weatherAlerts: true,
  language: "en",
  enableNewsApi: false,
};

jest.mock("@/store/settingsStore", () => ({
  useSettingsStore: (selector: any) => {
    if (selector) return selector({ settings: mockSettings });
    return { settings: mockSettings };
  },
}));

jest.mock("@/utils/notifications", () => ({
  scheduleEventNotification: jest.fn(),
  cancelEventNotification: jest.fn(),
  cancelAllEventNotifications: jest.fn(),
}));

jest.mock("@/lib/logger", () => {
  const mLogger = {
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
  return {
    logger: {
      ...mLogger,
      extend: () => mLogger,
    },
  };
});

// Mock translation hook
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("useJourneyNotifications hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useJourneyStore.getState().clearJourney();
      useWeatherStore.getState().clearCache();
    });
    mockSettings.journeyProgress = true;
    mockSettings.delayAlerts = true;
    mockSettings.weatherAlerts = true;
  });

  it("should not schedule anything if trainId is not present", () => {
    renderHook(() => useJourneyNotifications());
    expect(scheduleEventNotification).not.toHaveBeenCalled();
  });

  it("should schedule approaching stop notification if nextStop is present", () => {
    const mockTrainData = {
      0: {
        journey_list: [
          {
            train: { delay: 0 },
            pass_list: [
              {
                station: { station_id: "S1", station_ori_name: "Milan" },
                arr_time: "12:00",
                dep_time: "12:02",
              },
            ],
          },
        ],
      },
    };

    act(() => {
      useJourneyStore
        .getState()
        .setJourney(
          "12345",
          { station_id: "S1", station_ori_name: "Milan" },
          mockTrainData as any,
        );
    });

    renderHook(() => useJourneyNotifications());

    expect(scheduleEventNotification).toHaveBeenCalledWith(
      "journey.approachingStop",
      true,
      expect.any(Number),
      "journeyProgress.approachingStopTitle",
      expect.any(String),
    );
  });

  it("should cancel approaching stop notification if nextStop is not present", () => {
    // Journey set but no stop list
    const mockTrainData = {
      0: {
        journey_list: [
          {
            train: { delay: 0 },
            pass_list: [],
          },
        ],
      },
    };

    act(() => {
      useJourneyStore
        .getState()
        .setJourney(
          "12345",
          { station_id: "S1", station_ori_name: "Milan" },
          mockTrainData as any,
        );
    });

    renderHook(() => useJourneyNotifications());

    expect(cancelEventNotification).toHaveBeenCalledWith(
      "journey.approachingStop",
    );
  });

  it("should not trigger delay alert on the first load of trainInfo (initial loading)", () => {
    const mockTrainData = {
      0: {
        journey_list: [
          {
            train: { delay: 5 }, // already 5 min delay on load
            pass_list: [],
          },
        ],
      },
    };

    act(() => {
      useJourneyStore
        .getState()
        .setJourney(
          "12345",
          { station_id: "S1", station_ori_name: "Milan" },
          mockTrainData as any,
        );
    });

    renderHook(() => useJourneyNotifications());

    // Should not trigger delay alert because previousDelayRef was null and got initialized to 5
    expect(scheduleEventNotification).not.toHaveBeenCalledWith(
      "journey.delay",
      expect.any(Boolean),
      expect.any(Number),
      expect.any(String),
      expect.any(String),
    );
  });

  it("should trigger delay alert when delay increases by 3 or more minutes", () => {
    const mockTrainData1 = {
      0: {
        journey_list: [
          {
            train: { delay: 2 },
            pass_list: [],
          },
        ],
      },
    };

    const mockTrainData2 = {
      0: {
        journey_list: [
          {
            train: { delay: 5 }, // delay increases from 2 to 5
            pass_list: [],
          },
        ],
      },
    };

    act(() => {
      useJourneyStore
        .getState()
        .setJourney(
          "12345",
          { station_id: "S1", station_ori_name: "Milan" },
          mockTrainData1 as any,
        );
    });

    const { rerender } = renderHook(() => useJourneyNotifications());

    // Rerender with increased delay
    act(() => {
      useJourneyStore
        .getState()
        .setJourney(
          "12345",
          { station_id: "S1", station_ori_name: "Milan" },
          mockTrainData2 as any,
        );
    });
    rerender({});

    expect(scheduleEventNotification).toHaveBeenCalledWith(
      "journey.delay",
      true,
      expect.any(Number),
      "delayAlerts.delayIncreasedTitle",
      "delayAlerts.delayIncreasedBody",
    );
  });

  it("should schedule weather notification when weather is available", () => {
    const mockTrainData = {
      0: {
        journey_list: [
          {
            train: { delay: 0 },
            pass_list: [
              {
                station: { station_id: "S1", station_ori_name: "Milan" },
                arr_time: "12:00",
                dep_time: "12:02",
              },
            ],
          },
        ],
      },
    };

    act(() => {
      useJourneyStore
        .getState()
        .setJourney(
          "12345",
          { station_id: "S1", station_ori_name: "Milan" },
          mockTrainData as any,
        );
    });

    act(() => {
      useWeatherStore.setState({
        weather: {
          temperature: 20,
          isDay: 1,
          weatherCode: 0,
          precipitation: 0,
          humidity: 50,
          windSpeed: 5,
          apparentTemperature: 20,
          windDirection: 0,
          cloudCover: 0,
          aqi: 20,
          uvIndex: 1,
        },
      });
    });

    renderHook(() => useJourneyNotifications());

    expect(scheduleEventNotification).toHaveBeenCalledWith(
      "journey.destinationWeather",
      true,
      expect.any(Number),
      "weatherAlerts.destinationWeatherTitle",
      "weatherAlerts.destinationWeatherBody",
    );
  });

  it("should cancel all notifications when journey is completed", () => {
    const mockTrainData = {
      0: {
        journey_list: [
          {
            train: { delay: 0 },
            pass_list: [
              {
                station: { station_id: "S1", station_ori_name: "Milan" },
                arr_time: "12:00",
                dep_time: "12:02",
                actual_data: { arr_actual_time: "12:01" }, // journey completed
              },
            ],
          },
        ],
      },
    };

    act(() => {
      useJourneyStore
        .getState()
        .setJourney(
          "12345",
          { station_id: "S1", station_ori_name: "Milan" },
          mockTrainData as any,
        );
    });

    renderHook(() => useJourneyNotifications());

    expect(cancelAllEventNotifications).toHaveBeenCalled();
  });

  it("simulates a full journey end-to-end, testing all notifications in sequence", () => {
    // 1. Initial Setup at 08:00 AM
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-07-11T08:00:00Z"));

    const mockTrainData = {
      0: {
        journey_list: [
          {
            train: { delay: 0 },
            pass_list: [
              {
                station: { station_id: "S1", station_ori_name: "Stop A" }, // First stop
                arr_time: "08:20",
                dep_time: "08:22",
                actual_data: {},
              },
              {
                station: { station_id: "S2", station_ori_name: "Milan" }, // Destination
                arr_time: "09:00",
                actual_data: {},
              },
            ],
          },
        ],
      },
    };

    act(() => {
      useJourneyStore
        .getState()
        .setJourney(
          "12345",
          { station_id: "S2", station_ori_name: "Milan" },
          mockTrainData as any,
        );
      useWeatherStore.setState({
        weather: {
          temperature: 25,
          weatherCode: 0, // sunny
          isDay: 1,
        } as any,
      });
    });

    const { rerender } = renderHook(() => useJourneyNotifications());

    // Expectation at 08:00:
    // - Approaching Stop A scheduled for 08:18 (2 mins before 08:20)
    // - Destination Weather scheduled for 08:50 (10 mins before 09:00)
    expect(scheduleEventNotification).toHaveBeenCalledWith(
      "journey.approachingStop",
      true,
      expect.any(Number),
      "journeyProgress.approachingStopTitle",
      "journeyProgress.approachingStopBody",
    );

    expect(scheduleEventNotification).toHaveBeenCalledWith(
      "journey.destinationWeather",
      true,
      expect.any(Number),
      "weatherAlerts.destinationWeatherTitle",
      "weatherAlerts.destinationWeatherBody",
    );

    jest.clearAllMocks();

    // 2. Simulate Delay: advance time to 08:10 and add a 5 minute delay
    act(() => {
      jest.setSystemTime(new Date("2026-07-11T08:10:00Z"));
      mockTrainData[0].journey_list[0].train.delay = 5;
      useJourneyStore
        .getState()
        .setJourney(
          "12345",
          { station_id: "S2", station_ori_name: "Milan" },
          mockTrainData as any,
        );
    });

    rerender({});

    // Delay should trigger IMMEDIATELY (timestamp = Date.now() + 1000)
    expect(scheduleEventNotification).toHaveBeenCalledWith(
      "journey.delay",
      true,
      expect.any(Number),
      "delayAlerts.delayIncreasedTitle",
      "delayAlerts.delayIncreasedBody",
    );

    // Weather and Approaching Stop should be rescheduled to account for the +5 min delay
    expect(scheduleEventNotification).toHaveBeenCalledWith(
      "journey.approachingStop",
      true,
      expect.any(Number),
      "journeyProgress.approachingStopTitle",
      "journeyProgress.approachingStopBody",
    );

    jest.clearAllMocks();

    // 3. Train passes Stop A: time advances to 08:25
    act(() => {
      jest.setSystemTime(new Date("2026-07-11T08:25:00Z"));
      mockTrainData[0].journey_list[0].pass_list[0].actual_data = {
        arr_actual_time: "08:24",
        dep_actual_time: "08:25",
      } as any;

      useJourneyStore
        .getState()
        .setJourney(
          "12345",
          { station_id: "S2", station_ori_name: "Milan" },
          mockTrainData as any,
        );
    });

    rerender({});

    // Since Stop A is passed, the nextStop becomes Milan (S2).
    // Approaching Stop should be scheduled for Milan.
    expect(scheduleEventNotification).toHaveBeenCalledWith(
      "journey.approachingStop",
      true,
      expect.any(Number),
      "journeyProgress.approachingStopTitle",
      "journeyProgress.approachingStopBody",
    );

    jest.clearAllMocks();

    // 4. Train arrives at Destination: time advances to 09:05
    act(() => {
      jest.setSystemTime(new Date("2026-07-11T09:05:00Z"));
      mockTrainData[0].journey_list[0].pass_list[1].actual_data = {
        arr_actual_time: "09:05",
      } as any;

      useJourneyStore
        .getState()
        .setJourney(
          "12345",
          { station_id: "S2", station_ori_name: "Milan" },
          mockTrainData as any,
        );
    });

    rerender({});

    // Journey is completed -> cancel all notifications
    expect(cancelAllEventNotifications).toHaveBeenCalled();

    jest.useRealTimers();
  });
});
