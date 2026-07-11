import React from "react";
import { logger } from "@/lib/logger";
import { useWeatherStore } from "@/store/weatherStore";
import ClearCacheButton from "./clearCacheButton";

const uiLogger = logger.extend("UI");

export default function ClearWeatherCacheButton() {
  return (
    <ClearCacheButton
      label="Clear Weather Cache"
      onPress={() => {
        useWeatherStore.getState().clearCache();
        uiLogger.log("User manually cleared the weather cache.");
      }}
    />
  );
}
