import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const pool = new Pool({ connectionString: 'postgresql://rubikcon:rubikconpassword@localhost:5432/rubikcondb?schema=public' })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function check() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3
  })
  console.log('Recent Payments:', payments)

  const enrollments = await prisma.enrollment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3
  })
  console.log('Recent Enrollments:', enrollments)
}

check().catch(console.error).finally(() => prisma.$disconnect())
