import { Request, Response, NextFunction } from 'express'
import { verifyToken, sendError, JWTPayload } from '../utils/response'
import prisma from '../config/database'

// Extend Express Request to carry user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload
    }
  }
}

// 30-day session row; we also slide the window on activity if < 7 days remain.
const SESSION_DURATION_DAYS = 30
const SLIDE_THRESHOLD_DAYS = 7

function addDays(d: Date, days: number): Date {
  const out = new Date(d)
  out.setDate(out.getDate() + days)
  return out
}

/**
 * Validate the JWT, then validate that the linked DB session still exists and
 * hasn't been expired (e.g. by logout). If the session is fine and is getting
 * close to expiring (< SLIDE_THRESHOLD_DAYS remaining), extend it so active
 * users effectively never get force-logged-out.
 *
 * Backwards compatibility: tokens issued before the session-binding rollout
 * lack a `sessionId` claim. Rather than mass-logout everyone on deploy day,
 * we accept those legacy tokens but don't slide anything. They'll naturally
 * expire and be replaced by session-bound tokens on the next login.
 */
async function validateSession(payload: JWTPayload): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!payload.sessionId) {
    // Legacy token (signed before this change). Accept until it expires.
    return { ok: true }
  }
  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    select: { id: true, userId: true, expiresAt: true },
  })
  if (!session) return { ok: false, reason: 'Session not found. Please log in again.' }
  if (session.userId !== payload.userId) {
    // Should never happen unless something is tampered with.
    return { ok: false, reason: 'Session does not match this user. Please log in again.' }
  }
  const now = new Date()
  if (session.expiresAt <= now) {
    return { ok: false, reason: 'Your session has ended. Please log in again.' }
  }
  // Slide the window when nearing expiry — keeps active users logged in.
  const msUntilExpiry = session.expiresAt.getTime() - now.getTime()
  const thresholdMs = SLIDE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000
  if (msUntilExpiry < thresholdMs) {
    await prisma.session.update({
      where: { id: session.id },
      data: { expiresAt: addDays(now, SESSION_DURATION_DAYS) },
    })
  }
  return { ok: true }
}

// Strictly require valid JWT AND an active DB session.
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    sendError(res, 'Authentication required. Provide a Bearer token.', 401)
    return
  }

  const token = authHeader.slice(7)
  try {
    const payload = verifyToken(token)
    const sessionCheck = await validateSession(payload)
    if (!sessionCheck.ok) {
      sendError(res, sessionCheck.reason, 401)
      return
    }
    req.user = payload
    next()
  } catch {
    sendError(res, 'Invalid or expired token. Please log in again.', 401)
  }
}

// Optionally attach user (doesn't fail if no token).
// Still honors session-revocation so a logged-out token doesn't leak data.
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = verifyToken(authHeader.slice(7))
      const sessionCheck = await validateSession(payload)
      if (sessionCheck.ok) req.user = payload
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next()
}

// Admin-only guard (must be used after requireAuth)
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
    sendError(res, 'Forbidden. Admin access required.', 403)
    return
  }
  next()
}

// Super admin-only guard (must be used after requireAuth)
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'SUPER_ADMIN') {
    sendError(res, 'Forbidden. Super admin access required.', 403)
    return
  }
  next()
}
