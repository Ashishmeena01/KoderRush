import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("[Internal Server Error]:", err);

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "An unexpected internal server error occurred."
      : err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

