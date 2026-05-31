import { createStyleHook } from "@/hooks/use-theme-color";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const styles = useStyles();

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
                    ? styles.iconFocused.color
                    : styles.iconUnfocused.color
                }
                style={[
                  ,
                  styles.icon,
                  isFocused ? styles.iconFocused : styles.iconUnfocused,
                ]}
              />

              <Text
                style={[
                  styles.label,
                  isFocused ? styles.labelFocused : styles.labelUnfocused,
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

const useStyles = createStyleHook((theme) => ({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    // bg-surface/70
    backgroundColor: theme.colors.surface70,
    // border-t border-outline-variant/20
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant20,
    // rounded-t-xl
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
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
    backgroundColor: theme.colors.primary,
  },
  icon: {
    marginBottom: 4, // mb-1
  },
  iconFocused: {
    color: theme.colors.primary,
    opacity: 1,
  },
  iconUnfocused: {
    color: theme.colors.onSurfaceVariant,
    opacity: 0.7,
  },
  label: {
    // font-label-caps text-label-caps dalla config tailwind
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize,
    //lineHeight: theme.typography.lineHeight,
    letterSpacing: theme.typography.letterSpacing,
  },
  labelFocused: {
    color: theme.colors.primary,
    opacity: 1,
  },
  labelUnfocused: {
    color: theme.colors.onSurfaceVariant,
    opacity: 0.7,
  },
}));
