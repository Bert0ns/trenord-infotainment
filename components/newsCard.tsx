import { createStyleHook } from "@/hooks/use-theme-color";
import React from "react";
import { Dimensions, Text, View } from "react-native";
import Card from "@/components/ui/card";

export default function NewsCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  const styles = useStyles();

  //const tagColor =
  //tag === "EVENT" ? theme.colors.primary : theme.colors.destructive;

  return (
    <Card variant="outline" style={styles.newsCard}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.newsText}>{text}</Text>
    </Card>
  );
}

const { width } = Dimensions.get("window");
const useStyles = createStyleHook((theme) => ({
  newsCard: {
    width: width * 0.65,
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.primary,
    marginBottom: 8,
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
    backgroundColor: theme.colors.muted,
    paddingVertical: 8,
    borderRadius: 9999,
    gap: 4,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "500",
    color: theme.colors.foreground,
  },
}));
