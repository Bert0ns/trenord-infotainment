import { Theme } from "@/constants/theme.types";
import { MaterialIcons } from "@expo/vector-icons";

export interface WeatherIconInfo {
  name: keyof typeof MaterialIcons.glyphMap;
  color: string;
  conditionKey: string;
}

export function getWeatherIcon(
  code: number,
  isDay: boolean,
  theme: Theme,
): WeatherIconInfo {
  if ([0, 1, 2].includes(code)) {
    return {
      name: isDay ? "wb-sunny" : "bedtime",
      color: theme.colors.warning,
      conditionKey: "sunny",
    };
  }

  if ([2, 3].includes(code)) {
    return {
      name: "cloud",
      color: theme.colors.cloud || theme.colors.mutedForeground,
      conditionKey: "cloudy",
    };
  }

  if ([45, 48].includes(code)) {
    return {
      name: "dehaze",
      color: theme.colors.cloud || theme.colors.mutedForeground,
      conditionKey: "foggy",
    };
  }

  if ((code >= 51 && code <= 67) || [80, 81, 82].includes(code)) {
    return {
      name: "water-drop",
      color: theme.colors.info,
      conditionKey: "rainy",
    };
  }

  if ((code >= 71 && code <= 77) || [85, 86].includes(code)) {
    return {
      name: "ac-unit",
      color: theme.colors.info,
      conditionKey: "snowy",
    };
  }

  if ([95, 96, 99].includes(code)) {
    return {
      name: "bolt",
      color: theme.colors.warning,
      conditionKey: "stormy",
    };
  }

  return {
    name: "thermostat",
    color: theme.colors.primary,
    conditionKey: "unknown",
  };
}
