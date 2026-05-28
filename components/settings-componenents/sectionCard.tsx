import { THEME } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface SectionCardProps {
  iconName: keyof typeof MaterialIcons.glyphMap;
  title: string;
  children: React.ReactNode;
}

export default function SectionCard({
  iconName,
  title,
  children,
}: SectionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialIcons
            name={iconName}
            size={20}
            color={THEME.colors.primary}
          />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surfaceVariant,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: THEME.spacing.md,
  },
  iconContainer: {
    backgroundColor: "#d6e2db", // Grigio-verde chiaro
    padding: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.colors.onSurface,
  },
});
