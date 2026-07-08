import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Alert, Linking } from "react-native";
import { useTranslation } from "react-i18next";

export function useLocationPermission() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const { t } = useTranslation("common");

  useEffect(() => {
    (async () => {
      try {
        let { status, canAskAgain } =
          await Location.getForegroundPermissionsAsync();

        if (status !== "granted" && canAskAgain) {
          const response = await Location.requestForegroundPermissionsAsync();
          status = response.status;
          canAskAgain = response.canAskAgain;
        }

        if (status !== "granted" && !canAskAgain) {
          Alert.alert(
            t("locationPermissionTitle", "Location Permission"),
            t(
              "locationPermissionMessage",
              "Location permission is required to show your live position. Please enable it in your device settings.",
            ),
            [
              { text: t("cancel", "Cancel"), style: "cancel" },
              {
                text: t("openSettings", "Open Settings"),
                onPress: () => Linking.openSettings(),
              },
            ],
          );
        }

        setPermissionGranted(status === "granted");
      } catch (e) {
        console.error("Failed to request location permissions", e);
      }
    })();
  }, [t]);

  return permissionGranted;
}
