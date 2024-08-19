// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/CustomError";

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("Error:", err.message);

  const statusCode = err.statusCode || 500;
  const response: ErrorResponse = {
    status: "error",
    message: err.message,
  };

  if (err.details) {
    response["details"] = err.details;
  }

  res.status(statusCode).json(response);
};
