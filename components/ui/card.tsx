import { createStyleHook } from "@/hooks/use-theme-color";
import React from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";

export type CardProps = ViewProps &
  Omit<PressableProps, "style" | "children"> & {
    children: React.ReactNode;
    variant?: "default" | "outline" | "elevated" | "muted";
    style?: StyleProp<ViewStyle>;
  };

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
        {...props}
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
    backgroundColor: theme.colors.backgroundTransparent, // Or theme.colors.background if you prefer non-transparent
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
}));
