import { PrismaClient, WeekDifficulty, SlideDeckViewerType, ReadingResourceType } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { academyPhase1Course } from './academyPhase1Data'

const prisma = new PrismaClient()

async function seedUsers() {
  const adminPassword = await bcrypt.hash('admin123456', 12)
  const demoPassword = await bcrypt.hash('demo12345', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@rubikcon.com' },
    update: {
      password: adminPassword,
      name: 'Rubikcon Admin',
      role: 'ADMIN',
    },
    create: {
      email: 'admin@rubikcon.com',
      password: adminPassword,
      name: 'Rubikcon Admin',
      role: 'ADMIN',
    },
  })

  const demo = await prisma.user.upsert({
    where: { email: 'demo@rubikcon.com' },
    update: {
      password: demoPassword,
      name: 'Demo User',
      role: 'USER',
    },
    create: {
      email: 'demo@rubikcon.com',
      password: demoPassword,
      name: 'Demo User',
      role: 'USER',
    },
  })

  return { admin, demo }
}

async function seedLegacyCourse() {
  const legacyCourse = await prisma.course.upsert({
    where: { slug: 'web3-fundamentals' },
    update: {
      title: 'Web3 Fundamentals',
      description: 'A comprehensive deep-dive into blockchain technology, DeFi, smart contracts, and NFTs.',
      published: true,
    },
    create: {
      title: 'Web3 Fundamentals',
      description: 'A comprehensive deep-dive into blockchain technology, DeFi, smart contracts, and NFTs.',
      slug: 'web3-fundamentals',
      published: true,
      publishedAt: new Date(),
    },
  })

  await prisma.lesson.deleteMany({
    where: {
      module: {
        courseId: legacyCourse.id,
      },
    },
  })
  await prisma.module.deleteMany({ where: { courseId: legacyCourse.id } })

  const module1 = await prisma.module.create({
    data: {
      title: 'Module 1: Blockchain Basics',
      position: 1,
      courseId: legacyCourse.id,
    },
  })

  await prisma.lesson.createMany({
    data: [
      {
        title: 'What is Blockchain?',
        content: 'A blockchain is a distributed database shared among computer network nodes...',
        videoUrl: 'https://www.youtube.com/embed/SSo_EIwHSd4',
        duration: 12,
        position: 1,
        moduleId: module1.id,
      },
      {
        title: 'Consensus Mechanisms',
        content: 'Proof of Work vs Proof of Stake — how blockchains agree on state...',
        videoUrl: 'https://www.youtube.com/embed/M3EFi_POhps',
        duration: 18,
        position: 2,
        moduleId: module1.id,
      },
    ],
  })
}

