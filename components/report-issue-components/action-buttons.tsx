import { createStyleHook } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

type ActionButtonsProps = {
  onSubmit: () => void;
  onCancel: () => void;
};

export function ActionButtons({ onSubmit, onCancel }: ActionButtonsProps) {
  const styles = useStyles();
  const { t } = useTranslation("reportIssue", { keyPrefix: "actionButtons" });

  return (
    <View>
      <Pressable
        style={styles.submitButton}
        accessibilityRole="button"
        onPress={onSubmit}
      >
        <Text style={styles.submitLabel}>{t("submitReport")}</Text>
        <Ionicons
          name="arrow-forward"
          size={18}
          color={styles.submitLabel.color}
        />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={onCancel}
        style={({ pressed }) => [
          styles.cancelButton,
          pressed && styles.cancelPressed,
        ]}
      >
        <Text style={styles.cancelLabel}>{t("cancel")}</Text>
      </Pressable>
    </View>
  );
}

const useStyles = createStyleHook((theme) => ({
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 28,
    paddingVertical: 16,
    marginBottom: 12,
  },
  submitLabel: {
    color: theme.colors.primaryForeground,
    fontSize: 17,
    fontWeight: "700",
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  cancelPressed: {
    opacity: 0.7,
  },
  cancelLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.mutedForeground,
  },
}));
