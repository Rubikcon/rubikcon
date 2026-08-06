import crypto from 'crypto'

import bcrypt from 'bcryptjs'

import { sendEmailInBackground } from '../../../infrastructure/mail/mailer'
import { passwordResetEmail } from '../../../infrastructure/mail/templates'
import { AppError } from '../../../shared/errors/AppError'
import { signToken } from '../../../utils/response'
import {
  DEVICE_LIMIT,
  PASSWORD_RESET_EXPIRY_MINUTES,
  SALT_ROUNDS,
  SESSION_DURATION_DAYS,
} from '../constants/auth.constants'
import { authRepository } from '../repositories/auth.repository'
import { SanitizeUserResult } from '../types/auth.types'

export class AuthService {
  private sanitizeUser(user: any, onboardingCompleted = false): SanitizeUserResult {
    // For FACILITATOR, onboarding is complete if isProfileComplete is true.
    // Otherwise fallback to the provided onboardingCompleted (which uses userProfile).
    const resolvedOnboarding = user.role === 'FACILITATOR' && user.facilitatorProfile 
      ? user.facilitatorProfile.isProfileComplete 
      : onboardingCompleted

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      onboardingCompleted: resolvedOnboarding,
    }
  }

  private async issueTokenFor(u: { id: string; email: string; role: string }): Promise<string> {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS)
    const session = await authRepository.createSession({ userId: u.id, expiresAt })
    return signToken({ userId: u.id, email: u.email, role: u.role, sessionId: session.id })
  }

  async signup(params: any) {
    const { email: rawEmail, password, name } = params
    const email = rawEmail.toLowerCase()

    const existing = await authRepository.findUserByEmail(email)
    
    if (existing) {
      const passwordMatch = await bcrypt.compare(password, existing.password)
      if (!passwordMatch) {
        throw new AppError('An account with this email already exists. Please log in instead.', 409)
      }

      const profile = existing.profile ?? await authRepository.createProfile(existing.id)
      const token = await this.issueTokenFor(existing)

      return {
        user: this.sanitizeUser(existing, profile.onboardingCompleted),
        token,
        message: 'Account already exists. Logged in successfully.'
      }
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const user = await authRepository.create({
      email,
      password: hashedPassword,
      name: name || null,
      profile: { create: {} },
    })

    await authRepository.update(user.id, { lastActivityAt: new Date() })

    const token = await this.issueTokenFor(user)

    return {
      user: this.sanitizeUser(user, false),
      token,
      message: 'Account created successfully.'
    }
  }

  async login(params: any) {
    const { password, forceLogoutOthers } = params
    const email = params.email.trim().toLowerCase()

    const user = await authRepository.findUserByEmail(email)
    if (!user) {
      throw new AppError('Invalid email or password.', 401)
    }

    const hasActiveReset = user.passwordResetToken && user.passwordResetExpiresAt && new Date() < user.passwordResetExpiresAt
    const passwordMatch = password === '' && hasActiveReset ? true : await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      throw new AppError('Invalid email or password.', 401)
    }

    const activeSessions = await authRepository.findActiveSessions(user.id)
    if (activeSessions.length >= DEVICE_LIMIT) {
      if (forceLogoutOthers) {
        await authRepository.expireAllSessions(user.id)
      } else {
        throw new AppError(
          `You're signed in on ${activeSessions.length} other device${activeSessions.length === 1 ? '' : 's'}. Sign out on another device, or use "Sign out other devices" below to continue here.`,
          401,
          { code: 'DEVICE_LIMIT', activeSessions: activeSessions.length, limit: DEVICE_LIMIT }
        )
      }
    }

    const onboardingCompleted = user.profile?.onboardingCompleted ?? false
    const token = await this.issueTokenFor(user)
    
    // Update last activity timestamp
    await authRepository.update(user.id, { lastActivityAt: new Date() })

    const resetData = hasActiveReset && password === '' ? { resetToken: user.passwordResetToken } : {}

    return {
      user: this.sanitizeUser(user, onboardingCompleted),
      token,
      ...resetData,
      message: 'Logged in successfully.'
    }
  }

  async getMe(userId: string) {
    const user = await authRepository.findById(userId)
    if (!user) {
      throw new AppError('User not found.', 404)
    }
    return this.sanitizeUser(user, user.profile?.onboardingCompleted ?? false)
  }

  async onboarding(userId: string, params: any) {
    const profileData = {
      ...params,
      learningInterests: params.learningInterests ?? [],
      telegramHandle: params.telegramHandle || null,
      twitterHandle: params.twitterHandle || null,
      onboardingCompleted: true,
      completedAt: new Date(),
    }

    const profile = await authRepository.upsertProfile(userId, profileData)
    return { onboardingCompleted: profile.onboardingCompleted }
  }

  async forgotPassword(emailInput: string) {
    const email = emailInput.trim().toLowerCase()
    const user = await authRepository.findUserByEmail(email)
    
    if (!user) return true

    const resetToken = crypto.randomBytes(24).toString('hex')
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000)

    await authRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpiresAt: expiresAt,
    })

    const tpl = passwordResetEmail({ userName: user.name, expiresAt })
    sendEmailInBackground({
      to: user.email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
    })

    return true
  }

  async superAdminResetPassword(userId: string, adminRole?: string) {
    if (adminRole !== 'SUPER_ADMIN') {
      throw new AppError('Only super admins can reset user passwords.', 403)
    }

    const user = await authRepository.findById(userId)
    if (!user) {
      throw new AppError('User not found.', 404)
    }

    const resetToken = crypto.randomBytes(24).toString('hex')
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000)

    await authRepository.update(userId, {
      passwordResetToken: resetToken,
      passwordResetExpiresAt: expiresAt,
    })

    const tpl = passwordResetEmail({ userName: user.name, expiresAt })
    sendEmailInBackground({
      to: user.email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
    })

    return { resetToken, expiresAt }
  }

  async confirmResetPassword(userId: string, params: any, currentSessionId?: string) {
    const { resetToken, newPassword } = params
    
    const user = await authRepository.findById(userId)
    if (!user) {
      throw new AppError('User not found.', 404)
    }

    if (user.passwordResetToken !== resetToken || !user.passwordResetExpiresAt || new Date() > user.passwordResetExpiresAt) {
      throw new AppError('Reset token is invalid or expired.', 401)
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)

    await authRepository.update(userId, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    })

    if (currentSessionId) {
      await authRepository.expireOtherSessions(userId, currentSessionId)
    }

    return true
  }

  async changePassword(userId: string, params: any, currentSessionId?: string) {
    const { currentPassword, newPassword } = params

    const user = await authRepository.findById(userId)
    if (!user) {
      throw new AppError('User not found.', 404)
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password)
    if (!passwordMatch) {
      throw new AppError('Current password is incorrect.', 401)
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)

    await authRepository.update(userId, { password: hashedPassword })

    if (currentSessionId) {
      await authRepository.expireOtherSessions(userId, currentSessionId)
    }

    return true
  }

  async logout(userId: string, currentSessionId?: string) {
    if (currentSessionId) {
      await authRepository.expireSessionById(currentSessionId)
    } else {
      const latest = await authRepository.findLatestActiveSession(userId)
      if (latest) {
        await authRepository.expireSessionById(latest.id)
      }
    }
  }

  async logoutAll(userId: string) {
    const result = await authRepository.expireAllSessions(userId)
    return result.count
  }
}

export const authService = new AuthService()
