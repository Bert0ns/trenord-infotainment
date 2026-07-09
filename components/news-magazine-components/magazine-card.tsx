import { NewsArticle } from "@/lib/api/currentsapi-news/currentsapi-news-types";
import { createStyleHook } from "@/hooks/use-theme-color";
import { BlurView } from "expo-blur";
import { MaterialIcons } from "@expo/vector-icons";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useVideoThumbnail } from "@/hooks/use-video-thumbnail";
import {
  extractMediaUrl,
  isDirectVideoLink,
  openMediaUrl,
} from "@/utils/link-handler";

type MagazineCardProps = {
  article: NewsArticle;
  height: number;
};

export function MagazineCard({ article, height }: MagazineCardProps) {
  const styles = useStyles();

  const resolvedUrl = extractMediaUrl(article.description) || article.url;
  const isVideo = isDirectVideoLink(resolvedUrl);

  const hasImage = Boolean(
    article.image && article.image !== "None" && article.image !== "null",
  );

  const thumbnailUri = useVideoThumbnail(resolvedUrl, isVideo, hasImage);

  const handlePress = async () => {
    await openMediaUrl(resolvedUrl, isVideo);
  };

  const effectiveImageUri = hasImage ? article.image : thumbnailUri;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.cardContainer, { height }]}
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        {effectiveImageUri ? (
          <ImageBackground
            source={{ uri: effectiveImageUri! }}
            style={styles.imageBackground}
            imageStyle={styles.imageStyle}
          >
            {isVideo && (
              <View style={styles.playIconCenter}>
                <MaterialIcons
                  name="play-circle-outline"
                  size={48}
                  color="rgba(255,255,255,0.7)"
                />
              </View>
            )}
            <View style={styles.overlayContainer}>
              <BlurView intensity={70} tint="dark" style={styles.blurView}>
                <Text style={styles.title} numberOfLines={3}>
                  {article.title}
                </Text>
              </BlurView>
            </View>
          </ImageBackground>
        ) : (
          <View style={[styles.imageBackground, styles.fallbackBackground]}>
            <View style={styles.playIconCenter}>
              {isVideo ? (
                <MaterialIcons
                  name="play-circle-outline"
                  size={48}
                  color="rgba(255,255,255,0.7)"
                />
              ) : (
                <MaterialIcons
                  name="newspaper"
                  size={48}
                  color="rgba(255,255,255,0.2)"
                />
              )}
            </View>
            <View style={styles.overlayContainer}>
              <View style={[styles.blurView, styles.fallbackBlurView]}>
                <Text style={styles.title} numberOfLines={4}>
                  {article.title}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const useStyles = createStyleHook((theme) => ({
  cardContainer: {
    width: "100%",
    marginBottom: 12,
    borderRadius: theme.borderRadius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  imageContainer: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    backgroundColor: theme.colors.background,
  },
  imageBackground: {
    flex: 1,
    justifyContent: "flex-end",
  },
  imageStyle: {
    resizeMode: "cover",
  },
  fallbackBackground: {
    backgroundColor: theme.colors.secondary,
  },
  overlayContainer: {
    width: "100%",
  },
  blurView: {
    padding: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  fallbackBlurView: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
    lineHeight: 18,
  },
  playIconCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
}));
