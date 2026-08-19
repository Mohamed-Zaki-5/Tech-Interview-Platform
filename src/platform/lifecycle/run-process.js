import { loadConfig } from "../config/load-config.js";
import { createDatabase } from "../database/create-database.js";
import { createLogger } from "../logging/create-logger.js";
import { registerShutdownSignals } from "./register-shutdown-signals.js";
import { reportStartupFailure } from "./report-startup-failure.js";

/**
 * Applies the common configuration, logging, database, and shutdown wiring for a process.
 *
 * @param {(dependencies: {
 *   config: ReturnType<typeof loadConfig>,
 *   database: ReturnType<typeof createDatabase>,
 *   logger: import("pino").Logger,
 * }) => { start: () => Promise<unknown>, stop: (reason: string) => Promise<void> }} createLifecycle
 */
export async function runProcess(createLifecycle) {
  try {
    const config = loadConfig();
    const logger = createLogger({ config });
    const database = createDatabase(config.database);
    const lifecycle = createLifecycle({ config, database, logger });

    await lifecycle.start();
    registerShutdownSignals({ lifecycle, logger });
  } catch (error) {
    reportStartupFailure(error);
    process.exitCode = 1;
  }
}
