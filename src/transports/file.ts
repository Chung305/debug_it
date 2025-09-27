import { LogEntry, Transport } from "..";
import { getLogHeader } from "../lib/util";
import * as fs from "fs/promises";
import * as path from "path";

export interface FileTransportOptions {
  filePath: string;
  maxSize?: number;
}

export const fileTransport = (options: FileTransportOptions): Transport => {
  const { filePath, maxSize = Infinity } = options;
  const dir = path.dirname(filePath);

  // Ensure log directory exists (one-time async op, non-blocking)
  fs.mkdir(dir, { recursive: true }).catch((err) =>
    console.error("Failed to create log dir:", err)
  );

  return async (entry: LogEntry) => {
    const header = getLogHeader(
      entry.LEVEL,
      entry.timestamp,
      entry.isDebugMode || false
    );
    const output =
      JSON.stringify({
        ...(entry.isDebugMode ? { "[DEBUG]": header } : { LEVEL: header }),
        MESSAGE: entry.MESSAGE,
        ...(entry.META ? { META: entry.META } : {}),
      }) + "\n"; // Newline for easy file parsing

    try {
      // Check file size and rotate if needed (simple: rename to .old)
      const stats = await fs.stat(filePath);
      if (stats.size > maxSize) {
        await fs.rename(filePath, `${filePath}.old`);
      }
    } catch (err) {
      // Ignore if file doesn't exist yet
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
        console.error("File transport error:", err);
      }
    }

    // Append to file asynchronously
    await fs.appendFile(filePath, output);
  };
};
