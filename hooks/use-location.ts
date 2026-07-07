import * as Location from "expo-location";
import { useEffect, useState } from "react";

export function useLocationPermission() {
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        let { status, canAskAgain } =
          await Location.getForegroundPermissionsAsync();
        if (status !== "granted" && canAskAgain) {
          const response = await Location.requestForegroundPermissionsAsync();
          status = response.status;
        }
        setPermissionGranted(status === "granted");
      } catch (e) {
        console.error("Failed to request location permissions", e);
      }
    })();
  }, []);

  return permissionGranted;
}
