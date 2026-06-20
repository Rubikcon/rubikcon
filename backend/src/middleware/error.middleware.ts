import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { sendEmailInBackground } from '../utils/mailer'
import { bugAlertEmail } from '../utils/emailTemplates'
import { config } from '../config/env'

const BUG_ALERT_RECIPIENT = 'bdlsmdsadiq@gmail.com'

/**
 * Throw this anywhere in a route handler instead of calling sendError + return.
 * The global errorHandler picks it up and responds with the correct status.
 *
 * Example:
 *   throw new AppError('Course not found.', 404)
 *   throw new AppError('Validation failed', 400, parsed.error.flatten().fieldErrors)
 */
export class AppError extends Error {
  constructor(
    public override readonly message: string,
    public readonly statusCode: number = 500,
    public readonly errors?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

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
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaMessages: Record<string, { status: number; message: string }> = {
      P2002: { status: 409, message: 'A record with this value already exists.' },
      P2025: { status: 404, message: 'Record not found.' },
      P2003: { status: 409, message: 'Operation failed due to a related record constraint.' },
      P2014: { status: 409, message: 'The change you are trying to make would violate a required relation.' },
    }
    const mapped = prismaMessages[err.code]
    if (mapped) {
      res.status(mapped.status).json({
        success: false,
        message: mapped.message,
        timestamp: new Date().toISOString(),
      })
      return
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      message: 'Invalid data provided.',
      timestamp: new Date().toISOString(),
    })
    return
  }

  // ── Unexpected / unhandled — log + alert ──────────────────────────────────
  console.error('[Unhandled Error]', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    userId: req.user?.userId,
  })

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
