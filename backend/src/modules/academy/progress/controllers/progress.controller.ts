import { Request, Response, NextFunction } from 'express'
import { sendSuccess, sendError } from '../../../../shared/api/response'
import { progressService } from '../services/progress.service'
import { SubmitLegacyProgressSchema, AdminWeekFilterSchema, SubmitRatingSchema, SaveGlossaryTermSchema } from '../schemas/progress.schemas'

export class ProgressController {
  async getLearnerProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const progress = await progressService.getLearnerProgress(req.user!.userId)
      const formatted = progress.map(p => ({
        id: p.week.id,
        weekSlug: p.week.slug,
        title: p.week.title,
        number: p.week.number,
        courseSlug: p.week.course.slug,
        courseTitle: p.week.course.title,
        status: p.status,
        completedAt: p.completedAt,
        updatedAt: p.updatedAt,
      }))
      return sendSuccess(res, formatted)
    } catch (err) {
      next(err)
    }
  }

  async getAdminLearnerProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = AdminWeekFilterSchema.safeParse(req.query)
      if (!parsed.success) {
        return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      }

      // We rely on the auth context providing user info to restrict access.
      // Since 'facilitatorAccessibleCourseWhere' was previously imported, 
      // we'll mock its logic here for now to avoid the import issue.
      // A proper solution is to put this in auth/academy authorization utility.
      const user = req.user!
      let courseScope: any = {}
      if (user.role === 'ADMIN') {
        courseScope = {
          OR: [
            { creatorId: user.userId },
            { courseFacilitators: { some: { facilitator: { userId: user.userId } } } }
          ]
        }
      }

      const ownership = Object.keys(courseScope).length === 0 ? {} : { week: { course: courseScope } }
      const slugFilter = parsed.data.weekSlug ? { week: { slug: parsed.data.weekSlug } } : {}
      
      const progress = await progressService.getAdminLearnerProgress({ AND: [ownership, slugFilter] })
      return sendSuccess(res, progress)
    } catch (err) {
      next(err)
    }
  }

  async getLegacyProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const progress = await progressService.getLegacyProgress(req.user!.userId)
      const mapped = progress.map(p => ({
        lessonId: p.lessonId,
        moduleId: p.lesson.moduleId,
        title: p.lesson.title,
        completed: p.completed
      }))
      return sendSuccess(res, mapped)
    } catch (err) {
      next(err)
    }
  }

  async submitLegacyProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = SubmitLegacyProgressSchema.safeParse(req.body)
      if (!parsed.success) {
        return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      }

      const { lessonId, completed } = parsed.data
      const progress = await progressService.completeLegacyProgress(req.user!.userId, lessonId, completed)
      
      if (!progress) {
        return sendError(res, 'Lesson not found.', 404)
      }

      return sendSuccess(res, {
        lessonId: progress.lessonId,
        completed: progress.completed
      }, 'Progress saved.')
    } catch (err) {
      next(err)
    }
  }

  async manuallyCompleteWeek(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await progressService.manuallyCompleteWeek(req.user!.userId, req.params.weekSlug)
      
      if (result.error) {
        return sendError(res, result.error, result.error === 'Week not found.' ? 404 : 403)
      }

      return sendSuccess(res, {
        status: result.progress!.status,
        completedAt: result.progress!.completedAt,
      }, 'Lesson marked complete.')
    } catch (err) {
      next(err)
    }
  }

  async submitRating(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = SubmitRatingSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

      const result = await progressService.submitRating(req.user!.userId, req.params.weekSlug, parsed.data.rating)
      if (result.error) {
        return sendError(res, result.error, result.statusCode || 400)
      }

      return sendSuccess(res, { rating: result.rating }, 'Lesson rating saved.')
    } catch (err) {
      next(err)
    }
  }

  async saveGlossaryTerm(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = SaveGlossaryTermSchema.safeParse(req.body)
      if (!parsed.success) {
        return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      }

      const result = await progressService.saveGlossaryTerm(req.user!.userId, parsed.data.termId)
      if (result.error) {
        return sendError(res, result.error, result.statusCode || 400)
      }

      return sendSuccess(res, result.item, 'Glossary term saved.', 201)
    } catch (err) {
      next(err)
    }
  }

  async removeGlossaryTerm(req: Request, res: Response, next: NextFunction) {
    try {
      await progressService.removeGlossaryTerm(req.user!.userId, req.params.termId)
      return sendSuccess(res, { termId: req.params.termId }, 'Glossary term removed.')
    } catch (err) {
      next(err)
    }
  }

  async markResourceRead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await progressService.markResourceRead(req.user!.userId, req.params.resourceId)
      if (result.error) {
        return sendError(res, result.error, 404)
      }
      return sendSuccess(res, { resourceId: result.resourceId, read: result.read }, result.message, result.read ? 201 : 200)
    } catch (err) {
      next(err)
    }
  }

  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await progressService.getDashboard(req.user!.userId)
      return sendSuccess(res, data)
    } catch (err) {
      next(err)
    }
  }
}

export const progressController = new ProgressController()
