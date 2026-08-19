import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { createApplication } from "../../src/api/create-application.js";
import { loadConfig } from "../../src/platform/config/load-config.js";

const config = loadConfig({ NODE_ENV: "test" });

describe("health endpoints", () => {
  it("reports process liveness without checking PostgreSQL", async () => {
    const database = { checkReadiness: vi.fn() };
    const app = createApplication({ config, database });

    const response = await request(app).get("/health/live");

    expect(response.status).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.body).toEqual({ status: "ok" });
    expect(database.checkReadiness).not.toHaveBeenCalled();
  });

  it("reports readiness after PostgreSQL responds", async () => {
    const database = { checkReadiness: vi.fn().mockResolvedValue(undefined) };
    const app = createApplication({ config, database });

    const response = await request(app).get("/health/ready");

    expect(response.status).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.body).toEqual({
      checks: { database: "up" },
      status: "ready",
    });
    expect(database.checkReadiness).toHaveBeenCalledOnce();
  });

  it("reports dependency unavailability without exposing the PostgreSQL error", async () => {
    const database = {
      checkReadiness: vi
        .fn()
        .mockRejectedValue(new Error("password authentication failed for db-user")),
    };
    const app = createApplication({ config, database });

    const response = await request(app).get("/health/ready");

    expect(response.status).toBe(503);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.body).toEqual({
      checks: { database: "down" },
      status: "not_ready",
    });
    expect(response.text).not.toContain("password");
    expect(response.text).not.toContain("db-user");
  });
});
