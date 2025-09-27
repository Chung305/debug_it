# DebugIt 🚀

An optimized, composable logging library for Node.js with TypeScript support.

## ✨ Features

- **Composable Architecture**: Mix and match different transport methods
- **TypeScript Support**: Full type safety and IntelliSense support
- **Debug Mode**: Enhanced visual output for development
- **File Rotation**: Automatic log file rotation based on size
- **Async Optimized**: Non-blocking transport execution
- **Minimal Dependencies**: Lightweight and fast

## 🎯 Debug Mode Comparison

### Default Output

```json
{
  "level": "[ERROR]-(2025-09-27T14:09:57.770Z)",
  "message": "Something went wrong",
  "meta": {
    "errorCode": 500
  }
}
```

### Debug Mode Output

```json
{
  "[DEBUG]": "(2025-09-27T14:25:33.942Z)===>",
  "message": "Something went wrong",
  "meta": {
    "errorCode": 500
  }
}
```

## 📦 Installation

```bash
npm install debug-it
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { DebugIt, consoleTransport } from "debug-it";

const logger = new DebugIt([consoleTransport]);

logger.info("Hello, world!");
logger.error("Something went wrong", { errorCode: 500 });
```

### Advanced Usage with File Transport

```typescript
import { DebugIt, consoleTransport, fileTransport } from "debug-it";

const logger = new DebugIt(
  [
    consoleTransport,
    fileTransport({
      filePath: "./logs/app.log",
      maxSize: 1024 * 1024, // 1MB
    }),
  ],
  true
); // Enable debug mode

logger.debug("Debug message");
logger.info("Info message");
logger.warn("Warning message");
logger.error("Error message");
```

## 📚 API Reference

### Constructor Parameters

```typescript
new DebugIt(transports?, debugMode?)
```

| Parameter    | Type          | Default | Description                           |
| ------------ | ------------- | ------- | ------------------------------------- |
| `transports` | `Transport[]` | `[]`    | Array of transport functions          |
| `debugMode`  | `boolean`     | `false` | Enable debug mode for enhanced output |

### Log Levels

| Level   | Priority | Description                        |
| ------- | -------- | ---------------------------------- |
| `debug` | 0        | Detailed information for debugging |
| `info`  | 1        | General information messages       |
| `warn`  | 2        | Warning messages                   |
| `error` | 3        | Error messages                     |

### Transport Options

#### Console Transport

```typescript
import { consoleTransport } from "debug-it";
```

Outputs formatted JSON logs to the console.

#### File Transport

```typescript
import { fileTransport } from "debug-it";

const transport = fileTransport({
  filePath: "./logs/app.log",
  maxSize: number, // Optional: File size limit in bytes
});
```

## 🔧 Configuration Examples

### Development Setup

```typescript
const logger = new DebugIt([consoleTransport], true);
```

### Production Setup

```typescript
const logger = new DebugIt(
  [fileTransport({ filePath: "./logs/app.log" })],
  false
);
```

### Full-Featured Setup with Debug Options

```typescript
const logger = new DebugIt(
  [
    consoleTransport,
    fileTransport({ filePath: "./logs/app.log", maxSize: 1024 * 1024 }),
  ],
  "info", // Set minimum log level to "info"
  true, // Enable/Disable debug mode
  { debugUI: true, wsPort: 3001, password: "secret" } // Enable WebSocket transport
);
```

## 🧪 Testing

```bash
npm test
```

## 🏗️ Building

```bash
npm run build
```

## 📄 License

MIT

## 👤 Author

**OCB** ❤️

---

_Built with TypeScript and optimized for performance_
