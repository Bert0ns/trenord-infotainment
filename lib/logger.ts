export const logger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV !== "test") {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV !== "test") {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV !== "test") {
      console.error(...args);
    }
  },
};
