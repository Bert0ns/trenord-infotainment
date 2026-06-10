import { createStyleHook } from "@/hooks/use-theme-color";
import React from "react";
import { View, ViewProps } from "react-native";

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "elevated" | "muted";
}

export default function Card({
  children,
  style,
  variant = "default",
  ...props
}: CardProps) {
  const styles = useStyles();

  return (
    <View style={[styles.card, styles[variant], style]} {...props}>
      {children}
    </View>
  );
}

const useStyles = createStyleHook((theme) => ({
  card: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  default: {
    backgroundColor: theme.colors.background,
  },
  muted: {
    backgroundColor: theme.colors.muted,
  },
  outline: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  elevated: {
    backgroundColor: theme.colors.backgroundTransparent,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
}));
