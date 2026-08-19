import "dotenv/config";

import { createApiLifecycle } from "./create-api-lifecycle.js";
import { createApplication } from "./create-application.js";
import { registerModuleRoutes } from "./register-module-routes.js";
import { runProcess } from "../platform/lifecycle/run-process.js";

await runProcess(({ config, database, logger }) => {
  const application = createApplication({
    config,
    database,
    logger,
    registerRoutes: registerModuleRoutes,
  });

  return createApiLifecycle({ application, config, database, logger });
});
