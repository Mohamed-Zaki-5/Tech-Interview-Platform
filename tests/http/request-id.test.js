import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { createApplication } from "../../src/api/create-application.js";
import { loadConfig } from "../../src/platform/config/load-config.js";

const config = loadConfig({ NODE_ENV: "test" });
const database = { checkReadiness: vi.fn() };

describe("request identifiers", () => {
  it("generates a correlation identifier when the client does not provide one", async () => {
    const response = await request(createApplication({ config, database })).get("/health/live");

    expect(response.headers["x-request-id"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("preserves a bounded client correlation identifier", async () => {
    const response = await request(createApplication({ config, database }))
      .get("/health/live")
      .set("X-Request-Id", "frontend-request_123");

    expect(response.headers["x-request-id"]).toBe("frontend-request_123");
  });

  it("replaces an unsafe client correlation identifier", async () => {
    const response = await request(createApplication({ config, database }))
      .get("/health/live")
      .set("X-Request-Id", "unsafe request id");

    expect(response.headers["x-request-id"]).not.toBe("unsafe request id");
    expect(response.headers["x-request-id"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});
