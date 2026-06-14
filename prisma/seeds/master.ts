import { SeedContext } from './types'

export default async function seedMaster(
  { prisma }: SeedContext
) {
  const prodi = await prisma.prodi.create({
    data: {
      name: 'Informatika',
      fakultas: 'Teknik'
    }
  })

  const company = await prisma.companies.create({
    data: {
      name: 'Tech Corp',
      industry: 'IT',
      location: 'Jakarta'
    }
  })

  const skill = await prisma.skills.create({
    data: {
      name: 'JavaScript',
      category: 'Programming'
    }
  })

  const grade = await prisma.grade_scale.create({
    data: {
      letter: 'A',
      weight: 4
    }
  })

  return {
    prodi,
    company,
    skill,
    grade
  }
}