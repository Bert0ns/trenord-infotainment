import Card from "@/components/ui/card";
import { createStyleHook, useTheme } from "@/hooks/use-theme-color";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

export interface WeatherData {
  city: string;
  temperature: number;
  code: number;
  isDay: boolean;
  condition?: string;
}

export default function WeatherCard({ data }: { data: WeatherData | null }) {
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

  // Nuova funzione basata sui codici meteo WMO e giorno/notte
  const getIcon = () => {
    const { code, isDay } = data;

    // 0: Cielo sereno
    if ([0, 1].includes(code)) {
      weatherCondition = "sunny";
      return {
        name: isDay ? "wb-sunny" : "bedtime", // Sole o Luna
        color: theme.colors.warning, // Giallo/Oro
      };
    }

    // 1, 2, 3: Da poco nuvoloso a coperto
    if ([2, 3].includes(code)) {
      weatherCondition = "cloudy";
      return {
        name: "cloud",
        color: theme.colors.cloud || theme.colors.mutedForeground, // Assicurati di avere 'cloud' nel tema o usa un fallback
      };
    }

    // 45, 48: Nebbia
    if ([45, 48].includes(code)) {
      weatherCondition = "foggy";
      return {
        name: "dehaze", // L'icona con le linee orizzontali, ottima per la nebbia
        color: theme.colors.cloud || theme.colors.mutedForeground,
      };
    }

    // 51-67, 80-82: Pioviggine e Pioggia (anche gelata o a rovesci)
    if ((code >= 51 && code <= 67) || [80, 81, 82].includes(code)) {
      weatherCondition = "rainy";
      return {
        name: "water-drop",
        color: theme.colors.info, // Azzurro
      };
    }

    // 71-77, 85-86: Neve (debole, moderata, forte o grandine)
    if ((code >= 71 && code <= 77) || [85, 86].includes(code)) {
      weatherCondition = "snowy";
      return {
        name: "ac-unit", // L'icona del fiocco di neve in MaterialIcons
        color: theme.colors.info, // Puoi usare info o creare un colore apposito "snow" nel tema
      };
    }

    // 95, 96, 99: Temporali (con o senza grandine)
    if ([95, 96, 99].includes(code)) {
      weatherCondition = "stormy";
      return {
        name: "bolt", // Fulmine
        color: theme.colors.warning, // Giallo
      };
    }

    return { name: "thermostat", color: theme.colors.primary };
  };

  const iconInfo = getIcon();

  return (
    <Card variant="muted" style={styles.card}>
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
