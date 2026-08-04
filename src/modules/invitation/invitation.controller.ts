import { Request, Response } from "express";
import * as invitationService from "./invitation.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated } from "../../utils/apiResponse";
import { getCompanyMembership, getStudentByUserId } from "../../utils/context";

// POST /invitations (perusahaan)
export const createInvitationHandler = asyncHandler(async (req: Request, res: Response) => {
  const member = await getCompanyMembership(req.user!.id);
  const data = await invitationService.createInvitation(member.companyId, req.user!.id, req.body);
  return sendCreated(res, data, "Undangan berhasil dikirim ke kandidat");
});

// GET /invitations/company
export const companyInvitationsHandler = asyncHandler(async (req: Request, res: Response) => {
  const member = await getCompanyMembership(req.user!.id);
  const data = await invitationService.listCompanyInvitations(member.companyId, {
    jobId: req.query.jobId ? String(req.query.jobId) : undefined,
    status: req.query.status ? String(req.query.status) : undefined,
  });
  return sendSuccess(res, data, "Daftar undangan perusahaan");
});

// PATCH /invitations/:id/cancel
export const cancelInvitationHandler = asyncHandler(async (req: Request, res: Response) => {
  const member = await getCompanyMembership(req.user!.id);
  const data = await invitationService.cancelInvitation(member.companyId, String(req.params.id));
  return sendSuccess(res, data, "Undangan dibatalkan");
});

// GET /invitations/me (mahasiswa)
export const myInvitationsHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByUserId(req.user!.id);
  const data = await invitationService.listStudentInvitations(student.id);
  return sendSuccess(res, data, "Daftar undangan Anda");
});

// PATCH /invitations/:id/respond (mahasiswa)
export const respondInvitationHandler = asyncHandler(async (req: Request, res: Response) => {
  const student = await getStudentByUserId(req.user!.id);
  const data = await invitationService.respondInvitation(
    student.id,
    String(req.params.id),
    req.body.action,
  );
  return sendSuccess(res, data, "Undangan diperbarui");
});