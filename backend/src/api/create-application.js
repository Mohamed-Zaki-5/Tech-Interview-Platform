import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";

import { createCors } from "../platform/http/create-cors.js";
import { createProblemDetailsHandler, notFound } from "../platform/http/problem-details.js";
import { requestId } from "../platform/http/request-id.js";
import { createRequestLogger } from "../platform/logging/create-request-logger.js";

/**
 * Creates the Express application without opening a network listener.
 *
 * @param {{
 *   config: ReturnType<typeof import("../platform/config/load-config.js").loadConfig>,
 *   database: { checkReadiness: () => Promise<void> | void },
 *   logger?: import("pino").Logger,
 *   registerRoutes?: (application: import("express").Express) => void,
 * }} dependencies
 */
export function createApplication({ config, database, logger, registerRoutes = () => {} }) {
  const application = express();

  application.disable("x-powered-by");
  application.set(
    "trust proxy",
    config.api.trustProxyHops === 0 ? false : config.api.trustProxyHops,
  );
  application.use(requestId);
  if (logger !== undefined) {
    application.use(createRequestLogger(logger));
  }
  application.use(helmet());
  application.use(createCors(config.cors));
  application.use(express.json({ limit: config.api.jsonBodyLimit, strict: true }));
  application.use(cookieParser());

  application.get("/health/live", (_request, response) => {
    response.set("Cache-Control", "no-store").status(200).json({ status: "ok" });
  });

  application.get("/health/ready", async (_request, response) => {
    try {
      await database.checkReadiness();
      response
        .set("Cache-Control", "no-store")
        .status(200)
        .json({ checks: { database: "up" }, status: "ready" });
    } catch (error) {
      logger?.warn(
        {
          dependency: "postgresql",
          errorName: error instanceof Error ? error.name : typeof error,
          requestId: response.locals.requestId,
        },
        "Readiness check failed",
      );
      response
        .set("Cache-Control", "no-store")
        .status(503)
        .json({ checks: { database: "down" }, status: "not_ready" });
    }
  });

  registerRoutes(application);

  application.use(notFound);
  application.use(
    createProblemDetailsHandler({
      logger,
      problemBaseUrl: `${config.origins.api}/problems`,
    }),
  );

  return application;
}
