import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { createStyleHook } from "@/hooks/use-theme-color";

type ReportHeaderProps = {
  title: string;
  onClose: () => void;
};

export function ReportHeader({ title, onClose }: ReportHeaderProps) {
  const styles = useStyles();

  return (
    <View style={styles.headerRow}>
      <View style={styles.headerLeft}>
        <View style={styles.warningBadge}>
          <Ionicons name="warning" size={18} color={styles.warningIcon.color} />
        </View>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={onClose}
        style={({ pressed }) => [
          styles.closeButton,
          pressed && styles.closeButtonPressed,
        ]}
      >
        <Ionicons name="close" size={20} color={styles.closeIcon.color} />
      </Pressable>
    </View>
  );
}

const useStyles = createStyleHook((theme) => ({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  warningBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.destructive,
    alignItems: "center",
    justifyContent: "center",
  },
  warningIcon: {
    color: theme.colors.destructiveForeground,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonPressed: {
    opacity: 0.7,
  },
  closeIcon: {
    color: theme.colors.mutedForeground,
  },
}));
