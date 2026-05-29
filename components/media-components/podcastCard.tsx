import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { THEME } from "../../constants/theme";

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
          color={THEME.colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surfaceVariant, // Grigio chiaro (#f3f3f8)
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.sm + 2,
    marginBottom: THEME.spacing.sm,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: "#000", // Fallback se l'immagine carica lentamente
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: THEME.spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.colors.onSurface,
    marginBottom: 2,
  },
  episode: {
    fontSize: 13,
    color: THEME.colors.onSurfaceVariant,
  },
  plusButton: {
    padding: THEME.spacing.sm,
  },
});
