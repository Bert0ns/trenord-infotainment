import { THEME } from "@/constants/theme";
import { ScrollView, StyleSheet, Text, View } from "react-native";


export default function MediaScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Featured Entertainment</Text>
        <Text style={styles.pageSubtitle}>Films, Documentaries, Podcasts.</Text>
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
