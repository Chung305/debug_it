# debug_it

Lightweight Node.js logger with WebSocket transport for custom real-time UIs.

`debug_it` is a fast, composable logging library with console, file, and WebSocket transports. Build your own live log dashboards by connecting to its WebSocket server or send logs to a remote endpoint.

[![npm](https://img.shields.io/npm/v/debug_it)](https://www.npmjs.com/package/debug_it) [![License](https://img.shields.io/npm/l/debug_it)](https://grok.com/c/LICENSE)

## Features

- **Optimized**: Async, non-blocking transports for minimal overhead.
- **Composable**: Console, file, WebSocket, and custom transports.
- **WebSocket Support**: Stream logs to a local or remote WebSocket for custom UIs.
- **Source Tracking**: Auto-captures caller info (file:line).
- **Lightweight**: <10KB gzipped, single dep (`ws`).

## Installation

```bash
npm install debug_it

```

## Usage

Basic logging:

```typescript
const { DebugIt, consoleTransport, fileTransport } = require("debug_it");

const logger = new DebugIt([
  consoleTransport,
  fileTransport({ filePath: "logs/app.log" }),
]);

logger.info("Hello!", { user: "Alice" });
```

**Output**:

```
{"LEVEL":"[INFO]-(2025-10-03T22:19:00.000Z)","MESSAGE":"Hello!","source":"[app.js:10:5]","META":{"user":"Alice"}}

```

### WebSocket for Custom UI

Stream logs to a WebSocket server:

```typescript
const logger = new DebugIt(
  [websocketTransport({ mode: "server", wsPort: 3001, password: "secret" })],
  { minLevel: "debug", debugMode: true }
);

logger.debug("Test", { id: 123 });
```

Connect a custom UI to `ws://localhost:3001?password=secret`. Sample UI (`ui/sample.html`):

```JS
<script>
  const ws = new WebSocket('ws://localhost:3001?password=secret');
  ws.onmessage = (event) => console.log(JSON.parse(event.data));
</script>

```

### Remote WebSocket

Send logs to a remote server:

```typescript
const logger = new DebugIt(
  [websocketTransport({ mode: "client", wsUrl: "wss://your-ui.com/logs" })],
  { minLevel: "debug" }
);
logger.info("Remote log");
```

### Environment Variables

```typescript
const logger = DebugIt.fromEnv([consoleTransport]);
```

```typescript
export DEBUG_IT_LEVEL=info
export DEBUG_IT_MODE=true
export DEBUG_IT_WS_PORT=3001

```

## API

- **new DebugIt(transports, settings, debugOptions)**:
  - `transports`: Array of transports.
  - `settings`: `{ minLevel: 'debug' | 'info' | 'warn' | 'error', debugMode: boolean }`.
  - `debugOptions`: `{ debugUI, wsMode, wsPort, wsUrl, password }`.
- **Methods**: `debug()`, `info()`, `warn()`, `error()`, `addTransport()`, `close()`.
- **Transports**: `consoleTransport`, `fileTransport({ filePath, maxSize })`, `websocketTransport({ mode, port, url, password })`.

## License

MIT

**OCB** ❤️
