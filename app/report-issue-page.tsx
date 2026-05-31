import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
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
  type SheetHandle,
  issueOptions,
} from "@/components/report-issue-components";

export default function ReportIssuePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const sheetRef = useRef<SheetHandle | null>(null);
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

  const requestClose = () => {
    if (sheetRef.current?.close) {
      sheetRef.current.close();
    } else {
      router.back();
    }
  };

  const onSubmitReportIssue = () => {
    alert("Report submitted successfully!");
    console.log("Report Issue form Data:", {
      selectedIssues: Array.from(selectedIssues),
      details,
    });
    requestClose();
  };

  return (
    <SheetContainer
      ref={sheetRef}
      bottomInset={insets.bottom}
      onClose={() => router.back()}
    >
      <ReportHeader title="Report an Issue" onClose={requestClose} />

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

        <ActionButtons onSubmit={onSubmitReportIssue} onCancel={requestClose} />
      </ScrollView>
    </SheetContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 12,
  },
});
