import { NotFoundError, ValidationError, ConflictError } from '../../../../shared/errors/AppError'

import { quizzesRepository } from '../repositories/quizzes.repository'
import { progressService } from '../../progress/services/progress.service'

export class QuizzesService {
  async submitQuiz(userId: string, quizId: string, answers: {questionId: string, selectedOptionId: string}[]) {
    const quiz = await quizzesRepository.findById(quizId)
    if (!quiz) throw new NotFoundError('Quiz not found.')

    const [attemptCount, unlock] = await Promise.all([
      quizzesRepository.countQuizAttempts(userId, quiz.id),
      quizzesRepository.findRetakeUnlock(userId, quiz.id),
    ])

    const effectiveLimit = quiz.attemptLimit + (unlock ? 1 : 0)
    if (attemptCount >= effectiveLimit) {
      throw new ConflictError('Quiz is locked. A facilitator must unlock a retake for another attempt.')
    }

    const answersByQuestion = new Map(answers.map(a => [a.questionId, a.selectedOptionId]))
    if (answersByQuestion.size !== quiz.questions.length) {
      throw new ValidationError('Every quiz question must be answered exactly once.')
    }

    let score = 0
    for (const question of quiz.questions) {
      const selectedOptionId = answersByQuestion.get(question.id)
      const selectedOption = question.options.find(o => o.id === selectedOptionId)
      if (!selectedOption) throw new ValidationError(`Invalid option selected for question ${question.id}.`)
      if (selectedOption.isCorrect) score += 1
    }

    const percentage = Number(((score / quiz.questions.length) * 100).toFixed(1))

    const attempt = await quizzesRepository.createQuizAttempt(userId, quiz.id, score, percentage, answers)
    await progressService.syncWeekProgress(userId, quiz.weekId)

    return { attempt, quiz, answersByQuestion }
  }

  async getAttempt(userId: string, quizId: string) {
    return quizzesRepository.findLatestAttempt(userId, quizId)
  }

  async unlockRetake(userId: string, quizId: string, adminId: string) {
    return quizzesRepository.unlockRetake(userId, quizId, adminId)
  }

  async verifyCourseAccess(courseId: string, userId: string, email: string, role: string) {
    const course = await quizzesRepository.findCourseForAdmin(courseId, userId, email, role)
    if (!course) throw new NotFoundError('Course not found or access denied.')
    return { course }
  }

  async createQuiz(courseId: string, weekId: string, userId: string, email: string, role: string) {
    const access = await this.verifyCourseAccess(courseId, userId, email, role)
    if (access.course!.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      throw new ValidationError('Cannot edit an approved course.')
    }

    const week = await quizzesRepository.findWeekForCourse(weekId, courseId)
    if (!week) throw new NotFoundError('Week not found.')

    const quiz = await quizzesRepository.create(weekId)
    return { quiz }
  }

  async updateQuizSettings(courseId: string, weekId: string, userId: string, email: string, role: string, data: any) {
    await this.verifyCourseAccess(courseId, userId, email, role)
    const week = await quizzesRepository.findWeekForCourse(weekId, courseId)
    if (!week) throw new NotFoundError('Week not found.')
    
    const quiz = await quizzesRepository.findQuizByWeek(week.id)
    if (!quiz) throw new NotFoundError('Quiz not found. Create the quiz first.')

    const updated = await quizzesRepository.updateQuizSettings(quiz.id, data)
    return { updated }
  }

  async addQuestion(courseId: string, weekId: string, userId: string, email: string, role: string, data: any) {
    await this.verifyCourseAccess(courseId, userId, email, role)
    const week = await quizzesRepository.findWeekForCourse(weekId, courseId)
    if (!week) throw new NotFoundError('Week not found.')
    
    const quiz = await quizzesRepository.findQuizByWeek(week.id)
    if (!quiz) throw new NotFoundError('Quiz not found. Create the quiz first.')

    const count = await quizzesRepository.countQuestions(quiz.id)
    if (count >= 30) throw new ValidationError('Quiz cannot have more than 30 questions.')

    const question = await quizzesRepository.createQuestion(quiz.id, data.prompt, data.explanation, count + 1, data.options)
    return { question }
  }

  async updateQuestion(courseId: string, weekId: string, questionId: string, userId: string, email: string, role: string, data: any) {
    await this.verifyCourseAccess(courseId, userId, email, role)
    
    const question = await quizzesRepository.findQuestion(questionId, weekId, courseId)
    if (!question) throw new NotFoundError('Question not found.')

    const updateData: any = {}
    if (data.prompt !== undefined) updateData.prompt = data.prompt
    if (data.explanation !== undefined) updateData.explanation = data.explanation

    const updated = await quizzesRepository.updateQuestion(questionId, updateData, data.options)
    return { updated }
  }

  async deleteQuestion(courseId: string, weekId: string, questionId: string, userId: string, email: string, role: string) {
    await this.verifyCourseAccess(courseId, userId, email, role)
    
    const question = await quizzesRepository.findQuestion(questionId, weekId, courseId)
    if (!question) throw new NotFoundError('Question not found.')

    await quizzesRepository.deleteQuestion(questionId)
    return { id: questionId }
  }

  async deleteQuiz(courseId: string, weekId: string, userId: string, email: string, role: string) {
    const access = await this.verifyCourseAccess(courseId, userId, email, role)
    if (access.course!.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      throw new ValidationError('Cannot edit an approved course.')
    }

    const week = await quizzesRepository.findWeekForCourse(weekId, courseId)
    if (!week) throw new NotFoundError('Week not found.')

    await quizzesRepository.deleteByWeek(weekId)
    return { success: true }
  }
}

export const quizzesService = new QuizzesService()
