/**
 * DebugIt Library
 * A flexible logging library with multiple transports and real-time WebSocket support.
 */

// Main
export { DebugIt } from "./debugit";

// Types
export type { LogEntry, DebugOptions, Transport } from "./lib/types";

// Constants
export { LEVELS } from "./lib/constants";

// Transport
export {
  consoleTransport,
  fileTransport,
  websocketTransport,
} from "./transports";
