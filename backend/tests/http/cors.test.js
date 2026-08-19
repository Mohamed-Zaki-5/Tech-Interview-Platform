import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { createApplication } from "../../src/api/create-application.js";
import { loadConfig } from "../../src/platform/config/load-config.js";

const config = loadConfig({
  COOKIE_PATH: "/api/v1/auth",
  COOKIE_SAME_SITE: "lax",
  COOKIE_SECURE: "true",
  CORS_ALLOWED_ORIGINS: "https://app.example.com",
  DATABASE_URL: "postgresql://app:password@db.example.com:5432/interviews?sslmode=require",
  JWT_ACCESS_AUDIENCE: "tech-interview-api",
  JWT_ACCESS_ISSUER: "https://api.example.com",
  JWT_SIGNING_SECRET_BASE64: Buffer.alloc(32, 1).toString("base64"),
  NODE_ENV: "production",
  PUBLIC_API_ORIGIN: "https://api.example.com",
  PUBLIC_FRONTEND_ORIGIN: "https://app.example.com",
  RATE_LIMIT_HMAC_SECRET_BASE64: Buffer.alloc(32, 2).toString("base64"),
});
const database = { checkReadiness: vi.fn() };

describe("CORS", () => {
  it("permits an explicitly approved origin with credentials", async () => {
    const response = await request(createApplication({ config, database }))
      .get("/health/live")
      .set("Origin", "https://app.example.com");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe("https://app.example.com");
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
    expect(response.headers.vary).toContain("Origin");
  });

  it("rejects an unapproved browser origin with safe Problem Details", async () => {
    const response = await request(createApplication({ config, database }))
      .get("/health/live")
      .set("Origin", "https://attacker.example");

    expect(response.status).toBe(403);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
    expect(response.headers.vary).toContain("Origin");
    expect(response.body).toMatchObject({
      code: "ORIGIN_NOT_ALLOWED",
      detail: "The request origin is not allowed.",
      status: 403,
    });
  });

  it("allows a non-browser request without an Origin header", async () => {
    const response = await request(createApplication({ config, database })).get("/health/live");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
