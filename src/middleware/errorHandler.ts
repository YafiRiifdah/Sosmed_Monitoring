import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: "Validation error", issues: error.issues });
  }

  const message = error instanceof Error ? error.message : "Unexpected error";
  logger.error(message, { error });
  return res.status(500).json({ message });
}
