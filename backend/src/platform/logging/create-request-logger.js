import { pinoHttp } from "pino-http";

/**
 * @param {import("pino").Logger} logger
 * @returns {import("express").RequestHandler}
 */
export function createRequestLogger(logger) {
  const options =
    /** @type {import("pino-http").Options<import("node:http").IncomingMessage, import("express").Response>} */ ({
      customSuccessMessage: () => "request completed",
      customErrorMessage: () => "request failed",
      genReqId(_request, response) {
        return response.locals.requestId;
      },
      logger,
      serializers: {
        err(error) {
          return {
            name: error instanceof Error ? error.name : typeof error,
          };
        },
        req(request) {
          const identifiedRequest = /** @type {typeof request & { id?: string }} */ (request);
          return {
            headers: request.headers,
            id: identifiedRequest.id,
            method: request.method,
            remoteAddress: request.socket.remoteAddress,
            url: request.url?.split("?", 1)[0],
          };
        },
        res(response) {
          return {
            headers: response.getHeaders(),
            statusCode: response.statusCode,
          };
        },
      },
      wrapSerializers: false,
    });

  return /** @type {import("express").RequestHandler} */ (pinoHttp(options));
}
