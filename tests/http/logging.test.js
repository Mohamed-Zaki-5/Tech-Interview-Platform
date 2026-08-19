import { PassThrough } from "node:stream";

import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { createApplication } from "../../src/api/create-application.js";
import { loadConfig } from "../../src/platform/config/load-config.js";
import { createLogger } from "../../src/platform/logging/create-logger.js";

describe("HTTP logging", () => {
  it("redacts authorization and cookie values from structured request logs", async () => {
    const config = loadConfig({ LOG_LEVEL: "info", NODE_ENV: "test" });
    const database = { checkReadiness: vi.fn() };
    const destination = new PassThrough();
    let output = "";
    destination.on("data", (chunk) => {
      output += chunk.toString();
    });
    const logger = createLogger({ config, destination });
    const app = createApplication({ config, database, logger });

    await request(app)
      .get("/health/live?access_token=secret-query-token")
      .set("Authorization", "Bearer secret-access-token")
      .set("Cookie", "refreshToken=secret-refresh-token");

    expect(output).toContain("request completed");
    expect(output).toContain("[Redacted]");
    expect(output).not.toContain("secret-access-token");
    expect(output).not.toContain("secret-refresh-token");
    expect(output).not.toContain("secret-query-token");
  });
});
