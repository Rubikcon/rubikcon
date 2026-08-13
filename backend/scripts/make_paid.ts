import { prisma } from '../src/infrastructure/prisma/client'

async function makeCoursePaid() {
  try {
    const course = await prisma.course.findUnique({
      where: { slug: 'blockchain-social-impact' }
    })
    
    if (course) {
      await prisma.course.update({
        where: { slug: 'blockchain-social-impact' },
        data: {
          isPaid: true,
          priceNgn: 50000,
          priceUsd: 100,
          discountPercent: 10
        }
      })
      console.log('Course marked as paid successfully.')
    } else {
      console.log('Course not found.')
    }
  } catch(e) {
    console.error(e)
  }
}

makeCoursePaid().finally(() => process.exit(0))
