import { createStyleHook } from "@/hooks/use-theme-color";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

interface SectionHeaderProps {
  title: string;
  type?: "journey" | "media" | "home";
  isFirst?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onSeeMorePress?: () => void;
}

export default function SectionHeader({
  title,
  type,
  icon,
  isFirst,
  onSeeMorePress,
}: SectionHeaderProps) {
  const styles = useStyles();
  const { t } = useTranslation("common", { keyPrefix: "sectionHeader" });

  return (
    <View style={isFirst ? styles.firstContainer : styles.container}>
      {type === "home" ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <MaterialIcons
            name={icon || "train"}
            size={16}
            color={styles.iconColor.color}
          />
          <Text style={styles.titleHome}>{title}</Text>
        </View>
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <MaterialIcons
            name={icon || "train"}
            size={18}
            color={styles.iconColor.color}
          />
          <Text style={styles.title}>{title}</Text>
        </View>
      )}
      {type === "media" && (
        <TouchableOpacity>
          <Text style={styles.seeAll}>{t("seeAll")}</Text>
        </TouchableOpacity>
      )}
      {type === "home" && (
        <TouchableOpacity onPress={onSeeMorePress}>
          <Text style={styles.seeAll}>{t("seeMore")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const useStyles = createStyleHook((theme) => ({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  firstContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 0,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  titleHome: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.foreground,
  },
  seeAll: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  iconColor: {
    color: theme.colors.primary,
  },
  seeMore: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary,
  },
}));
