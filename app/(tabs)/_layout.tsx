import Header from "@/components/header";
import CustomTabBar from "@/components/tabBar";
import { useTrainPolling } from "@/hooks/use-train-polling";
import { useJourneyNotifications } from "@/hooks/use-journey-notifications";
import { Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

export default function TabLayout() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
  });
  const { t } = useTranslation("common");

  useTrainPolling();
  useJourneyNotifications();

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
