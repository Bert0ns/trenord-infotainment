import { createStyleHook, useTheme } from "@/hooks/use-theme-color";
import { useTranslation } from "react-i18next";
import { TextInput } from "react-native";

type DetailsInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DetailsInput({ value, onChange }: DetailsInputProps) {
  const styles = useStyles();
  const theme = useTheme();
  const { t } = useTranslation("reportIssue", { keyPrefix: "detailsInput" });

  return (
    <TextInput
      placeholder={t("placeholder")}
      placeholderTextColor={theme.colors.mutedForeground}
      value={value}
      onChangeText={onChange}
      multiline
      style={styles.textArea}
      textAlignVertical="top"
    />
  );
}

const useStyles = createStyleHook((theme) => ({
  textArea: {
    minHeight: 110,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    fontSize: 15,
    color: theme.colors.foreground,
    backgroundColor: theme.colors.muted,
    marginBottom: 20,
  },
}));
