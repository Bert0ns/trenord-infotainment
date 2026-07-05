import { createStyleHook, useTheme } from "@/hooks/use-theme-color";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import Card from "../ui/card";

export interface CurrentWeatherData {
  city: string;
  temperature: number;
  code: number;
  isDay: boolean;
  humidity: number;
  windSpeed: number;
  feelsLike?: number;
  precipitation?: number;
  cloudCover?: number;
  windDirection?: number;
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
        <Text style={styles.sectionLabel}>{t("loadingWeather")}</Text>
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

  const GridItem = ({
    icon,
    label,
    value,
    color,
  }: {
    icon: any;
    label: string;
    value: string | number;
    color?: string;
  }) => (
    <View style={styles.gridItem}>
      <MaterialIcons
        name={icon}
        size={26}
        color={color ? color : theme.colors.mutedForeground}
        style={styles.gridIcon}
      />
      <View style={styles.gridTextContainer}>
        <Text style={styles.gridLabel}>{label}</Text>
        <Text style={styles.gridValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      <View style={styles.headerContainer}>
        <Text style={styles.cityLabel}>{data.city.toUpperCase()}</Text>
        <Text style={styles.sectionLabel}>
          {t("currentWeather").toUpperCase()}
        </Text>
      </View>

      <View style={styles.mainRow}>
        <View>
          <Text style={styles.temperature}>{data.temperature}°C</Text>
          <Text style={styles.condition}>{t(weatherCondition)}</Text>
        </View>
        <MaterialIcons
          name={iconInfo.name as any}
          size={72}
          color={iconInfo.color}
          style={styles.icon}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsGrid}>
        <View style={styles.detailsRow}>
          <GridItem
            icon="water-drop"
            label={t("humidity")}
            value={`${data.humidity}%`}
            color={theme.colors.info}
          />
          <GridItem
            icon="thermostat"
            label={t("feelsLike")}
            value={`${data.feelsLike ?? "--"}°C`}
            color={theme.colors.warning}
          />
        </View>

        <View style={styles.detailsRow}>
          <GridItem
            icon="filter-drama"
            label={t("clouds")}
            value={`${data.cloudCover ?? "--"}%`}
            color={theme.colors.cloud}
          />
          <GridItem
            icon="umbrella"
            label={t("precip")}
            value={`${data.precipitation ?? 0} mm`}
            color={theme.colors.info}
          />
        </View>

        <View style={styles.detailsRow}>
          <GridItem
            icon="air"
            label={t("wind")}
            value={`${data.windSpeed} km/h`}
            color={theme.colors.cloud}
          />
          <GridItem
            icon="explore"
            label={t("direction")}
            value={`${data.windDirection ?? "--"}°`}
            color={theme.colors.cloud}
          />
        </View>
      </View>
    </View>
  );
}

const useStyles = createStyleHook((theme) => ({
  card: {
    backgroundColor: theme.colors.muted,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  headerContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  },
  cityLabel: {
    fontSize: 26,
    fontWeight: "900",
    color: theme.colors.foreground,
    letterSpacing: 0.5,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.mutedForeground,
    letterSpacing: 1,
    marginTop: 5,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: theme.spacing.md,
  },
  mainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  temperature: {
    fontSize: 48,
    fontWeight: "800",
    color: theme.colors.foreground,
  },
  condition: {
    fontSize: 18,
    color: theme.colors.mutedForeground,
    marginTop: -4,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },

  detailsGrid: {
    gap: theme.spacing.md,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gridItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 0.5,
    paddingVertical: 4,
  },
  gridIcon: {
    marginRight: 12,
  },
  gridTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.mutedForeground,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.foreground,
  },
  icon: {
    marginRight: 0,
  },
}));
