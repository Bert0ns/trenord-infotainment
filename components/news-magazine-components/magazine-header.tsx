import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { createStyleHook } from "@/hooks/use-theme-color";

type MagazineHeaderProps = {
  title: string;
  onClose: () => void;
};

export function MagazineHeader({ title, onClose }: MagazineHeaderProps) {
  const styles = useStyles();

  return (
    <View style={styles.headerRow}>
      <View style={styles.headerLeft}>
        <View style={styles.iconBadge}>
          <MaterialIcons
            name="local-library"
            size={20}
            color={styles.icon.color}
          />
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
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    color: theme.colors.primaryForeground,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
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
