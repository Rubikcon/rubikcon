import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { sendEmailInBackground } from '../../infrastructure/mail/mailer'
import { bugAlertEmail } from '../../infrastructure/mail/templates'
import { config } from '../../config/env'
import { AppError } from './AppError'
import { logger } from '../../infrastructure/logger'

const BUG_ALERT_RECIPIENT = 'bdlsmdsadiq@gmail.com'

function sendBugAlert(err: Error, req: Request): void {
  const tpl = bugAlertEmail({
    errorName: err.name,
    errorMessage: err.message,
    stack: err.stack ?? '',
    method: req.method,
    path: req.path,
    userId: req.user?.userId,
    timestamp: new Date().toISOString(),
  })
  sendEmailInBackground({ to: BUG_ALERT_RECIPIENT, subject: tpl.subject, html: tpl.html, text: tpl.text })
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // ── Expected application error ────────────────────────────────────────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors ?? null,
      timestamp: new Date().toISOString(),
    })
    return
  }

  // ── Zod validation error thrown directly (not via safeParse) ─────────────
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: err.flatten().fieldErrors,
      timestamp: new Date().toISOString(),
    })
    return
  }

  // ── JWT errors ────────────────────────────────────────────────────────────
  if (err instanceof TokenExpiredError) {
    res.status(401).json({
      success: false,
      message: 'Token expired. Please log in again.',
      timestamp: new Date().toISOString(),
    })
    return
  }
  if (err instanceof JsonWebTokenError) {
    res.status(401).json({
      success: false,
      message: 'Invalid token. Please log in again.',
      timestamp: new Date().toISOString(),
    })
    return
  }

  // ── Prisma errors ─────────────────────────────────────────────────────────
  if (err.name === 'PrismaClientKnownRequestError') {
    const code = (err as any).code as string
    const prismaMessages: Record<string, { status: number; message: string }> = {
      P2002: { status: 409, message: 'A record with this value already exists.' },
      P2025: { status: 404, message: 'Record not found.' },
      P2003: { status: 409, message: 'Operation failed due to a related record constraint.' },
      P2014: { status: 409, message: 'The change you are trying to make would violate a required relation.' },
    }
    const mapped = prismaMessages[code]
    if (mapped) {
      res.status(mapped.status).json({
        success: false,
        message: mapped.message,
        timestamp: new Date().toISOString(),
      })
      return
    }
  }

  if (err.name === 'PrismaClientValidationError') {
    res.status(400).json({
      success: false,
      message: 'Invalid data provided.',
      timestamp: new Date().toISOString(),
    })
    return
  }

  // ── Unexpected / unhandled — log + alert ──────────────────────────────────
  logger.error({
    err: err,
    method: req.method,
    path: req.path,
    userId: req.user?.userId,
  }, '[Unhandled Error]')

  sendBugAlert(err, req)

  res.status(500).json({
    success: false,
    message: config.isDev ? err.message : 'Internal server error.',
    timestamp: new Date().toISOString(),
  })
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
  })
}
