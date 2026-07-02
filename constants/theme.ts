/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";
import { Colors, GlobalTheme } from "./theme.types";

export const THEME: GlobalTheme = {
  colors: {
    light: {
      background: "#ffffff",
      foreground: "#1a1c1f",
      primary: "#004a2b",
      primaryForeground: "#ffffff",
      secondary: "rgba(0, 100, 60, 0.2)",
      secondaryForeground: "#004a2b",
      muted: "#f3f3f8",
      mutedForeground: "#3f4942",
      border: "#bec9bf",
      destructive: "#ba1a1a",
      destructiveForeground: "#ffffff",
      backgroundTransparent: "rgba(249, 249, 254, 0.7)",
      borderTransparent: "rgba(190, 201, 191, 0.1)",
      homeSecondary: "#82D8A8",
      info: "#4A90E2",
      infoForeground: "#ffffff",
      warning: "#F5A623",
      warningForeground: "#ffffff",
      cloud: "#BEC9C0",
      homeLiveStatus: "#004a2b",
      logout: "#383f3b",
      scaleGood: "#1fb456",
      scaleFair: "#84CC16",
      scaleModerate: "#EAB308",
      scalePoor: "#F97316",
      scaleVeryPoor: "#EF4444",
      scaleExtreme: "#7E22CE",
      svgTrack: "#e2e2e7",
    },
    dark: {
      background: "#181D19",
      foreground: "#DFE4DE",
      primary: "#82D8A8",
      primaryForeground: "#00391E",
      secondary: "#82D8A833",
      secondaryForeground: "#82D8A8",
      muted: "#FFFFFF0D",
      mutedForeground: "#BEC9C0",
      border: "#88938B33",
      destructive: "#9f1616",
      destructiveForeground: "#ffffff",
      backgroundTransparent: "#181D19",
      borderTransparent: "#3F49424D",
      homeSecondary: "#004a2b",
      info: "#64B5F6",
      infoForeground: "#002C59",
      warning: "#FFB74D",
      warningForeground: "#4A2B00",
      cloud: "#BEC9C0",
      homeLiveStatus: "#438d64",
      logout: "#383f3b",
      scaleGood: "#4ADE80",
      scaleFair: "#A3E635",
      scaleModerate: "#FACC15",
      scalePoor: "#FB923C",
      scaleVeryPoor: "#F87171",
      scaleExtreme: "#C084FC",
      svgTrack: "#3f4942",
    },
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  typography: {
    // usato solo per la bottom nav bar
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6, // 0.05em di 12px
    fontFamily: "Inter_700Bold",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export type Theme = typeof THEME;
export type ColorName = keyof Colors;
