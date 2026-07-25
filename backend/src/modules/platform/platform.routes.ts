import { NextFunction, Request, Response, Router } from 'express'

import { requireAdmin, requireAuth } from '../../middleware/auth.middleware'
import { sendSuccess } from '../../shared/api/response'
import './platform.swagger'
import { platformRepository } from './repositories/platform.repository'

const router = Router()

router.get('/admin/stats', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await platformRepository.getStats()
    return sendSuccess(res, stats)
  } catch (err) {
    next(err)
  }
})

export const platformRoutes = router

