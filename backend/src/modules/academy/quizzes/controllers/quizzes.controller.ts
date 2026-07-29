
import { Request, Response, NextFunction } from 'express'
import { sendSuccess, sendError } from '../../../../shared/api/response'
import { quizzesService } from '../services/quizzes.service'
import { QuizSubmissionSchema, QuizSettingsSchema, QuizQuestionInputSchema } from '../schemas/quizzes.schemas'

export class QuizzesController {
  async submitQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = QuizSubmissionSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

      const result = await quizzesService.submitQuiz(req.user!.userId, req.params.quizId, parsed.data.answers)

      const { attempt, quiz, answersByQuestion } = result
      return sendSuccess(res, {
        id: attempt!.id,
        score: attempt!.score,
        percentage: attempt!.percentage,
        passed: attempt!.percentage >= quiz!.passMark,
        submittedAt: attempt!.submittedAt,
        questions: quiz!.questions.map(question => ({
          id: question.id,
          prompt: question.prompt,
          explanation: question.explanation,
          options: question.options.map(option => ({
            id: option.id,
            label: option.label,
            isCorrect: option.isCorrect,
            isSelected: answersByQuestion!.get(question.id) === option.id,
          })),
        })),
      }, 'Quiz submitted successfully.', 201)
    } catch (err) { next(err) }
  }

  async getAttempt(req: Request, res: Response, next: NextFunction) {
    try {
      const attempt = await quizzesService.getAttempt(req.user!.userId, req.params.quizId)
      if (!attempt) return sendError(res, 'No quiz attempt found.', 404)

      const selected = new Map(attempt.answers.map(answer => [answer.questionId, answer.selectedOptionId]))
      return sendSuccess(res, {
        id: attempt.id,
        score: attempt.score,
        percentage: attempt.percentage,
        submittedAt: attempt.submittedAt,
        quiz: {
          id: attempt.quiz.id,
          title: attempt.quiz.title,
          passMark: attempt.quiz.passMark,
        },
        questions: attempt.quiz.questions.map(question => ({
          id: question.id,
          prompt: question.prompt,
          explanation: question.explanation,
          options: question.options.map(option => ({
            id: option.id,
            label: option.label,
            isCorrect: option.isCorrect,
            isSelected: selected.get(question.id) === option.id,
          })),
        })),
      })
    } catch (err) { next(err) }
  }

  async unlockRetake(req: Request, res: Response, next: NextFunction) {
    try {
      const unlock = await quizzesService.unlockRetake(req.body.userId, req.params.quizId, req.user!.userId)
      return sendSuccess(res, unlock, 'Retake unlocked.')
    } catch (err) { next(err) }
  }

  async createQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await quizzesService.createQuiz(req.params.courseId, req.params.weekId, req.user!.userId, req.user!.email, req.user!.role)
      return sendSuccess(res, result.quiz, 'Quiz created.', 201)
    } catch (err) { next(err) }
  }

  async updateQuizSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = QuizSettingsSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const result = await quizzesService.updateQuizSettings(req.params.courseId, req.params.weekId, req.user!.userId, req.user!.email, req.user!.role, parsed.data)
      return sendSuccess(res, result.updated, 'Quiz settings updated.')
    } catch (err) { next(err) }
  }

  async addQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = QuizQuestionInputSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const result = await quizzesService.addQuestion(req.params.courseId, req.params.weekId, req.user!.userId, req.user!.email, req.user!.role, parsed.data)
      return sendSuccess(res, result.question, 'Question added.', 201)
    } catch (err) { next(err) }
  }

  async updateQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = QuizQuestionInputSchema.partial().safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const result = await quizzesService.updateQuestion(req.params.courseId, req.params.weekId, req.params.questionId, req.user!.userId, req.user!.email, req.user!.role, parsed.data)
      return sendSuccess(res, result.updated, 'Question updated.')
    } catch (err) { next(err) }
  }

  async deleteQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await quizzesService.deleteQuestion(req.params.courseId, req.params.weekId, req.params.questionId, req.user!.userId, req.user!.email, req.user!.role)
      return sendSuccess(res, { id: result.id }, 'Question deleted.')
    } catch (err) { next(err) }
  }

  async deleteQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      await quizzesService.deleteQuiz(req.params.courseId, req.params.weekId, req.user!.userId, req.user!.email, req.user!.role)
      return sendSuccess(res, null, 'Quiz deleted.')
    } catch (err) { next(err) }
  }
}

export const quizzesController = new QuizzesController()
