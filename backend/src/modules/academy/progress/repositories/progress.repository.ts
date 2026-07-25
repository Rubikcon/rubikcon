import { Prisma } from '@prisma/client'
import prisma from '../../../../infrastructure/prisma/client'

export class ProgressRepository {
  async findProgressByUserId(userId: string) {
    return prisma.weekProgress.findMany({
      where: { userId },
      include: {
        week: {
          select: {
            id: true,
            number: true,
            slug: true,
            title: true,
            course: {
              select: {
                id: true,
                slug: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async findAdminProgress(where: Prisma.WeekProgressWhereInput) {
    return prisma.weekProgress.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        week: { select: { id: true, slug: true, number: true, title: true } },
      },
      orderBy: [{ week: { number: 'asc' } }, { updatedAt: 'desc' }],
    })
  }

  async findLegacyProgressByUserId(userId: string) {
    return prisma.progress.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            moduleId: true,
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })
  }

  async findWeekProgress(userId: string, weekId: string) {
    return prisma.weekProgress.findUnique({
      where: { userId_weekId: { userId, weekId } },
      select: { status: true, manuallyCompleted: true, firstOpenedAt: true, completedAt: true },
    })
  }

  async getLessonStructure(weekId: string) {
    return Promise.all([
      prisma.quiz.findFirst({ where: { weekId }, select: { id: true } }),
      prisma.assignment.count({ where: { weekId } }),
    ])
  }

  async getLearnerActions(userId: string, weekId: string) {
    return Promise.all([
      prisma.quizAttempt.findFirst({
        where: { userId, quiz: { weekId } },
        select: { id: true, percentage: true, quiz: { select: { passMark: true } } },
        orderBy: { percentage: 'desc' }
      }),
      prisma.assignmentSubmission.findFirst({ where: { userId, assignment: { weekId } }, select: { id: true } }),
    ])
  }

  async upsertWeekProgress(userId: string, weekId: string, status: any, manuallyCompleted: boolean, firstOpenedAt: Date | null, completedAt: Date | null) {
    return prisma.weekProgress.upsert({
      where: { userId_weekId: { userId, weekId } },
      update: { status, manuallyCompleted, firstOpenedAt, completedAt },
      create: { userId, weekId, status, manuallyCompleted, firstOpenedAt, completedAt },
    })
  }

  async findWeekBySlug(slug: string) {
    return prisma.week.findUnique({
      where: { slug },
      select: { id: true, courseId: true, published: true },
    })
  }

  async findCourseEnrollment(userId: string, courseId: string) {
    return prisma.courseEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    })
  }

  async findLessonById(id: string) {
    return prisma.lesson.findUnique({ where: { id } })
  }

  async upsertLegacyProgress(userId: string, lessonId: string, completed: boolean) {
    return prisma.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { completed },
      create: { userId, lessonId, completed },
    })
  }

  async updateWeekRating(userId: string, weekId: string, rating: number) {
    return prisma.weekProgress.update({
      where: { userId_weekId: { userId, weekId } },
      data: { rating },
    })
  }

  async findGlossaryTermById(id: string) {
    return prisma.glossaryTerm.findUnique({ where: { id } })
  }

  async upsertSavedGlossaryTerm(userId: string, termId: string) {
    return prisma.savedGlossaryTerm.upsert({
      where: { userId_termId: { userId, termId } },
      update: {},
      create: { userId, termId },
    })
  }

  async deleteSavedGlossaryTerm(userId: string, termId: string) {
    return prisma.savedGlossaryTerm.deleteMany({
      where: { userId, termId },
    })
  }

  async findReadingResourceById(id: string) {
    return prisma.readingResource.findUnique({
      where: { id },
      select: { id: true },
    })
  }

  async findReadingProgress(userId: string, resourceId: string) {
    return prisma.readingProgress.findUnique({
      where: { userId_resourceId: { userId, resourceId } },
    })
  }

  async deleteReadingProgress(userId: string, resourceId: string) {
    return prisma.readingProgress.delete({
      where: { userId_resourceId: { userId, resourceId } },
    })
  }

  async createReadingProgress(userId: string, resourceId: string) {
    return prisma.readingProgress.create({
      data: { userId, resourceId },
    })
  }

  async getDashboardCourses(userId: string) {
    return prisma.course.findMany({
      where: {
        published: true,
        weeks: { some: { published: true } },
        enrollments: { some: { userId } },
      },
      include: {
        weeks: {
          where: { published: true },
          orderBy: { number: 'asc' },
          select: {
            id: true,
            number: true,
            slug: true,
            title: true,
            durationLabel: true,
            estimatedCompletionMinutes: true,
            moduleId: true,
            module: { select: { id: true, title: true, description: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getCourseProgressMap(userId: string, weekIds: string[]) {
    const items = await prisma.weekProgress.findMany({
      where: { userId, weekId: { in: weekIds } },
    })
    return new Map(items.map(item => [item.weekId, item]))
  }

  async getQuizAttemptsByWeeks(userId: string, weekIds: string[]) {
    return prisma.quizAttempt.findMany({
      where: { userId, quiz: { weekId: { in: weekIds } } },
      include: {
        quiz: { select: { weekId: true } },
      },
      orderBy: { submittedAt: 'desc' },
    })
  }

  async getAssignmentSubmissionCount(userId: string) {
    const assignmentCounts = await prisma.assignmentSubmission.groupBy({
      by: ['userId'],
      where: { userId },
      _count: { _all: true },
    })
    return assignmentCounts[0]?._count._all ?? 0
  }
}

export const progressRepository = new ProgressRepository()
