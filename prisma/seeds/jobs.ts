import { SeedContext } from './types'

type JobsInput = {
  company: any
  hrUser: any
}

export default async function seedJobs(
  { prisma }: SeedContext,
  { company, hrUser }: JobsInput
) {
  const hr = await prisma.hr_profiles.create({
    data: {
      user_id: hrUser.id,
      name: 'HR Tech',
      company_id: company.id
    }
  })

  const job = await prisma.jobs.create({
    data: {
      title: 'Backend Developer',
      company_id: company.id,
      hr_id: hr.id,
      job_type: 'Full_time',
      status: 'active',
      minimum_gpa: 3
    }
  })

  const requirement = await prisma.requirements.create({
    data: {
      job_id: job.id,
      req_text: 'Menguasai Node.js',
      type: 'hard_skill'
    }
  })

  return {
    hr,
    job,
    requirement
  }
}