/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const THEME = {
  colors: {
    primary: "#004a2b", // Verde scuro Trenord
    primaryContainer: "#d2eedb", // Verde chiaro per sfondi attivi
    surface: "#ffffff", // Sfondo pagina
    surfaceVariant: "#f3f3f8", // Sfondo delle card grigio chiaro
    onSurface: "#1a1c1f", // Testo principale
    onSurfaceVariant: "#3f4942", // Testo secondario/descrizioni
    outline: "#bec9bf", // Bordi
    error: "#ba1a1a", // Rosso per bottone Report
    surface70: "rgba(249, 249, 254, 0.7)", // Sfondo trasparente per la bottom nav bar
    outlineVariant20: "rgba(190, 201, 191, 0.1)", // Bordi trasparenti per la bottom nav bar
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    md: 8,
    mdLg: 12,
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

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
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
