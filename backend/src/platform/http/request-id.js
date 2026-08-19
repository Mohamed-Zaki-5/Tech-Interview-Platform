import { randomUUID } from "node:crypto";

const SAFE_REQUEST_ID = /^[A-Za-z0-9._-]{1,128}$/;

/** @type {import("express").RequestHandler} */
export function requestId(request, response, next) {
  const suppliedRequestId = request.get("x-request-id");
  const identifier =
    suppliedRequestId !== undefined && SAFE_REQUEST_ID.test(suppliedRequestId)
      ? suppliedRequestId
      : randomUUID();

  response.locals.requestId = identifier;
  response.set("X-Request-Id", identifier);
  return next();
}
