/* global jest */
process.env.EXPO_PUBLIC_TRENORD_CLIENT_ID = "mock_client_id";
process.env.EXPO_PUBLIC_TRENORD_ISSUER = "mock_issuer";
process.env.EXPO_PUBLIC_TRENORD_AUDIENCE = "mock_audience";
process.env.EXPO_PUBLIC_TRENORD_TOKEN_URL = "mock_token_url";
process.env.EXPO_PUBLIC_TRENORD_API_URL = "mock_api_url";
process.env.EXPO_PUBLIC_TRENORD_PRIVATE_JWK = "{}";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("react-native-reanimated", () => {
  const { View, Text, ScrollView, Image } = require("react-native");
  return {
    __esModule: true,
    default: {
      createAnimatedComponent: (Component) => Component,
      View: View,
      Text: Text,
      ScrollView: ScrollView,
      Image: Image,
    },
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    useAnimatedProps: jest.fn(() => ({})),
    useDerivedValue: jest.fn(() => ({ value: 0 })),
    withTiming: jest.fn((val) => val),
    withSpring: jest.fn((val) => val),
    withRepeat: jest.fn((val) => val),
    withSequence: jest.fn((val) => val),
    withDelay: jest.fn((val) => val),
    Easing: {
      in: jest.fn(),
      out: jest.fn(),
      inOut: jest.fn(),
      linear: jest.fn(),
      ease: jest.fn(),
      quad: jest.fn(),
      cubic: jest.fn(),
    },
    runOnJS: jest.fn(() => jest.fn()),
    runOnUI: jest.fn(() => jest.fn()),
    Animated: {
      View: View,
      Text: Text,
      ScrollView: ScrollView,
      Image: Image,
    },
    SensorType: {
      ACCELEROMETER: "accelerometer",
      GRAVITY: "gravity",
    },
    useAnimatedSensor: jest.fn(() => ({})),
  };
});

jest.mock("react-native-maps", () => {
  const React = require("react");
  const { View } = require("react-native");

  const MapView = ({ children, ...props }) =>
    React.createElement(View, props, children);
  const Marker = ({ children, ...props }) =>
    React.createElement(View, props, children);
  const Polyline = (props) => React.createElement(View, props);

  return {
    __esModule: true,
    default: MapView,
    Marker,
    Polyline,
  };
});

// Provide a test-friendly mock for react-i18next that returns real English
// translations loaded from the project's locale JSON files. This keeps tests
// stable and independent from device locale settings.
jest.mock("react-i18next", () => {
  const path = (p) => require(p);
  const en = {
    common: path("./lib/i18n/locales/en/common.json"),
    home: path("./lib/i18n/locales/en/home.json"),
    journey: path("./lib/i18n/locales/en/journey.json"),
    login: path("./lib/i18n/locales/en/login.json"),
    media: path("./lib/i18n/locales/en/media.json"),
    reportIssue: path("./lib/i18n/locales/en/reportIssue.json"),
    settings: path("./lib/i18n/locales/en/settings.json"),
  };

  function lookup(namespace, key, keyPrefix) {
    const parts = (keyPrefix ? keyPrefix + "." + key : key).split(".");
    let node = en[namespace] || {};
    for (const p of parts) {
      if (node && Object.prototype.hasOwnProperty.call(node, p)) {
        node = node[p];
      } else {
        return key; // fallback to the raw key when missing
      }
    }
    return typeof node === "string" ? node : key;
  }

  function replaceTemplate(str, opts) {
    if (!opts) return str;
    return Object.entries(opts).reduce(
      (s, [k, v]) => s.replace(`{{${k}}}`, String(v)),
      str,
    );
  }

  return {
    useTranslation: (ns, options) => {
      const namespace =
        typeof ns === "string" ? ns : Array.isArray(ns) ? ns[0] : "common";
      const keyPrefix =
        options && options.keyPrefix ? options.keyPrefix : undefined;
      return {
        t: (k, opts) => replaceTemplate(lookup(namespace, k, keyPrefix), opts),
        i18n: { changeLanguage: jest.fn(), language: "en" },
      };
    },
    Trans: ({ children }) => children,
    Translation: ({ children, ns }) =>
      children((k, opts) => replaceTemplate(lookup(ns || "common", k), opts), {
        i18n: {},
      }),
    initReactI18next: { type: "3rdParty", init: jest.fn() },
  };
});

jest.mock("@/lib/api/trenord/trenord", () => ({
  fetchTrainData: jest.fn(),
  fetchStationMetadata: jest.fn().mockResolvedValue([]),
  clearTrenordApiCache: jest.fn(),
}));

// Mock @expo/vector-icons to avoid ESM parsing issues in tests
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: () => null,
  MaterialCommunityIcons: () => null,
  FontAwesome: () => null,
  FontAwesome5: () => null,
  Ionicons: () => null,
  AntDesign: () => null,
  Entypo: () => null,
  EvilIcons: () => null,
  Feather: () => null,
  Foundation: () => null,
  Octicons: () => null,
  SimpleLineIcons: () => null,
  Zocial: () => null,
}));

jest.mock("@/hooks/use-weather-data", () => ({
  useWeatherData: jest.fn(() => ({
    refreshWeather: jest.fn(),
  })),
}));
