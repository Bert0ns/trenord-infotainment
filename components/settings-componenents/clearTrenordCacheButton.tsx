import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { logger } from "@/lib/logger";
import { useTheme } from "@/hooks/use-theme-color";
import { clearTrenordApiCache } from "@/lib/api/trenord/trenord";

const uiLogger = logger.extend("UI");

export default function ClearTrenordCacheButton() {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.clearCacheButton,
        { backgroundColor: theme.colors.destructive },
      ]}
      onPress={() => {
        clearTrenordApiCache();
        uiLogger.log("User manually cleared the Trenord cache.");
      }}
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
        Clear Trenord Cache
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
