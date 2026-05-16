export class AppError extends Error {
  constructor(message, statusCode = 400, options = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = options.code;
    this.data = options.data;
  }
}
