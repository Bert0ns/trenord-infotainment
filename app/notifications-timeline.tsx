import { useRouter } from "expo-router";
import React, { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

import { SlideSheet, SheetHandle } from "@/components/ui/slide-sheet";
import { useNotificationRegistryStore } from "@/store/notificationRegistryStore";
import { createStyleHook } from "@/hooks/use-theme-color";

export default function NotificationsTimeline() {
  const router = useRouter();
  const { t } = useTranslation("notifications");
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const sheetRef = useRef<SheetHandle>(null);

  const { history, scheduledNotifications, markAllAsRead, clearHistory } =
    useNotificationRegistryStore();

  useEffect(() => {
    // Automatically mark all as read when opening the timeline
    // and whenever new notifications arrive while the panel is open
    markAllAsRead();
  }, [markAllAsRead, history]);

  const handleClose = () => {
    router.back();
  };

  const scheduledList = Object.values(scheduledNotifications).sort(
    (a, b) => a.timestamp - b.timestamp,
  );

  const renderItem = (
    title: string,
    body: string,
    isFuture: boolean,
    key: string,
    date: Date,
  ) => (
    <View
      key={key}
      style={[styles.itemContainer, isFuture && styles.itemFuture]}
    >
      <View style={styles.itemIconContainer}>
        <MaterialIcons
          name={isFuture ? "schedule" : "notifications"}
          size={24}
          style={isFuture ? styles.iconFuture : styles.iconPast}
        />
      </View>
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{title}</Text>
          <Text style={styles.itemTime}>
            {date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <Text style={styles.itemBody}>{body}</Text>
      </View>
    </View>
  );

  return (
    <SlideSheet
      ref={sheetRef}
      bottomInset={insets.bottom}
      onClose={handleClose}
      header={
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("timeline.title")}</Text>
          <TouchableOpacity onPress={() => sheetRef.current?.close()}>
            <MaterialIcons name="close" size={28} style={styles.closeIcon} />
          </TouchableOpacity>
        </View>
      }
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={clearHistory} style={styles.actionButton}>
            <Text style={styles.actionText}>{t("timeline.clearAll")}</Text>
          </TouchableOpacity>
        </View>

        {scheduledList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("timeline.future")}</Text>
            {scheduledList.map((item) =>
              renderItem(
                t("timeline.future"),
                t("timeline.scheduledBody"),
                true,
                item.id,
                new Date(item.timestamp),
              ),
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("timeline.past")}</Text>
          {history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {t("timeline.noNotifications")}
              </Text>
            </View>
          ) : (
            history.map((item) =>
              renderItem(
                item.title,
                item.body,
                false,
                item.id + item.timestamp,
                new Date(item.timestamp),
              ),
            )
          )}
        </View>
      </ScrollView>
    </SlideSheet>
  );
}

const useStyles = createStyleHook((theme) => ({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.foreground,
  },
  closeIcon: {
    color: theme.colors.foreground,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 16,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.muted,
    borderRadius: theme.borderRadius.sm,
  },
  actionText: {
    color: theme.colors.mutedForeground,
    fontWeight: "bold",
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.mutedForeground,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  itemFuture: {
    borderColor: theme.colors.primary,
    borderStyle: "dashed",
    backgroundColor: "transparent",
  },
  itemIconContainer: {
    marginRight: 12,
    justifyContent: "center",
  },
  iconPast: {
    color: theme.colors.mutedForeground,
  },
  iconFuture: {
    color: theme.colors.primary,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: theme.colors.foreground,
    flex: 1,
    marginRight: 8,
  },
  itemTime: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
  },
  itemBody: {
    fontSize: 14,
    color: theme.colors.foreground,
    lineHeight: 20,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    color: theme.colors.mutedForeground,
    fontStyle: "italic",
  },
}));
