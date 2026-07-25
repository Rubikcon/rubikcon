import { NextFunction, Request, Response } from 'express'

import { sendSuccess, sendError } from '../../../shared/api/response'
import { AppError } from '../../../shared/errors/AppError'
import {
  ChangePasswordSchema,
  ConfirmResetPasswordSchema,
  ForgotPasswordSchema,
  LoginUserSchema,
  OnboardUserSchema,
  SignupUserSchema,
} from '../schemas/auth.schemas'
import { authService } from '../services/auth.service'

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const data = SignupUserSchema.parse(req.body)
      const result = await authService.signup(data)
      const statusCode = result.message.includes('already exists') ? 200 : 201

      return sendSuccess(res, { user: result.user, token: result.token }, result.message, statusCode)
    } catch (err: any) {
      if (err.name === 'ZodError') {
        throw new AppError('Validation failed', 400, err.flatten().fieldErrors)
      }
      next(err)
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = LoginUserSchema.parse(req.body)
      const result = await authService.login(data)
      const { message, ...payload } = result

      return sendSuccess(res, payload, message)
    } catch (err: any) {
      if (err.name === 'ZodError') {
        throw new AppError('Validation failed', 400, err.flatten().fieldErrors)
      }
      next(err)
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.userId)
      return sendSuccess(res, user)
    } catch (err) {
      next(err)
    }
  }

  async onboarding(req: Request, res: Response, next: NextFunction) {
    try {
      const data = OnboardUserSchema.parse(req.body)
      const result = await authService.onboarding(req.user!.userId, data)
      return sendSuccess(res, result, 'Onboarding complete.')
    } catch (err: any) {
      if (err.name === 'ZodError') {
        throw new AppError('Validation failed', 400, err.flatten().fieldErrors)
      }
      next(err)
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = ForgotPasswordSchema.parse(req.body)
      await authService.forgotPassword(email)
      
      return sendSuccess(
        res,
        { sent: true },
        'If an account exists for that email, you\'ll receive a password-reset email shortly.'
      )
    } catch (err: any) {
      if (err.name === 'ZodError') {
        throw new AppError('Validation failed', 400, err.flatten().fieldErrors)
      }
      next(err)
    }
  }

  async superAdminResetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.superAdminResetPassword(req.params.userId, req.user?.role)
      return sendSuccess(res, result, 'Password reset initiated. User has been emailed and can now log in with a blank password.')
    } catch (err) {
      next(err)
    }
  }

  async confirmResetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = ConfirmResetPasswordSchema.parse(req.body)
      await authService.confirmResetPassword(req.user!.userId, data, req.user?.sessionId)
      return sendSuccess(res, {}, 'Password reset successfully.')
    } catch (err: any) {
      if (err.name === 'ZodError') {
        throw new AppError('Validation failed', 400, err.flatten().fieldErrors)
      }
      next(err)
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = ChangePasswordSchema.parse(req.body)
      await authService.changePassword(req.user!.userId, data, req.user?.sessionId)
      return sendSuccess(res, {}, 'Password changed successfully.')
    } catch (err) {
      next(err)
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.logout(req.user!.userId, req.user?.sessionId)
      return sendSuccess(res, {}, 'Signed out of this device.')
    } catch (err) {
      next(err)
    }
  }

  async logoutAll(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await authService.logoutAll(req.user!.userId)
      return sendSuccess(res, { signedOut: count }, `Signed out of ${count} device${count === 1 ? '' : 's'}.`)
    } catch (err) {
      next(err)
    }
  }
}

export const authController = new AuthController()
