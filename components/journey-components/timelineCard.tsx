import { createStyleHook, useTheme } from "@/hooks/use-theme-color";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

export type NodeStatus = "past" | "current" | "future";

interface TimelineCardProps {
  status: NodeStatus;
  stationName: string;
  scheduledTime?: string;
  estimatedTime?: string;
  actualTime?: string;
  platform?: string;
  delayMinutes?: number;
  isCancelled?: boolean;
  isLast?: boolean;
}

export default function TimelineCard({
  status,
  stationName,
  scheduledTime,
  actualTime,
  estimatedTime,
  platform,
  delayMinutes,
  isCancelled,
  isLast,
}: TimelineCardProps) {
  const styles = useStyles();
  const theme = useTheme();
  const { t } = useTranslation("journey", { keyPrefix: "timelineCard" });

  const isPast = status === "past";
  const isCurrent = status === "current";
  const isFuture = status === "future";

  return (
    <View style={styles.container}>
      <View style={styles.timelineColumn}>
        {/* Vertical Line */}
        {!isLast && (
          <View
            style={[
              styles.line,
              {
                backgroundColor: isFuture
                  ? theme.colors.border
                  : theme.colors.primary,
              },
            ]}
          />
        )}
        {/* Dot */}
        {isCancelled === true && (
          <MaterialIcons
            name="cancel"
            size={14}
            color={theme.colors.destructive}
            style={{
              position: "absolute",
              zIndex: 3,
              marginTop: theme.spacing.sm + 4,
            }}
          />
        )}
        {!isCancelled && (
          <View
            style={[
              styles.dot,
              isCurrent && styles.dotCurrent,
              isFuture && {
                backgroundColor: theme.colors.border,
                borderColor: theme.colors.background,
              },
              (isPast || isCurrent) && {
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.background,
              },
            ]}
          />
        )}
      </View>

      <View style={styles.contentColumn}>
        <View style={[styles.card, isCurrent && styles.currentCard]}>
          <View style={styles.headerRow}>
            <View>
              <Text
                style={[
                  styles.stationName,
                  isCurrent && styles.currentStationName,
                  isFuture && styles.textMuted,
                ]}
              >
                {stationName}
              </Text>

              {/* Info */}
              <View style={styles.subInfoRow}>
                {/* Platform */}
                {platform && !isCurrent && (
                  <Text style={styles.subInfoText}>
                    {t("platform", { platform })}
                  </Text>
                )}
                {/* Arriving + Platform */}
                {isCurrent && (
                  <Text style={styles.arrivingText}>
                    {t("arrivingIn", { minutes: delayMinutes })} •{" "}
                    {t("platform", { platform })}
                  </Text>
                )}
                {/* Cancelled */}
                {isCancelled && (
                  <View style={styles.onTimeRow}>
                    <Text
                      style={[
                        styles.subInfoText,
                        { color: theme.colors.destructive },
                      ]}
                    >
                      {t("cancelled")}
                    </Text>
                  </View>
                )}
              </View>

              {/* Delay Badge */}
              {isCurrent && delayMinutes && delayMinutes > 0 && (
                <View style={styles.delayBadge}>
                  <MaterialIcons
                    name="warning"
                    size={12}
                    color={theme.colors.destructiveForeground}
                  />
                  <Text style={styles.delayText}>
                    {t("minutesDelay", { minutes: delayMinutes })}
                  </Text>
                </View>
              )}
            </View>

            {/* Time */}
            <View style={styles.timeContainer}>
              {/* Scheduled Time */}
              <Text
                style={[
                  styles.scheduledTime,
                  isPast && styles.timeStrikethrough,
                  isCurrent && styles.timeCurrent,
                ]}
              >
                {scheduledTime}
              </Text>
              {/* Actual depearted time */}
              {actualTime && isPast && (
                <Text
                  style={[styles.statusText, { color: theme.colors.primary }]}
                >
                  {t("departedAt", { time: actualTime })}
                </Text>
              )}
              {/* Estimated time */}
              {isFuture && (
                <Text style={styles.subInfoText}>{estimatedTime}</Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const useStyles = createStyleHook((theme) => ({
  container: {
    flexDirection: "row",
    minHeight: 80,
  },
  timelineColumn: {
    width: 30,
    alignItems: "center",
  },
  line: {
    position: "absolute",
    top: 24,
    bottom: -5,
    width: 2,
    zIndex: 1,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    marginTop: theme.spacing.sm + 4,
    zIndex: 2,
  },
  dotCurrent: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 4,
    marginTop: theme.spacing.md + 4,
  },
  contentColumn: {
    flex: 1,
    paddingBottom: theme.spacing.xl,
  },
  card: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  currentCard: {
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stationName: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: 4,
  },
  currentStationName: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  textMuted: {
    color: theme.colors.mutedForeground,
  },
  subInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  subInfoText: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
  },
  onTimeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  arrivingText: {
    fontSize: 13,
    fontWeight: "500",
    color: theme.colors.primary,
  },
  delayBadge: {
    backgroundColor: theme.colors.destructive,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  delayText: {
    color: theme.colors.destructiveForeground,
    fontSize: 12,
    fontWeight: "600",
  },
  timeContainer: {
    alignItems: "flex-end",
  },
  scheduledTime: {
    fontSize: 15,
    color: theme.colors.mutedForeground,
  },
  timeStrikethrough: {
    textDecorationLine: "line-through",
    color: theme.colors.border,
  },
  timeCurrent: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  inMinsText: {
    fontSize: 13,
    color: theme.colors.foreground,
    marginTop: 2,
  },
}));
