import { createStyleHook, useTheme } from "@/hooks/use-theme-color";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";

interface DiscoveryCardProps {
  imageSource: any;
  title: string;
  category: string;
  distance: string;
}

export default function DiscoverCard({
  imageSource,
  title,
  category,
  distance,
}: DiscoveryCardProps) {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <View style={styles.discoverCard}>
      <Image source={imageSource} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.discoverTitle}>{title}</Text>
        <Text style={styles.discoverSubtitle}>
          {category} • {distance}
        </Text>
        <TouchableOpacity style={styles.button}>
          <MaterialIcons
            name="directions"
            size={16}
            color={theme.colors.primaryForeground}
          />
          <Text style={styles.buttonText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { width } = Dimensions.get("window");
const useStyles = createStyleHook((theme) => ({
  newsCard: {
    width: width * 0.65,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginRight: theme.spacing.sm,
  },
  tag: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5, marginBottom: 8 },
  newsText: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    lineHeight: 20,
  },

  discoverCard: {
    width: width * 0.55,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
    overflow: "hidden",
  },
  image: { width: "100%", height: 120 },
  info: { padding: theme.spacing.md },
  discoverTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: 2,
  },
  discoverSubtitle: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.md,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    borderRadius: 9999,
    gap: 4,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "500",
    color: theme.colors.primaryForeground,
  },
}));