async function seedAcademyCourse() {
  for (const facilitator of academyPhase1Course.facilitators) {
    await prisma.facilitator.upsert({
      where: { email: facilitator.email },
      update: {
        name: facilitator.name,
        title: facilitator.title,
        organization: facilitator.organization,
        linkedinUrl: facilitator.linkedinUrl,
        photoUrl: facilitator.photoUrl ?? null,
        bio: facilitator.bio,
      },
      create: {
        email: facilitator.email,
        name: facilitator.name,
        title: facilitator.title,
        organization: facilitator.organization,
        linkedinUrl: facilitator.linkedinUrl,
        photoUrl: facilitator.photoUrl ?? null,
        bio: facilitator.bio,
      },
    })
  }

  const course = await prisma.course.upsert({
    where: { slug: academyPhase1Course.slug },
    update: {
      title: academyPhase1Course.title,
      description: academyPhase1Course.description,
      tagline: academyPhase1Course.tagline,
      level: academyPhase1Course.level,
      estimatedDuration: academyPhase1Course.estimatedDuration,
      phaseLabel: academyPhase1Course.phaseLabel,
      heroImage: academyPhase1Course.heroImage ?? null,
      published: true,
      publishedAt: new Date(),
    },
    create: {
      title: academyPhase1Course.title,
      description: academyPhase1Course.description,
      tagline: academyPhase1Course.tagline,
      level: academyPhase1Course.level,
      estimatedDuration: academyPhase1Course.estimatedDuration,
      phaseLabel: academyPhase1Course.phaseLabel,
      heroImage: academyPhase1Course.heroImage ?? null,
      slug: academyPhase1Course.slug,
      published: true,
      publishedAt: new Date(),
    },
  })

  await prisma.week.deleteMany({ where: { courseId: course.id } })

  for (const weekData of academyPhase1Course.weeks) {
    const week = await prisma.week.create({
      data: {
        courseId: course.id,
        number: weekData.number,
        title: weekData.title,
        slug: weekData.slug,
        durationLabel: weekData.durationLabel,
        difficulty: weekData.difficulty as WeekDifficulty,
        hook: weekData.hook,
        whatToExpect: weekData.whatToExpect,
        summary: weekData.summary,
        estimatedCompletionMinutes: weekData.estimatedCompletionMinutes,
        videoTitle: weekData.videoTitle,
        videoUrl: weekData.videoUrl,
        published: true,
      },
    })

    for (let i = 0; i < weekData.facilitators.length; i += 1) {
      const facilitator = await prisma.facilitator.findUniqueOrThrow({
        where: { email: weekData.facilitators[i] },
      })

      await prisma.weekFacilitator.create({
        data: {
          weekId: week.id,
          facilitatorId: facilitator.id,
          position: i + 1,
        },
      })
    }

    await prisma.weekTopic.createMany({
      data: weekData.topics.map((title, index) => ({
        weekId: week.id,
        title,
        position: index + 1,
      })),
    })

    await prisma.weekObjective.createMany({
      data: weekData.objectives.map((body, index) => ({
        weekId: week.id,
        body,
        position: index + 1,
      })),
    })

    const slideDeck = await prisma.slideDeck.create({
      data: {
        weekId: week.id,
        title: weekData.slideDeck.title,
        url: weekData.slideDeck.url,
        slideCount: weekData.slideDeck.slideCount,
        lastUpdatedAt: new Date(weekData.slideDeck.lastUpdatedAt),
        viewerType: weekData.slideDeck.viewerType as SlideDeckViewerType,
      },
    })

    await prisma.slideDeckSection.createMany({
      data: weekData.slideDeck.sections.map((label, index) => ({
        slideDeckId: slideDeck.id,
        label,
        position: index + 1,
      })),
    })

    await prisma.glossaryTerm.createMany({
      data: weekData.glossary.map((term, index) => ({
        weekId: week.id,
        term: term.term,
        definition: term.definition,
        example: term.example ?? null,
        position: index + 1,
      })),
    })

    await prisma.readingResource.createMany({
      data: weekData.readings.map((reading, index) => ({
        weekId: week.id,
        title: reading.title,
        source: reading.source,
        url: reading.url,
        description: reading.description,
        type: reading.type as ReadingResourceType,
        position: index + 1,
      })),
    })

    const quiz = await prisma.quiz.create({
      data: {
        weekId: week.id,
        title: weekData.quiz.title,
        passMark: weekData.quiz.passMark,
        attemptLimit: 1,
      },
    })

    for (let questionIndex = 0; questionIndex < weekData.quiz.questions.length; questionIndex += 1) {
      const questionData = weekData.quiz.questions[questionIndex]
      const question = await prisma.quizQuestion.create({
        data: {
          quizId: quiz.id,
          prompt: questionData.prompt,
          explanation: questionData.explanation,
          position: questionIndex + 1,
        },
      })

      await prisma.quizOption.createMany({
        data: questionData.options.map((option, optionIndex) => ({
          questionId: question.id,
          label: option.label,
          isCorrect: option.isCorrect,
          position: optionIndex + 1,
        })),
      })
    }

    for (let assignmentIndex = 0; assignmentIndex < weekData.assignments.length; assignmentIndex += 1) {
      const assignmentData = weekData.assignments[assignmentIndex]
      const assignment = await prisma.assignment.create({
        data: {
          weekId: week.id,
          title: assignmentData.title,
          instructions: assignmentData.instructions,
          deadline: new Date(assignmentData.deadline),
          allowTextSubmission: assignmentData.allowTextSubmission,
          allowFileUpload: assignmentData.allowFileUpload,
          position: assignmentIndex + 1,
        },
      })

      if (assignmentData.choices?.length) {
        await prisma.assignmentChoice.createMany({
          data: assignmentData.choices.map((choice, choiceIndex) => ({
            assignmentId: assignment.id,
            title: choice.title,
            description: choice.description,
            position: choiceIndex + 1,
          })),
        })
      }
    }
  }
}

async function seedSampleGig(adminId: string) {
  const existing = await prisma.gig.findFirst({
    where: { title: 'Build a DeFi Yield Aggregator Smart Contract', posterId: adminId },
  })

  if (existing) return existing

  return prisma.gig.create({
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
      posterId: adminId,
    },
  })
}

async function main() {
  console.log('🌱 Seeding database...')

  const { admin, demo } = await seedUsers()
  console.log('✅ Admin user:', admin.email)
  console.log('✅ Demo user:', demo.email)

  await seedLegacyCourse()
  console.log('✅ Seeded legacy Web3 course')

  await seedAcademyCourse()
  console.log(`✅ Seeded academy course: ${academyPhase1Course.title}`)

  const gig = await seedSampleGig(admin.id)
  console.log('✅ Sample gig:', gig.title)

  console.log('\n🎉 Seed complete!')
  console.log('\nTest credentials:')
  console.log('  Admin: admin@rubikcon.com / admin123456')
  console.log('  Demo:  demo@rubikcon.com  / demo12345')
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
