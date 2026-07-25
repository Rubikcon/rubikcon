import { Router } from 'express'

import { requireAuth, requireAdmin, optionalAuth } from '../../../middleware/auth.middleware'
import { assignmentsController } from './controllers/assignments.controller'
import './assignments.swagger'

const router = Router()

router.get('/weeks/:weekSlug/assignment', optionalAuth, assignmentsController.getWeekAssignments.bind(assignmentsController))
router.post('/assignments/:assignmentId/submissions', requireAuth, assignmentsController.submitAssignment.bind(assignmentsController))

router.get('/admin/assignments/submissions', requireAuth, requireAdmin, assignmentsController.getSubmissions.bind(assignmentsController))
router.post('/admin/assignments/submissions/:submissionId/feedback', requireAuth, requireAdmin, assignmentsController.provideFeedback.bind(assignmentsController))
router.delete('/admin/assignments/submissions/:submissionId/feedback/:feedbackId', requireAuth, requireAdmin, assignmentsController.deleteFeedback.bind(assignmentsController))

router.post('/admin/courses/:courseId/weeks/:weekId/assignments', requireAuth, requireAdmin, assignmentsController.createAssignment.bind(assignmentsController))
router.delete('/admin/courses/:courseId/weeks/:weekId/assignments/:assignmentId', requireAuth, requireAdmin, assignmentsController.deleteAssignment.bind(assignmentsController))

export const assignmentsRoutes = router
