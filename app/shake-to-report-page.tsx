import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    ActionButtons,
    DetailsInput,
    IssueGrid,
    IssueOptionCard,
    ReportHeader,
    SectionTitle,
    SheetContainer,
    issueOptions,
} from "@/components/shake-to-report";

export default function ShakeToReportPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(
    () => new Set(["other-issue"]),
  );
  const [details, setDetails] = useState("");

  const options = useMemo(() => issueOptions, []);
  const primaryOptions = options.slice(0, 4);
  const otherOption = options[4];

  const toggleIssue = (id: string) => {
    setSelectedIssues((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <SheetContainer bottomInset={insets.bottom}>
      <ReportHeader title="Report an Issue" onClose={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle>What seems to be the problem?</SectionTitle>
        <IssueGrid
          options={primaryOptions}
          selectedIds={selectedIssues}
          onToggle={toggleIssue}
        />

        <IssueOptionCard
          option={otherOption}
          selected={selectedIssues.has(otherOption.id)}
          onPress={() => toggleIssue(otherOption.id)}
          variant="wide"
        />

        <SectionTitle>Additional details (Optional)</SectionTitle>
        <DetailsInput value={details} onChange={setDetails} />

        <ActionButtons onSubmit={() => {}} onCancel={() => router.back()} />
      </ScrollView>
    </SheetContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 12,
  },
});
