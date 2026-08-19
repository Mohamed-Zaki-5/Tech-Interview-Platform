/**
 * Writes a deliberately minimal structured record because full configuration and logging may
 * not be available when startup validation fails.
 *
 * @param {unknown} error
 * @param {NodeJS.WriteStream} [destination]
 */
export function reportStartupFailure(error, destination = process.stderr) {
  destination.write(
    `${JSON.stringify({
      errorName: error instanceof Error ? error.name : typeof error,
      level: "fatal",
      message: "Process startup failed",
      timestamp: new Date().toISOString(),
    })}\n`,
  );
}
