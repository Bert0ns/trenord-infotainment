import JourneyTimeline from "@/components/journey-components/journeyTimeline";
import LoadingScreen from "@/components/loadingScreen";
import { useRefreshTrainData } from "@/hooks/use-refresh-train-data";
import { useScreenStyles } from "@/hooks/use-screen-styles";
import { useTheme } from "@/hooks/use-theme-color";
import {
  selectNextStop,
  selectOrigDestData,
  selectPassList,
  selectTrainInfo,
  useJourneyStore,
} from "@/store/journeyStore";
import { Redirect } from "expo-router";
import { RefreshControl, ScrollView } from "react-native";

import { logger } from "@/lib/logger";

const uiLogger = logger.extend("UI");

export default function JourneyScreen() {
  const styles = useScreenStyles();
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
    return <LoadingScreen />;
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
