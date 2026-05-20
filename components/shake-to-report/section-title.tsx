import { type ReactNode } from "react";
import { StyleSheet, Text } from "react-native";

type SectionTitleProps = {
  children: ReactNode;
};

export function SectionTitle({ children }: SectionTitleProps) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A5750",
    marginBottom: 12,
  },
});
