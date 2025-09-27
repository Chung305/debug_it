# debugIt

## Features

Debug Mode:

- default output:
  {"level":"[ERROR]-(2025-09-27T14:09:57.770Z)","message":"Something went wrong","meta":{"errorCode":500}}
- debug output for visual queues easier to look to at:
  {"[DEBUG]":"(2025-09-27T14:25:33.942Z)===>","message":"Something went wrong","meta":{"errorCode":500}}

## Examples

### default initialization

const logger = new DebugIt([consoleTransport])

### debug and fileTransport

const logger = new DebugIt(
[
consoleTransport,
fileTransport({ filePath: "./logs/app.log", maxSize: 1024 * 1024 }),
],
true // Enable/Disable debug mode
)
===

❤️ ocb
