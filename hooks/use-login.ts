import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { fetchTrainData } from "@/lib/api/trenord";
import { useJourneyStore, Station } from "@/store/journeyStore";
import { logger } from "@/lib/logger";
import { TrainInfoResponse } from "@/lib/api/types";

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
    logger.log(`[Login UI] Searching for train code: ${codeToSearch}...`);
    setIsLoading(true);
    setErrorMsg(null);

    // Yield to the UI thread
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const data = await fetchTrainData(codeToSearch);
      if (!data || data.length === 0 || !data[0].journey_list) {
        logger.warn("[Login UI] Train not found or empty response returned.");
        setErrorMsg(
          "We couldn't find any active train with this code. Please verify the number.",
        );
        setIsLoading(false);
        return;
      }
      const passList = data[0].journey_list[0].pass_list || [];
      logger.log(`[Login UI] Train found! Parsed ${passList.length} stations.`);

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
          logger.log(
            `[QR Scanner] Preset destination '${presetDestination}' found in train route.`,
          );
          setDestination(presetDestination);

          const destStation = parsedStations.find(
            (s: any) => s.station_ori_name === presetDestination,
          );
          if (destStation) {
            logger.log(
              `[Login UI] Auto-starting journey! Train: ${codeToSearch}, Destination: ${destStation.station_ori_name}`,
            );
            setJourney(codeToSearch, destStation, data);
            router.replace("/(tabs)/home");
            return;
          }
        } else {
          logger.warn(
            `[QR Scanner] Preset destination '${presetDestination}' NOT found in train route.`,
          );
          setErrorMsg(
            `The scanned destination "${presetDestination}" is not valid for this train. Please select manually.`,
          );
          setDestination("");
        }
      }
    } catch (err: any) {
      logger.error("[Login UI] Connection Error:", err.message);
      setErrorMsg("Connection error. Could not reach the server.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleQRScan(data: string) {
    logger.log("[QR Scanner] Raw scanned data:", data);
    try {
      const parsed = JSON.parse(data);
      logger.log("[QR Scanner] Parsed JSON:", parsed);

      if (!parsed || typeof parsed !== "object") {
        logger.warn("[QR Scanner] Invalid payload format: not an object.");
        setErrorMsg("Invalid QR format. Expected a JSON object.");
        return;
      }

      if (!parsed.ticketCode) {
        logger.warn("[QR Scanner] Missing 'ticketCode' in payload.");
        setErrorMsg("QR code is missing the ticket code.");
        return;
      }

      const codeStr = String(parsed.ticketCode).trim();
      if (!/^\d+$/.test(codeStr) || codeStr.length < 4 || codeStr.length > 7) {
        logger.warn(`[QR Scanner] Invalid ticket code format: ${codeStr}`);
        setErrorMsg(
          `Scanned ticket code "${codeStr}" is invalid (must be 4-7 numbers).`,
        );
        return;
      }

      logger.log(
        `[QR Scanner] Successfully extracted ticketCode: ${codeStr}, destination: ${parsed.destination || "none"}`,
      );
      setTicketCode(codeStr);
      handleSearch(codeStr, parsed.destination);
    } catch (e) {
      logger.warn("[QR Scanner] Failed to parse QR data as JSON:", e);
      setErrorMsg("Invalid QR code format. Expected JSON.");
    }
  }

  function handleStart() {
    if (!canStart) return;
    const destStation = stations.find(
      (s) => s.station_ori_name === destination,
    );
    if (destStation) {
      logger.log(
        `[Login UI] Starting journey! Train: ${ticketCode}, Destination: ${destStation.station_ori_name}`,
      );
      setJourney(ticketCode, destStation, trainData!);
      router.replace("/(tabs)/home");
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
