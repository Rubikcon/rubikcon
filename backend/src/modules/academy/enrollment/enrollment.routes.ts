import { Router } from 'express'
import { requireAuth, requireAdmin } from '../../../middleware/auth.middleware'
import { enrollmentController } from './controllers/enrollment.controller'
import './enrollment.swagger'

const router = Router()

// --- Admin Enrollment Management ---
router.get(
  '/admin/courses/:courseId/enrollments',
  requireAuth,
  requireAdmin,
  enrollmentController.getCourseEnrollments.bind(enrollmentController)
)

export const enrollmentRoutes = router
