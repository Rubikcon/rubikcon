import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const pool = new Pool({ connectionString: 'postgresql://rubikcon:rubikconpassword@localhost:5432/rubikcondb?schema=public' })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function check() {
  const payment = await prisma.payment.findUnique({
    where: { internalReference: '4b73a2f1-4e68-4ddc-a2ad-76eaf7c136e9' }
  })
  console.log('Payment Status:', payment?.status)

  const enrollment = await prisma.courseEnrollment.findFirst({
    where: { userId: payment?.userId, courseId: payment?.courseId }
  })
  console.log('Enrollment:', enrollment)
}

check().catch(console.error).finally(() => prisma.$disconnect())
