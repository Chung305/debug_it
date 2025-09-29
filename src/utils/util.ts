/**
 * Generates a log header based on the logging level, timestamp, and debug mode.
 */
export const getLogHeader = (
  level: string,
  timestamp: Date,
  isDebugMode: boolean
): string => {
  return isDebugMode
    ? `(${timestamp.toISOString()}) ---> `
    : `[${level.toUpperCase()}]-(${timestamp.toISOString()})`;
};

/**
 * Captures the caller information from the stack trace.
 * Returns a string like "[filename:line:column]" or undefined if not available.
 */
export const getCallerInfo = (): string | undefined => {
  const originalPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;

  const err = new Error();
  const stack = err.stack as unknown as NodeJS.CallSite[];

  Error.prepareStackTrace = originalPrepareStackTrace;

  if (!stack || stack.length < 2) {
    return undefined;
  }

  // Find the first stack frame that's outside our library
  for (let i = 1; i < stack.length; i++) {
    const caller = stack[i];
    const fileName = caller.getFileName();

    if (!fileName) continue;

    // Get just the filename for checking
    const shortFileName = fileName.split(/[/\\]/).pop() || fileName;

    // Skip frames that are part of our library (in the src directory)
    // But NOT the root level files like example.ts
    const isLibraryFrame =
      (fileName.includes("src") && !fileName.endsWith("example.ts")) ||
      fileName.includes("node_modules");

    if (!isLibraryFrame) {
      const lineNumber = caller.getLineNumber();
      const columnNumber = caller.getColumnNumber();

      if (lineNumber) {
        return `[${shortFileName}:${lineNumber}:${columnNumber || 0}]`;
      }
    }
  }

  return undefined;
};
