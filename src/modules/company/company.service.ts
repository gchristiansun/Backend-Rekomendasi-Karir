import prisma from "../../config/prisma";
import { UpdateCompanyInput } from "./company.validation";
import { COMPANY_STATUS } from "../../constants";

export const listCompanies = async (opts: {
  status?: string;
  search?: string;
  skip: number;
  take: number;
}) => {
  const where: any = {};
  if (opts.status) where.status = opts.status;
  if (opts.search) where.name = { contains: opts.search, mode: "insensitive" };

  const [total, companies] = await Promise.all([
    prisma.company.count({ where }),
    prisma.company.findMany({
      where,
      include: { _count: { select: { jobs: true, members: true } } },
      orderBy: { created_at: "desc" },
      skip: opts.skip,
      take: opts.take,
    }),
  ]);
  return { total, companies };
};

export const getCompanyById = (id: string) =>
  prisma.company.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
      },
      _count: { select: { jobs: true } },
    },
  });

export const updateCompany = (id: string, data: UpdateCompanyInput) =>
  prisma.company.update({ where: { id }, data });

export const setVerification = (
  id: string,
  status: (typeof COMPANY_STATUS)[keyof typeof COMPANY_STATUS],
) =>
  prisma.company.update({
    where: { id },
    data: {
      status,
      verifiedAt: status === COMPANY_STATUS.VERIFIED ? new Date() : null,
    },
  });

// Statistik ringkas untuk dashboard Direktur.
export const getCompanyStats = async (companyId: string) => {
  const [activeJobs, totalJobs, applications] = await Promise.all([
    prisma.job.count({ where: { companyId, status: "active" } }),
    prisma.job.count({ where: { companyId } }),
    prisma.application.count({ where: { job: { companyId } } }),
  ]);
  return { activeJobs, totalJobs, totalApplicants: applications };
};