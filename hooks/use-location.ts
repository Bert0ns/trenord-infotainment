import * as Location from "expo-location";

export function useLocationPermission() {
  const [status] = Location.useForegroundPermissions();
  if (status?.status === "granted") return true;
  return false;
}
