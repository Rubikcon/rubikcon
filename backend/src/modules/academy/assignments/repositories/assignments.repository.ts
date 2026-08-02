
import { AssignmentSubmissionStatus } from '@prisma/client'

import prisma from '../../../../infrastructure/prisma/client'

export class AssignmentsRepository {
  async findById(id: string) {
    return prisma.assignment.findUnique({
      where: { id },
      include: {
        choices: true,
        week: {
          include: {
            course: {
              include: {
                createdBy: { select: { id: true, name: true, email: true } },
                courseFacilitators: {
                  select: {
                    facilitator: { select: { name: true, email: true } },
                  },
                },
              },
            },
          },
        },
      },
    })
  }

  async createSubmission(userId: string, assignmentId: string, choiceId: string | undefined, data: any) {
    return prisma.assignmentSubmission.create({
      data: {
        userId,
        assignmentId,
        choiceId: choiceId || undefined,
        status: AssignmentSubmissionStatus.SUBMITTED,
        textResponse: data.textResponse,
        attachmentName: data.attachmentName,
        attachmentUrl: data.attachmentUrl,
        attachmentMimeType: data.attachmentMimeType,
        attachmentSizeBytes: data.attachmentSizeBytes,
      },
    })
  }

  async findSubmissionsByCourse(courseId: string) {
    return prisma.assignmentSubmission.findMany({
      where: { assignment: { week: { courseId } } },
      orderBy: { submittedAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        assignment: {
          include: { week: { select: { id: true, title: true, slug: true } } },
        },
        choice: true,
        feedback: {
          orderBy: { createdAt: 'desc' },
          include: { reviewer: { select: { name: true } } },
        },
      },
    })
  }

  async findSubmissionById(id: string) {
    return prisma.assignmentSubmission.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        assignment: {
          include: {
            week: {
              include: {
                course: { select: { id: true, createdById: true, title: true, slug: true } },
              },
            },
          },
        },
      },
    })
  }

  async createFeedback(submissionId: string, reviewerId: string, feedback: string, rating?: number) {
    return prisma.assignmentFeedback.create({
      data: {
        submissionId,
        reviewerId,
        feedback,
        rating,
      },
      include: { reviewer: { select: { name: true } } },
    })
  }

  async updateSubmissionStatus(submissionId: string, status: AssignmentSubmissionStatus) {
    return prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: { status },
    })
  }

  async findFeedbackById(id: string) {
    return prisma.assignmentFeedback.findUnique({
      where: { id },
      include: { submission: { include: { assignment: { include: { week: { include: { course: true } } } } } } },
    })
  }

  async deleteFeedback(id: string) {
    return prisma.assignmentFeedback.delete({ where: { id } })
  }

  async findCourseForAdmin(courseId: string, userId: string, email: string, role: string) {
    if (role === 'SUPER_ADMIN') {
      return prisma.course.findUnique({ where: { id: courseId } })
    }
    return prisma.course.findFirst({
      where: {
        id: courseId,
        OR: [
          { createdById: userId },
          { courseFacilitators: { some: { facilitator: { email } } } }
        ]
      }
    })
  }

  async countAssignmentsByWeek(weekId: string) {
    return prisma.assignment.count({ where: { weekId } })
  }

  async create(weekId: string, data: any) {
    const { choices, ...rest } = data
    return prisma.assignment.create({
      data: {
        ...rest,
        deadline: new Date(rest.deadline),
        weekId,
        choices: {
          create: choices.map((c: any) => ({ title: c.title, description: c.description, position: c.position })),
        },
      },
      include: { choices: { orderBy: { position: 'asc' } } },
    })
  }

  async findAssignmentInWeek(assignmentId: string, weekId: string) {
    return prisma.assignment.findFirst({ where: { id: assignmentId, weekId } })
  }

  async delete(id: string) {
    return prisma.assignment.delete({ where: { id } })
  }

  async findWeekBySlug(slug: string) {
    return prisma.week.findUnique({
      where: { slug },
      include: {
        quiz: { include: { questions: { orderBy: { position: 'asc' }, include: { options: { orderBy: { position: 'asc' } } } } } },
        assignments: { orderBy: { position: 'asc' }, include: { choices: { orderBy: { position: 'asc' } } } },
      },
    })
  }

  async getUserWeekState(userId: string, weekId: string, quizId?: string) {
    const [weekProgress, latestAttempt, submissions] = await Promise.all([
      prisma.weekProgress.findUnique({ where: { userId_weekId: { userId, weekId } } }),
      quizId ? prisma.quizAttempt.findFirst({ where: { userId, quizId }, orderBy: { submittedAt: 'desc' } }) : null,
      prisma.assignmentSubmission.findMany({
        where: { userId, assignment: { weekId } },
        include: {
          feedback: { orderBy: { createdAt: 'desc' }, include: { reviewer: { select: { name: true } } } },
          choice: true,
        },
      }),
    ])

    const unlockGranted = quizId
      ? await prisma.quizRetakeUnlock.findUnique({ where: { quizId_userId: { quizId, userId } } })
      : null

    return { weekProgress, latestAttempt, submissions, unlockGranted }
  }
}

export const assignmentsRepository = new AssignmentsRepository()
