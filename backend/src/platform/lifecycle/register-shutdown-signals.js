/**
 * @param {{
 *   lifecycle: { stop: (reason: string) => Promise<void> },
 *   logger: { error: (bindings: object, message: string) => void },
 *   processTarget?: {
 *     once: (event: "SIGINT" | "SIGTERM", listener: () => void) => unknown,
 *     off: (event: "SIGINT" | "SIGTERM", listener: () => void) => unknown,
 *     exitCode?: string | number | null,
 *   },
 * }} dependencies
 */
export function registerShutdownSignals({ lifecycle, logger, processTarget = process }) {
  /** @type {Promise<void> | undefined} */
  let shutdownPromise;

  /** @param {"SIGINT" | "SIGTERM"} signal */
  const shutDown = (signal) => {
    if (shutdownPromise !== undefined) {
      return;
    }

    shutdownPromise = (async () => {
      try {
        await lifecycle.stop(signal);
      } catch (error) {
        logger.error(
          { errorName: error instanceof Error ? error.name : typeof error, signal },
          "Graceful shutdown failed",
        );
        processTarget.exitCode = 1;
      }
    })();
  };

  const onSigint = () => shutDown("SIGINT");
  const onSigterm = () => shutDown("SIGTERM");
  processTarget.once("SIGINT", onSigint);
  processTarget.once("SIGTERM", onSigterm);

  return () => {
    processTarget.off("SIGINT", onSigint);
    processTarget.off("SIGTERM", onSigterm);
  };
}
