import { Request, Response, NextFunction } from 'express'
import { paymentsService } from '../services/payments.service'
import { sendSuccess, sendError } from '../../../../shared/api/response'
import { AppError } from '../../../../shared/errors/AppError'

export class PaymentsController {
  async initialize(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId, currency } = req.body
      const userId = req.user!.userId
      const email = req.user!.email

      if (!courseId || !currency) {
        return sendError(res, 'Course ID and currency are required', 400)
      }

      const result = await paymentsService.initializePayment(userId, email, courseId, currency)
      
      return sendSuccess(res, result, 'Payment initialized successfully')
    } catch (err) {
      next(err)
    }
  }

  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { internalReference } = req.params
      const userId = req.user!.userId

      const status = await paymentsService.getPaymentStatus(internalReference, userId)
      return sendSuccess(res, status, 'Payment status fetched')
    } catch (err) {
      next(err)
    }
  }

  async paystackWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-paystack-signature'] as string
      if (!signature) {
        return sendError(res, 'Missing signature', 401)
      }

      const rawBody = (req as any).rawBody || JSON.stringify(req.body)

      const result = await paymentsService.verifyPaystackWebhook(signature, req.body, rawBody)
      
      return res.status(200).json(result)
    } catch (err) {
      if (err instanceof AppError && err.statusCode === 401) {
        return sendError(res, 'Unauthorized webhook', 401)
      }
      console.error('Paystack webhook error:', err)
      return res.status(200).send('Webhook processed with errors')
    }
  }

  async nowpaymentsWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-nowpayments-sig'] as string
      if (!signature) {
        return sendError(res, 'Missing signature', 401)
      }

      const rawBody = (req as any).rawBody || JSON.stringify(req.body)

      const result = await paymentsService.verifyNowPaymentsWebhook(signature, req.body, rawBody)
      
      return res.status(200).json(result)
    } catch (err) {
      if (err instanceof AppError && err.statusCode === 401) {
        return sendError(res, 'Unauthorized webhook', 401)
      }
      console.error('NOWPayments webhook error:', err)
      return res.status(200).send('Webhook processed with errors')
    }
  }

  adminGetAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const skip = (page - 1) * limit
      
      const { payments, total } = await paymentsService.getAdminPayments(skip, limit)
      return sendSuccess(res, { payments, total, page, limit, totalPages: Math.ceil(total / limit) }, 'Payments fetched')
    } catch (err) {
      next(err)
    }
  }
}

export const paymentsController = new PaymentsController()
