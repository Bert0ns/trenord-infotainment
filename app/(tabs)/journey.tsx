import TimelineCard from "@/components/journey-components/timelineCard";
import { createStyleHook, useTheme } from "@/hooks/use-theme-color";
import {
  useJourneyStore,
  selectOrigDestData,
  selectTrainInfo,
  selectPassList,
  selectNextStop,
} from "@/store/journeyStore";
import { capitalizeWords } from "@/utils/string";
import { MaterialIcons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { ScrollView, Text, View, RefreshControl } from "react-native";
import { useRefreshTrainData } from "@/hooks/use-refresh-train-data";

import { logger } from "@/lib/logger";
import { useTranslation } from "react-i18next";

const uiLogger = logger.extend("UI");

export default function JourneyScreen() {
  const { t } = useTranslation("common");
  const styles = useStyles();
  const theme = useTheme();
  const trainId = useJourneyStore((s) => s.trainId);
  const destinationStation = useJourneyStore((s) => s.destinationStation);
  const origDestData = useJourneyStore(selectOrigDestData);
  const trainInfo = useJourneyStore(selectTrainInfo);
  const passListArray = useJourneyStore(selectPassList);
  const nextStop = useJourneyStore(selectNextStop);
  const { isRefreshing, onRefresh } = useRefreshTrainData();

  if (!trainId) return <Redirect href="/login" />;

  if (!origDestData || !trainInfo || !passListArray) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Text style={styles.pageSubtitle}>{t("loadingTrainData")}</Text>
      </View>
    );
  }
  uiLogger.log(
    `Rendering timeline for train ${trainId}. ${passListArray.length} stations loaded.`,
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>
          {destinationStation
            ? capitalizeWords(destinationStation.station_ori_name)
            : "Unknown"}{" "}
          - {trainInfo.train_category} {trainId}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <MaterialIcons
            name="access-time"
            size={16}
            color={theme.colors.mutedForeground}
          />
          <Text style={styles.pageSubtitle}>
            {origDestData.dep_time
              ? origDestData.dep_time.slice(0, 5)
              : "Unknown"}{" "}
            -{" "}
            {origDestData.dep_time
              ? origDestData.arr_time.slice(0, 5)
              : "Unknown"}
          </Text>
        </View>
      </View>
      {/* Timeline Fermate */}
      <View style={styles.timelineContainer}>
        {passListArray.map((pass: any, index: any) => {
          let status: any = "future";
          if (pass === nextStop) {
            status = "current";
          } else if (
            (nextStop && pass.pass_count < nextStop.pass_count) ||
            (pass.type === "O" &&
              pass.actual_data?.dep_actual_time !== undefined) ||
            (pass.type === "D" &&
              pass.actual_data?.arr_actual_time !== undefined) ||
            (pass.actual_data?.arr_actual_time !== undefined &&
              pass.actual_data?.dep_actual_time !== undefined)
          ) {
            status = "past";
          }

          const scheduledTime =
            pass.type === "O" ? pass.dep_time : pass.arr_time;
          const actualTime =
            pass.type === "O"
              ? pass.actual_data?.dep_actual_time
              : pass.actual_data?.arr_actual_time;

          return (
            <TimelineCard
              key={pass.station.station_id}
              status={status}
              stationName={capitalizeWords(pass.station.station_ori_name)}
              scheduledTime={scheduledTime?.slice(0, 5) || "N/A"}
              actualTime={actualTime?.slice(0, 5) || "N/A"}
              platform={pass.platform ? String(pass.platform) : undefined}
              delayMinutes={trainInfo.delay ? trainInfo.delay : 0}
              isCancelled={pass.cancelled}
              isLast={index === passListArray.length - 1}
              isFirst={nextStop?.pass_count === 1}
              isCompleted={
                pass.type === "D" &&
                pass.actual_data?.arr_actual_time !== undefined
              }
              isAtStation={
                pass.actual_data?.arr_actual_time !== undefined &&
                pass.actual_data?.dep_actual_time === undefined &&
                pass.type !== "D"
              }
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

const useStyles = createStyleHook((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: 100, // Spazio extra per non sovrapporsi alla tua bottom nav bar
  },
  pageHeader: {
    marginBottom: theme.spacing.lg,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  pageSubtitle: {
    fontSize: 16,
    color: theme.colors.mutedForeground,
    lineHeight: 22,
  },
  themeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  themeBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
  },
  themeBoxActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.secondary,
  },
  themeBoxText: {
    marginTop: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.mutedForeground,
  },
  themeBoxTextActive: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  dropdownText: {
    fontSize: 16,
    color: theme.colors.foreground,
  },
  footer: {
    marginTop: theme.spacing.md,
    alignItems: "center",
  },
  reportButton: {
    backgroundColor: theme.colors.destructive,
    width: "100%",
    paddingVertical: 14,
    borderRadius: theme.borderRadius.xl,
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  reportButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  versionText: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.sm,
  },
  linksRow: {
    flexDirection: "row",
    gap: 16,
  },
  link: {
    fontSize: 13,
    color: theme.colors.primary,
  },
  card: {
    backgroundColor: theme.colors.muted,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  timelineContainer: {
    marginTop: theme.spacing.sm,
    paddingLeft: theme.spacing.sm, // Per dare spazio ai pallini
  },
}));
