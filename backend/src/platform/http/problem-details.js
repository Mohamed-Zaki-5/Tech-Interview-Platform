import { ProblemError } from "./problem-error.js";

/** @type {import("express").RequestHandler} */
export function notFound(request, _response, next) {
  return next(
    new ProblemError({
      code: "ROUTE_NOT_FOUND",
      detail: "The requested resource was not found.",
      status: 404,
      title: "Route not found",
      typeSlug: "route-not-found",
    }),
  );
}

/**
 * @param {{ problemBaseUrl: string, logger?: { error: (bindings: object, message: string) => void } }} options
 * @returns {import("express").ErrorRequestHandler}
 */
export function createProblemDetailsHandler({ problemBaseUrl, logger }) {
  return (error, request, response, _next) => {
    const requestParsingProblem = createRequestParsingProblem(error);
    const knownProblem = error instanceof ProblemError || requestParsingProblem !== undefined;
    const problem =
      error instanceof ProblemError
        ? error
        : requestParsingProblem !== undefined
          ? requestParsingProblem
          : new ProblemError({
              cause: error,
              code: "INTERNAL_SERVER_ERROR",
              detail: "An unexpected error occurred.",
              status: 500,
              title: "Internal server error",
              typeSlug: "internal-server-error",
            });

    if (!knownProblem) {
      logger?.error(
        {
          errorName: error instanceof Error ? error.name : typeof error,
          requestId: response.locals.requestId,
        },
        "Unhandled request error",
      );
    }

    const body = {
      type: `${problemBaseUrl}/${problem.typeSlug}`,
      title: problem.title,
      status: problem.status,
      code: problem.code,
      detail: problem.detail,
      instance: request.originalUrl.split("?", 1)[0],
      requestId: response.locals.requestId,
      ...(problem.errors === undefined ? {} : { errors: problem.errors }),
    };

    response.status(problem.status).type("application/problem+json").json(body);
  };
}

/**
 * @param {unknown} error
 * @returns {ProblemError | undefined}
 */
function createRequestParsingProblem(error) {
  if (typeof error !== "object" || error === null || !("type" in error)) {
    return undefined;
  }

  if (error.type === "entity.too.large") {
    return new ProblemError({
      code: "REQUEST_BODY_TOO_LARGE",
      detail: "The request body exceeds the allowed size.",
      status: 413,
      title: "Request body too large",
      typeSlug: "request-body-too-large",
    });
  }

  if (error.type === "entity.parse.failed") {
    return new ProblemError({
      code: "INVALID_JSON",
      detail: "The request body contains invalid JSON.",
      status: 400,
      title: "Invalid JSON",
      typeSlug: "invalid-json",
    });
  }

  return undefined;
}
