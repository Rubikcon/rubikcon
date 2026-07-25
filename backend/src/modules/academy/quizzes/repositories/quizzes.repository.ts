
import prisma from '../../../../infrastructure/prisma/client'
import { QuizAttemptStatus } from '@prisma/client'

export class QuizzesRepository {
  async findById(id: string) {
    return prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { position: 'asc' },
          include: { options: { orderBy: { position: 'asc' } } },
        },
      },
    })
  }

  async countQuizAttempts(userId: string, quizId: string) {
    return prisma.quizAttempt.count({ where: { userId, quizId } })
  }

  async findRetakeUnlock(userId: string, quizId: string) {
    return prisma.quizRetakeUnlock.findUnique({
      where: { quizId_userId: { quizId, userId } },
    })
  }

  async createQuizAttempt(userId: string, quizId: string, score: number, percentage: number, answers: any[]) {
    return prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        percentage,
        status: QuizAttemptStatus.SUBMITTED,
        answers: {
          create: answers.map(a => ({ questionId: a.questionId, selectedOptionId: a.selectedOptionId })),
        },
      },
      include: {
        answers: { select: { questionId: true, selectedOptionId: true } },
      },
    })
  }

  async findLatestAttempt(userId: string, quizId: string) {
    return prisma.quizAttempt.findFirst({
      where: { userId, quizId },
      orderBy: { submittedAt: 'desc' },
      include: {
        quiz: { include: { questions: { orderBy: { position: 'asc' }, include: { options: { orderBy: { position: 'asc' } } } } } },
        answers: true,
      },
    })
  }

  async unlockRetake(userId: string, quizId: string, unlockedByAdminId: string) {
    return prisma.quizRetakeUnlock.upsert({
      where: { quizId_userId: { quizId, userId } },
      update: { unlockedAt: new Date(), unlockedById: unlockedByAdminId },
      create: { quizId, userId, unlockedById: unlockedByAdminId },
    })
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

  async findWeekForCourse(weekId: string, courseId: string) {
    return prisma.week.findFirst({ where: { id: weekId, courseId } })
  }

  async create(weekId: string) {
    return prisma.quiz.create({
      data: { weekId, title: 'Week Quiz' }
    })
  }

  async updateQuizSettings(quizId: string, data: any) {
    return prisma.quiz.update({ where: { id: quizId }, data })
  }

  async findQuizByWeek(weekId: string) {
    return prisma.quiz.findFirst({ where: { weekId } })
  }

  async countQuestions(quizId: string) {
    return prisma.quizQuestion.count({ where: { quizId } })
  }

  async createQuestion(quizId: string, prompt: string, explanation: string | undefined, position: number, options: any[]) {
    return prisma.quizQuestion.create({
      data: {
        quizId,
        prompt,
        explanation: explanation ?? '',
        position,
        options: {
          create: options.map((o, i) => ({ label: o.label, isCorrect: o.isCorrect, position: i + 1 })),
        },
      },
      include: { options: { orderBy: { position: 'asc' } } },
    })
  }

  async findQuestion(questionId: string, weekId: string, courseId: string) {
    return prisma.quizQuestion.findFirst({
      where: { id: questionId, quiz: { week: { id: weekId, courseId } } },
    })
  }

  async updateQuestion(questionId: string, updateData: any, newOptions?: any[]) {
    return prisma.$transaction(async (tx) => {
      if (Object.keys(updateData).length > 0) {
        await tx.quizQuestion.update({ where: { id: questionId }, data: updateData })
      }
      if (newOptions) {
        await tx.quizOption.deleteMany({ where: { questionId } })
        await tx.quizOption.createMany({
          data: newOptions.map((o, i) => ({ questionId, label: o.label, isCorrect: o.isCorrect, position: i + 1 })),
        })
      }
      return tx.quizQuestion.findUnique({
        where: { id: questionId },
        include: { options: { orderBy: { position: 'asc' } } },
      })
    })
  }

  async deleteQuestion(questionId: string) {
    return prisma.quizQuestion.delete({ where: { id: questionId } })
  }

  async deleteByWeek(weekId: string) {
    return prisma.quiz.deleteMany({ where: { weekId } })
  }
}

export const quizzesRepository = new QuizzesRepository()
