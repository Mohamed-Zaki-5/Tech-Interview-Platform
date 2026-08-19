import { z } from "zod";

import { ConfigurationError } from "./configuration-error.js";

const BOOLEAN_VALUES = new Map([
  ["true", true],
  ["false", false],
]);

const environmentSchema = z.enum(["development", "test", "production"]);
const logLevelSchema = z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]);

/**
 * @param {string | undefined} value
 * @returns {boolean | null | undefined}
 */
function parseBoolean(value) {
  if (value === undefined) {
    return undefined;
  }

  return BOOLEAN_VALUES.get(value.toLowerCase()) ?? null;
}

/**
 * @param {string | undefined} value
 * @returns {number | undefined}
 */
function parseInteger(value) {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : Number.NaN;
}

/**
 * @param {string | undefined} value
 * @returns {string[] | undefined}
 */
function parseOrigins(value) {
  if (value === undefined) {
    return undefined;
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/**
 * @param {string | undefined} value
 * @returns {Buffer | undefined}
 */
function parseBase64Secret(value) {
  if (
    value === undefined ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)
  ) {
    return undefined;
  }

  const bytes = Buffer.from(value, "base64");
  return bytes.length >= 32 ? bytes : undefined;
}

/**
 * @param {string[] | undefined} origins
 * @returns {boolean}
 */
function hasUniqueOrigins(origins) {
  return origins !== undefined && origins.length > 0 && new Set(origins).size === origins.length;
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function isHttpsOrigin(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.origin === value;
  } catch {
    return false;
  }
}

/**
 * @param {string | undefined} value
 * @returns {boolean}
 */
function isPostgreSqlUrl(value) {
  if (value === undefined) {
    return false;
  }

  try {
    const url = new URL(value);
    return (
      (url.protocol === "postgresql:" || url.protocol === "postgres:") &&
      url.hostname.length > 0 &&
      url.pathname.length > 1
    );
  } catch {
    return false;
  }
}

/**
 * Loads, validates, and groups process configuration without mutating the supplied environment.
 *
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} [environmentVariables]
 */
export function loadConfig(environmentVariables = process.env) {
  const environmentResult = environmentSchema.safeParse(
    environmentVariables.NODE_ENV ?? "development",
  );
  if (!environmentResult.success) {
    throw new ConfigurationError(["NODE_ENV"]);
  }

  const environment = environmentResult.data;
  const isTest = environment === "test";
  const isProduction = environment === "production";
  const testSecret = Buffer.alloc(32, 1);
  const cookieSecure = parseBoolean(environmentVariables.COOKIE_SECURE);
  const jwtSigningSecret = parseBase64Secret(environmentVariables.JWT_SIGNING_SECRET_BASE64);
  const rateLimitSecret = parseBase64Secret(environmentVariables.RATE_LIMIT_HMAC_SECRET_BASE64);

  const raw = {
    apiHost: environmentVariables.API_HOST ?? "127.0.0.1",
    apiPort: parseInteger(environmentVariables.API_PORT) ?? (isTest ? 0 : 3000),
    jsonBodyLimit: environmentVariables.JSON_BODY_LIMIT ?? "256kb",
    trustProxyHops: parseInteger(environmentVariables.TRUST_PROXY_HOPS) ?? 0,
    databaseUrl:
      environmentVariables.DATABASE_URL ??
      (isTest ? "postgresql://test:test@127.0.0.1:5432/tech_interview_platform_test" : undefined),
    logLevel: environmentVariables.LOG_LEVEL ?? (isTest ? "silent" : "info"),
    publicApiOrigin:
      environmentVariables.PUBLIC_API_ORIGIN ?? (isTest ? "http://localhost:3000" : undefined),
    publicFrontendOrigin:
      environmentVariables.PUBLIC_FRONTEND_ORIGIN ?? (isTest ? "http://localhost:5173" : undefined),
    allowedOrigins:
      parseOrigins(environmentVariables.CORS_ALLOWED_ORIGINS) ??
      (isTest ? ["http://localhost:5173"] : undefined),
    cookieSecure: cookieSecure === undefined ? !isTest : cookieSecure,
    cookieSameSite: environmentVariables.COOKIE_SAME_SITE ?? "lax",
    cookiePath: environmentVariables.COOKIE_PATH ?? "/api/v1/auth",
    accessTokenIssuer:
      environmentVariables.JWT_ACCESS_ISSUER ?? (isTest ? "http://localhost:3000" : undefined),
    accessTokenAudience:
      environmentVariables.JWT_ACCESS_AUDIENCE ?? (isTest ? "tech-interview-api-test" : undefined),
    jwtSigningSecret:
      environmentVariables.JWT_SIGNING_SECRET_BASE64 === undefined && isTest
        ? testSecret
        : jwtSigningSecret,
    rateLimitSecret:
      environmentVariables.RATE_LIMIT_HMAC_SECRET_BASE64 === undefined && isTest
        ? Buffer.alloc(32, 2)
        : rateLimitSecret,
    assessmentDurationHours:
      parseInteger(environmentVariables.ASSESSMENT_SESSION_DURATION_HOURS) ?? 24,
    maximumQuestionCount: parseInteger(environmentVariables.ASSESSMENT_MAX_QUESTION_COUNT) ?? 50,
    weakMinimumEvaluatedQuestions:
      parseInteger(environmentVariables.WEAK_AREA_MINIMUM_EVALUATED_QUESTIONS) ?? 5,
    weakScoreThresholdPercentage:
      parseInteger(environmentVariables.WEAK_AREA_SCORE_THRESHOLD_PERCENTAGE) ?? 60,
    argonMemoryCostKiB: parseInteger(environmentVariables.ARGON2_MEMORY_COST_KIB) ?? 65_536,
    argonTimeCost: parseInteger(environmentVariables.ARGON2_TIME_COST) ?? 3,
    argonParallelism: parseInteger(environmentVariables.ARGON2_PARALLELISM) ?? 4,
    argonHashLength: parseInteger(environmentVariables.ARGON2_HASH_LENGTH) ?? 32,
    argonConcurrency: parseInteger(environmentVariables.ARGON2_MAX_CONCURRENCY) ?? 1,
    argonQueueLimit: parseInteger(environmentVariables.ARGON2_QUEUE_LIMIT) ?? 16,
    argonQueueTimeoutMs: parseInteger(environmentVariables.ARGON2_QUEUE_TIMEOUT_MS) ?? 2_000,
  };

  const invalidKeys = [];
  /** @param {string} key @param {unknown} value */
  const requireString = (key, value) => {
    if (typeof value !== "string" || value.length === 0) invalidKeys.push(key);
  };
  /** @param {string} key @param {unknown} value @param {number} [minimum] */
  const requirePositiveInteger = (key, value, minimum = 1) => {
    if (typeof value !== "number" || !Number.isInteger(value) || value < minimum) {
      invalidKeys.push(key);
    }
  };

  requireString("DATABASE_URL", raw.databaseUrl);
  requireString("PUBLIC_API_ORIGIN", raw.publicApiOrigin);
  requireString("PUBLIC_FRONTEND_ORIGIN", raw.publicFrontendOrigin);
  requireString("JWT_ACCESS_ISSUER", raw.accessTokenIssuer);
  requireString("JWT_ACCESS_AUDIENCE", raw.accessTokenAudience);

  if (!hasUniqueOrigins(raw.allowedOrigins)) invalidKeys.push("CORS_ALLOWED_ORIGINS");
  if (!isPostgreSqlUrl(raw.databaseUrl)) invalidKeys.push("DATABASE_URL");
  if (!(raw.jwtSigningSecret instanceof Buffer)) invalidKeys.push("JWT_SIGNING_SECRET_BASE64");
  if (!(raw.rateLimitSecret instanceof Buffer)) invalidKeys.push("RATE_LIMIT_HMAC_SECRET_BASE64");
  if (
    raw.jwtSigningSecret instanceof Buffer &&
    raw.rateLimitSecret instanceof Buffer &&
    raw.jwtSigningSecret.equals(raw.rateLimitSecret)
  ) {
    invalidKeys.push("RATE_LIMIT_HMAC_SECRET_BASE64");
  }
  if (raw.cookieSameSite !== "lax") invalidKeys.push("COOKIE_SAME_SITE");
  if (typeof raw.cookieSecure !== "boolean") invalidKeys.push("COOKIE_SECURE");
  if (!raw.cookiePath.startsWith("/")) invalidKeys.push("COOKIE_PATH");
  if (!logLevelSchema.safeParse(raw.logLevel).success) invalidKeys.push("LOG_LEVEL");
  if (!Number.isInteger(raw.apiPort) || raw.apiPort < 0 || raw.apiPort > 65_535)
    invalidKeys.push("API_PORT");
  if (!Number.isInteger(raw.trustProxyHops) || raw.trustProxyHops < 0)
    invalidKeys.push("TRUST_PROXY_HOPS");
  requirePositiveInteger("ASSESSMENT_SESSION_DURATION_HOURS", raw.assessmentDurationHours);
  requirePositiveInteger("ASSESSMENT_MAX_QUESTION_COUNT", raw.maximumQuestionCount);
  requirePositiveInteger(
    "WEAK_AREA_MINIMUM_EVALUATED_QUESTIONS",
    raw.weakMinimumEvaluatedQuestions,
  );
  requirePositiveInteger(
    "ARGON2_MEMORY_COST_KIB",
    raw.argonMemoryCostKiB,
    isProduction ? 65_536 : 1,
  );
  requirePositiveInteger("ARGON2_TIME_COST", raw.argonTimeCost, isProduction ? 3 : 1);
  requirePositiveInteger("ARGON2_PARALLELISM", raw.argonParallelism, isProduction ? 4 : 1);
  requirePositiveInteger("ARGON2_HASH_LENGTH", raw.argonHashLength, isProduction ? 32 : 1);
  requirePositiveInteger("ARGON2_MAX_CONCURRENCY", raw.argonConcurrency);
  requirePositiveInteger("ARGON2_QUEUE_LIMIT", raw.argonQueueLimit);
  requirePositiveInteger("ARGON2_QUEUE_TIMEOUT_MS", raw.argonQueueTimeoutMs);

  if (
    !Number.isInteger(raw.weakScoreThresholdPercentage) ||
    raw.weakScoreThresholdPercentage < 0 ||
    raw.weakScoreThresholdPercentage > 100
  ) {
    invalidKeys.push("WEAK_AREA_SCORE_THRESHOLD_PERCENTAGE");
  }

  if (isProduction) {
    if (raw.cookieSecure !== true) invalidKeys.push("COOKIE_SECURE");
    if (!isHttpsOrigin(raw.publicApiOrigin ?? "")) invalidKeys.push("PUBLIC_API_ORIGIN");
    if (!isHttpsOrigin(raw.publicFrontendOrigin ?? "")) invalidKeys.push("PUBLIC_FRONTEND_ORIGIN");
    if (raw.allowedOrigins?.some((origin) => !isHttpsOrigin(origin))) {
      invalidKeys.push("CORS_ALLOWED_ORIGINS");
    }
    if (!raw.allowedOrigins?.includes(raw.publicFrontendOrigin ?? "")) {
      invalidKeys.push("CORS_ALLOWED_ORIGINS");
    }
  }

  if (invalidKeys.length > 0) {
    throw new ConfigurationError(invalidKeys);
  }

  return {
    environment,
    serviceName: "tech-interview-platform-backend",
    api: {
      host: raw.apiHost,
      port: raw.apiPort,
      jsonBodyLimit: raw.jsonBodyLimit,
      trustProxyHops: raw.trustProxyHops,
    },
    database: { url: /** @type {string} */ (raw.databaseUrl) },
    logging: { level: raw.logLevel },
    origins: {
      api: raw.publicApiOrigin,
      frontend: raw.publicFrontendOrigin,
    },
    cors: { allowedOrigins: /** @type {string[]} */ (raw.allowedOrigins) },
    cookie: {
      path: raw.cookiePath,
      sameSite: raw.cookieSameSite,
      secure: raw.cookieSecure,
    },
    authentication: {
      accessTokenAudience: raw.accessTokenAudience,
      accessTokenIssuer: raw.accessTokenIssuer,
      accessTokenLifetimeMinutes: 15,
      jwtSigningSecret: raw.jwtSigningSecret,
      refreshSessionLifetimeDays: 7,
    },
    rateLimiting: { hmacSecret: raw.rateLimitSecret },
    assessment: {
      maximumQuestionCount: raw.maximumQuestionCount,
      sessionDurationHours: raw.assessmentDurationHours,
    },
    weakAreas: {
      minimumEvaluatedQuestions: raw.weakMinimumEvaluatedQuestions,
      scoreThresholdPercentage: raw.weakScoreThresholdPercentage,
    },
    passwordHashing: {
      concurrency: raw.argonConcurrency,
      hashLength: raw.argonHashLength,
      memoryCostKiB: raw.argonMemoryCostKiB,
      parallelism: raw.argonParallelism,
      queueLimit: raw.argonQueueLimit,
      queueTimeoutMs: raw.argonQueueTimeoutMs,
      timeCost: raw.argonTimeCost,
      variant: "argon2id",
      version: 19,
    },
  };
}
