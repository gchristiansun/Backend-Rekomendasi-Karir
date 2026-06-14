import { SeedContext } from './types'

type RelationInput = {
  studentUser: any
  skill: any
  clo: any
  job: any
}

export default async function seedRelations(
  { prisma }: SeedContext,
  { studentUser, skill, clo, job }: RelationInput
) {
  const student = await prisma.students.create({
    data: {
      user_id: studentUser.id,
      nim: '123456',
      name: 'Budi',
      gpa: 3.5
    }
  })

  await prisma.student_skill_map.create({
    data: {
      student_id: student.id,
      skill_id: skill.id,
      proficiency: 0.8
    }
  })

  await prisma.applications.create({
    data: {
      student_id: student.id,
      job_id: job.id,
      match_score: 0.85,
      status: 'new'
    }
  })

  return { student }
}