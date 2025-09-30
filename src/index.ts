/**
 * DebugIt Library
 * A flexible logging library with multiple transports and real-time WebSocket support.
 */

// Main
export { DebugIt } from "./debugit";

// Types
export type { LogEntry, DebugOptions, Transport } from "./utils/types";

// Constants
export { LEVELS } from "./utils/constants";

// Transports
export {
  consoleTransport,
  fileTransport,
  websocketTransport,
} from "./transports";
