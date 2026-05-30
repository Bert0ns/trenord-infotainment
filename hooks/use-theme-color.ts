/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { ColorName, THEME } from "@/constants/theme";
import { Theme } from "@/constants/theme.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { StyleSheet } from "react-native";

export function useSelectedScheme() {
  const systemScheme = useColorScheme();
  return systemScheme !== "unspecified" ? systemScheme : "light";
}

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorName,
) {
  const theme = useSelectedScheme();
  const colorFromProps = props[theme];
  return colorFromProps ?? THEME.colors[theme][colorName];
}

export function useTheme(): Theme {
  const theme = useSelectedScheme();
  const themeColors = THEME.colors[theme];

  return {
    colors: themeColors,
    spacing: THEME.spacing,
    borderRadius: THEME.borderRadius,
    typography: THEME.typography,
  };
}

export function useStyleSheet<T extends StyleSheet.NamedStyles<T>>(
  factory: (theme: Theme) => T,
): T {
  const theme = useTheme();
  return factory(theme);
}

export function createStyleHook<T extends StyleSheet.NamedStyles<T>>(
  factory: (theme: Theme) => T,
): () => T {
  return () => useStyleSheet(factory);
}
