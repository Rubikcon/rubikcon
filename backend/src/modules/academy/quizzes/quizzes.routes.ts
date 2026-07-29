import './quizzes.swagger';

import './quizzes.swagger'
import { Router } from 'express'
import { requireAuth, requireAdmin } from '../../../middleware/auth.middleware'
import { quizzesController } from './controllers/quizzes.controller'

const router = Router()

// Learner endpoints
router.post('/quizzes/:quizId/submit', requireAuth, quizzesController.submitQuiz.bind(quizzesController))
router.get('/quizzes/:quizId/attempt', requireAuth, quizzesController.getAttempt.bind(quizzesController))

// Admin endpoints
router.post('/admin/quizzes/:quizId/unlock-retake', requireAuth, requireAdmin, quizzesController.unlockRetake.bind(quizzesController))
router.post('/admin/courses/:courseId/weeks/:weekId/quiz', requireAuth, requireAdmin, quizzesController.createQuiz.bind(quizzesController))
router.patch('/admin/courses/:courseId/weeks/:weekId/quiz/settings', requireAuth, requireAdmin, quizzesController.updateQuizSettings.bind(quizzesController))
router.post('/admin/courses/:courseId/weeks/:weekId/quiz/questions', requireAuth, requireAdmin, quizzesController.addQuestion.bind(quizzesController))
router.patch('/admin/courses/:courseId/weeks/:weekId/quiz/questions/:questionId', requireAuth, requireAdmin, quizzesController.updateQuestion.bind(quizzesController))
router.delete('/admin/courses/:courseId/weeks/:weekId/quiz/questions/:questionId', requireAuth, requireAdmin, quizzesController.deleteQuestion.bind(quizzesController))
router.delete('/admin/courses/:courseId/weeks/:weekId/quiz', requireAuth, requireAdmin, quizzesController.deleteQuiz.bind(quizzesController))

export const quizzesRoutes = router
