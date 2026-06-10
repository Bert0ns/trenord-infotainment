import { createStyleHook } from "@/hooks/use-theme-color";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import Card from "@/components/ui/card";

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
  const styles = useStyles();

  return (
    <Card variant="muted" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialIcons
            name={iconName}
            size={20}
            color={styles.iconColor.color}
          />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      {children}
    </Card>
  );
}

const useStyles = createStyleHook((theme) => ({
  card: {
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  iconContainer: {
    backgroundColor: "#00643C33", // Grigio-verde chiaro
    padding: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  iconColor: {
    color: theme.colors.primary,
  },
}));
