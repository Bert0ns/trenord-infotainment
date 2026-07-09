import Card from "@/components/ui/card";
import { createStyleHook, useTheme } from "@/hooks/use-theme-color";
import { MaterialIcons } from "@expo/vector-icons";
import { getWeatherIcon } from "@/utils/weather";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

export interface WeatherData {
  city: string;
  temperature: number;
  code: number;
  isDay: boolean;
  condition?: string;
}

export default function WeatherCard({
  data,
  route,
}: {
  data: WeatherData | null;
  route?: string;
}) {
  const styles = useStyles();
  const theme = useTheme();
  const { t } = useTranslation("home", { keyPrefix: "weatherCard" });

  if (!data) {
    return (
      <Card variant="muted" style={styles.card}>
        <Text style={styles.label}>{t("loadingWeather")}</Text>
      </Card>
    );
  }

  const iconInfo = getWeatherIcon(data.code, data.isDay, theme as any);
  const weatherCondition = iconInfo.conditionKey;

  const handlePress = () => {
    if (route) {
      router.push(route as any);
    }
  };

  return (
    <Card variant="muted" style={styles.card} onPress={handlePress}>
      <MaterialIcons
        name={iconInfo.name as any}
        size={40}
        color={iconInfo.color}
        style={styles.icon}
      />
      <View>
        <Text style={styles.label}>{data.city}</Text>
        <Text style={styles.value}>
          {data.temperature}°C, {t(weatherCondition)}
        </Text>
      </View>
    </Card>
  );
}

const useStyles = createStyleHook((theme) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  icon: { marginRight: theme.spacing.md },
  label: { fontSize: 14, color: theme.colors.mutedForeground },
  value: { fontSize: 16, fontWeight: "700", color: theme.colors.foreground },
}));
