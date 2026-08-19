import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { createApplication } from "../../src/api/create-application.js";
import { loadConfig } from "../../src/platform/config/load-config.js";

const config = loadConfig({ NODE_ENV: "test" });
const database = { checkReadiness: vi.fn() };

describe("HTTP middleware", () => {
  it("parses JSON requests and cookies before module routes", async () => {
    const app = createApplication({
      config,
      database,
      registerRoutes(application) {
        application.post("/api/v1/example", (request_, response) => {
          response.json({ body: request_.body, session: request_.cookies.session });
        });
      },
    });

    const response = await request(app)
      .post("/api/v1/example")
      .set("Cookie", "session=opaque-value")
      .send({ value: "parsed" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ body: { value: "parsed" }, session: "opaque-value" });
  });

  it("rejects a JSON body above the configured limit with safe Problem Details", async () => {
    const app = createApplication({
      config,
      database,
      registerRoutes(application) {
        application.post("/api/v1/example", (_request, response) => response.sendStatus(204));
      },
    });

    const response = await request(app)
      .post("/api/v1/example")
      .send({ value: "x".repeat(300 * 1024) });

    expect(response.status).toBe(413);
    expect(response.body).toMatchObject({
      code: "REQUEST_BODY_TOO_LARGE",
      detail: "The request body exceeds the allowed size.",
      status: 413,
    });
    expect(response.text).not.toContain("limit");
    expect(response.text).not.toContain("stack");
  });
});
