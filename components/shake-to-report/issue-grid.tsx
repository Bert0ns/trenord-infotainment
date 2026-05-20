import { StyleSheet, View } from "react-native";

import { IssueOptionCard } from "./issue-card";
import type { IssueOption } from "./issue-options";

type IssueGridProps = {
  options: IssueOption[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
};

export function IssueGrid({ options, selectedIds, onToggle }: IssueGridProps) {
  return (
    <View style={styles.grid}>
      {options.map((option) => (
        <IssueOptionCard
          key={option.id}
          option={option}
          selected={selectedIds.has(option.id)}
          onPress={() => onToggle(option.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
});
