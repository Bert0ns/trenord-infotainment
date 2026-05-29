import React from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { THEME } from "../../constants/theme";

interface MovieCardProps {
  imageSource: any;
  title: string;
  category: string;
  duration: string;
}

export default function MovieCard({
  imageSource,
  title,
  category,
  duration,
}: MovieCardProps) {
  return (
    <View style={styles.cardContainer}>
      <ImageBackground
        source={imageSource}
        style={styles.image}
        imageStyle={styles.imageRadius}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {category} • {duration}
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 330,
    height: 220,
    marginRight: THEME.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    flex: 1,
    justifyContent: "flex-end",
  },
  imageRadius: {
    borderRadius: THEME.borderRadius.lg,
  },
  overlay: {
    padding: THEME.spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Scurisce l'immagine per far risaltare i testi
    borderRadius: THEME.borderRadius.lg,
    height: "100%",
    justifyContent: "flex-end",
  },
  badge: {
    backgroundColor: "#8bdeab", // Verde chiaro per il badge del film
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: THEME.spacing.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#002110",
    textTransform: "uppercase",
  },
  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 2,
  },
  subtitle: {
    color: "#e2e2e7",
    fontSize: 14,
  },
});
