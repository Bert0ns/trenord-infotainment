import SectionCard from "@/components/settings-componenents/sectionCard";
import SettingSwitch from "@/components/settings-componenents/settingSwitch";
import DropDownSelector from "@/components/ui/dropDownSelector";
import { AppSettings, LanguageCode, useSettings } from "@/hooks/settings";
import { createStyleHook, useTheme } from "@/hooks/use-theme-color";
import { useJourneyStore } from "@/store/journeyStore";
import { MaterialIcons } from "@expo/vector-icons";
import { getLocales } from "expo-localization";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { logger } from "@/lib/logger";

const uiLogger = logger.extend("UI");

export default function SettingsScreen() {
  const router = useRouter();
  const styles = useStyles();
  const theme = useTheme();
  const { t } = useTranslation("settings");

  const { settings, set } = useSettings();
  const { trainId, clearJourney } = useJourneyStore();

  const languages: Record<LanguageCode, string> = {
    en: "English (UK)",
    it: "Italiano",
    "--": t("language.default"),
  };

  const selectedLanguage =
    languages[settings.language] +
    (settings.language === "--" ? ` (${getLocales()[0].languageTag})` : "");

  const handleLogout = () => {
    uiLogger.log("User requested to end journey. Clearing state...");
    clearJourney();
    router.replace("/login");
  };

  const ThemeOption = ({
    title,
    icon,
  }: {
    title: AppSettings["theme"];
    icon: keyof typeof MaterialIcons.glyphMap;
  }) => {
    const isActive = settings.theme === title;
    return (
      <TouchableOpacity
        style={[styles.themeBox, isActive && styles.themeBoxActive]}
        onPress={() => set("theme", title)}
      >
        <MaterialIcons
          name={icon}
          size={24}
          color={isActive ? theme.colors.primary : theme.colors.mutedForeground}
        />
        <Text
          style={[styles.themeBoxText, isActive && styles.themeBoxTextActive]}
        >
          {t(`theme.options.${title}`)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>{t("title")}</Text>
        <Text style={styles.pageSubtitle}>{t("subtitle")}</Text>
      </View>

      <SectionCard iconName="palette" title={t("theme.title")}>
        <View style={styles.themeRow}>
          <ThemeOption title="light" icon="light-mode" />
          <ThemeOption title="dark" icon="dark-mode" />
          <ThemeOption title="system" icon="settings-system-daydream" />
        </View>
      </SectionCard>
      <SectionCard
        iconName="health-and-safety"
        title={t("travelComfort.title")}
      >
        <SettingSwitch
          label={t("travelComfort.antiSickness.label")}
          description={t("travelComfort.antiSickness.description")}
          value={settings.antiSickness}
          onValueChange={(value) => set("antiSickness", value)}
        />
      </SectionCard>

      <SectionCard iconName="language" title={t("language.title")}>
        <DropDownSelector
          options={Object.values(languages)}
          selectedValue={selectedLanguage}
          onSelect={(value) => {
            const langCode = Object.entries(languages).find(
              ([, name]) => name === value,
            )?.[0] as LanguageCode;
            set("language", langCode);
          }}
          placeholder={t("language.placeholder")}
        />
      </SectionCard>

      <SectionCard iconName="notifications" title={t("notifications.title")}>
        <SettingSwitch
          label={t("notifications.journeyProgress.title")}
          description={t("notifications.journeyProgress.description")}
          value={settings.journeyProgress}
          onValueChange={(value) => set("journeyProgress", value)}
        />
        <SettingSwitch
          label={t("notifications.delayAlerts.title")}
          description={t("notifications.delayAlerts.description")}
          value={settings.delayAlerts}
          onValueChange={(value) => set("delayAlerts", value)}
        />
        <SettingSwitch
          label={t("notifications.weatherAlerts.title")}
          description={t("notifications.weatherAlerts.description")}
          value={settings.weatherAlerts}
          onValueChange={(value) => set("weatherAlerts", value)}
        />
      </SectionCard>

      <View style={styles.card}>
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => router.push("/report-issue-page")}
          >
            <Text style={styles.reportButtonText}>{t("reportIssue")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>
              {trainId ? t("endJourney") : t("backToLogin")}
            </Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>App Version 0.0.0 </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const useStyles = createStyleHook((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: 100, // Spazio extra per non sovrapporsi alla tua bottom nav bar
  },
  pageHeader: {
    marginBottom: theme.spacing.lg,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  pageSubtitle: {
    fontSize: 16,
    color: theme.colors.mutedForeground,
    lineHeight: 22,
  },
  themeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  themeBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
  },
  themeBoxActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.secondary,
  },
  themeBoxText: {
    marginTop: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.mutedForeground,
  },
  themeBoxTextActive: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  dropdownText: {
    fontSize: 16,
    color: theme.colors.foreground,
  },
  footer: {
    marginTop: theme.spacing.md,
    alignItems: "center",
  },
  reportButton: {
    backgroundColor: theme.colors.destructive,
    width: "100%",
    paddingVertical: 14,
    borderRadius: theme.borderRadius.xl,
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  reportButtonText: {
    color: theme.colors.destructiveForeground,
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: theme.colors.warning,
    width: "100%",
    paddingVertical: 14,
    borderRadius: theme.borderRadius.xl,
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  logoutButtonText: {
    color: theme.colors.warningForeground,
    fontSize: 16,
    fontWeight: "600",
  },
  versionText: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.sm,
  },
  linksRow: {
    flexDirection: "row",
    gap: 16,
  },
  link: {
    fontSize: 13,
    color: theme.colors.primary,
  },
  card: {
    backgroundColor: theme.colors.muted,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
}));
