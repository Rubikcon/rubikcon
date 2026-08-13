import { Router } from 'express'
import { paymentsController } from './controllers/payments.controller'
import { requireAuth, requireSuperAdmin } from '../../../middleware/auth.middleware'

export const paymentsRoutes = Router()

// Protected routes
paymentsRoutes.post('/initialize', requireAuth, paymentsController.initialize)
paymentsRoutes.get('/:internalReference', requireAuth, paymentsController.getStatus)

// Admin routes
paymentsRoutes.get('/admin/all', requireAuth, requireSuperAdmin, paymentsController.adminGetAll)

// Public Webhook routes (auth by signature inside controller)
// Exporting a separate router for webhooks since they shouldn't be under an auth middleware if attached globally,
// but our structure usually handles it. If attached under /api/academy/payments, webhooks are:
// /api/academy/payments/webhook/paystack
paymentsRoutes.post('/webhook/paystack', paymentsController.paystackWebhook)
paymentsRoutes.post('/webhook/nowpayments', paymentsController.nowpaymentsWebhook)
