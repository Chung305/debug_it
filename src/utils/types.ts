interface LogEntry {
  LEVEL: "debug" | "info" | "warn" | "error";
  MESSAGE: string;
  timestamp: Date;
  // Optional metadata (e.g., { userId: 123 })
  META?: any;
  // used just to replace level in debug mode (for better visibility)
  "[DEBUG]"?: any;
  // Optional source/module name
  source?: string;
  // Optional debug mode flag
  isDebugMode?: boolean;
}

interface Settings {
  minLevel: LogEntry["LEVEL"];
  debugMode: boolean;
}

interface DebugOptions {
  wsMode?: "server" | "client";
  // WebSocket port (default: 3001)
  wsPort?: number;
  // For client mode only (e.g., 'wss://example.com/logs')
  wsUrl?: string;
  // Optional password for WebSocket connection  (e.g., 'wss://example.com/logs?password=secret')
  password?: string;
  reconnectInterval?: number;
}

type Transport = (entry: LogEntry) => void | Promise<void>;

export { LogEntry, DebugOptions, Transport, Settings };
