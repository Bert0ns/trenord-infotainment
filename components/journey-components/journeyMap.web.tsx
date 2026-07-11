import { createStyleHook } from "@/hooks/use-theme-color";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { type JourneyMapProps } from "./journeyMap";

export function JourneyMap(_: JourneyMapProps) {
  const styles = useStyles();
  const { t } = useTranslation("common");

  return (
    <View style={styles.mapContainer}>
      <Text style={styles.placeholderText}>{t("mapNotAvailableWeb")}</Text>
    </View>
  );
}

const useStyles = createStyleHook((theme) => ({
  mapContainer: {
    width: "100%",
    height: 400,
    backgroundColor: theme.colors.muted,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: "hidden",
    borderColor: theme.colors.border,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: theme.colors.mutedForeground,
    fontWeight: "bold",
  },
}));
