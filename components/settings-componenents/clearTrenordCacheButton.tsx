import { logger } from "@/lib/logger";
import { clearTrenordApiCache } from "@/lib/api/trenord/trenord";
import ClearCacheButton from "./clearCacheButton";

const uiLogger = logger.extend("UI");

export default function ClearTrenordCacheButton() {
  return (
    <ClearCacheButton
      label="Clear Trenord Cache"
      onPress={() => {
        clearTrenordApiCache();
        uiLogger.log("User manually cleared the Trenord cache.");
      }}
    />
  );
}
