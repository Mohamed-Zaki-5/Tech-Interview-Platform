export class ProblemError extends Error {
  /**
   * @param {{
   *   status: number,
   *   code: string,
   *   title: string,
   *   detail: string,
   *   typeSlug: string,
   *   errors?: Array<{ field: string, code: string, message: string }>,
   *   cause?: unknown,
   * }} problem
   */
  constructor(problem) {
    super(problem.detail, { cause: problem.cause });
    this.name = "ProblemError";
    this.status = problem.status;
    this.code = problem.code;
    this.title = problem.title;
    this.detail = problem.detail;
    this.typeSlug = problem.typeSlug;
    this.errors = problem.errors;
  }
}
