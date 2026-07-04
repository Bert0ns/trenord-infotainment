import * as WebBrowser from "expo-web-browser";
import { Linking, Platform } from "react-native";
import { logger } from "@/lib/logger";

const uiLogger = logger.extend("LinkHandler");

/**
 * Parses a string to extract a media URL (e.g. video) if present.
 * Now it specifically targets actual media file extensions rather than just "video" keyword.
 */
export function extractMediaUrl(text: string): string | null {
  if (!text) return null;
  const match = text.match(
    /(https?:\/\/[^\s]+\.(?:mp4|webm|mkv|mov|mp3|wav)(?:\?.*)?)/i,
  );
  return match ? match[0] : null;
}

/**
 * Checks if a given URL is a direct video link based on file extension.
 */
export function isDirectVideoLink(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\.(mp4|webm|mkv|mov)(?:\?.*)?$/i.test(url);
}

/**
 * Handles opening a URL based on whether it is a direct video or a standard webpage.
 */
export async function openMediaUrl(url: string | null, isVideo: boolean) {
  const safeUrl =
    url?.startsWith("http://") || url?.startsWith("https://") ? url : null;

  if (!safeUrl) {
    uiLogger.warn(`Invalid or unsafe URL blocked: ${url}`);
    return;
  }

  try {
    if (isVideo) {
      uiLogger.log(`Opening external video link: ${safeUrl}`);
      // On web we might just want to open in new tab anyway
      if (Platform.OS === "web") {
        window.open(safeUrl, "_blank");
      } else {
        await Linking.openURL(safeUrl);
      }
    } else {
      uiLogger.log(`Opening webpage: ${safeUrl}`);
      await WebBrowser.openBrowserAsync(safeUrl, {
        controlsColor: "#007aff",
      });
    }
  } catch (e) {
    uiLogger.error("Failed to open URL", e);
  }
}
