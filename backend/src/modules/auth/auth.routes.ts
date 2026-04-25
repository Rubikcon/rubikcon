import { Router, Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import prisma from '../../config/database'
import { sendSuccess, sendError, signToken } from '../../utils/response'
import { requireAuth } from '../../middleware/auth.middleware'

const router = Router()

// ─── Validation Schemas ───────────────────────────────────────────────────────

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SALT_ROUNDS = 12

function sanitizeUser(user: { id: string; email: string; name: string | null; role: string; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  }
}

// ─── POST /auth/signup ────────────────────────────────────────────────────────

router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = signupSchema.safeParse(req.body)
    if (!parsed.success) {
      return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const { email, password, name } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return sendError(res, 'An account with this email already exists.', 409)
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name: name || null },
    })

    const token = signToken({ userId: user.id, email: user.email, role: user.role })

    return sendSuccess(res, { user: sanitizeUser(user), token }, 'Account created successfully.', 201)
  } catch (err) {
    next(err)
  }
})

// ─── POST /auth/login ─────────────────────────────────────────────────────────

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return sendError(res, 'Invalid email or password.', 401)
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return sendError(res, 'Invalid email or password.', 401)
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role })

    return sendSuccess(res, { user: sanitizeUser(user), token }, 'Logged in successfully.')
  } catch (err) {
    next(err)
  }
})

// ─── GET /auth/me ─────────────────────────────────────────────────────────────

router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
    if (!user) return sendError(res, 'User not found.', 404)
    return sendSuccess(res, sanitizeUser(user))
  } catch (err) {
    next(err)
  }
})

export default router
