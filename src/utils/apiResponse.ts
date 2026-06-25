import { Response } from "express";

export interface Meta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "OK",
  status = 200,
  meta?: Meta,
) => {
  return res.status(status).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
};

export const sendCreated = <T>(res: Response, data: T, message = "Created") =>
  sendSuccess(res, data, message, 201);