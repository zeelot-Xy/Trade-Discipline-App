import { ZodError } from "zod";

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: error.issues[0]?.message || "Validation failed.",
      code: "VALIDATION_ERROR",
    });
  }

  return res.status(statusCode).json({
    success: false,
    message:
      error.message || "Something went wrong while processing your request.",
    ...(error.code ? { code: error.code } : {}),
    ...(error.data ? { data: error.data } : {}),
  });
};
