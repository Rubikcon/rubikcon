
import { Request, Response, NextFunction } from 'express'

import { sendSuccess, sendError } from '../../../../shared/api/response'
import { assignmentsService } from '../services/assignments.service'
import { AssignmentSubmissionSchema, FeedbackSchema, CreateAssignmentSchema } from '../schemas/assignments.schemas'

export class AssignmentsController {
  async submitAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = AssignmentSubmissionSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const result = await assignmentsService.submitAssignment(req.user!.userId, req.params.assignmentId, parsed.data)
      return sendSuccess(res, result.submission, 'Assignment submitted successfully.', 201)
    } catch (err) { next(err) }
  }

  async getSubmissions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await assignmentsService.getSubmissions(req.query.courseId as string, req.user!.userId, req.user!.email, req.user!.role)
      return sendSuccess(res, result.submissions)
    } catch (err) { next(err) }
  }

  async provideFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = FeedbackSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const result = await assignmentsService.provideFeedback(req.params.submissionId, req.user!.userId, parsed.data.feedback, parsed.data.rating)
      return sendSuccess(res, result.feedback, 'Feedback submitted.', 201)
    } catch (err) { next(err) }
  }

  async deleteFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      await assignmentsService.deleteFeedback(req.params.feedbackId, req.user!.userId, req.user!.email, req.user!.role)
      return sendSuccess(res, null, 'Feedback deleted.')
    } catch (err) { next(err) }
  }

  async createAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = CreateAssignmentSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const result = await assignmentsService.createAssignment(req.params.courseId, req.params.weekId, req.user!.userId, req.user!.email, req.user!.role, parsed.data)
      return sendSuccess(res, result.assignment, 'Assignment created.', 201)
    } catch (err) { next(err) }
  }

  async deleteAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      await assignmentsService.deleteAssignment(req.params.courseId, req.params.weekId, req.params.assignmentId, req.user!.userId, req.user!.email, req.user!.role)
      return sendSuccess(res, null, 'Assignment deleted.')
    } catch (err) { next(err) }
  }

  async getWeekAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await assignmentsService.getWeekAssignments(req.params.weekSlug, req.user)
      return sendSuccess(res, result)
    } catch (err) { next(err) }
  }
}

export const assignmentsController = new AssignmentsController()
