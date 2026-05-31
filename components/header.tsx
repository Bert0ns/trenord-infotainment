import { createStyleHook } from "@/hooks/use-theme-color";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Header() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <View style={styles.headerContent}>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons
            name="arrow-back-ios"
            size={24}
            color={styles.iconColor.color}
          />
        </TouchableOpacity>
        <View style={styles.centerContent}>
          <Image
            source={require("../assets/images/trenord-icon.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.headerTitle}>TRENORD</Text>
        </View>
        <View style={{ width: 50 }}>{/* Placeholder for centering */}</View>
      </View>
    </View>
  );
}

const useStyles = createStyleHook((theme) => ({
  headerContainer: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.muted,
  },
  headerContent: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.primary,
    letterSpacing: 1,
  },
  iconButton: {
    padding: theme.spacing.sm,
  },
  iconColor: {
    color: theme.colors.primary,
  },
  centerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  logo: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
  },
}));
