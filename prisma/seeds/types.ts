import { PrismaClient } from '@prisma/client'

export type SeedContext = {
  prisma: PrismaClient
}

export type SeedMaster = {
  prodi: any
  company: any
  skill: any
  grade: any
}

export type SeedUsers = {
  adminUser: any
  hrUser: any
  studentUser: any
}

export type SeedAcademic = {
  curriculum: any
  matkul: any
  clo: any
}

export type SeedJobs = {
  hr: any
  job: any
  requirement: any
}