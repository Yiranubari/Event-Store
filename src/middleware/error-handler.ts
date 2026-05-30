import { Request, Response, NextFunction } from "express";
import { AppError } from "@/exceptions/app-exceptions";
import { logger } from "@/utils/logger";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  logger.error(`Unhandled error: ${err.message}`, err);
  res.status(500).json({ error: "Internal server error" });
}
