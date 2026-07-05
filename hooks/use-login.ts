import { fetchTrainData } from "@/lib/api/trenord";
import { TrainInfoResponse } from "@/lib/api/types";
import { logger } from "@/lib/logger";
import { Station, useJourneyStore } from "@/store/journeyStore";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useQRScanner } from "./use-qr-scanner";

const loginLogger = logger.extend("Login");

export function useLogin() {
  const router = useRouter();

  const [ticketCode, setTicketCode] = useState("");
  const [destination, setDestination] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [trainData, setTrainData] = useState<TrainInfoResponse | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const setJourney = useJourneyStore((state) => state.setJourney);

  useEffect(() => {
    // Only clear on initial mount if they arrive here already logged in
    const checkAndClear = () => {
      if (useJourneyStore.getState().trainId) {
        useJourneyStore.getState().clearJourney();
      }
    };

    if (useJourneyStore.persist.hasHydrated()) {
      checkAndClear();
    } else {
      const unsub = useJourneyStore.persist.onFinishHydration(() => {
        checkAndClear();
      });
      return () => {
        unsub();
      };
    }
  }, []);

  const canSearch = ticketCode.length >= 4 && ticketCode.length <= 7;
  const canStart = destination.length > 0;

  function handleCodeChange(value: string) {
    const digitsOnly = value.replace(/\D/g, "");
    setTicketCode(digitsOnly);
    if (errorMsg) setErrorMsg(null);
    // Reset data if code changes
    if (trainData) {
      setTrainData(null);
      setDestination("");
      setStations([]);
    }
  }

  async function handleSearch(
    codeToSearch: string = ticketCode,
    presetDestination?: string,
  ) {
    if (!codeToSearch || codeToSearch.length < 4 || codeToSearch.length > 7)
      return;
    loginLogger.log(`Searching for train code: ${codeToSearch}...`);
    setIsLoading(true);
    setErrorMsg(null);

    // Yield to the UI thread
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const data = await fetchTrainData(codeToSearch);
      if (!data || data.length === 0 || !data[0].journey_list) {
        loginLogger.warn("Train not found or empty response returned.");
        setErrorMsg(
          "We couldn't find any active train with this code. Please verify the number.",
        );
        setIsLoading(false);
        return;
      }
      const passList = data[0].journey_list[0].pass_list || [];
      loginLogger.log(`Train found! Parsed ${passList.length} stations.`);

      const parsedStations = passList.map((p: any) => ({
        station_id: p.station.station_id,
        station_ori_name: p.station.station_ori_name,
      }));
      setStations(parsedStations);
      setTrainData(data);

      if (presetDestination) {
        const stationExists = parsedStations.some(
          (s: any) => s.station_ori_name === presetDestination,
        );
        if (stationExists) {
          loginLogger.log(
            `Preset destination '${presetDestination}' found in train route.`,
          );
          setDestination(presetDestination);

          const destStation = parsedStations.find(
            (s: any) => s.station_ori_name === presetDestination,
          );
          if (destStation) {
            loginLogger.log(
              `Auto-starting journey! Train: ${codeToSearch}, Destination: ${destStation.station_ori_name}`,
            );
            setJourney(codeToSearch, destStation, data);
            router.replace("/(tabs)/home/home");
            return;
          }
        } else {
          loginLogger.warn(
            `Preset destination '${presetDestination}' NOT found in train route.`,
          );
          setErrorMsg(
            `The scanned destination "${presetDestination}" is not valid for this train. Please select manually.`,
          );
          setDestination("");
        }
      }
    } catch (err: any) {
      loginLogger.error("Connection Error:", err.message);
      setErrorMsg("Connection error. Could not reach the server.");
    } finally {
      setIsLoading(false);
    }
  }

  const { handleQRScan } = useQRScanner({
    setTicketCode,
    handleSearch,
    setErrorMsg,
  });

  function handleStart() {
    if (!canStart) return;
    const destStation = stations.find(
      (s) => s.station_ori_name === destination,
    );
    if (destStation) {
      loginLogger.log(
        `Starting journey! Train: ${ticketCode}, Destination: ${destStation.station_ori_name}`,
      );
      setJourney(ticketCode, destStation, trainData!);
      router.replace("/(tabs)/home/home");
    }
  }

  return {
    ticketCode,
    destination,
    isLoading,
    trainData,
    stations,
    errorMsg,
    canSearch,
    canStart,
    setDestination,
    handleCodeChange,
    handleSearch: () => handleSearch(ticketCode),
    handleQRScan,
    handleStart,
  };
}
