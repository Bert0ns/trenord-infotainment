import { logger } from "@/lib/logger";

const scannerLogger = logger.extend("Scanner");
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
    scannerLogger.log("Raw scanned data:", data);
    try {
      const parsed = JSON.parse(data);
      scannerLogger.log("Parsed JSON:", parsed);

      if (!parsed || typeof parsed !== "object") {
        scannerLogger.warn("Invalid payload format: not an object.");
        setErrorMsg("Invalid QR format. Expected a JSON object.");
        return;
      }

      if (!parsed.ticketCode) {
        scannerLogger.warn("Missing 'ticketCode' in payload.");
        setErrorMsg("QR code is missing the ticket code.");
        return;
      }

      const codeStr = String(parsed.ticketCode).trim();
      if (!/^\d+$/.test(codeStr) || codeStr.length < 4 || codeStr.length > 7) {
        scannerLogger.warn(`Invalid ticket code format: ${codeStr}`);
        setErrorMsg(
          `Scanned ticket code "${codeStr}" is invalid (must be 4-7 numbers).`,
        );
        return;
      }

      scannerLogger.log(
        `Successfully extracted ticketCode: ${codeStr}, destination: ${parsed.destination || "none"}`,
      );
      setTicketCode(codeStr);
      handleSearch(codeStr, parsed.destination);
    } catch (e) {
      scannerLogger.warn("Failed to parse QR data as JSON:", e);
      setErrorMsg("Invalid QR code format. Expected JSON.");
    }
  }

  return { handleQRScan };
}
