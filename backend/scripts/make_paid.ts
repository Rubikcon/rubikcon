import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const pool = new Pool({ connectionString: 'postgresql://rubikcon:rubikconpassword@localhost:5432/rubikcondb?schema=public' })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const course = await prisma.course.update({
    where: { slug: 'blockchain-social-impact' },
    data: {
      isPaid: true,
      priceNgn: 50000,
      priceUsd: 100,
      discountPercent: 0
    }
  })
  console.log('Updated course:', course.slug, 'isPaid:', course.isPaid)
}

main()
  .catch(console.error)
