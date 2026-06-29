import { useScreenStyles } from "@/hooks/use-screen-styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

export default function LoadingScreen() {
  const { t } = useTranslation("common");
  const styles = useScreenStyles();

  return (
    <View
      style={[
        styles.container,
        { alignItems: "center", justifyContent: "center" },
      ]}
    >
      <Text style={styles.pageSubtitle}>{t("loadingTrainData")}</Text>
    </View>
  );
}
