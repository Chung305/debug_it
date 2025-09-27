import { DebugIt } from "./src/index";
import { consoleTransport } from "./src/transports/console";
import { fileTransport } from "./src/transports/file";

// CLIENT Example (connect to a hosted WebSocket server)
const hostLogger = new DebugIt([], "debug", false, {
  wsMode: "client",
  wsUrl: "wss://your-hosted-ws.com/logs",
  password: "secret",
  reconnectInterval: 10000,
});
hostLogger.info("Sent to hosted WS");

const logger = new DebugIt(
  [
    consoleTransport,
    fileTransport({ filePath: "./logs/app.log", maxSize: 1024 * 1024 }),
  ],
  "info", // Set minimum log level to "info"
  true, // Enable/Disable debug mode
  { debugUI: true, wsPort: 3001, password: "secret" } // Enable WebSocket transport
);

// logger.info("Hello, world!", { foo: "bar" });
// logger.error("Something went wrong", { errorCode: 500 });
// logger.debug("This is a debug message", { debugInfo: "details" });
// logger.warn("This is a warning", { warningLevel: 1 });

logger.info("Hello from WebSocket!", { foo: "bar" });
// Keep the process running to test (e.g., add setInterval or wait)
setInterval(() => {
  logger.info("Periodic log", { count: Math.random() });
}, 2000);
