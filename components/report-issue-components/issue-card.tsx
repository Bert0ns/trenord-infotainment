import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";
import { createStyleHook } from "@/hooks/use-theme-color";

import type { IssueOption } from "./issue-options";

type IssueOptionCardProps = {
  option: IssueOption;
  selected: boolean;
  onPress: () => void;
  variant?: "compact" | "wide";
};

export function IssueOptionCard({
  option,
  selected,
  onPress,
  variant = "compact",
}: IssueOptionCardProps) {
  const styles = useStyles();
  const isWide = variant === "wide";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isWide ? styles.cardWide : styles.cardCompact,
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
    >
      <Ionicons
        name={option.icon}
        size={22}
        color={selected ? styles.iconSelected.color : styles.icon.color}
      />
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {option.label}
      </Text>
    </Pressable>
  );
}

const useStyles = createStyleHook((theme) => ({
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 18,
    backgroundColor: theme.colors.muted,
    gap: 8,
  },
  cardCompact: {
    flexBasis: "48%",
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  cardWide: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  cardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.secondary,
  },
  cardPressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  labelSelected: {
    color: theme.colors.primary,
  },
  icon: {
    color: theme.colors.foreground,
  },
  iconSelected: {
    color: theme.colors.primary,
  },
}));
