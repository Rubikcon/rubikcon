import { Request, Response, NextFunction } from 'express'

import { sendSuccess, sendError, sendPaginated } from '../../../shared/api/response'
import { AppError } from '../../../shared/errors/AppError'
import { GIGS_PAGINATION_DEFAULT_LIMIT, GIGS_PAGINATION_MAX_LIMIT } from '../constants/gigs.constants'
import { CreateGigSchema, ApplySchema } from '../schemas/gigs.schemas'
import { gigsService } from '../services/gigs.service'

export class GigsController {
  async listGigs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1)
      const limit = Math.min(GIGS_PAGINATION_MAX_LIMIT, parseInt(req.query.limit as string) || GIGS_PAGINATION_DEFAULT_LIMIT)
      
      const { gigs, total } = await gigsService.listGigs({
        page,
        limit,
        category: req.query.category as string | undefined,
        difficulty: req.query.difficulty as string | undefined,
        currency: req.query.currency as string | undefined,
        search: req.query.search as string | undefined,
      })

      return sendPaginated(res, gigs, total, page, limit)
    } catch (err) {
      next(err)
    }
  }

  async getGigById(req: Request, res: Response, next: NextFunction) {
    try {
      const gig = await gigsService.getGigById(req.params.id)
      return sendSuccess(res, gig)
    } catch (err) {
      next(err)
    }
  }

  async createGig(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = CreateGigSchema.safeParse(req.body)
      if (!parsed.success) {
        throw new AppError('Validation failed', 400, parsed.error.flatten().fieldErrors)
      }

      const gig = await gigsService.createGig({
        ...parsed.data,
        posterId: req.user!.userId
      })

      return sendSuccess(res, gig, 'Gig posted successfully.', 201)
    } catch (err) {
      next(err)
    }
  }

  async applyToGig(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = ApplySchema.safeParse(req.body)
      if (!parsed.success) {
        throw new AppError('Validation failed', 400, parsed.error.flatten().fieldErrors)
      }

      const application = await gigsService.applyToGig({
        gigId: parsed.data.gigId,
        userId: req.user!.userId,
        proposal: parsed.data.proposal,
        rate: parsed.data.rate,
      })

      return sendSuccess(res, application, 'Application submitted successfully.', 201)
    } catch (err) {
      next(err)
    }
  }

  async getApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const applications = await gigsService.getApplications(req.params.id, req.user!.userId)
      return sendSuccess(res, applications)
    } catch (err) {
      next(err)
    }
  }
}

export const gigsController = new GigsController()
