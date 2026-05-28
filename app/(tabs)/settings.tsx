import SectionCard from "@/components/settings-componenents/sectionCard";
import SettingSwitch from "@/components/settings-componenents/settingSwitch";
import { THEME } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TabTwoScreen() {
  const router = useRouter();

  // add globals states
  const [theme, setTheme] = useState("Light");
  //const [language, setLanguage] = useState("en");
  const [antiSickness, setAntiSickness] = useState(false);
  const [journeyProgress, setJourneyProgress] = useState(true);
  const [delayAlerts, setDelayAlerts] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState(false);

  const ThemeOption = ({
    title,
    icon,
  }: {
    title: string;
    icon: keyof typeof MaterialIcons.glyphMap;
  }) => {
    const isActive = theme === title;
    return (
      <TouchableOpacity
        style={[styles.themeBox, isActive && styles.themeBoxActive]}
        onPress={() => setTheme(title)}
      >
        <MaterialIcons
          name={icon}
          size={24}
          color={
            isActive ? THEME.colors.primary : THEME.colors.onSurfaceVariant
          }
        />
        <Text
          style={[styles.themeBoxText, isActive && styles.themeBoxTextActive]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Settings</Text>
        <Text style={styles.pageSubtitle}>
          Manage your app preferences and travel experience.
        </Text>
      </View>

      <SectionCard iconName="palette" title="App Theme">
        <View style={styles.themeRow}>
          <ThemeOption title="Light" icon="light-mode" />
          <ThemeOption title="Dark" icon="dark-mode" />
          <ThemeOption title="System" icon="settings-system-daydream" />
        </View>
      </SectionCard>
      <SectionCard iconName="health-and-safety" title="Travel Comfort">
        <SettingSwitch
          label="Anti-Sickness Mode"
          description="Reduces motion animations and increases contrast to mitigate travel nausea."
          value={antiSickness}
          onValueChange={setAntiSickness}
        />
      </SectionCard>

      <SectionCard iconName="language" title="Language">
        <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownText}>English (UK)</Text>
          <MaterialIcons
            name="keyboard-arrow-down"
            size={24}
            color={THEME.colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      </SectionCard>

      <SectionCard iconName="notifications" title="Notifications">
        <SettingSwitch
          label="Journey Progress"
          description="Updates on approaching stops"
          value={journeyProgress}
          onValueChange={setJourneyProgress}
        />
        <SettingSwitch
          label="Delay Alerts"
          description="Real-time schedule changes"
          value={delayAlerts}
          onValueChange={setDelayAlerts}
        />
        <SettingSwitch
          label="Weather & Disruptions"
          description="Major network issues"
          value={weatherAlerts}
          onValueChange={setWeatherAlerts}
        />
      </SectionCard>

      <View style={styles.card}>
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => router.push("/report-issue-page")}
          >
            <Text style={styles.reportButtonText}>Report Issue</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>App Version 0.0.0 </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
  },
  content: {
    padding: THEME.spacing.md,
    paddingBottom: 100, // Spazio extra per non sovrapporsi alla tua bottom nav bar
  },
  pageHeader: {
    marginBottom: THEME.spacing.lg,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: THEME.colors.primary,
    marginBottom: THEME.spacing.sm,
  },
  pageSubtitle: {
    fontSize: 16,
    color: THEME.colors.onSurfaceVariant,
    lineHeight: 22,
  },
  themeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: THEME.spacing.sm,
  },
  themeBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.outline,
    borderRadius: THEME.borderRadius.mdLg,
    backgroundColor: THEME.colors.surface,
  },
  themeBoxActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryContainer,
  },
  themeBoxText: {
    marginTop: THEME.spacing.sm,
    fontSize: 14,
    color: THEME.colors.onSurfaceVariant,
  },
  themeBoxTextActive: {
    color: THEME.colors.primary,
    fontWeight: "600",
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.outline,
    borderRadius: THEME.borderRadius.mdLg,
    padding: THEME.spacing.md,
    backgroundColor: THEME.colors.surface,
  },
  dropdownText: {
    fontSize: 16,
    color: THEME.colors.onSurface,
  },
  footer: {
    marginTop: THEME.spacing.md,
    alignItems: "center",
  },
  reportButton: {
    backgroundColor: THEME.colors.error,
    width: "100%",
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.xl,
    alignItems: "center",
    marginBottom: THEME.spacing.lg,
  },
  reportButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  versionText: {
    fontSize: 13,
    color: THEME.colors.onSurfaceVariant,
    marginBottom: THEME.spacing.sm,
  },
  linksRow: {
    flexDirection: "row",
    gap: 16,
  },
  link: {
    fontSize: 13,
    color: THEME.colors.primary,
  },
  card: {
    backgroundColor: THEME.colors.surfaceVariant,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
});
