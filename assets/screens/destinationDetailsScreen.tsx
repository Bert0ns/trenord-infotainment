import {
  AirQualityCard,
  UVIndexCard,
} from "@/components/journey-components/enviromentWidgets";
import CurrentWeatherCard from "@/components/journey-components/weatherCurrentCard";
import { createStyleHook } from "@/hooks/use-theme-color";
import { useJourneyStore } from "@/store/journeyStore";
import { useWeatherStore } from "@/store/weatherStore";
import { Redirect } from "expo-router";
import { useEffect } from "react";
import { ScrollView, View } from "react-native";

export default function DestinationDetailsScreen() {
  const styles = useStyles();
  const trainId = useJourneyStore((s) => s.trainId);
  const destinationStation = useJourneyStore((s) => s.destinationStation);
  const weather = useWeatherStore((state) => state.weather);
  const startWeatherUpdates = useWeatherStore(
    (state) => state.startWeatherUpdates,
  );
  useEffect(() => {
    startWeatherUpdates(
      destinationStation
        ? destinationStation.station_ori_name.split(" ")[0]
        : "None",
    );
  }, []);

  console.log(
    `\nCurrent temperature_2m: ${weather?.temperature}`,
    `\nCurrent weather_code: ${weather?.weatherCode}`,
    `\nCurrent relative_humidity_2m: ${weather?.humidity}`,
    `\nCurrent wind_speed_10m: ${weather?.windSpeed}`,
  );

  if (!trainId) return <Redirect href="/login" />;

  return (
    <ScrollView
      style={styles.container}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      {/*<ImageHeader
        imageUri="https://images.unsplash.com/photo-1572973945934-8fa710606f3c?q=80&w=800" 
        stationName={destinationStation? destinationStation.station_ori_name : "Unknown"}
      />*/}

      <View style={styles.contentPadding}>
        <CurrentWeatherCard
          data={{
            temperature: Math.trunc(weather ? weather.temperature : 0),
            code: weather ? weather.weatherCode : 0,
            isDay: weather?.isDay === 1,
            humidity: weather ? weather.humidity : 0,
            windSpeed: Math.trunc(weather ? weather.windSpeed : 0),
          }}
        />
        <View style={styles.row}>
          <AirQualityCard value={Math.trunc(weather ? weather.aqi : 0)} />
          <View style={{ width: 16 }} />
          <UVIndexCard level={Math.trunc(weather ? weather.uvIndex : 0)} />
        </View>
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const useStyles = createStyleHook((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentPadding: {
    paddingHorizontal: theme.spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionMargin: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  horizontalScroll: {
    overflow: "visible",
  },
  connectionsBox: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
}));
