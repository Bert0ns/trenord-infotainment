import { useRouter } from "expo-router";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import {
  SheetContainer,
  SheetHandle,
} from "@/components/report-issue-components/sheet-container";
import { useJourneyStore } from "@/store/journeyStore";
import { useNews } from "@/hooks/useNews";
import { useItalyNews } from "@/hooks/useItalyNews";
import { useWorldNews } from "@/hooks/useWorldNews";
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
  const { height } = useWindowDimensions();

  // Fetch city-specific, Italy, and world news
  const { data: cityNews, isLoading: isCityLoading } = useNews();
  const { data: italyNews, isLoading: isItalyLoading } = useItalyNews();
  const { data: worldNews, isLoading: isWorldLoading } = useWorldNews();

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

  const isLoading = isCityLoading || isItalyLoading || isWorldLoading;

  const existingIds = new Set([
    ...cityNews.map((n) => n.id),
    ...italyNews.map((n) => n.id),
  ]);
  const uniqueWorldNews = worldNews.filter((n) => !existingIds.has(n.id));

  return (
    <SheetContainer
      ref={sheetRef}
      bottomInset={24}
      onClose={handleClose}
      header={
        <MagazineHeader
          title={t("magazineTitle")}
          onClose={() => sheetRef.current?.close()}
        />
      }
    >
      <View style={{ height: height * 0.85 }}>
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

            {italyNews.length > 0 && (
              <View style={styles.section}>
                <MagazineSectionLabel title={t("italyNewsTitle")} icon="map" />
                <MasonryGrid data={italyNews} columns={2} />
              </View>
            )}

            {uniqueWorldNews.length > 0 && (
              <View style={styles.section}>
                <MagazineSectionLabel
                  title={t("worldNewsTitle")}
                  icon="public"
                />
                <MasonryGrid data={uniqueWorldNews} columns={2} />
              </View>
            )}

            {cityNews.length === 0 &&
              italyNews.length === 0 &&
              uniqueWorldNews.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>{t("noNewsAvailable")}</Text>
                </View>
              )}
          </ScrollView>
        )}
      </View>
    </SheetContainer>
  );
}

const useStyles = createStyleHook((theme) => ({
  scrollView: {
    flex: 1, // Restored to enable scrolling within bounded view
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
