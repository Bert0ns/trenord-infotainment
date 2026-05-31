/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";
import { Colors, GlobalTheme } from "./theme.types";

export const THEME: GlobalTheme = {
  colors: {
    light: {
      primary: "#004a2b",
      //primaryContainer: "#d2eedb",
      primaryContainer: "rgba(0, 100, 60, 0.2)",
      surface: "#ffffff",
      surfaceVariant: "#f3f3f8",
      onSurface: "#1a1c1f",
      onSurfaceVariant: "#3f4942",
      outline: "#bec9bf",
      error: "#ba1a1a",
      surface70: "rgba(249, 249, 254, 0.7)",
      outlineVariant20: "rgba(190, 201, 191, 0.1)",
    },
    dark: {
      primary: "#82D8A8",
      primaryContainer: "#82D8A833",
      surface: "#181D19",
      surfaceVariant: "#FFFFFF0D",
      onSurface: "#DFE4DE",
      onSurfaceVariant: "#BEC9C0",
      outline: "#88938B33",
      error: "#ba1a1a",
      surface70: "#1C211DE5",
      outlineVariant20: "#3F49424D",
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
    xl: 20, // da capire
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
