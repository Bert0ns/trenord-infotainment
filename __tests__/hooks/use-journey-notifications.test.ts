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

jest.mock("@/hooks/settings", () => ({
  useSettings: () => ({
    settings: mockSettings,
    set: jest.fn(),
    reset: jest.fn(),
  }),
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
});
