import { THEME } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  //const insets = useSafeAreaInsets(); // Calcola lo spazio per gli iPhone moderni (pb-safe-area-bottom)

  return (
    <BlurView
      intensity={80}
      tint="light" // we can use "light" or "dark" or "default"
      style={[styles.container]}
    >
      <View style={styles.content}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.title !== undefined ? options.title : route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName: keyof typeof MaterialIcons.glyphMap = "help";

          switch (route.name) {
            case "index": // Home
              iconName = "home";
              if (isFocused) iconName = "home";
              break;
            case "journey":
              iconName = "alt-route";
              if (isFocused) iconName = "alt-route";
              break;
            case "media":
              iconName = "play-circle-outline";
              if (isFocused) iconName = "play-circle-filled";
              break;
            case "settings":
              iconName = "settings";
              if (isFocused) iconName = "settings";
              break;
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={({ pressed }) => [
                styles.tabItem,
                pressed && { transform: [{ scale: 0.9 }] },
              ]}
            >
              {/* Active indicator */}
              {isFocused && <View style={styles.activeIndicator} />}

              <MaterialIcons
                name={iconName}
                size={28}
                color={
                  isFocused
                    ? THEME.colors.primary
                    : THEME.colors.onSurfaceVariant
                }
                style={[styles.icon, { opacity: isFocused ? 1 : 0.7 }]}
              />

              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused
                      ? THEME.colors.primary
                      : THEME.colors.onSurfaceVariant,
                    opacity: isFocused ? 1 : 0.7,
                  },
                ]}
              >
                {String(label)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    // bg-surface/70
    backgroundColor: THEME.colors.surface70,
    // border-t border-outline-variant/20
    borderTopWidth: 1,
    borderTopColor: THEME.colors.outlineVariant20,
    // rounded-t-xl
    borderTopLeftRadius: THEME.borderRadius.xl,
    borderTopRightRadius: THEME.borderRadius.xl,
    // shadow-lg
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 80, // h-20
    paddingHorizontal: 16, // px-4
  },
  tabItem: {
    width: 64, // w-16
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  activeIndicator: {
    position: "absolute",
    top: -8, // after:-top-2
    width: 4, // after:w-1
    height: 4, // after:h-1
    borderRadius: 2,
    backgroundColor: THEME.colors.primary,
  },
  icon: {
    marginBottom: 4, // mb-1
  },
  label: {
    // font-label-caps text-label-caps dalla config tailwind
    fontFamily: THEME.typography.fontFamily,
    fontSize: THEME.typography.fontSize,
    //lineHeight: THEME.typography.lineHeight,
    letterSpacing: THEME.typography.letterSpacing,
  },
});
