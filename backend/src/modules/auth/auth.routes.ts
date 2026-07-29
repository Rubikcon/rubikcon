import { Router } from 'express'

import { requireAuth } from '../../middleware/auth.middleware'
import { authController } from './controllers/auth.controller'
import './auth.swagger'

const router = Router()

// Register a new user
router.post('/signup', authController.signup)

// Authenticate a user and create a session
router.post('/login', authController.login)

// Get current authenticated user details
router.get('/me', requireAuth, authController.getMe)

// Complete user onboarding profile
router.post('/onboarding', requireAuth, authController.onboarding)

// Request a password reset link
router.post('/forgot-password', authController.forgotPassword)

// Initiate a password reset on behalf of a user (Super Admin only)
router.post('/superadmin/users/:userId/reset-password', requireAuth, authController.superAdminResetPassword)

// Confirm a password reset and set new password
router.post('/confirm-reset-password', requireAuth, authController.confirmResetPassword)

// Change current password
router.post('/change-password', requireAuth, authController.changePassword)

// Sign out of the current device
router.post('/logout', requireAuth, authController.logout)

// Sign out of all active devices
router.post('/logout-all', requireAuth, authController.logoutAll)

export default router
