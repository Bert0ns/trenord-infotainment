import * as Location from "expo-location";
import { useEffect } from "react";

export function useLocationPermission() {
  const [status, requestPermission] = Location.useForegroundPermissions();

  useEffect(() => {
    if (status && status.status !== "granted" && status.canAskAgain) {
      requestPermission();
    }
  }, [status, requestPermission]);

  if (status?.status === "granted") return true;
  return false;
}
