export interface LogEntry {
  level: "debug" | "info" | "warn" | "error";
  message: string;
  meta?: any; // Optional metadata (e.g., { userId: 123 })
  "[DEBUG]"?: any; // used just to replace level in debug mode (for better visibility)
  isDebugMode?: boolean; // Optional debug mode flag
  timestamp: Date;
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
  private debugMode: boolean = false;
  private minLevel: LogEntry["level"] = "debug";

  constructor(
    transports: Transport[] = [],
    debugMode: boolean = false,
    minLevel: LogEntry["level"] = "debug"
  ) {
    this.transports = transports;
    this.debugMode = debugMode;
    this.minLevel = minLevel;
  }

  addTransport(transport: Transport): void {
    this.transports.push(transport);
  }

  private log(level: LogEntry["level"], message?: string, meta?: any): void {
    if (LEVELS[level] < LEVELS[this.minLevel]) return;
    const entry: LogEntry = {
      level,
      message: message ?? "",
      meta,
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

// Example built-in transport: Console output (optimized with JSON.stringify for speed)
export const consoleTransport: Transport = (entry) => {
  const { level, message, meta, timestamp, isDebugMode } = entry;
  const header = `[${level.toUpperCase()}]-(${timestamp.toISOString()})`;
  const debugHeader = `(${timestamp.toISOString()})===>`;
  const output = JSON.stringify({
    ...(isDebugMode ? { "[DEBUG]": debugHeader } : { level: header }),
    message,
    ...(meta ? { meta } : {}),
  });
  console.log(output);
};

import { promises as fs } from "fs";
import * as path from "path";

export interface FileTransportOptions {
  filePath: string; // e.g., './logs/app.log'
  maxSize?: number; // Optional: Rotate file if it exceeds this size in bytes (default: no limit)
}

export const fileTransport = (options: FileTransportOptions): Transport => {
  const { filePath, maxSize = Infinity } = options;
  const dir = path.dirname(filePath);

  // Ensure log directory exists (one-time async op, non-blocking)
  fs.mkdir(dir, { recursive: true }).catch((err) =>
    console.error("Failed to create log dir:", err)
  );

  return async (entry: LogEntry) => {
    const header = `[${entry.level.toUpperCase()}]-(${entry.timestamp.toISOString()})`;
    const debugHeader = `(${entry.timestamp.toISOString()})===>`;
    const output =
      JSON.stringify({
        ...(entry.isDebugMode ? { "[DEBUG]": debugHeader } : { level: header }),
        message: entry.message,
        ...(entry.meta ? { meta: entry.meta } : {}),
      }) + "\n"; // Newline for easy file parsing

    try {
      // Check file size and rotate if needed (simple: rename to .old)
      const stats = await fs.stat(filePath);
      if (stats.size > maxSize) {
        await fs.rename(filePath, `${filePath}.old`);
      }
    } catch (err) {
      // Ignore if file doesn't exist yet
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
        console.error("File transport error:", err);
      }
    }

    // Append to file asynchronously
    await fs.appendFile(filePath, output);
  };
};
