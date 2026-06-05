/* global jest */
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
  };
});
