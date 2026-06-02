import { createStyleHook, useTheme } from "@/hooks/use-theme-color";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

export interface WeatherData {
  city: string;
  time: string;
  temperature: number;
  condition: string;
}

export default function WeatherCard({ data }: { data: WeatherData | null }) {
  const styles = useStyles();
  const theme = useTheme();

  if (!data)
    return (
      <View style={styles.card}>
        <Text style={styles.label}>Loading weather...</Text>
      </View>
    );

  const getIcon = () => {
    if (data.condition.includes("Sun"))
      return { name: "wb-sunny", color: theme.colors.warning };
    if (data.condition.includes("Cloud"))
      return { name: "cloud", color: theme.colors.cloud };
    if (data.condition.includes("Rain"))
      return { name: "water-drop", color: theme.colors.info };
    return { name: "thermostat", color: theme.colors.primary };
  };

  const iconInfo = getIcon();

  return (
    <View style={styles.card}>
      <MaterialIcons
        name={iconInfo.name as any}
        size={40}
        color={iconInfo.color}
        style={styles.icon}
      />
      <View>
        <Text style={styles.label}>
          {data.city} at {data.time}
        </Text>
        <Text style={styles.value}>
          {data.temperature}°C, {data.condition}
        </Text>
      </View>
    </View>
  );
}

const useStyles = createStyleHook((theme) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.muted,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
  },
  icon: { marginRight: theme.spacing.md },
  label: { fontSize: 14, color: theme.colors.mutedForeground },
  value: { fontSize: 16, fontWeight: "700", color: theme.colors.foreground },
}));
