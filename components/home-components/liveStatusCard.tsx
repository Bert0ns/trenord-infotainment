import Card from "@/components/ui/card";
import { createStyleHook, useTheme } from "@/hooks/use-theme-color";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

interface LiveStatusCardProps {
  nextStop: string;
  arrivalTime: string;
  destination: string;
  destinationArrivalTime?: string;
  speed: string;
  trainNumber: string;
  delayMinutes: number;
  isFirst?: boolean;
  departureTime?: string;
  isCompleted?: boolean;
  isAtStation?: boolean;
}

export default function LiveStatusCard({
  nextStop,
  arrivalTime,
  destination,
  destinationArrivalTime,
  speed,
  trainNumber,
  delayMinutes,
  isFirst,
  departureTime,
  isCompleted,
  isAtStation,
}: LiveStatusCardProps) {
  const styles = useStyles();
  const theme = useTheme();
  const { t } = useTranslation("home", { keyPrefix: "liveStatusCard" });

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            flex: 1,
          }}
        >
          {isCompleted && (
            <Text style={styles.label}>{t("journeyCompleted")}</Text>
          )}
          {!isCompleted && isAtStation && (
            <Text style={styles.label}>{t("currentlyAt")}</Text>
          )}
          {!isCompleted && !isAtStation && isFirst && (
            <Text style={styles.label}>{t("startingFrom")}</Text>
          )}
          {!isCompleted && !isAtStation && !isFirst && (
            <Text style={styles.label}>{t("nextStop")}</Text>
          )}
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          {!isCompleted && <Text style={styles.label}>{t("destination")}</Text>}
          {delayMinutes > 0 && (
            <View style={styles.delayBadge}>
              <MaterialIcons
                name="warning"
                size={12}
                color={theme.colors.destructiveForeground}
              />
              <Text style={styles.delayText}>
                + {delayMinutes} {t("minutesDelay")}
              </Text>
            </View>
          )}
          {delayMinutes === 0 && !isCompleted && (
            <View
              style={[
                styles.delayBadge,
                { backgroundColor: theme.colors.info },
              ]}
            >
              <Text style={styles.onTimeText}>{t("onTime")}</Text>
            </View>
          )}
        </View>
      </View>

      <View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={[styles.stationName, { flex: 1 }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {nextStop}
          </Text>

          {!isCompleted && (
            <MaterialIcons
              name="arrow-forward"
              size={24}
              color={theme.colors.destructiveForeground}
              style={{ marginHorizontal: 8, opacity: 0.5 }}
            />
          )}

          {!isCompleted && (
            <Text
              style={[styles.stationName, { flex: 1, textAlign: "right" }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {destination}
            </Text>
          )}
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flex: 1 }}>
            {isCompleted && (
              <View style={styles.timeRow}>
                <MaterialIcons
                  name="place"
                  size={16}
                  color={theme.colors.destructiveForeground}
                  style={{ opacity: 0.9 }}
                />
                <Text style={styles.timeText}>{arrivalTime}</Text>
              </View>
            )}
            {!isCompleted && (isAtStation || isFirst) && (
              <View style={styles.timeRow}>
                <MaterialIcons
                  name="trip-origin"
                  size={16}
                  color={theme.colors.destructiveForeground}
                  style={{ opacity: 0.9 }}
                />
                <Text style={styles.timeText}>{departureTime}</Text>
              </View>
            )}
            {!isCompleted && !isAtStation && !isFirst && (
              <View style={styles.timeRow}>
                <MaterialIcons
                  name="place"
                  size={16}
                  color={theme.colors.destructiveForeground}
                  style={{ opacity: 0.9 }}
                />
                <Text style={styles.timeText}>{arrivalTime}</Text>
              </View>
            )}
          </View>

          {!isCompleted && (
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              {destinationArrivalTime && (
                <View style={styles.timeRow}>
                  <MaterialIcons
                    name="place"
                    size={16}
                    color={theme.colors.destructiveForeground}
                    style={{ opacity: 0.9 }}
                  />
                  <Text style={[styles.timeText, { textAlign: "right" }]}>
                    {destinationArrivalTime}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.infoBlock}>
          <Text style={styles.label}>{t("speed")}</Text>
          <View style={styles.valueRow}>
            <MaterialIcons
              name="speed"
              size={16}
              color={theme.colors.destructiveForeground}
              style={styles.icon}
            />
            <Text style={styles.valueText}>{speed}</Text>
          </View>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.label}>{t("trainNumber")}</Text>
          <Text style={styles.valueText}>{trainNumber}</Text>
        </View>
      </View>
    </Card>
  );
}

const useStyles = createStyleHook((theme) => ({
  card: {
    backgroundColor: theme.colors.homeLiveStatus,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    marginTop: 0,
  },
  label: {
    color: theme.colors.homeSecondary,
    opacity: 1.5,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  delayBadge: {
    backgroundColor: theme.colors.destructive,
    flexDirection: "row",
    alignItems: "center",
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
  onTimeText: {
    color: theme.colors.infoForeground,
    fontSize: 12,
    fontWeight: "600",
  },
  stationName: {
    color: theme.colors.destructiveForeground,
    fontSize: 32,
    fontWeight: "800",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: theme.spacing.md,
  },
  timeText: {
    color: theme.colors.destructiveForeground,
    fontSize: 14,
    opacity: 0.9,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.homeSecondary,
    opacity: 0.5,
    marginBottom: theme.spacing.md,
  },
  bottomRow: {
    flexDirection: "row",
    gap: theme.spacing.lg,
    flexWrap: "wrap",
  },
  infoBlock: {
    gap: 4,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 4,
  },
  valueText: {
    color: theme.colors.destructiveForeground,
    fontSize: 16,
    fontWeight: "500",
  },
}));
