import Card from "@/components/ui/card";
import { createStyleHook, useTheme } from "@/hooks/use-theme-color";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

interface LiveStatusCardProps {
  nextStop: string;
  arrivalTime: string;
  speed: string;
  trainNumber: string;
  delayMinutes: number;
  isFirst?: boolean;
  departureTime?: string;
}

export default function LiveStatusCard({
  nextStop,
  arrivalTime,
  speed,
  trainNumber,
  delayMinutes,
  isFirst,
  departureTime,
}: LiveStatusCardProps) {
  const styles = useStyles();
  const theme = useTheme();
  const { t } = useTranslation("home", { keyPrefix: "liveStatusCard" });

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        {isFirst && <Text style={styles.label}>t("startingFrom")</Text>}
        {!isFirst && <Text style={styles.label}>t("nextStop")</Text>}
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
        {delayMinutes === 0 && (
          <View
            style={[styles.delayBadge, { backgroundColor: theme.colors.info }]}
          >
            <Text style={styles.onTimeText}>{t("onTime")}</Text>
          </View>
        )}
      </View>

      <View>
        <Text style={styles.stationName}>{nextStop}</Text>
        {isFirst && <Text style={styles.arrTime}>Dep: {departureTime}</Text>}
        {!isFirst && <Text style={styles.arrTime}>Arr: {arrivalTime}</Text>}
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
  arrTime: {
    color: theme.colors.destructiveForeground,
    fontSize: 14,
    opacity: 0.9,
    marginBottom: theme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.homeSecondary,
    opacity: 0.5,
    marginBottom: theme.spacing.md,
  },
  bottomRow: {
    flexDirection: "row",
    gap: theme.spacing.xl,
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
