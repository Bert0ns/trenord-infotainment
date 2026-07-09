import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { logger } from "@/lib/logger";
import { useTheme } from "@/hooks/use-theme-color";
import { useWeatherStore } from "@/store/weatherStore";

const uiLogger = logger.extend("UI");

export default function ClearWeatherCacheButton() {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.clearCacheButton,
        { backgroundColor: theme.colors.destructive },
      ]}
      onPress={() => {
        useWeatherStore.getState().clearCache();
        uiLogger.log("User manually cleared the Weather cache.");
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
        Clear Weather Cache
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
