import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createApplication } from "../../src/api/create-application.js";
import { createApiLifecycle } from "../../src/api/create-api-lifecycle.js";
import { loadConfig } from "../../src/platform/config/load-config.js";
import { createLogger } from "../../src/platform/logging/create-logger.js";

/** @type {Array<ReturnType<typeof createApiLifecycle>>} */
const activeLifecycles = [];

afterEach(async () => {
  await Promise.all(activeLifecycles.splice(0).map((lifecycle) => lifecycle.stop("test-cleanup")));
});

describe("API lifecycle", () => {
  it("opens and gracefully closes the HTTP and database boundaries", async () => {
    const config = loadConfig({ NODE_ENV: "test" });
    const database = {
      checkReadiness: vi.fn().mockResolvedValue(undefined),
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
    };
    const logger = createLogger({ config });
    const application = createApplication({ config, database, logger });
    const lifecycle = createApiLifecycle({ application, config, database, logger });
    activeLifecycles.push(lifecycle);

    const address = await lifecycle.start();
    const response = await request(`http://127.0.0.1:${address.port}`).get("/health/live");
    await lifecycle.stop("test");

    expect(response.status).toBe(200);
    expect(database.connect).toHaveBeenCalledOnce();
    expect(database.disconnect).toHaveBeenCalledOnce();
    expect(lifecycle.isStarted()).toBe(false);
  });
});
