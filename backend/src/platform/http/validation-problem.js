import { ProblemError } from "./problem-error.js";

export class ValidationProblem extends ProblemError {
  /** @param {Array<{ field: string, code: string, message: string }>} errors */
  constructor(errors) {
    super({
      code: "VALIDATION_FAILED",
      detail: "The request contains invalid fields.",
      errors,
      status: 400,
      title: "Request validation failed",
      typeSlug: "validation-failed",
    });
    this.name = "ValidationProblem";
  }
}
