import { NewsArticle } from "@/lib/api/currentsapi-news/currentsapi-news-types";
import { createStyleHook } from "@/hooks/use-theme-color";
import { BlurView } from "expo-blur";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  ImageBackground,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { logger } from "@/lib/logger";

const uiLogger = logger.extend("UI");

export default function NewsCard({ article }: { article: NewsArticle }) {
  const styles = useStyles();
  const { t } = useTranslation("home", { keyPrefix: "newsCard" });

  const videoUrlMatch = article.description.match(
    /(https?:\/\/[^\s]+(?:mp4|video)[^\s]*)/,
  );
  const resolvedUrl = videoUrlMatch ? videoUrlMatch[0] : article.url;

  const isVideo =
    resolvedUrl.includes("/mp4/") ||
    resolvedUrl.endsWith(".mp4") ||
    resolvedUrl.includes("/video/");

  const handlePress = async () => {
    try {
      if (isVideo) {
        uiLogger.log(`Opening external video link: ${resolvedUrl}`);
        await Linking.openURL(resolvedUrl);
      } else {
        uiLogger.log(`Opening news article: ${resolvedUrl}`);
        await WebBrowser.openBrowserAsync(resolvedUrl, {
          controlsColor: "#007aff",
        });
      }
    } catch (e) {
      uiLogger.error("Failed to open article url", e);
    }
  };

  const hasImage =
    article.image && article.image !== "None" && article.image !== "null";

  // Clean description if it's just the URL
  const displayDescription =
    article.description === resolvedUrl
      ? t("videoArticle")
      : article.description;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.cardContainer}
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        {hasImage ? (
          <ImageBackground
            source={{ uri: article.image! }}
            style={styles.imageBackground}
            imageStyle={styles.imageStyle}
          >
            <View style={styles.overlayContainer}>
              <BlurView intensity={70} tint="dark" style={styles.blurView}>
                <Text style={styles.title} numberOfLines={2}>
                  {article.title}
                </Text>
                <Text style={styles.description} numberOfLines={2}>
                  {displayDescription}
                </Text>
              </BlurView>
            </View>
          </ImageBackground>
        ) : (
          <View style={[styles.imageBackground, styles.fallbackBackground]}>
            {isVideo && (
              <View style={styles.playIconCenter}>
                <MaterialIcons
                  name="play-circle-outline"
                  size={64}
                  color="rgba(255,255,255,0.7)"
                />
              </View>
            )}
            <View style={styles.overlayContainer}>
              <View style={[styles.blurView, styles.fallbackBlurView]}>
                <Text style={styles.title} numberOfLines={2}>
                  {article.title}
                </Text>
                <Text style={styles.description} numberOfLines={3}>
                  {displayDescription}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const { width } = Dimensions.get("window");

const useStyles = createStyleHook((theme) => ({
  cardContainer: {
    width: width * 0.75, // Sleek, slightly peeking next card
    height: 220,
    marginRight: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    // Soft shadow for premium feel
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  imageContainer: {
    flex: 1,
    borderRadius: theme.borderRadius.xl,
    overflow: "hidden", // Ensures the blur doesn't bleed out of rounded corners
    backgroundColor: theme.colors.background,
  },
  imageBackground: {
    flex: 1,
    justifyContent: "flex-end", // Align blur view to the bottom
  },
  imageStyle: {
    resizeMode: "cover",
  },
  fallbackBackground: {
    backgroundColor: theme.colors.secondary, // Solid color for image-less articles
  },
  overlayContainer: {
    width: "100%",
  },
  blurView: {
    padding: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255, 255, 255, 0.2)", // Subtle glass highlight
  },
  fallbackBlurView: {
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Emulate dark blur tint when blur isn't active on a solid background
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff", // Always white text on dark blur
    marginBottom: 4,
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)", // Slightly dimmed white
    lineHeight: 18,
  },
  playIconCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40, // offset for the overlay
  },
}));
