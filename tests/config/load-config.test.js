import { describe, expect, it } from "vitest";

import { loadConfig } from "../../src/platform/config/load-config.js";

const productionEnvironment = {
  API_HOST: "127.0.0.1",
  API_PORT: "3000",
  COOKIE_PATH: "/api/v1/auth",
  COOKIE_SAME_SITE: "lax",
  COOKIE_SECURE: "true",
  CORS_ALLOWED_ORIGINS: "https://app.example.com,https://admin.example.com",
  DATABASE_URL: "postgresql://app:password@db.example.com:5432/interviews?sslmode=require",
  JWT_ACCESS_AUDIENCE: "tech-interview-api",
  JWT_ACCESS_ISSUER: "https://api.example.com",
  JWT_SIGNING_SECRET_BASE64: Buffer.alloc(32, 1).toString("base64"),
  LOG_LEVEL: "info",
  NODE_ENV: "production",
  PUBLIC_API_ORIGIN: "https://api.example.com",
  PUBLIC_FRONTEND_ORIGIN: "https://app.example.com",
  RATE_LIMIT_HMAC_SECRET_BASE64: Buffer.alloc(32, 2).toString("base64"),
};

describe("loadConfig", () => {
  it("returns typed and grouped configuration for a valid production environment", () => {
    const config = loadConfig(productionEnvironment);

    expect(config).toMatchObject({
      environment: "production",
      api: {
        host: "127.0.0.1",
        port: 3000,
        jsonBodyLimit: "256kb",
      },
      cors: {
        allowedOrigins: ["https://app.example.com", "https://admin.example.com"],
      },
      cookie: {
        path: "/api/v1/auth",
        sameSite: "lax",
        secure: true,
      },
      authentication: {
        accessTokenAudience: "tech-interview-api",
        accessTokenIssuer: "https://api.example.com",
      },
      assessment: {
        maximumQuestionCount: 50,
        sessionDurationHours: 24,
      },
      passwordHashing: {
        hashLength: 32,
        memoryCostKiB: 65_536,
        parallelism: 4,
        timeCost: 3,
      },
      weakAreas: {
        minimumEvaluatedQuestions: 5,
        scoreThresholdPercentage: 60,
      },
    });
  });

  it("rejects missing production secrets without including secret values", () => {
    const invalidEnvironment = {
      ...productionEnvironment,
      JWT_SIGNING_SECRET_BASE64: undefined,
      RATE_LIMIT_HMAC_SECRET_BASE64: "not-base64",
    };

    expect(() => loadConfig(invalidEnvironment)).toThrowError(
      expect.objectContaining({
        name: "ConfigurationError",
        message: "Application configuration is invalid.",
      }),
    );

    try {
      loadConfig(invalidEnvironment);
    } catch (error) {
      expect(JSON.stringify(error)).not.toContain("not-base64");
    }
  });

  it("keeps test defaults isolated from production requirements", () => {
    const config = loadConfig({ NODE_ENV: "test" });

    expect(config).toMatchObject({
      environment: "test",
      api: { host: "127.0.0.1", port: 0 },
      cors: { allowedOrigins: ["http://localhost:5173"] },
      cookie: { secure: false },
      database: { url: "postgresql://test:test@127.0.0.1:5432/tech_interview_platform_test" },
    });
  });

  it("rejects a non-PostgreSQL URL and reused production secrets", () => {
    const reusedSecret = Buffer.alloc(32, 3).toString("base64");

    expect(() =>
      loadConfig({
        ...productionEnvironment,
        DATABASE_URL: "mysql://database.example.com/interviews",
        JWT_SIGNING_SECRET_BASE64: reusedSecret,
        RATE_LIMIT_HMAC_SECRET_BASE64: reusedSecret,
      }),
    ).toThrowError(
      expect.objectContaining({
        invalidKeys: expect.arrayContaining(["DATABASE_URL", "RATE_LIMIT_HMAC_SECRET_BASE64"]),
      }),
    );
  });

  it("does not silently replace malformed production values with defaults", () => {
    expect(() =>
      loadConfig({
        ...productionEnvironment,
        API_PORT: "three-thousand",
        COOKIE_SECURE: "yes",
      }),
    ).toThrowError(
      expect.objectContaining({
        invalidKeys: expect.arrayContaining(["API_PORT", "COOKIE_SECURE"]),
      }),
    );
  });
});
