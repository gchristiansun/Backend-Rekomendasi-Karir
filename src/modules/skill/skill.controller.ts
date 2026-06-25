import { Request, Response } from "express";
import * as skillService from "./skill.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated } from "../../utils/apiResponse";

export const listSkillsHandler = asyncHandler(async (req: Request, res: Response) => {
  const search = req.query.search ? String(req.query.search) : undefined;
  const skills = await skillService.listSkills(search);
  return sendSuccess(res, skills, "Daftar skill");
});

export const createSkillHandler = asyncHandler(async (req: Request, res: Response) => {
  const skill = await skillService.createSkill(req.body);
  return sendCreated(res, skill, "Skill dibuat");
});

export const updateSkillHandler = asyncHandler(async (req: Request, res: Response) => {
  const skill = await skillService.updateSkill(String(req.params.id), req.body);
  return sendSuccess(res, skill, "Skill diperbarui");
});

export const deleteSkillHandler = asyncHandler(async (req: Request, res: Response) => {
  await skillService.deleteSkill(String(req.params.id));
  return sendSuccess(res, null, "Skill dihapus");
});