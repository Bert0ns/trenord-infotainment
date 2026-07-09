import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { Platform, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { SettingsProvider } from "@/hooks/settings";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const lastMagnitudeRef = useRef(0);
  const lastShakeAtRef = useRef(0);

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    let subscription: { remove: () => void } | null = null;
    let isActive = true;

    void import("expo-sensors").then(({ Accelerometer }) => {
      if (!isActive) {
        return;
      }

      Accelerometer.setUpdateInterval(200);
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const delta = Math.abs(magnitude - lastMagnitudeRef.current);
        lastMagnitudeRef.current = magnitude;

        const now = Date.now();
        const cooldownMs = 1500;
        const minDelta = 1.2;
        const shakeThreshold = 2.2;

        if (
          delta > minDelta &&
          magnitude > shakeThreshold &&
          now - lastShakeAtRef.current > cooldownMs &&
          pathname !== "/report-issue-page"
        ) {
          lastShakeAtRef.current = now;
          router.push("/report-issue-page");
        }
      });
    });

    return () => {
      isActive = false;
      subscription?.remove();
    };
  }, [pathname, router]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SettingsProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="report-issue-page"
            options={{
              presentation: "transparentModal",
              animation: "none",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="news-magazine"
            options={{
              presentation: "transparentModal",
              animation: "none",
              headerShown: false,
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
