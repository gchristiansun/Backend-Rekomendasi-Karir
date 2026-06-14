import { Request, Response, NextFunction } from "express";
import { companyService } from "./company.service";
import { HttpError } from "../../utils/httpError";

type companyParams = {
  id: string
}

export const companyController = {
  async getAll(
    req: Request, 
    res: Response, 
    next: NextFunction
  ) {
    try {
      const companies = await companyService.getAllCompanies();
      res.json(companies);
    } catch (err) {
      next(err);
    }
  },

  async getById(
    req: Request<companyParams>, 
    res: Response, 
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const company = await companyService.getCompanyById(id);

      if (!company) {
        throw new HttpError(404, "Company not found");
      }

      res.json(company);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const company = await companyService.createCompany(req.body);
      res.status(201).json(company);
    } catch (err) {
      next(err);
    }
  },

  async update(
    req: Request<companyParams>, 
    res: Response, 
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      const updated = await companyService.updateCompany(id, req.body);

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async delete(
    req: Request<companyParams>, 
    res: Response, 
    next: NextFunction
  ) {
    try {
      const { id } = req.params
      await companyService.deleteCompany(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};