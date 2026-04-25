import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123456', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rubikcon.com' },
    update: {},
    create: {
      email: 'admin@rubikcon.com',
      password: adminPassword,
      name: 'Rubikcon Admin',
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin user:', admin.email)

  // Create demo user
  const demoPassword = await bcrypt.hash('demo12345', 12)
  const demo = await prisma.user.upsert({
    where: { email: 'demo@rubikcon.com' },
    update: {},
    create: {
      email: 'demo@rubikcon.com',
      password: demoPassword,
      name: 'Demo User',
      role: 'USER',
    },
  })
  console.log('✅ Demo user:', demo.email)

  // Create course
  const course = await prisma.course.upsert({
    where: { slug: 'web3-fundamentals' },
    update: {},
    create: {
      title: 'Web3 Fundamentals',
      description: 'A comprehensive deep-dive into blockchain technology, DeFi, smart contracts, and NFTs.',
      slug: 'web3-fundamentals',
      published: true,
    },
  })
  console.log('✅ Course:', course.title)

  // Create module
  const module1 = await prisma.module.create({
    data: {
      title: 'Module 1: Blockchain Basics',
      position: 1,
      courseId: course.id,
    },
  })

  // Create lessons
  const lessons = await Promise.all([
    prisma.lesson.create({
      data: {
        title: 'What is Blockchain?',
        content: 'A blockchain is a distributed database shared among computer network nodes...',
        videoUrl: 'https://www.youtube.com/embed/SSo_EIwHSd4',
        duration: 12,
        position: 1,
        moduleId: module1.id,
      },
    }),
    prisma.lesson.create({
      data: {
        title: 'Consensus Mechanisms',
        content: 'Proof of Work vs Proof of Stake — how blockchains agree on state...',
        videoUrl: 'https://www.youtube.com/embed/M3EFi_POhps',
        duration: 18,
        position: 2,
        moduleId: module1.id,
      },
    }),
  ])
  console.log(`✅ Created ${lessons.length} lessons`)

  // Create a sample gig
  const gig = await prisma.gig.create({
    data: {
      title: 'Build a DeFi Yield Aggregator Smart Contract',
      description: 'Production-ready yield aggregator routing funds to highest-yielding Aave/Compound pools.',
      budget: 4.5,
      budgetType: 'FIXED',
      currency: 'ETH',
      category: 'Smart Contracts',
      skills: ['Solidity', 'DeFi', 'Aave', 'Foundry'],
      difficulty: 'SENIOR',
      deadline: '3 weeks',
      featured: true,
      posterId: admin.id,
    },
  })
  console.log('✅ Sample gig:', gig.title)

  console.log('\n🎉 Seed complete!')
  console.log('\nTest credentials:')
  console.log('  Admin: admin@rubikcon.com / admin123456')
  console.log('  Demo:  demo@rubikcon.com  / demo12345')
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
