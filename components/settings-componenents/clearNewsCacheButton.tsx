import { logger } from "@/lib/logger";
import { useNewsStore } from "@/store/newsStore";
import ClearCacheButton from "./clearCacheButton";

const uiLogger = logger.extend("UI");

export default function ClearNewsCacheButton() {
  return (
    <ClearCacheButton
      label="Clear News Cache"
      onPress={() => {
        useNewsStore.getState().clearCache();
        uiLogger.log("User manually cleared the news cache.");
      }}
    />
  );
}
