import { createStyleHook } from "@/hooks/use-theme-color";
import React from "react";
import { Switch, Text, View } from "react-native";

interface SettingSwitchProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}

export default function SettingSwitch({
  label,
  description,
  value,
  onValueChange,
}: SettingSwitchProps) {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#d9dade", true: styles.switchTrackTrue.color }}
        thumbColor={"#ffffff"}
      />
    </View>
  );
}

const useStyles = createStyleHook((theme) => ({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
  textContainer: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  label: {
    fontSize: 15,
    color: theme.colors.foreground,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
  },
  switchTrackTrue: {
    color: theme.colors.primary,
  },
}));
