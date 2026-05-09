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

function sanitizeUser(user: { id: string; email: string; name: string | null; role: string; createdAt: Date }, onboardingCompleted = false) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    onboardingCompleted,
  }
}

// ─── POST /auth/signup ────────────────────────────────────────────────────────

router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = signupSchema.safeParse(req.body)
    if (!parsed.success) {
      return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const { password, name } = parsed.data
    const email = parsed.data.email.toLowerCase()

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return sendError(res, 'An account with this email already exists.', 409)
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const user = await prisma.$transaction(async tx => {
      const createdUser = await tx.user.create({
        data: { email, password: hashedPassword, name: name || null },
      })

      // Create empty profile record so onboardingCompleted = false.
      await tx.userProfile.create({
        data: { userId: createdUser.id },
      })

      return createdUser
    })

    const token = signToken({ userId: user.id, email: user.email, role: user.role })

    return sendSuccess(res, { user: sanitizeUser(user, false), token }, 'Account created successfully.', 201)
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

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    })
    if (!user) {
      return sendError(res, 'Invalid email or password.', 401)
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return sendError(res, 'Invalid email or password.', 401)
    }

    const onboardingCompleted = user.profile?.onboardingCompleted ?? false
    const token = signToken({ userId: user.id, email: user.email, role: user.role })

    return sendSuccess(res, { user: sanitizeUser(user, onboardingCompleted), token }, 'Logged in successfully.')
  } catch (err) {
    next(err)
  }
})

// ─── GET /auth/me ─────────────────────────────────────────────────────────────

router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { profile: true },
    })
    if (!user) return sendError(res, 'User not found.', 404)
    return sendSuccess(res, sanitizeUser(user, user.profile?.onboardingCompleted ?? false))
  } catch (err) {
    next(err)
  }
})

// ─── POST /auth/onboarding ────────────────────────────────────────────────────

const onboardingSchema = z.object({
  userRole: z.string().min(1).optional(),
  gender: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  experienceLevel: z.string().min(1).optional(),
  motivation: z.string().min(1).optional(),
  learningInterests: z.array(z.string()).optional(),
  telegramHandle: z.string().optional(),
  twitterHandle: z.string().optional(),
})

router.post('/onboarding', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = onboardingSchema.safeParse(req.body)
    if (!parsed.success) {
      return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const { userRole, gender, country, experienceLevel, motivation, learningInterests, telegramHandle, twitterHandle } = parsed.data

    const profileData = {
      userRole,
      gender,
      country,
      experienceLevel,
      motivation,
      learningInterests: learningInterests ?? [],
      telegramHandle: telegramHandle || null,
      twitterHandle: twitterHandle || null,
      onboardingCompleted: true,
      completedAt: new Date(),
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId: req.user!.userId },
      create: { userId: req.user!.userId, ...profileData },
      update: profileData,
    })

    return sendSuccess(res, { onboardingCompleted: profile.onboardingCompleted }, 'Onboarding complete.')
  } catch (err) {
    next(err)
  }
})

export default router
