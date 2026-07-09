import { consoleTransport, logger as rnLogs } from "react-native-logs";

const config = {
  levels: {
    trace: 0,
    debug: 1,
    info: 2,
    log: 2,
    warn: 3,
    error: 4,
  },
  severity: process.env.NODE_ENV === "production" ? "error" : "trace",
  transport: consoleTransport,
  transportOptions: {
    colors: {
      trace: "white" as const,
      debug: "greenBright" as const,
      info: "blueBright" as const,
      log: "blueBright" as const,
      warn: "yellowBright" as const,
      error: "redBright" as const,
    },
    extensionColors: {
      TrenordAPI: "cyan" as const,
      NewsAPI: "greenBright" as const,
      Login: "magenta" as const,
      Scanner: "green" as const,
      Polling: "yellow" as const,
      Sync: "blue" as const,
      UI: "grey" as const,
      Report: "red" as const,
      Settings: "white" as const,
      Store: "magentaBright" as const,
      NewsStore: "yellowBright" as const,
      WeatherAPI: "cyanBright" as const,
      GeocodingAPI: "blueBright" as const,
    },
  },
  async: process.env.NODE_ENV !== "test",
  dateFormat: "time",
  printLevel: false,
  printDate: true,
  enabled: process.env.NODE_ENV !== "test",
};

export const logger = rnLogs.createLogger(config);
