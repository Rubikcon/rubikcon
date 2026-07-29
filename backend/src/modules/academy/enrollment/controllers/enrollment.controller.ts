import { Request, Response, NextFunction } from 'express'
import { sendSuccess, sendError } from '../../../../shared/api/response'
import { enrollmentService } from '../services/enrollment.service'

export class EnrollmentController {
  async getCourseEnrollments(req: Request, res: Response, next: NextFunction) {
    try {
      const enrollments = await enrollmentService.getCourseEnrollments(
        req.params.courseId,
        req.user!.userId,
        req.user!.role
      )
      return sendSuccess(res, enrollments)
    } catch (err) {
      next(err)
    }
  }
}

export const enrollmentController = new EnrollmentController()
