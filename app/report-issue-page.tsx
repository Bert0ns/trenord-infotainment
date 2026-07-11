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
  issueOptions,
} from "@/components/report-issue-components";
import { SlideSheet, type SheetHandle } from "@/components/ui/slide-sheet";
import { logger } from "@/lib/logger";
import { useTranslation } from "react-i18next";
import { scheduleEventNotification } from "@/utils/notifications";

const reportLogger = logger.extend("Report");

export default function ReportIssuePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation("reportIssue");
  const { t: tNotif } = useTranslation("notifications");
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
    reportLogger.log("Report Issue form Data:", {
      selectedIssues: Array.from(selectedIssues),
      details,
    });
    alert(t("reportSubmittedSuccessfully"));

    scheduleEventNotification(
      "system.feedback",
      true,
      Date.now() + 30000,
      tNotif("system.feedbackPromptTitle"),
      tNotif("system.feedbackPromptBody"),
    );

    requestClose();
  };

  return (
    <SlideSheet
      ref={sheetRef}
      bottomInset={insets.bottom}
      onClose={() => router.back()}
      header={
        <ReportHeader title={t("reportAnIssue")} onClose={requestClose} />
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle>{t("whatSeemsToBeTheProblem")}</SectionTitle>
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

        <SectionTitle>{t("additionalDetails")}</SectionTitle>
        <DetailsInput value={details} onChange={setDetails} />

        <ActionButtons onSubmit={onSubmitReportIssue} onCancel={requestClose} />
      </ScrollView>
    </SlideSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 12,
  },
});
