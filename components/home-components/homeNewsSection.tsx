import React from "react";
import { FlatList, Text } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useNews } from "@/hooks/useNews";
import { useTheme } from "@/hooks/use-theme-color";
import { capitalizeWords } from "@/utils/string";
import { ErrorBoundary } from "@/components/errorBoundary";
import SectionHeader from "@/components/sectionHeader";
import NewsCard from "@/components/newsCard";
import { Station } from "@/lib/api/trenord/trenord-types";

interface Props {
  destinationMunicipality?: string | null;
  destinationStation?: Station | null;
}

export default function HomeNewsSection({
  destinationMunicipality,
  destinationStation,
}: Props) {
  const { data: newsData, isLoading: isNewsLoading } = useNews();
  const theme = useTheme();
  const { t } = useTranslation("home");
  const router = useRouter();

  return (
    <ErrorBoundary>
      <SectionHeader
        title={
          destinationMunicipality
            ? t("newsSuffix", {
                city: capitalizeWords(destinationMunicipality),
              })
            : destinationStation
              ? t("newsSuffix", {
                  city: capitalizeWords(destinationStation.station_ori_name),
                })
              : t("latestNews")
        }
        type="home"
        icon="newspaper"
        isFirst
        onSeeMorePress={() => router.push("/news-magazine" as any)}
      />
      {isNewsLoading ? (
        <Text
          style={{
            paddingHorizontal: theme.spacing.md,
            color: theme.colors.mutedForeground,
          }}
        >
          {t("loadingNews")}
        </Text>
      ) : newsData.length > 0 ? (
        <FlatList
          data={newsData}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NewsCard article={item} />}
          contentContainerStyle={{
            paddingLeft: theme.spacing.md,
            paddingBottom: theme.spacing.md,
          }}
        />
      ) : (
        <Text
          style={{
            paddingHorizontal: theme.spacing.md,
            color: theme.colors.mutedForeground,
          }}
        >
          {t("noNews")}
        </Text>
      )}
    </ErrorBoundary>
  );
}
