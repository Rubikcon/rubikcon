import './progress.swagger';
import './progress.swagger'
import { Router } from 'express'
import { requireAuth, requireAdmin } from '../../../middleware/auth.middleware'
import { progressController } from './controllers/progress.controller'

const router = Router()

// Learner endpoints
router.get('/progress', requireAuth, progressController.getLearnerProgress.bind(progressController))
router.post('/progress', requireAuth, progressController.submitLegacyProgress.bind(progressController))
router.get('/legacy-progress', requireAuth, progressController.getLegacyProgress.bind(progressController))
router.post('/weeks/:weekSlug/complete', requireAuth, progressController.manuallyCompleteWeek.bind(progressController))
router.post('/weeks/:weekSlug/rating', requireAuth, progressController.submitRating.bind(progressController))
router.post('/glossary/save', requireAuth, progressController.saveGlossaryTerm.bind(progressController))
router.delete('/glossary/save/:termId', requireAuth, progressController.removeGlossaryTerm.bind(progressController))
router.post('/resources/:resourceId/mark-read', requireAuth, progressController.markResourceRead.bind(progressController))
router.get('/dashboard', requireAuth, progressController.getDashboard.bind(progressController))

// Admin endpoints
router.get('/admin/learners/progress', requireAuth, requireAdmin, progressController.getAdminLearnerProgress.bind(progressController))

export const progressRoutes = router
