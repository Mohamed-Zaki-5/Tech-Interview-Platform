import pino from "pino";

const REDACTED_PATHS = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.headers.idempotency-key",
  "req.headers.x-api-key",
  "res.headers.set-cookie",
  "password",
  "passwordHash",
  "accessToken",
  "refreshToken",
  "secret",
];

/**
 * @param {{
 *   config: { environment: string, serviceName: string, logging: { level: string } },
 *   destination?: import("node:stream").Writable,
 * }} options
 */
export function createLogger({ config, destination }) {
  const options = {
    base: {
      environment: config.environment,
      service: config.serviceName,
    },
    level: config.logging.level,
    redact: {
      censor: "[Redacted]",
      paths: REDACTED_PATHS,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  return destination === undefined ? pino(options) : pino(options, destination);
}
