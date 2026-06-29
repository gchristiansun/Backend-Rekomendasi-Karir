import { Request, Response } from "express";
import * as service from "./notification.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { HttpError } from "../../utils/httpError";

export const listHandler = asyncHandler(async (req: Request, res: Response) => {
  const items = await service.listMyNotifications(req.user!.id);
  return sendSuccess(res, items, "Notifikasi");
});

export const unreadCountHandler = asyncHandler(async (req: Request, res: Response) => {
  const count = await service.unreadCount(req.user!.id);
  return sendSuccess(res, { count }, "Jumlah notifikasi belum dibaca");
});

export const markReadHandler = asyncHandler(async (req: Request, res: Response) => {
  const notif = await service.markRead(req.user!.id, String(req.params.id));
  if (!notif) throw new HttpError(404, "Notifikasi tidak ditemukan");
  return sendSuccess(res, notif, "Notifikasi ditandai dibaca");
});

export const markAllReadHandler = asyncHandler(async (req: Request, res: Response) => {
  await service.markAllRead(req.user!.id);
  return sendSuccess(res, null, "Semua notifikasi ditandai dibaca");
});