import { SeedContext } from './types'

export default async function seedUsers({ prisma }: SeedContext) {
  const admin = await prisma.users.create({
    data: {
      email: 'admin@mail.com',
      password: 'hashed',
      role: 'admin'
    }
  })

  const hrUser = await prisma.users.create({
    data: {
      email: 'hr@mail.com',
      password: 'hashed',
      role: 'hr'
    }
  })

  const studentUser = await prisma.users.create({
    data: {
      email: 'student@mail.com',
      password: 'hashed',
      role: 'student'
    }
  })

  return {
    adminUser: admin,
    hrUser,
    studentUser
  }
}