import { Router } from 'express'
import { requireAuth, optionalAuth } from '../../middleware/auth.middleware'
import { gigsController } from './controllers/gigs.controller'
import './gigs.swagger'

const router = Router()

router.get('/', optionalAuth, gigsController.listGigs)

router.get('/:id', gigsController.getGigById)

router.post('/', requireAuth, gigsController.createGig)

router.post('/apply', requireAuth, gigsController.applyToGig)

router.get('/:id/applications', requireAuth, gigsController.getApplications)

export default router
