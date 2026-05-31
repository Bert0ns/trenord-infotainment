import SectionHeader from "@/components/sectionHeader";
import { createStyleHook, useTheme } from "@/hooks/use-theme-color";
import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

export default function HomeScreen() {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Milano Centrale - R 2564</Text>
        {/* Trenord API */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <MaterialIcons
            name="access-time"
            size={16}
            color={theme.colors.onSurfaceVariant}
          />
          <Text style={styles.pageSubtitle}>08:30 - 10:15</Text>{" "}
          {/* Trenord API */}
        </View>
      </View>
      <SectionHeader
        title="Destination News"
        type="home"
        icon="newspaper"
        isFirst
      />
      {/* News cards */}
      <SectionHeader title="Discover Milano" type="home" icon="explore" />
      {/* Tips cards */}
    </ScrollView>
  );
}

const useStyles = createStyleHook((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
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
    color: theme.colors.onSurfaceVariant,
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
    borderColor: theme.colors.outline,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  themeBoxActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryContainer,
  },
  themeBoxText: {
    marginTop: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
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
    borderColor: theme.colors.outline,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  dropdownText: {
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  footer: {
    marginTop: theme.spacing.md,
    alignItems: "center",
  },
  reportButton: {
    backgroundColor: theme.colors.error,
    width: "100%",
    paddingVertical: 14,
    borderRadius: theme.borderRadius.xl,
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  reportButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  versionText: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
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
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
}));
