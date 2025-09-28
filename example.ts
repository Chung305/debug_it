import { DebugIt } from "./src/index";
import { consoleTransport } from "./src/transports/console";
import { fileTransport } from "./src/transports/file";

// CLIENT Example (connect to a hosted WebSocket server)
// const hostLogger = new DebugIt([], "debug", false, {
//   wsMode: "client",
//   wsUrl: "wss://your-hosted-ws.com/logs",
//   password: "secret",
//   reconnectInterval: 10000,
// });
// hostLogger.info("Sent to hosted WS");

// SERVER Example (start a local WebSocket server)
const logger = new DebugIt(
  [consoleTransport],
  { minLevel: "info", debugMode: true },
  { wsPort: 3001, password: "secret" } // Enable WebSocket transport
);
// fileTransport({ filePath: "./logs/app.log", maxSize: 1024 * 1024 }),
// SERVER Example (start a local WebSocket server)
const simpleLogger = new DebugIt([consoleTransport], {
  minLevel: "info",
  debugMode: false,
});
simpleLogger.info("Simple logger, console only", { simple: true });

// logger.info("Hello, world!", { foo: "bar" });
// logger.error("Something went wrong", { errorCode: 500 });
// logger.debug("This is a debug message", { debugInfo: "details" });
// logger.warn("This is a warning", { warningLevel: 1 });

logger.info("Hello from WebSocket!", { foo: "bar" });
// Keep the process running to test (e.g., add setInterval or wait)
setInterval(() => {
  logger.info("Yoo FEDE, Txt me if you see this!", { count: Math.random() });
}, 2000);
