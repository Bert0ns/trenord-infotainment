import { logger } from "../../lib/logger";

describe("logger", () => {
  const originalEnv = process.env.NODE_ENV;
  const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  const setNodeEnv = (value: string | undefined) => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value,
      configurable: true,
      writable: true,
    });
  };

  afterEach(() => {
    setNodeEnv(originalEnv);
    jest.clearAllMocks();
  });

  afterAll(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("does not log when NODE_ENV is test", () => {
    setNodeEnv("test");
    logger.log("test log");
    logger.warn("test warn");
    logger.error("test error");

    expect(logSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("logs when NODE_ENV is not test", () => {
    setNodeEnv("development");
    logger.log("test log");
    logger.warn("test warn");
    logger.error("test error");

    expect(logSpy).toHaveBeenCalledWith("test log");
    expect(warnSpy).toHaveBeenCalledWith("test warn");
    expect(errorSpy).toHaveBeenCalledWith("test error");
  });
});
