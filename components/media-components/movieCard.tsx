import { createStyleHook } from "@/hooks/use-theme-color";
import React from "react";
import { ImageBackground, Text, View } from "react-native";
import Card from "@/components/ui/card";

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
  const styles = useStyles();

  return (
    <Card variant="elevated" style={[styles.cardContainer, { padding: 0 }]}>
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
    </Card>
  );
}

const useStyles = createStyleHook((theme) => ({
  cardContainer: {
    width: 330,
    height: 220,
    marginRight: theme.spacing.md,
  },
  image: {
    flex: 1,
    justifyContent: "flex-end",
  },
  imageRadius: {
    borderRadius: theme.borderRadius.lg,
  },
  overlay: {
    padding: theme.spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Scurisce l'immagine per far risaltare i testi
    borderRadius: theme.borderRadius.lg,
    height: "100%",
    justifyContent: "flex-end",
  },
  badge: {
    backgroundColor: "#8bdeab", // Verde chiaro per il badge del film
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: theme.spacing.sm,
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
}));
