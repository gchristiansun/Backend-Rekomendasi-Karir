import { Request, Response, NextFunction, RequestHandler } from "express";

// Bungkus handler async agar error otomatis diteruskan ke errorHandler.
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };