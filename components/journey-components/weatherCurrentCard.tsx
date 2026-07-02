import { createStyleHook, useTheme } from "@/hooks/use-theme-color";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import Card from "../ui/card";

export interface CurrentWeatherData {
  temperature: number;
  code: number;
  isDay: boolean;
  humidity: number;
  windSpeed: number;
}

export default function CurrentWeatherCard({
  data,
}: {
  data: CurrentWeatherData | null;
}) {
  const styles = useStyles();
  const theme = useTheme();
  const { t } = useTranslation("home", { keyPrefix: "weatherCard" });
  let weatherCondition: string = "unknown";

  if (!data) {
    return (
      <Card variant="muted" style={styles.card}>
        <Text style={styles.label}>{t("loadingWeather")}</Text>
      </Card>
    );
  }

  const getIcon = () => {
    const { code, isDay } = data;

    if ([0, 1, 2].includes(code)) {
      weatherCondition = "sunny";
      return {
        name: isDay ? "wb-sunny" : "bedtime",
        color: theme.colors.warning,
      };
    }

    if ([3].includes(code)) {
      weatherCondition = "cloudy";
      return {
        name: "cloud",
        color: theme.colors.cloud || theme.colors.mutedForeground,
      };
    }

    if ([45, 48].includes(code)) {
      weatherCondition = "foggy";
      return {
        name: "dehaze",
        color: theme.colors.cloud || theme.colors.mutedForeground,
      };
    }

    if ((code >= 51 && code <= 67) || [80, 81, 82].includes(code)) {
      weatherCondition = "rainy";
      return {
        name: "water-drop",
        color: theme.colors.info,
      };
    }

    if ((code >= 71 && code <= 77) || [85, 86].includes(code)) {
      weatherCondition = "snowy";
      return {
        name: "ac-unit",
        color: theme.colors.info,
      };
    }

    if ([95, 96, 99].includes(code)) {
      weatherCondition = "stormy";
      return {
        name: "bolt",
        color: theme.colors.warning,
      };
    }

    return { name: "thermostat", color: theme.colors.primary };
  };

  const iconInfo = getIcon();

  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>{t("currentWeather")}</Text>

      <View style={styles.mainRow}>
        <View>
          <Text style={styles.temperature}>{data.temperature}°C</Text>
          <Text style={styles.condition}>{t(weatherCondition)}</Text>
        </View>
        <MaterialIcons
          name={iconInfo.name as any}
          size={60}
          color={iconInfo.color}
          style={styles.icon}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <MaterialIcons
            name="water-drop"
            size={14}
            color={theme.colors.info}
          />
          <Text style={styles.detailText}>{data.humidity}%</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialIcons
            name="air"
            size={14}
            color={theme.colors.mutedForeground}
          />
          <Text style={styles.detailText}>{data.windSpeed} km/h</Text>
        </View>
      </View>
    </View>
  );
}

const useStyles = createStyleHook((theme) => ({
  card: {
    backgroundColor: theme.colors.muted,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderColor: theme.colors.border,
  },
  label: { fontSize: 14, color: theme.colors.mutedForeground },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.mutedForeground,
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  mainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  temperature: {
    fontSize: 36,
    fontWeight: "800",
    color: theme.colors.foreground,
  },
  condition: {
    fontSize: 16,
    color: theme.colors.mutedForeground,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  detailsRow: {
    flexDirection: "row",
    gap: theme.spacing.lg,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
  },
  icon: { marginRight: theme.spacing.md },
}));
