import { logger } from "@/lib/logger";

interface UseQRScannerProps {
  setTicketCode: (code: string) => void;
  handleSearch: (code: string, presetDestination?: string) => void;
  setErrorMsg: (msg: string | null) => void;
}

export function useQRScanner({
  setTicketCode,
  handleSearch,
  setErrorMsg,
}: UseQRScannerProps) {
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

  return { handleQRScan };
}
