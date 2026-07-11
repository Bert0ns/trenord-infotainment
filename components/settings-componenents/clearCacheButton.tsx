import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useTheme } from "@/hooks/use-theme-color";

interface Props {
  label: string;
  onPress: () => void;
}

export default function ClearCacheButton({ label, onPress }: Props) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.clearCacheButton,
        { backgroundColor: theme.colors.destructive },
      ]}
      onPress={onPress}
    >
      <MaterialIcons
        name="delete-outline"
        size={16}
        color={theme.colors.destructiveForeground}
      />
      <Text
        style={[
          styles.clearCacheButtonText,
          { color: theme.colors.destructiveForeground },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  clearCacheButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  clearCacheButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
