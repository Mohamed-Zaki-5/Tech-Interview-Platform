/**
 * @param {{
 *   database: { connect: () => Promise<void>, disconnect: () => Promise<void> },
 *   logger: import("pino").Logger,
 * }} dependencies
 */
export function createWorkerLifecycle({ database, logger }) {
  let started = false;

  return {
    async start() {
      if (started) {
        return;
      }

      await database.connect();
      started = true;
      logger.info("Worker process started; no evaluation job processor is registered in Phase 1");
    },

    async stop(reason = "shutdown") {
      if (!started) {
        return;
      }

      started = false;
      await database.disconnect();
      logger.info({ reason }, "Worker process stopped");
    },

    isStarted() {
      return started;
    },
  };
}
