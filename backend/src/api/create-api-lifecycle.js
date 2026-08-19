import { createServer } from "node:http";

/**
 * @param {{
 *   application: import("express").Express,
 *   config: { api: { host: string, port: number } },
 *   database: { connect: () => Promise<void>, disconnect: () => Promise<void> },
 *   logger: import("pino").Logger,
 * }} dependencies
 */
export function createApiLifecycle({ application, config, database, logger }) {
  /** @type {import("node:http").Server | undefined} */
  let server;
  let started = false;

  return {
    async start() {
      if (started) {
        return getAddress(server);
      }

      await database.connect();
      server = createServer(application);

      try {
        await listen(server, config.api.port, config.api.host);
        started = true;
      } catch (error) {
        await database.disconnect();
        throw error;
      }

      const address = getAddress(server);
      logger.info({ host: address.host, port: address.port }, "API process started");
      return address;
    },

    async stop(reason = "shutdown") {
      if (!started) {
        return;
      }

      started = false;
      await close(server);
      await database.disconnect();
      logger.info({ reason }, "API process stopped");
    },

    isStarted() {
      return started;
    },
  };
}

/**
 * @param {import("node:http").Server} server
 * @param {number} port
 * @param {string} host
 */
function listen(server, port, host) {
  return new Promise((resolve, reject) => {
    /** @param {Error} error */
    const onError = (error) => {
      server.off("listening", onListening);
      reject(error);
    };
    const onListening = () => {
      server.off("error", onError);
      resolve(undefined);
    };

    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port, host);
  });
}

/** @param {import("node:http").Server | undefined} server */
function close(server) {
  if (server === undefined) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    server.close((/** @type {Error | undefined} */ error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(undefined);
    });
    server.closeIdleConnections();
  });
}

/** @param {import("node:http").Server | undefined} server */
function getAddress(server) {
  const address = server?.address();
  if (address === null || address === undefined || typeof address === "string") {
    throw new Error("The API server does not have an IP address.");
  }

  return { host: address.address, port: address.port };
}
