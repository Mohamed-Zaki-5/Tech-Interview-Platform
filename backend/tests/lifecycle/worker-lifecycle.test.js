import { PassThrough } from "node:stream";

import { describe, expect, it, vi } from "vitest";

import { loadConfig } from "../../src/platform/config/load-config.js";
import { createLogger } from "../../src/platform/logging/create-logger.js";
import { createWorkerLifecycle } from "../../src/worker/create-worker-lifecycle.js";

describe("Worker lifecycle", () => {
  it("opens and closes Prisma while explicitly reporting the Phase 1 idle state", async () => {
    const config = loadConfig({ LOG_LEVEL: "info", NODE_ENV: "test" });
    const database = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
    };
    const destination = new PassThrough();
    let output = "";
    destination.on("data", (chunk) => {
      output += chunk.toString();
    });
    const logger = createLogger({ config, destination });
    const lifecycle = createWorkerLifecycle({ database, logger });

    await lifecycle.start();
    await lifecycle.stop("test");

    expect(database.connect).toHaveBeenCalledOnce();
    expect(database.disconnect).toHaveBeenCalledOnce();
    expect(output).toContain("no evaluation job processor is registered in Phase 1");
    expect(lifecycle.isStarted()).toBe(false);
  });
});
