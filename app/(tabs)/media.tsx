import MovieCard from "@/components/media-components/movieCard";
import PodcastCard from "@/components/media-components/podcastCard";
import SectionHeader from "@/components/sectionHeader";
import { useScreenStyles } from "@/hooks/use-screen-styles";
import { useJourneyStore } from "@/store/journeyStore";
import { Redirect } from "expo-router";
import { useTranslation } from "react-i18next";
import { FlatList, ScrollView, Text, View } from "react-native";

//Mockup data films, documentaries and podcasts, API integration later
const MOVIES_DATA = [
  {
    id: "1",
    title: "Mountain Silence",
    category: "Thriller",
    duration: "1h 40m",
    image: {
      uri: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600",
    },
  },
  {
    id: "2",
    title: "Neon Horizon",
    category: "Sci-Fi Thriller",
    duration: "2h 14m",
    image: {
      uri: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600",
    },
  },
  {
    id: "3",
    title: "Mountain Silence 2",
    category: "Thriller",
    duration: "1h 50m",
    image: {
      uri: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600",
    },
  },
];
const PODCASTS_DATA = [
  {
    id: 1,
    image: {
      uri: "https://images.unsplash.com/photo-1610116306796-6ebd3051c330?w=100",
    },
    title: "Tech Transit Today",
    episode: "Ep 42: The Future of Mobility",
  },

  {
    id: 2,
    image: {
      uri: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=100",
    },
    title: "History Uncovered",
    episode: "Ep 108: The First Railways",
  },

  {
    id: 3,
    image: {
      uri: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100",
    },
    title: "AI Talks",
    episode: "Ep 12: Neural Networks",
  },
];
const DOCUMENTARIES_DATA = [
  {
    id: "1",
    title: "Tiger",
    category: "Nature",
    duration: "1h ",
    image: {
      uri: "https://statickodami.akamaized.net/wp-content/uploads/sites/31/2021/03/iStock-490989354.jpg",
    },
  },
  {
    id: "2",
    title: "Cosmos",
    category: "Science",
    duration: "35m",
    image: {
      uri: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=500",
    },
  },
  {
    id: "3",
    title: "Alpes",
    category: "Nature",
    duration: "50m",
    image: {
      uri: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600",
    },
  },
];

export default function MediaScreen() {
  const styles = useScreenStyles();
  const { t } = useTranslation("media");
  const trainId = useJourneyStore((s) => s.trainId);

  if (!trainId) return <Redirect href="/login" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>{t("featuredEntertainment")}</Text>
        <Text style={styles.pageSubtitle}>
          {t("filmsDocumentariesPodcasts")}
        </Text>
      </View>
      <SectionHeader
        title={t("films")}
        type="media"
        icon="movie-creation"
        isFirst
      />
      {/* Film cards */}
      <FlatList
        data={MOVIES_DATA}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MovieCard
            imageSource={item.image}
            title={item.title}
            category={item.category}
            duration={item.duration}
          />
        )}
      />
      <SectionHeader title={t("documentaries")} type="media" icon="public" />
      {/* Documentaries cards */}
      <FlatList
        data={DOCUMENTARIES_DATA}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MovieCard
            imageSource={item.image}
            title={item.title}
            category={item.category}
            duration={item.duration}
          />
        )}
      />
      <SectionHeader title={t("podcasts")} type="journey" icon="podcasts" />
      {/* Podcasts cards */}
      {PODCASTS_DATA.map((podcast) => (
        <PodcastCard
          key={podcast.id}
          imageSource={podcast.image}
          title={podcast.title}
          episode={podcast.episode}
        />
      ))}
    </ScrollView>
  );
}
