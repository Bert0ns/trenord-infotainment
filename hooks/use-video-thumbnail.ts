import { useEffect, useState } from "react";
import { Platform } from "react-native";
import * as VideoThumbnails from "expo-video-thumbnails";
import { logger } from "@/lib/logger";

const uiLogger = logger.extend("VideoThumbnail");

export function useVideoThumbnail(
  resolvedUrl: string,
  isVideo: boolean,
  hasImage: boolean,
) {
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Only attempt to generate a thumbnail if it is actually a video and we don't have an image yet
    if (isVideo && !hasImage) {
      const generateThumbnail = async () => {
        try {
          // Additional safety check: ensure the URL looks like a direct video file
          // before passing it to expo-video-thumbnails, otherwise it crashes or fails.
          const isDirectVideoFile = resolvedUrl.match(
            /\.(mp4|webm|mkv|mov)(?:\?.*)?$/i,
          );
          if (!isDirectVideoFile || Platform.OS === "web") {
            uiLogger.warn(
              `Skipping thumbnail generation. isDirectVideo: ${!!isDirectVideoFile}, isWeb: ${Platform.OS === "web"}`,
            );
            return;
          }

          const { uri } = await VideoThumbnails.getThumbnailAsync(resolvedUrl, {
            time: 1000,
          });
          if (isMounted) setThumbnailUri(uri);
        } catch (e) {
          uiLogger.warn("Failed to generate video thumbnail: ", e);
        }
      };
      generateThumbnail();
    }

    return () => {
      isMounted = false;
    };
  }, [isVideo, hasImage, resolvedUrl]);

  return thumbnailUri;
}
