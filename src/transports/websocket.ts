import WebSocket from "ws";
import { Transport, LogEntry } from "../utils/types";
import { getLogHeader } from "../utils/util";

export interface WebSocketTransportOptions {
  mode?: "server" | "client";
  port?: number;
  url?: string;
  password?: string;
  headers?: Record<string, string>;
  reconnectInterval?: number;
}

let wssInstance: WebSocket.Server | null = null;
let wssPort: number | null = null;

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

  // Server Mode
  if (mode === "server") {
    if (wssInstance) {
      throw new Error(`WebSocket server already running on port ${wssPort}`);
    }
    wssInstance = new WebSocket.Server({ port, host: "localhost" });
    wssPort = port;

    wssInstance.on("listening", () =>
      console.log(`DebugIt WS server on ws://localhost:${port}`)
    );
    wssInstance.on("error", (err) => console.error("WS server error:", err));
    wssInstance.on("connection", (ws, req) => {
      const urlParams = new URLSearchParams(req.url?.slice(1));
      if (password && urlParams.get("password") !== password) {
        ws.close(1008, "Invalid password");
        return;
      }
      console.log("WS client connected");
    });

    const broadcast = (data: string) => {
      wssInstance?.clients.forEach((client) => {
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
        LEVEL: entry.LEVEL,
        MESSAGE: entry.MESSAGE,
        ...(entry.META ? { META: entry.META } : {}),
      });
      broadcast(output);
    };
  }

  // Client Mode (unchanged)
  if (mode === "client") {
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let wsClient: WebSocket | null = null;

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

    connect();

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

export function closeWebSocketServer(): void {
  if (wssInstance && wssPort) {
    wssInstance.close(() => {
      console.log(`Closed WebSocket server on port ${wssPort}`);
      wssInstance = null;
      wssPort = null;
    });
  }
}
