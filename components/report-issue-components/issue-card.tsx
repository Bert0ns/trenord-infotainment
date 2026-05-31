import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";
import { THEME } from "../../constants/theme";

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
        color={selected ? THEME.colors.primary : THEME.colors.onSurfaceVariant}
      />
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {option.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#C7D1CB",
    borderRadius: 18,
    backgroundColor: "#F7F9F8",
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
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryContainer,
  },
  cardPressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.colors.onSurfaceVariant,
  },
  labelSelected: {
    color: THEME.colors.primary,
  },
});
