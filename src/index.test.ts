import * as fs from "fs/promises";
import * as path from "path";
import { fileTransport, LogEntry } from ".";

describe("File Transport", () => {
  const testFile = path.join(__dirname, "test.log");

  afterEach(async () => {
    await fs.unlink(testFile).catch(() => {}); // Cleanup
  });

  it("should write to file asynchronously", async () => {
    const transport = fileTransport({ filePath: testFile });
    const entry: LogEntry = {
      level: "info",
      message: "File test",
      timestamp: new Date(),
      meta: { key: "value" },
    };

    await transport(entry); // Await since async

    const content = await fs.readFile(testFile, "utf-8");
    const parsed = JSON.parse(content.trim());
    expect(parsed.level).toContain("[INFO]");
    expect(parsed.message).toBe("File test");
    expect(parsed.meta).toEqual({ key: "value" });
    expect(parsed.level).toMatch(
      /\[INFO\]-\(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\)/
    );
  });

  // Optional: Test rotation (write enough to exceed a small maxSize)
  it("should rotate file when exceeding maxSize", async () => {
    const smallMax = 120; // Set just under the expected size of one entry
    const transport = fileTransport({ filePath: testFile, maxSize: smallMax });
    const entry: LogEntry = {
      level: "info",
      message:
        "Long enough to exceed the maximum file size limit for rotation testing",
      timestamp: new Date(),
    };

    // Write once (should be under or near limit)
    await transport(entry);
    let stats = await fs.stat(testFile);

    // Write again to exceed the limit, which should trigger rotation
    await transport(entry);

    // After rotation, original file should exist with new content
    stats = await fs.stat(testFile);
    expect(stats.size).toBeLessThan(250); // New file with one entry should be smaller

    // Check that the rotated file exists
    await expect(fs.stat(`${testFile}.old`)).resolves.toBeDefined(); // Rotated file exists
  });
});
