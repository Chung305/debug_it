export interface LogEntry {
  LEVEL: "debug" | "info" | "warn" | "error";
  MESSAGE: string;
  META?: any; // Optional metadata (e.g., { userId: 123 })
  "[DEBUG]"?: any; // used just to replace level in debug mode (for better visibility)
  isDebugMode?: boolean; // Optional debug mode flag
  timestamp: Date;
}

export interface DebugOptions {
  debugUI?: boolean; // Enable WebSocket transport for real-time viewing
  wsMode?: "server" | "client";
  wsPort?: number; // WebSocket port (default: 3001)
  wsUrl?: string; // For client mode only (e.g., 'wss://example.com/logs')
  password?: string; // Optional password for WebSocket connections
  reconnectInterval?: number;
}

const LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

export type Transport = (entry: LogEntry) => void | Promise<void>;

export class DebugIt {
  private transports: Transport[] = [];
  private minLevel: LogEntry["LEVEL"] = "debug";
  private debugMode: boolean = false;

  constructor(
    transports: Transport[] = [],
    minLevel: LogEntry["LEVEL"] = "debug",
    debugMode: boolean = false,
    debugOptions: DebugOptions = {}
  ) {
    this.transports = transports;
    this.debugMode = debugMode;
    this.minLevel = minLevel;

    if (this.debugMode && debugOptions.debugUI) {
      const {
        wsPort = 3001,
        wsMode = "server",
        wsUrl = "",
        password,
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
    const entry: LogEntry = {
      LEVEL: level,
      MESSAGE: message ?? "",
      META: meta,
      timestamp: new Date(),
      isDebugMode: this.debugMode,
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

import { consoleTransport } from "./transports/console";
import { fileTransport } from "./transports/file";
import { websocketTransport } from "./transports/websocket";

export { consoleTransport, fileTransport, websocketTransport };
