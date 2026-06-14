import { PrismaClient } from '@prisma/client'

import seedUsers from './seeds/users'
import seedMaster from './seeds/master'
import seedAcademic from './seeds/academic'
import seedJobs from './seeds/jobs'
import seedRelations from './seeds/relations'

const prisma = new PrismaClient()

async function main() {
  const ctx = { prisma }

  const users = await seedUsers(ctx)
  const master = await seedMaster(ctx)
  const academic = await seedAcademic(ctx, { prodi: master.prodi })
  const jobs = await seedJobs(ctx, { company: master.company, hrUser: users.hrUser })
  await seedRelations(ctx, { ...users, ...master, ...academic, ...jobs })
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })