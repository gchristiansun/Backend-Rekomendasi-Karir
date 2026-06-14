import { Router } from "express";
import { companyController } from "./company.controller";
import { validateRequest } from "../../middleware/validateRequest";
import {
  createCompanySchema,
  updateCompanySchema,
} from "./company.validation";

const router = Router();

router.get(
  "/", 
  companyController.getAll
);

router.get(
  "/:id", 
  companyController.getById
);

router.post(
  "/",
  validateRequest(createCompanySchema),
  companyController.create
);

router.put(
  "/:id",
  validateRequest(updateCompanySchema),
  companyController.update
);

router.delete(
  "/:id", 
  companyController.delete
);

export default router;