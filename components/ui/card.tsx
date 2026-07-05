import { createStyleHook } from "@/hooks/use-theme-color";
import React from "react";
import { Pressable, StyleProp, View, ViewProps, ViewStyle } from "react-native";

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "elevated" | "muted";
  onPress?: () => void;
}

export default function Card({
  children,
  style,
  variant = "default",
  onPress,
  ...props
}: CardProps) {
  const styles = useStyles();
  const cardStyle = [
    styles.card,
    styles[variant],
    style,
  ] as StyleProp<ViewStyle>;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && { opacity: 0.7 }]}
        {...(props as any)}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle} {...props}>
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
    backgroundColor: theme.colors.backgroundTransparent, // O theme.colors.background se preferisci non trasparente
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
}));
