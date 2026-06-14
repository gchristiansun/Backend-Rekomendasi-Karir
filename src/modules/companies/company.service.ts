import prisma from "../../config/prisma";
import { HttpError } from "../../utils/httpError";
import { 
  CreateCompanyInput,
  UpdateCompanyInput
} from "./company.validation";
import * as authService from "../auth/auth.service"

export const companyService = {
  async getAllCompanies() {
    return prisma.companies.findMany({
      orderBy: {
        created_at: "desc"
      },
    });
  },

  async getCompanyById(id: string) {
    const company = await prisma.companies.findUnique({
      where: { id }
    })
    if (!company) throw new Error("Company not found")

    return company
  },

  async createCompany(input: CreateCompanyInput) {
    const companyExist = await prisma.companies.findFirst({
      where: {name: input.name}
    })

    if (companyExist) throw new HttpError(409, "Company with this name already exists")

    return prisma.$transaction(async (tx) => {
      const company = await tx.companies.create({
        data: {
          name: input.name,
          industry: input.industry,
          location: input.location,
          size: input.size,
          founded: input.founded,
          website: input.website,
          logo_icon: input.logo_icon,
          description: input.description,
          verified: input.verified
        }
      });

      const user = await authService.createUser({
        email: input.admin_email,
        password: input.admin_password,
        role: "hr"
      })

      const hr = await tx.hr_profiles.create({
        data: {
          user_id: user.id,
          company_id: company.id,
          name: input.admin_name,
          position: "company admin"
        }
      })
    })
  },

  async updateCompany(id: string, input: UpdateCompanyInput) {
    const existingCompany = await prisma.companies.findUnique({
      where: { id }
    })
    if (!existingCompany) throw new Error("Company not found")

    return prisma.companies.update({
      where: { id },
      data: {
        name: input.name ?? existingCompany.name,
        industry: input.industry ?? existingCompany.industry,
        location: input.location ?? existingCompany.location,
        size: input.size ?? existingCompany.size,
        founded: input.founded ?? existingCompany.founded, 
        website: input.website ?? existingCompany.website,
        logo_icon: input.logo_icon ?? existingCompany.logo_icon,
        description: input.description ?? existingCompany.description,
        verified: input.verified ?? existingCompany.verified
      }
    });
  },

  async deleteCompany(id: string) {
    const existingCompany = await prisma.companies.findUnique({
      where: { id }
    })

    if (!existingCompany) {
      throw new Error("Company not found")
    }

    return prisma.$transaction(async (tx) => {
      // 1. delete HR profiles
      await tx.hr_profiles.deleteMany({
        where: { company_id: id }
      })

      // 2. delete jobs (akan cascade ke applications dll kalau FK sudah ON DELETE CASCADE)
      await tx.jobs.deleteMany({
        where: { company_id: id }
      })

      // 3. delete company
      return tx.companies.delete({
        where: { id }
      })
    })
  }
};