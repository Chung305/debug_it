import { LogEntry, DebugOptions, Transport, Settings } from "./lib/types";
import { LEVELS } from "./lib/constants";
import { getCallerInfo } from "./lib/util";
import { websocketTransport } from "./transports";

export class DebugIt {
  private transports: Transport[] = [];
  private minLevel: LogEntry["LEVEL"] = "debug";
  private debugMode: boolean = false;

  constructor(
    transports: Transport[] = [],
    settings: Settings = { minLevel: "debug", debugMode: false },
    debugOptions: DebugOptions = {}
  ) {
    this.transports = transports;
    this.minLevel = settings.minLevel;
    this.debugMode = settings.debugMode;

    if (this.debugMode) {
      const {
        wsMode = "server",
        wsPort = 3001,
        password,
        wsUrl = "",
        reconnectInterval,
      } = debugOptions;

      this.addTransport(
        websocketTransport({
          mode: wsMode,
          port: wsPort,
          url: wsUrl,
          password,
          reconnectInterval,
        })
      );
    }
  }

  addTransport(transport: Transport): void {
    this.transports.push(transport);
  }

  private log(level: LogEntry["LEVEL"], message?: string, meta?: any): void {
    if (LEVELS[level] < LEVELS[this.minLevel]) return;

    const callerInfo = getCallerInfo();

    const entry: LogEntry = {
      LEVEL: level,
      MESSAGE: message ?? "",
      META: meta,
      timestamp: new Date(),
      isDebugMode: this.debugMode,
      source: callerInfo,
    };

    // Run transports in parallel for optimization (non-blocking)
    this.transports.forEach((transport) => {
      // If transport is async, we don't await to keep it fast
      transport(entry);
    });
  }

  debug(message: string, meta?: any): void {
    this.log("debug", message, meta);
  }

  info(message: string, meta?: any): void {
    this.log("info", message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log("warn", message, meta);
  }

  error(message: string, meta?: any): void {
    this.log("error", message, meta);
  }
}
