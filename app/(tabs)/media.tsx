import MovieCard from "@/components/media-components/movieCard";
import PodcastCard from "@/components/media-components/podcastCard";
import SectionHeader from "@/components/sectionHeader";
import { THEME } from "@/constants/theme";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";

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

export default function TabTwoScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Featured Entertainment</Text>
        <Text style={styles.pageSubtitle}>Films, Documentaries, Podcasts.</Text>
      </View>
      <SectionHeader title="Films" type="media" isFirst />
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
      <SectionHeader title="Documentaries" type="media" />
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
      <SectionHeader title="Podcasts" type="journey" />
      {/* Podcasts cards */}
      <FlatList
        data={PODCASTS_DATA}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PodcastCard
            imageSource={item.image}
            title={item.title}
            episode={item.episode}
          />
        )}
      />
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
    paddingBottom: 100,
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
