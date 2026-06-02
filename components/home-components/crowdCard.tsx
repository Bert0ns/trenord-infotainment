import { createStyleHook, useTheme } from "@/hooks/use-theme-color";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

export type CrowdingLevel = "low" | "normal" | "high";

export default function CrowdingCard({ level }: { level: CrowdingLevel }) {
  const styles = useStyles();
  const theme = useTheme();

  const getCrowdingConfig = () => {
    switch (level) {
      case "low":
        return {
          bg: theme.colors.info,
          text: theme.colors.infoForeground,
          label: "Low Crowding",
          icon: "groups",
        };
      case "normal":
        return {
          bg: theme.colors.warning,
          text: theme.colors.warningForeground,
          label: "Normal Crowding",
          icon: "groups",
        };
      case "high":
        return {
          bg: theme.colors.destructive,
          text: theme.colors.destructiveForeground,
          label: "High Crowding",
          icon: "group",
        };
    }
  };

  const config = getCrowdingConfig();

  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
        <MaterialIcons
          name={config.icon as any}
          size={24}
          color={config.text}
        />
      </View>
      <View>
        <Text style={styles.label}>Current Carriage</Text>
        <Text style={styles.value}>{config.label}</Text>
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
    marginBottom: theme.spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
  },
  value: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
}));
