import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { THEME } from "../constants/theme";

export default function Header() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <View style={styles.headerContent}>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons
            name="arrow-back-ios"
            size={24}
            color={THEME.colors.primary}
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

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceVariant,
  },
  headerContent: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: THEME.spacing.md,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: THEME.colors.primary,
    letterSpacing: 1,
  },
  iconButton: {
    padding: THEME.spacing.sm,
  },
  centerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  logo: {
    width: 32,
    height: 32,
  },
});
