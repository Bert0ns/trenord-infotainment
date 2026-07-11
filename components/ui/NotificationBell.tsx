import { useNotificationRegistryStore } from "@/store/notificationRegistryStore";
import { MaterialIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { createStyleHook } from "@/hooks/use-theme-color";

interface NotificationBellProps {
  onPress: () => void;
}

export function NotificationBell({ onPress }: NotificationBellProps) {
  const styles = useStyles();
  const unreadCount = useNotificationRegistryStore(
    (state) => state.history.filter((item) => !item.isRead).length,
  );

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <MaterialIcons name="notifications" size={24} style={styles.iconColor} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const useStyles = createStyleHook((theme) => ({
  container: {
    position: "relative",
    padding: theme.spacing.sm,
  },
  iconColor: {
    color: theme.colors.primary,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: theme.colors.destructive,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: theme.colors.background,
  },
  badgeText: {
    color: theme.colors.destructiveForeground,
    fontSize: 10,
    fontWeight: "bold",
  },
}));
