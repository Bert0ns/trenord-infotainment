/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { ColorName, THEME } from "@/constants/theme";
import { Theme } from "@/constants/theme.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { StyleSheet } from "react-native";
import { useSettingsStore } from "@/store/settingsStore";

/**
 * Hook to get the currently selected color scheme (light or dark).
 *
 * This hook checks user preference from settings, and if set to "system", it uses the device's color scheme.
 */
export function useSelectedScheme() {
  const themeSetting = useSettingsStore((s) => s.settings.theme);
  const systemScheme = useColorScheme();
  if (themeSetting === "system") {
    return systemScheme !== "unspecified" ? systemScheme : "light";
  } else {
    return themeSetting;
  }
}

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorName,
) {
  const theme = useSelectedScheme();
  const colorFromProps = props[theme];
  return colorFromProps ?? THEME.colors[theme][colorName];
}

/**
 * Returns the current theme object based on the selected color scheme. The theme includes colors, spacing, border radius, and typography.
 */
export function useTheme(): Theme {
  const theme = useSelectedScheme();
  const themeColors = THEME.colors[theme];

  return {
    colors: themeColors,
    weatherColors: THEME.weatherColors[theme],
    spacing: THEME.spacing,
    borderRadius: THEME.borderRadius,
    typography: THEME.typography,
  };
}

/**
 * Helper hook to create a theme-aware stylesheet. It takes a factory function that receives the current theme and returns a StyleSheet object.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const styles = useStyleSheet((theme) => ({
 *     container: {
 *       display: "flex",
 *       flexDirection: "column",
 *       backgroundColor: theme.colors.surface,
 *       padding: theme.spacing.md,
 *     },
 *   }));
 *   return <View style={styles.container}>...</View>;
 * }
 * ```
 */
export function useStyleSheet<T extends StyleSheet.NamedStyles<T>>(
  factory: (theme: Theme) => T,
): T {
  const theme = useTheme();
  return factory(theme);
}

/**
 * Higher-order function to create a hook for generating theme-aware styles.
 * It takes a factory function that receives the current theme and returns a StyleSheet object,
 * and returns a hook that can be used in components to get the styles.
 *
 * Created as a convenient drop in replacement for `StyleSheet.create` that automatically has access to the current theme.
 * {@link useStyleSheet} is the underlying hook that does the actual work, this is just a wrapper for better ergonomics.
 * @example
 * ```tsx
 * const useStyles = createStyleHook((theme) => ({
 *   container: {
 *     backgroundColor: theme.colors.surface,
 *     padding: theme.spacing.md,
 *   },
 * }));
 *
 * function MyComponent() {
 *   const styles = useStyles();
 *   return <View style={styles.container}>...</View>;
 * }
 * ```
 */
export function createStyleHook<T extends StyleSheet.NamedStyles<T>>(
  factory: (theme: Theme) => T,
): () => T {
  return () => useStyleSheet(factory);
}
