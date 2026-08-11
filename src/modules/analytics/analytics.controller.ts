import { Request, Response } from "express";
import * as analyticsService from "./analytics.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getPagination, buildMeta } from "../../utils/pagination";
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

// ============================================================
// Handler khusus Super Admin
// ============================================================

// GET /analytics/activity-trends?days=30
export const activityTrendsHandler = asyncHandler(async (req: Request, res: Response) => {
  let days = parseInt(String(req.query.days ?? "30"), 10);
  if (!Number.isFinite(days) || days < 1) days = 30;
  if (days > 90) days = 90;
  const data = await analyticsService.getActivityTrends(days);
  return sendSuccess(res, data, "Tren aktivitas harian");
});

// GET /analytics/activity-logs?group=student|university|company&activity=&search=
export const activityLogsHandler = asyncHandler(async (req: Request, res: Response) => {
  const group = String(req.query.group ?? "student") as analyticsService.ActivityLogGroup;
  if (!["student", "university", "company"].includes(group)) {
    throw new HttpError(400, "group harus salah satu dari: student, university, company");
  }
  const { page, limit, skip } = getPagination(req.query, 20);
  const { total, logs } = await analyticsService.getActivityLogs({
    group,
    activity: req.query.activity ? String(req.query.activity) : undefined,
    search: req.query.search ? String(req.query.search) : undefined,
    skip,
    take: limit,
  });
  return sendSuccess(res, logs, "Log aktivitas pengguna", 200, buildMeta(page, limit, total));
});

// GET /analytics/recent-logs?limit=5
export const recentSystemLogsHandler = asyncHandler(async (req: Request, res: Response) => {
  let limit = parseInt(String(req.query.limit ?? "5"), 10);
  if (!Number.isFinite(limit) || limit < 1) limit = 5;
  if (limit > 50) limit = 50;
  const data = await analyticsService.getRecentSystemLogs(limit);
  return sendSuccess(res, data, "Log sistem terbaru");
});

// GET /analytics/master/courses
export const masterCoursesHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req.query, 20);
  const { total, courses } = await analyticsService.getMasterCourses({
    search: req.query.search ? String(req.query.search) : undefined,
    skip,
    take: limit,
  });
  return sendSuccess(res, courses, "Master data mata kuliah", 200, buildMeta(page, limit, total));
});

// GET /analytics/master/industries
export const masterIndustriesHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req.query, 20);
  const { total, industries } = await analyticsService.getMasterIndustries({
    search: req.query.search ? String(req.query.search) : undefined,
    skip,
    take: limit,
  });
  return sendSuccess(res, industries, "Master data kebutuhan industri", 200, buildMeta(page, limit, total));
});

// GET /analytics/master/stats
export const masterStatsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const data = await analyticsService.getMasterDataStatsAdmin();
  return sendSuccess(res, data, "Statistik master data");
});