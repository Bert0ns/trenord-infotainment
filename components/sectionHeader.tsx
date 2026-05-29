import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { THEME } from "../constants/theme";

interface SectionHeaderProps {
  title: string;
  type?: "journey" | "media" | "home";
  isFirst?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

export default function SectionHeader({
  title,
  type,
  icon,
  isFirst,
}: SectionHeaderProps) {
  return (
    <View style={isFirst ? styles.firstContainer : styles.container}>
      {type === "home" ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <MaterialIcons
            name={icon || "train"}
            size={16}
            color={THEME.colors.primary}
          />
          <Text style={styles.titelHome}>{title}</Text>
        </View>
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
      {type === "media" && (
        <TouchableOpacity>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
  },
  firstContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 0,
    marginBottom: THEME.spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: THEME.colors.onSurface,
  },
  titelHome: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.colors.onSurface,
  },
  seeAll: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.colors.primary,
  },
});
