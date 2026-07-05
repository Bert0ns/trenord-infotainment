import {
  AirQualityCard,
  UVIndexCard,
} from "@/components/journey-components/enviromentWidgets";
import CurrentWeatherCard from "@/components/journey-components/weatherCurrentCard";
import { createStyleHook, useTheme } from "@/hooks/use-theme-color";
import { useWeatherData } from "@/hooks/use-weather-data";
import { useJourneyStore } from "@/store/journeyStore";
import { useWeatherStore } from "@/store/weatherStore";
import { Redirect } from "expo-router";
import { RefreshControl, ScrollView, View } from "react-native";

export default function HomeDestinationDetails() {
  const styles = useStyles();
  const theme = useTheme();
  const trainId = useJourneyStore((s) => s.trainId);
  const destinationMunicipality = useJourneyStore(
    (s) => s.destinationMunicipality,
  );
  const weather = useWeatherStore((state) => state.weather);
  const loading = useWeatherStore((state) => state.loading);
  const { refreshWeather } = useWeatherData({ manageLifecycle: false });

  if (!trainId) return <Redirect href="/login" />;

  return (
    <ScrollView
      style={styles.container}
      bounces={false}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refreshWeather}
          tintColor={theme.colors.primary}
        />
      }
    >
      <View style={styles.contentPadding}>
        <CurrentWeatherCard
          data={{
            city: destinationMunicipality ? destinationMunicipality : "Unknown",
            temperature: Math.trunc(weather ? weather.temperature : 0),
            code: weather ? weather.weatherCode : 0,
            isDay: weather?.isDay === 1,
            humidity: weather ? weather.humidity : 0,
            windSpeed: Math.trunc(weather ? weather.windSpeed : 0),
            feelsLike: Math.trunc(weather ? weather.apparentTemperature : 0),
            precipitation: weather?.precipitation ?? 0,
            cloudCover: weather?.cloudCover ?? 0,
            windDirection: weather?.windDirection ?? 0,
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
  headerContainer: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: theme.colors.primary,
    marginBottom: 4,
    textTransform: "capitalize",
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.mutedForeground,
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
