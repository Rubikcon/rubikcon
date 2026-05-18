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
  password: z.string().min(0), // password can be empty during password-reset window
  // When true and the device limit has been hit, expire all existing
  // sessions for this user before issuing the new one. Used by the
  // "Sign out other devices" flow on the login page.
  forceLogoutOthers: z.boolean().optional(),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SALT_ROUNDS = 12

function sanitizeUser(user: { id: string; email: string; name: string | null; role: string; createdAt: Date }, onboardingCompleted = false) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
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

    const existing = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    })
    if (existing) {
      const passwordMatch = await bcrypt.compare(password, existing.password)
      if (!passwordMatch) {
        return sendError(res, 'An account with this email already exists. Please log in instead.', 409)
      }

      const profile = existing.profile ?? await prisma.userProfile.create({
        data: { userId: existing.id },
      })
      const token = signToken({ userId: existing.id, email: existing.email, role: existing.role })

      return sendSuccess(
        res,
        { user: sanitizeUser(existing, profile.onboardingCompleted), token },
        'Account already exists. Logged in successfully.'
      )
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        // Create empty profile record so onboardingCompleted = false.
        profile: { create: {} },
      },
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

    const { password, forceLogoutOthers } = parsed.data
    const email = parsed.data.email.trim().toLowerCase()

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    })
    if (!user) {
      return sendError(res, 'Invalid email or password.', 401)
    }

    // Check if password reset is active (blank password allowed)
    const hasActiveReset = user.passwordResetToken && user.passwordResetExpiresAt && new Date() < user.passwordResetExpiresAt
    const passwordMatch = password === '' && hasActiveReset ? true : await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return sendError(res, 'Invalid email or password.', 401)
    }

    // Check active sessions (limit to 5 concurrent devices). If the user
    // opted in via `forceLogoutOthers`, expire all existing sessions first
    // so they can sign in cleanly without juggling other devices.
    const activeSessions = await prisma.session.findMany({
      where: {
        userId: user.id,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'asc' },
    })

    const DEVICE_LIMIT = 5
    if (activeSessions.length >= DEVICE_LIMIT) {
      if (forceLogoutOthers) {
        await prisma.session.updateMany({
          where: { userId: user.id, expiresAt: { gt: new Date() } },
          data: { expiresAt: new Date() },
        })
      } else {
        return sendError(
          res,
          `You're signed in on ${activeSessions.length} other device${activeSessions.length === 1 ? '' : 's'}. Sign out on another device, or use "Sign out other devices" below to continue here.`,
          401,
          { code: 'DEVICE_LIMIT', activeSessions: activeSessions.length, limit: DEVICE_LIMIT }
        )
      }
    }

    const onboardingCompleted = user.profile?.onboardingCompleted ?? false
    const token = signToken({ userId: user.id, email: user.email, role: user.role })

    // Create new session
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30-day session
    await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt,
      },
    })

    // Return reset token if user logged in with blank password during reset
    const resetData = hasActiveReset && password === '' ? { resetToken: user.passwordResetToken } : {}

    return sendSuccess(res, { user: sanitizeUser(user, onboardingCompleted), token, ...resetData }, 'Logged in successfully.')
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

// ─── POST /superadmin/users/:userId/reset-password ───────────────────────────

router.post('/superadmin/users/:userId/reset-password', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'SUPER_ADMIN') {
      return sendError(res, 'Only super admins can reset user passwords.', 403)
    }

    const user = await prisma.user.findUnique({ where: { id: req.params.userId } })
    if (!user) return sendError(res, 'User not found.', 404)

    // Generate a simple reset token (in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await prisma.user.update({
      where: { id: req.params.userId },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiresAt: expiresAt,
      },
    })

    return sendSuccess(res, { resetToken, expiresAt }, 'Password reset initiated. User can now login with a blank password.')
  } catch (err) {
    next(err)
  }
})

// ─── POST /auth/confirm-reset-password ────────────────────────────────────────

router.post('/confirm-reset-password', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = z.object({
      resetToken: z.string().min(1, 'Reset token is required'),
      newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    }).safeParse(req.body)

    if (!parsed.success) {
      return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const { resetToken, newPassword } = parsed.data

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    })

    if (!user) return sendError(res, 'User not found.', 404)

    // Verify reset token is valid
    if (user.passwordResetToken !== resetToken || !user.passwordResetExpiresAt || new Date() > user.passwordResetExpiresAt) {
      return sendError(res, 'Reset token is invalid or expired.', 401)
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)

    await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    })

    return sendSuccess(res, {}, 'Password reset successfully.')
  } catch (err) {
    next(err)
  }
})

// ─── POST /auth/change-password ────────────────────────────────────────────────

router.post('/change-password', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = z.object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    }).safeParse(req.body)

    if (!parsed.success) {
      return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const { currentPassword, newPassword } = parsed.data

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    })

    if (!user) return sendError(res, 'User not found.', 404)

    const passwordMatch = await bcrypt.compare(currentPassword, user.password)
    if (!passwordMatch) {
      return sendError(res, 'Current password is incorrect.', 401)
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)

    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { password: hashedPassword },
    })

    return sendSuccess(res, {}, 'Password changed successfully.')
  } catch (err) {
    next(err)
  }
})

// ─── POST /auth/logout ────────────────────────────────────────────────────────

router.post('/logout', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Mark all sessions for this user as expired
    await prisma.session.updateMany({
      where: { userId: req.user!.userId },
      data: { expiresAt: new Date() },
    })
    return sendSuccess(res, {}, 'Logged out successfully.')
  } catch (err) {
    next(err)
  }
})

export default router
