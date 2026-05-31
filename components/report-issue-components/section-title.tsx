import { type ReactNode } from "react";
import { Text } from "react-native";
import { createStyleHook } from "@/hooks/use-theme-color";

type SectionTitleProps = {
  children: ReactNode;
};

export function SectionTitle({ children }: SectionTitleProps) {
  const styles = useStyles();
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

const useStyles = createStyleHook((theme) => ({
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.mutedForeground,
    marginBottom: 12,
  },
}));
