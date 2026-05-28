import { Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
import { Tabs } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import Header from "../../components/header";
import CustomTabBar from "../../components/tabBar";

export default function TabLayout() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
  });

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
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="journey" options={{ title: "Journey" }} />
      <Tabs.Screen name="media" options={{ title: "Media" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
