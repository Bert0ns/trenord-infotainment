import { createStyleHook, useTheme } from "@/hooks/use-theme-color";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { Circle, Svg } from "react-native-svg";

type ScaleColorKey =
  | "scaleGood"
  | "scaleFair"
  | "scaleModerate"
  | "scalePoor"
  | "scaleVeryPoor"
  | "scaleExtreme";

function getAirQualityInfo(aqi: number): {
  status: string;
  colorKey: ScaleColorKey;
} {
  if (aqi <= 20) return { status: "Good", colorKey: "scaleGood" };
  if (aqi <= 40) return { status: "Fair", colorKey: "scaleFair" };
  if (aqi <= 60) return { status: "Moderate", colorKey: "scaleModerate" };
  if (aqi <= 80) return { status: "Poor", colorKey: "scalePoor" };
  if (aqi <= 100) return { status: "Very Poor", colorKey: "scaleVeryPoor" };
  return { status: "Extremely Poor", colorKey: "scaleExtreme" };
}

// -- AIR QUALITY CARD --
export function AirQualityCard({ value }: { value: number }) {
  const styles = useStyles();
  const theme = useTheme();
  const { t } = useTranslation("home", { keyPrefix: "weatherCard" });

  const data = getAirQualityInfo(value);
  const activeColor = theme.weatherColors[data.colorKey];

  const size = 70;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const maxValue = 100;
  const fillPercentage = Math.min(value / maxValue, 1);
  const strokeDashoffset = circumference - circumference * fillPercentage;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{t("airQuality")}</Text>

      <View style={styles.centerContent}>
        <Svg width={size} height={size} style={styles.svgContainer}>
          <Circle
            stroke={theme.colors.svgTrack}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <Circle
            stroke={activeColor}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>

        <Text style={styles.valueLarge}>{value}</Text>
      </View>

      <Text style={styles.valueMedium}>{t(data.status)}</Text>
    </View>
  );
}

function getUVIndexInfo(uvIndex: number): {
  level: string;
  description: string;
  colorKey: ScaleColorKey;
} {
  if (uvIndex <= 2)
    return { level: "Low", description: "Minimal risk", colorKey: "scaleGood" };
  if (uvIndex <= 5)
    return {
      level: "Moderate",
      description: "Protection recommended",
      colorKey: "scaleModerate",
    };
  if (uvIndex <= 7)
    return {
      level: "High",
      description: "Protection required",
      colorKey: "scalePoor",
    };
  if (uvIndex <= 10)
    return {
      level: "Very High",
      description: "Extra protection",
      colorKey: "scaleVeryPoor",
    };
  return {
    level: "Extreme",
    description: "Avoid direct sun",
    colorKey: "scaleExtreme",
  };
}

// -- UV INDEX CARD --
export function UVIndexCard({ level }: { level: number }) {
  const styles = useStyles();
  const theme = useTheme();
  const { t } = useTranslation("home", { keyPrefix: "weatherCard" });

  const data = getUVIndexInfo(level);
  const activeColor = theme.weatherColors[data.colorKey];

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{t("uvIndex")}</Text>

      <View style={styles.centerContent}>
        <MaterialIcons name={"sunny"} size={45} color={activeColor} />
      </View>

      <Text style={styles.valueMedium}>
        {t(data.level)} ({level})
      </Text>
      <Text style={styles.subText}>{t(data.description)}</Text>
    </View>
  );
}

const useStyles = createStyleHook((theme) => ({
  card: {
    flex: 1,
    backgroundColor: theme.colors.muted,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: "center",
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.mutedForeground,
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  centerContent: {
    marginVertical: theme.spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    height: 70,
    width: 70,
  },
  svgContainer: {
    position: "absolute",
    transform: [{ rotate: "-90deg" }],
  },
  valueLarge: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.foreground,
  },
  valueMedium: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  subText: {
    fontSize: 11,
    color: theme.colors.mutedForeground,
    textAlign: "center",
    marginTop: 2,
  },
}));
