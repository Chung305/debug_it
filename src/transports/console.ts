import { Transport } from "..";
import { getLogHeader } from "../lib/util";

export const consoleTransport: Transport = (entry) => {
  const { LEVEL, MESSAGE, META, timestamp, isDebugMode } = entry;
  const header = getLogHeader(LEVEL, timestamp, isDebugMode || false);
  const output = JSON.stringify({
    ...(isDebugMode ? { "[DEBUG]": header } : { LEVEL: header }),
    MESSAGE: MESSAGE + " ---> ",
    ...(META ? { META } : {}),
  });
  console.log(output);
};
