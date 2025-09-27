import { DebugIt, consoleTransport, fileTransport } from "./src/index";

const logger = new DebugIt(
  [
    consoleTransport,
    fileTransport({ filePath: "./logs/app.log", maxSize: 1024 * 1024 }),
  ],
  true // Enable/Disable debug mode
);

logger.info("Hello, world!", { foo: "bar" });
logger.error("Something went wrong", { errorCode: 500 });
