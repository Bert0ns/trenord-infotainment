import { useRouter } from "expo-router";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import {
  SheetContainer,
  SheetHandle,
} from "@/components/report-issue-components/sheet-container";
import { useJourneyStore } from "@/store/journeyStore";
import { useNews } from "@/hooks/useNews";
import { useGlobalNews } from "@/hooks/useGlobalNews";
import { createStyleHook } from "@/hooks/use-theme-color";
import { getLocalizedCityName } from "@/utils/news";

import {
  MagazineHeader,
  MagazineSectionLabel,
  MasonryGrid,
} from "@/components/news-magazine-components";

export default function NewsMagazinePage() {
  const router = useRouter();
  const { t, i18n } = useTranslation("home");
  const styles = useStyles();
  const sheetRef = useRef<SheetHandle>(null);

  // Fetch both city-specific and global news
  const { data: cityNews, isLoading: isCityLoading } = useNews();
  const { data: globalNews, isLoading: isGlobalLoading } = useGlobalNews();

  // If there's city news, get the city name for the label.
  const { destinationStation, destinationMunicipality } = useJourneyStore();

  const rawKeyword =
    destinationMunicipality || destinationStation?.station_ori_name;
  const resolvedCityName = rawKeyword
    ? getLocalizedCityName(rawKeyword, i18n.language.substring(0, 2))
    : t("cityNewsFallback");

  const handleClose = () => {
    router.back();
  };

  const isLoading = isCityLoading || isGlobalLoading;

  return (
    <SheetContainer ref={sheetRef} bottomInset={24} onClose={handleClose}>
      <MagazineHeader
        title={t("magazineTitle")}
        onClose={() => sheetRef.current?.close()}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={styles.loaderColor.color} />
          <Text style={styles.loadingText}>{t("loadingNews")}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {cityNews.length > 0 && (
            <View style={styles.section}>
              <MagazineSectionLabel
                title={resolvedCityName as string}
                icon="location-on"
              />
              <MasonryGrid data={cityNews} columns={2} />
            </View>
          )}

          {globalNews.length > 0 && (
            <View style={styles.section}>
              <MagazineSectionLabel
                title={t("globalNewsTitle")}
                icon="public"
              />
              <MasonryGrid data={globalNews} columns={2} />
            </View>
          )}

          {cityNews.length === 0 && globalNews.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t("noNewsAvailable")}</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SheetContainer>
  );
}

const useStyles = createStyleHook((theme) => ({
  scrollView: {
    // flex: 1 removed to prevent collapsing to 0 height
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderColor: {
    color: theme.colors.primary,
  },
  loadingText: {
    marginTop: 12,
    color: theme.colors.mutedForeground,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    color: theme.colors.mutedForeground,
    fontSize: 16,
    textAlign: "center",
  },
}));
