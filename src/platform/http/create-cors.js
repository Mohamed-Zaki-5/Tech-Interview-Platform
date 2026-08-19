import cors from "cors";

import { ProblemError } from "./problem-error.js";

/**
 * @param {{ allowedOrigins: string[] }} configuration
 * @returns {import("express").RequestHandler}
 */
export function createCors(configuration) {
  const allowedOrigins = new Set(configuration.allowedOrigins);

  return cors({
    allowedHeaders: ["Authorization", "Content-Type", "Idempotency-Key", "X-Request-Id"],
    credentials: true,
    exposedHeaders: ["Retry-After", "X-Request-Id"],
    maxAge: 600,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    origin(origin, callback) {
      if (origin === undefined || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(
        new ProblemError({
          code: "ORIGIN_NOT_ALLOWED",
          detail: "The request origin is not allowed.",
          status: 403,
          title: "Origin not allowed",
          typeSlug: "origin-not-allowed",
        }),
      );
    },
  });
}
