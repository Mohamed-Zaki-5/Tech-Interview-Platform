import "dotenv/config";

import { createApiLifecycle } from "./create-api-lifecycle.js";
import { createApplication } from "./create-application.js";
import { registerModuleRoutes } from "./register-module-routes.js";
import { loadConfig } from "../platform/config/load-config.js";
import { createDatabase } from "../platform/database/create-database.js";
import { registerShutdownSignals } from "../platform/lifecycle/register-shutdown-signals.js";
import { reportStartupFailure } from "../platform/lifecycle/report-startup-failure.js";
import { createLogger } from "../platform/logging/create-logger.js";

async function main() {
  const config = loadConfig();
  const logger = createLogger({ config });
  const database = createDatabase(config.database);
  const application = createApplication({
    config,
    database,
    logger,
    registerRoutes: registerModuleRoutes,
  });
  const lifecycle = createApiLifecycle({ application, config, database, logger });

  await lifecycle.start();
  registerShutdownSignals({ lifecycle, logger });
}

main().catch((error) => {
  reportStartupFailure(error);
  process.exitCode = 1;
});
