import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/httpError";
import { verifyAccessToken } from "../utils/jwt";

export interface UserPayload {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Tambahkan properti `user` ke object Request milik Express.
declare global {
  namespace Express {
    export interface Request {
      user?: UserPayload;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new HttpError(401, "No token provided");
    }

    // FIX: sebelumnya split('') (per-karakter) -> sekarang split(' ')
    const tokenParts = authHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer" || !tokenParts[1]) {
      throw new HttpError(401, "Invalid token format. Use: Bearer <token>");
    }

    const token = tokenParts[1];
    const payload = verifyAccessToken(token);
    if (!payload || typeof payload === "string") {
      throw new HttpError(401, "Invalid or expired access token");
    }

    req.user = payload as UserPayload;
    next();
  } catch (error) {
    next(error);
  }
};