import { Ionicons } from "@expo/vector-icons";

export type IssueOption = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export const issueOptions: IssueOption[] = [
  { id: "too-crowded", label: "Too Crowded", icon: "people" },
  { id: "ac-broken", label: "AC Broken", icon: "snow" },
  { id: "dirty-seats", label: "Dirty Seats", icon: "brush" },
  { id: "app-bug", label: "App Bug", icon: "bug" },
  { id: "other-issue", label: "Other Issue", icon: "ellipsis-horizontal" },
];
