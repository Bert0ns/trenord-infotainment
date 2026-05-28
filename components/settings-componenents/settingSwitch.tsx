import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { THEME } from "../../constants/theme";

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
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#d9dade", true: THEME.colors.primary }}
        thumbColor={"#ffffff"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: THEME.spacing.sm,
  },
  textContainer: {
    flex: 1,
    paddingRight: THEME.spacing.md,
  },
  label: {
    fontSize: 15,
    color: THEME.colors.onSurface,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: THEME.colors.onSurfaceVariant,
  },
});
