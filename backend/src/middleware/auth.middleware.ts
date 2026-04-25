import { Request, Response, NextFunction } from 'express'
import { verifyToken, sendError, JWTPayload } from '../utils/response'

// Extend Express Request to carry user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload
    }
  }
}

// Strictly require valid JWT
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    sendError(res, 'Authentication required. Provide a Bearer token.', 401)
    return
  }

  const token = authHeader.slice(7)
  try {
    req.user = verifyToken(token)
    next()
  } catch {
    sendError(res, 'Invalid or expired token. Please log in again.', 401)
  }
}

// Optionally attach user (doesn't fail if no token)
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    try {
      req.user = verifyToken(authHeader.slice(7))
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next()
}

// Admin-only guard (must be used after requireAuth)
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'ADMIN') {
    sendError(res, 'Forbidden. Admin access required.', 403)
    return
  }
  next()
}
