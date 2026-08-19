import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { createApplication } from "../../src/api/create-application.js";
import { loadConfig } from "../../src/platform/config/load-config.js";
import { ValidationProblem } from "../../src/platform/http/validation-problem.js";

const config = loadConfig({ NODE_ENV: "test" });
const database = { checkReadiness: vi.fn() };

describe("Problem Details", () => {
  it("returns a safe RFC 9457-style response for an unknown route", async () => {
    const response = await request(createApplication({ config, database }))
      .get("/api/v1/does-not-exist")
      .set("X-Request-Id", "request-404");

    expect(response.status).toBe(404);
    expect(response.headers["content-type"]).toMatch(/^application\/problem\+json/);
    expect(response.body).toEqual({
      code: "ROUTE_NOT_FOUND",
      detail: "The requested resource was not found.",
      instance: "/api/v1/does-not-exist",
      requestId: "request-404",
      status: 404,
      title: "Route not found",
      type: "http://localhost:3000/problems/route-not-found",
    });
  });

  it("includes only safe field details for a validation failure", async () => {
    const app = createApplication({
      config,
      database,
      registerRoutes(application) {
        application.post("/api/v1/example", () => {
          throw new ValidationProblem([
            {
              code: "INVALID_FORMAT",
              field: "email",
              message: "Must be a valid email address.",
            },
          ]);
        });
      },
    });

    const response = await request(app)
      .post("/api/v1/example")
      .set("X-Request-Id", "request-validation");

    expect(response.status).toBe(400);
    expect(response.headers["content-type"]).toMatch(/^application\/problem\+json/);
    expect(response.body).toEqual({
      code: "VALIDATION_FAILED",
      detail: "The request contains invalid fields.",
      errors: [
        {
          code: "INVALID_FORMAT",
          field: "email",
          message: "Must be a valid email address.",
        },
      ],
      instance: "/api/v1/example",
      requestId: "request-validation",
      status: 400,
      title: "Request validation failed",
      type: "http://localhost:3000/problems/validation-failed",
    });
  });

  it("does not echo query-string secrets in the Problem Details instance", async () => {
    const response = await request(createApplication({ config, database })).get(
      "/api/v1/missing?access_token=secret-query-token",
    );

    expect(response.status).toBe(404);
    expect(response.body.instance).toBe("/api/v1/missing");
    expect(response.text).not.toContain("secret-query-token");
  });

  it("replaces unexpected failures with generic Problem Details", async () => {
    const app = createApplication({
      config,
      database,
      registerRoutes(application) {
        application.get("/api/v1/failure", () => {
          throw new Error("database password is secret-database-value");
        });
      },
    });

    const response = await request(app).get("/api/v1/failure");

    expect(response.status).toBe(500);
    expect(response.body).toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      detail: "An unexpected error occurred.",
      status: 500,
    });
    expect(response.text).not.toContain("secret-database-value");
    expect(response.text).not.toContain("stack");
  });
});
