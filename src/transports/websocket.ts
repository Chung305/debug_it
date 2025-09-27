import WebSocket from "ws";
import { Transport, LogEntry } from "../index"; // Adjust if needed for circular imports
import { getLogHeader } from "../lib/util";

export interface WebSocketTransportOptions {
  mode?: "server" | "client"; // Default: 'server'
  port?: number; // For server mode only (default: 3001)
  url?: string; // For client mode only (e.g., 'wss://example.com/logs')
  password?: string; // Auth (query 'pw' for simplicity)
  headers?: Record<string, string>; // Optional custom headers for client
  reconnectInterval?: number; // Ms between retries (default: 5000)
}

export const websocketTransport = (
  options: WebSocketTransportOptions = {}
): Transport => {
  const {
    mode = "server",
    port = 3001,
    url,
    password,
    headers = {},
    reconnectInterval = 5000,
  } = options;

  if (mode === "client" && !url) {
    throw new Error("URL required for client mode");
  }
  let wsClient: WebSocket | null = null; // For client mode
  let wss: WebSocket.Server | null = null; // For server mode

  // Server Mode (existing logic)
  if (mode === "server") {
    wss = new WebSocket.Server({ port, host: "localhost" });

    wss.on("listening", () =>
      console.log(`DebugIt WS server on ws://localhost:${port}`)
    );
    wss.on("error", (err) => console.error("WS server error:", err));
    wss.on("connection", (ws, req) => {
      const urlParams = new URLSearchParams(req.url?.slice(1));
      if (password && urlParams.get("password") !== password) {
        ws.close(1008, "Invalid password");
        return;
      }
      console.log("WS client connected");
    });

    const broadcast = (data: string) => {
      wss?.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) client.send(data);
      });
    };

    return (entry: LogEntry) => {
      const header = getLogHeader(
        entry.LEVEL,
        entry.timestamp,
        entry.isDebugMode || false
      );
      const output = JSON.stringify({
        ...(entry.isDebugMode ? { "[DEBUG]": header } : { LEVEL: header }),
        MESSAGE: entry.MESSAGE,
        ...(entry.META ? { META: entry.META } : {}),
      });
      broadcast(output);
    };
  }

  // Client Mode (new: connect to hosted URL and send logs)
  if (mode === "client") {
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      let fullUrl = url!;
      if (password)
        fullUrl += `${fullUrl.includes("?") ? "&" : "?"}password=${password}`;

      wsClient = new WebSocket(fullUrl, { headers });

      wsClient.on("open", () => {
        console.log(`Connected to hosted WS: ${url}`);
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
      });

      wsClient.on("close", () => {
        console.log(
          `Disconnected from ${url}. Reconnecting in ${reconnectInterval}ms...`
        );
        reconnectTimeout = setTimeout(connect, reconnectInterval);
      });

      wsClient.on("error", (err) =>
        console.error(`WS client error: ${err.message}`)
      );
    };

    connect(); // Initial connection

    return (entry: LogEntry) => {
      if (wsClient?.readyState !== WebSocket.OPEN) return;

      const header = getLogHeader(
        entry.LEVEL,
        entry.timestamp,
        entry.isDebugMode || false
      );

      const output = JSON.stringify({
        ...(entry.isDebugMode ? { "[DEBUG]": header } : { LEVEL: header }),
        MESSAGE: entry.MESSAGE,
        ...(entry.META ? { META: entry.META } : {}),
      });
      wsClient.send(output);
    };
  }
  throw new Error("Invalid mode");
};

// Optional: Export a close function for shutdown
export function closeWebSocketServer(port: number = 3001) {
  // Logic to close if needed; for now, placeholder
  console.log(`Closing WebSocket on port ${port}`);
  // Actual close: Would need to track the server instance
}
