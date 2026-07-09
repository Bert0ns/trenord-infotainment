import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { createStyleHook } from "@/hooks/use-theme-color";

type MagazineSectionLabelProps = {
  title: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
};

export function MagazineSectionLabel({
  title,
  icon,
}: MagazineSectionLabelProps) {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        {icon && (
          <MaterialIcons name={icon} size={20} color={styles.icon.color} />
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.divider} />
    </View>
  );
}

const useStyles = createStyleHook((theme) => ({
  container: {
    marginVertical: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  icon: {
    color: theme.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    width: "100%",
  },
}));
