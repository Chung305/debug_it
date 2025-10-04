import { Transport } from "../lib/types";
import { getLogHeader } from "../lib/utils";

export const consoleTransport: Transport = (entry) => {
  const { LEVEL, MESSAGE, META, timestamp, isDebugMode, source } = entry;
  const header = getLogHeader(LEVEL, timestamp, isDebugMode || false);
  const sourcePrefix = source ? `${source} ` : "";

  const output = JSON.stringify({
    ...(isDebugMode ? { "[DEBUG]": header } : { LEVEL: header }),
    MESSAGE: sourcePrefix + MESSAGE + " ---> ",
    ...(META ? { META } : {}),
  });

  try {
    console.log(output);
  } catch (error: any) {
    // Handle broken pipe errors gracefully
    if (error.code === "EPIPE") {
      // Silently ignore broken pipe errors
      return;
    }
    // Re-throw other errors
    throw error;
  }
};
