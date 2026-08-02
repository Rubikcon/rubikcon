import { Request, Response, NextFunction } from 'express'
import { sendSuccess, sendError } from '../../../shared/api/response'
import { userManagementService } from '../services/user-management.service'
import { UpdateRoleSchema, CreateFacilitatorSchema, UpdateFacilitatorSchema } from '../schemas/user-management.schemas'

export class UserManagementController {
  async getLearners(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query.q as string | undefined
      const result = await userManagementService.getLearners(q)
      return sendSuccess(res, { learners: result.learners, total: result.learners.length, pages: 1 })
    } catch (err) { next(err) }
  }

  async getLearnerById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userManagementService.getLearnerById(req.params.userId)
      return sendSuccess(res, result.learner)
    } catch (err) { next(err) }
  }

  async getFacilitators(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userManagementService.getFacilitators()
      return sendSuccess(res, result.facilitators)
    } catch (err) { next(err) }
  }

  async createFacilitator(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = CreateFacilitatorSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const result = await userManagementService.createFacilitator(parsed.data)
      return sendSuccess(res, result.facilitator, 'Facilitator created.', 201)
    } catch (err) { next(err) }
  }

  async updateFacilitator(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = UpdateFacilitatorSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const result = await userManagementService.updateFacilitator(req.params.id, parsed.data)
      return sendSuccess(res, result.facilitator, 'Facilitator updated.')
    } catch (err) { next(err) }
  }

  async deleteFacilitator(req: Request, res: Response, next: NextFunction) {
    try {
      await userManagementService.deleteFacilitator(req.params.id)
      return sendSuccess(res, null, 'Facilitator deleted.')
    } catch (err) { next(err) }
  }

  async getFacilitatorMe(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userManagementService.getFacilitatorMe(req.user!.email)
      return sendSuccess(res, result.facilitator)
    } catch (err) { next(err) }
  }

  async updateFacilitatorMe(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = UpdateFacilitatorSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const result = await userManagementService.updateFacilitatorMe(req.user!.email, parsed.data)
      return sendSuccess(res, result.facilitator, 'Profile updated.')
    } catch (err) { next(err) }
  }

  async getAdminUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userManagementService.getAdminUsers()
      return sendSuccess(res, result.admins)
    } catch (err) { next(err) }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query.q as string | undefined
      const result = await userManagementService.getUsers(q)
      return sendSuccess(res, { users: result.users, total: result.users.length, pages: 1 })
    } catch (err) { next(err) }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = UpdateRoleSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const result = await userManagementService.updateUserRole(req.params.userId, parsed.data.role)
      return sendSuccess(res, result.user, 'User role updated.')
    } catch (err) { next(err) }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      await userManagementService.deleteUser(req.params.userId)
      return sendSuccess(res, null, 'User deleted.')
    } catch (err) { next(err) }
  }
}

export const userManagementController = new UserManagementController()
