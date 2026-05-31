import { createStyleHook } from "@/hooks/use-theme-color";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface PodcastCardProps {
  imageSource: any;
  title: string;
  episode: string;
}

export default function PodcastCard({
  imageSource,
  title,
  episode,
}: PodcastCardProps) {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Image source={imageSource} style={styles.image} />

      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.episode} numberOfLines={1}>
          {episode}
        </Text>
      </View>

      <TouchableOpacity style={styles.plusButton}>
        <MaterialIcons
          name="add-circle-outline"
          size={24}
          color={styles.iconColor.color}
        />
      </TouchableOpacity>
    </View>
  );
}

const useStyles = createStyleHook((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceVariant, // Grigio chiaro (#f3f3f8)
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm + 2,
    marginBottom: theme.spacing.sm,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: "#000", // Fallback se l'immagine carica lentamente
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.onSurface,
    marginBottom: 2,
  },
  episode: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
  plusButton: {
    padding: theme.spacing.sm,
  },
  iconColor: {
    color: theme.colors.primary,
  },
}));
