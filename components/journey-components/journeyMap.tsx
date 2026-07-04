import { THEME } from "@/constants/theme";
import { useLocationPermission } from "@/hooks/use-location";
import { createStyleHook, useTheme } from "@/hooks/use-theme-color";
import { useRailwayPolylines } from "@/lib/api/overpass";
import { PassList } from "@/lib/api/types";
import { selectStations, useJourneyStore } from "@/store/journeyStore";
import { bboxToRegion, getBbox, stationLatLng } from "@/utils/geometry";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { getPassStatus } from "./journeyTimeline";
import { capitalizeWords } from "@/utils/string";

const mapMarkColor = THEME.colors.dark.primary;

export type JourneyMapProps = {
  stations: PassList[];
  nextStop: PassList | undefined;
};

export function JourneyMap({ stations, nextStop }: JourneyMapProps) {
  const styles = useStyles();
  const theme = useTheme();
  const { t } = useTranslation("common");
  const stationData = useJourneyStore(selectStations);

  const locationPermission = useLocationPermission();
  const polylines = useRailwayPolylines(stationData);

  const region = stationData?.length
    ? bboxToRegion(getBbox(stationData))
    : undefined;

  return (
    <View style={styles.mapContainer}>
      <MapView
        showsUserLocation
        userLocationPriority="low"
        rotateEnabled={false}
        showsCompass
        showsMyLocationButton
        initialRegion={region}
        style={styles.map}
      >
        {stations.map((pass) => {
          const station = stationData?.find(
            (s) => s.CodiceMIR === pass.station.station_id,
          );
          if (!station) return null;
          const s = getPassStatus(pass, nextStop);
          return (
            <Marker
              key={station.CodiceMIR}
              coordinate={stationLatLng(station)}
              title={station.NomeGeoStazioni}
              onPress={(e) => e.preventDefault()}
              onSelect={(e) => e.preventDefault()}
              onCalloutPress={(e) => e.preventDefault()}
            >
              <View
                style={[
                  styles.marker,
                  {
                    borderWidth: s === "current" ? 4 : 2,
                    backgroundColor: s === "past" ? mapMarkColor : "white",
                  },
                ]}
              />
              <Text style={styles.markerText}>
                {capitalizeWords(pass.station.station_ori_name)}
              </Text>
            </Marker>
          );
        })}
        {polylines.map((polyline, index) => (
          <Polyline
            key={index}
            coordinates={polyline}
            strokeColor={mapMarkColor}
            strokeWidth={3}
          />
        ))}
      </MapView>
      <View style={styles.mapInfoBox}>
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: locationPermission
              ? theme.colors.primary
              : theme.colors.destructive,
          }}
        />
        <Text style={styles.mapInfoText}>
          {locationPermission ? t("livePosOn") : t("livePosOff")}
        </Text>
      </View>
    </View>
  );
}

const useStyles = createStyleHook((theme) => ({
  mapContainer: {
    width: "100%",
    height: 400,
    backgroundColor: theme.colors.muted,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: "hidden",
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapInfoBox: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: theme.colors.backgroundTransparent,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  mapInfoText: {
    color: theme.colors.foreground,
    fontWeight: 600,
    fontSize: 12,
  },
  marker: {
    width: 20,
    height: 20,
    backgroundColor: "white",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: mapMarkColor,
  },
  markerText: {
    position: "absolute",
    top: 4,
    left: 22,
    color: "white",
    width: 150,
    fontSize: 10,
    fontWeight: "bold",
    textShadowColor: "#000000FF",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
}));
