export const ROLES = {
    STUDENT: "student",
    COMPANY: "company", 
    COMPANY_STAFF: "company_staff", 
    UNIVERSITY: "university",
    UNIVERSITY_STAFF: "university_staff",
    ADMIN: "admin",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];
export const ALL_ROLES = Object.values(ROLES) as Role[];

export const USER_STATUS = {
    ACTIVE: "active",
    PENDING: "pending",
    SUSPENDED: "suspended",
} as const;
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const COMPANY_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;
export type CompanyStatus = (typeof COMPANY_STATUS)[keyof typeof COMPANY_STATUS];

export const COMPANY_POSITION = {
    DIREKTUR: "direktur",
    HRD: "hrd",
} as const;

export const UNIVERSITY_POSITION = {
    ADMIN_KAMPUS: "admin_kampus",
    KAPRODI: "kaprodi",
} as const;

export const JOB_TYPE = {
    FULLTIME: "fulltime",
    PARTTIME: "parttime",
    INTERNSHIP: "internship",
    CONTRACT: "contract",
} as const;
export type JobType = (typeof JOB_TYPE)[keyof typeof JOB_TYPE];
export const ALL_JOB_TYPES = Object.values(JOB_TYPE) as JobType[];

export const JOB_STATUS = {
    DRAFT: "draft",
    ACTIVE: "active",
    CLOSED: "closed",
} as const;
export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];
export const ALL_JOB_STATUS = Object.values(JOB_STATUS) as JobStatus[];

export const APPLICATION_STATUS = {
    SUBMITTED: "submitted",
    PROCESSING: "processing",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
} as const;
export type ApplicationStatus = (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];
export const ALL_APPLICATION_STATUS = Object.values(APPLICATION_STATUS,) as ApplicationStatus[];

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
    submitted: "Terkirim",
    processing: "Diproses",
    accepted: "Diterima",
    rejected: "Ditolak",
};

export const CERTIFICATE_STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
} as const;
export type CertificateStatus = (typeof CERTIFICATE_STATUS)[keyof typeof CERTIFICATE_STATUS];

export const SKILL_SOURCE = {
    COURSE: "course",
    CERTIFICATE: "certificate",
    MANUAL: "manual",
} as const;

export const NOTIFICATION_TYPE = {
    INFO: "info",
    APPLICATION: "application",
    CERTIFICATE: "certificate",
    SYSTEM: "system",
} as const;