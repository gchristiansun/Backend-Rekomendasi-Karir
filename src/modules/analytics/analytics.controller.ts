import { Request, Response } from "express";
import * as analyticsService from "./analytics.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import prisma from "../../config/prisma";
import { HttpError } from "../../utils/httpError";

export const skillTrendsHandler = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
  const data = await analyticsService.getSkillTrends(limit);
  return sendSuccess(res, data, "Tren skill dari lowongan aktif");
});

export const systemOverviewHandler = asyncHandler(async (_req: Request, res: Response) => {
  const data = await analyticsService.getSystemOverview();
  return sendSuccess(res, data, "Ringkasan sistem");
});

export const applicationStatsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const data = await analyticsService.getApplicationStats();
  return sendSuccess(res, data, "Distribusi status lamaran");
});

// GET /analytics/university/dashboard
export const universityDashboardHandler = asyncHandler(async (req: Request, res: Response) => {
  const member = await prisma.universityMember.findFirst({
    where: { userId: req.user!.id },
    select: { universityId: true },
  });
  if (!member) throw new HttpError(403, "Anda tidak terhubung dengan universitas mana pun");

  const data = await analyticsService.getUniversityDashboard(member.universityId);
  return sendSuccess(res, data, "Ringkasan dashboard universitas");
});