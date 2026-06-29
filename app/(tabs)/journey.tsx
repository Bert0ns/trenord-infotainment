import JourneyTimeline from "@/components/journey-components/journeyTimeline";
import { useRefreshTrainData } from "@/hooks/use-refresh-train-data";
import { createStyleHook, useTheme } from "@/hooks/use-theme-color";
import {
  selectNextStop,
  selectOrigDestData,
  selectPassList,
  selectTrainInfo,
  useJourneyStore,
} from "@/store/journeyStore";
import { Redirect } from "expo-router";
import { RefreshControl, ScrollView, Text, View } from "react-native";

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
  uiLogger.trace(
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
      <JourneyTimeline
        passListArray={passListArray}
        destinationStation={destinationStation}
        nextStop={nextStop}
        trainInfo={trainInfo}
      />
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
}));
