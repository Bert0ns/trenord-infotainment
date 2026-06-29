import Header from "@/components/header";
import CustomTabBar from "@/components/tabBar";
import { fetchTrainData } from "@/lib/api/trenord";
import { logger } from "@/lib/logger";
import {
  useJourneyStore,
  selectIsJourneyCompleted,
} from "@/store/journeyStore";
import { Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

const pollingLogger = logger.extend("Polling");

const FETCH_TRAIN_POLLING_RATE = 120000; //2 min

export default function TabLayout() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
  });
  const { t } = useTranslation("common");

  const trainId = useJourneyStore((s) => s.trainId);
  const destinationStation = useJourneyStore((s) => s.destinationStation);
  const setJourney = useJourneyStore((s) => s.setJourney);

  const isJourneyCompleted = useJourneyStore(selectIsJourneyCompleted);

  useEffect(() => {
    if (!trainId || !destinationStation || isJourneyCompleted) return;

    let isMounted = true;

    const pollTrainData = async () => {
      try {
        pollingLogger.trace(`Background fetch for train ${trainId}...`);
        const data = await fetchTrainData(trainId);
        if (isMounted && data && data.length > 0) {
          setJourney(trainId, destinationStation, data);
        }
      } catch (err) {
        pollingLogger.error(`Failed to fetch train data:`, err);
      }
    };

    const interval = setInterval(pollTrainData, FETCH_TRAIN_POLLING_RATE);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [trainId, destinationStation, isJourneyCompleted, setJourney]);

  if (!fontsLoaded) {
    return (
      <View>
        <Text>{t("loading")}</Text>
      </View>
    );
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: true, header: () => <Header /> }}
    >
      <Tabs.Screen name="home" options={{ title: t("tabLayout.home") }} />
      <Tabs.Screen name="journey" options={{ title: t("tabLayout.journey") }} />
      <Tabs.Screen name="media" options={{ title: t("tabLayout.media") }} />
      <Tabs.Screen
        name="settings"
        options={{ title: t("tabLayout.settings") }}
      />
    </Tabs>
  );
}
