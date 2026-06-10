import { Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import Header from "../../components/header";
import CustomTabBar from "../../components/tabBar";

export default function TabLayout() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
  });
  const { t } = useTranslation("common", { keyPrefix: "tabLayout" });

  if (!fontsLoaded) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: true, header: () => <Header /> }}
    >
      <Tabs.Screen name="home" options={{ title: t("home") }} />
      <Tabs.Screen name="journey" options={{ title: t("journey") }} />
      <Tabs.Screen name="media" options={{ title: t("media") }} />
      <Tabs.Screen name="settings" options={{ title: t("settings") }} />
    </Tabs>
  );
}
