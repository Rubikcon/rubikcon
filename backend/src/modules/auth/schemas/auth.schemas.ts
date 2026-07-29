import { z } from 'zod'
import '@asteasolutions/zod-to-openapi'

export const SignupUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
}).openapi('SignupUserSchema', {
  title: 'Signup User',
  description: 'Payload for signing up a new user',
})

export type SignupUserDto = z.infer<typeof SignupUserSchema>

export const LoginUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(0), // password can be empty during password-reset window
  forceLogoutOthers: z.boolean().optional(),
}).openapi('LoginUserSchema', {
  title: 'Login User',
  description: 'Payload for logging in a user',
})

export type LoginUserDto = z.infer<typeof LoginUserSchema>

export const OnboardUserSchema = z.object({
  userRole: z.string().min(1).optional(),
  gender: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  experienceLevel: z.string().min(1).optional(),
  motivation: z.string().min(1).optional(),
  learningInterests: z.array(z.string()).optional(),
  telegramHandle: z.string().optional(),
  twitterHandle: z.string().optional(),
}).openapi('OnboardUserSchema', {
  title: 'Onboard User',
  description: 'Payload for onboarding a user',
})

export type OnboardUserDto = z.infer<typeof OnboardUserSchema>

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
}).openapi('ForgotPasswordSchema', {
  title: 'Forgot Password',
  description: 'Payload for requesting a password reset',
})

export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>

export const ConfirmResetPasswordSchema = z.object({
  resetToken: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).openapi('ConfirmResetPasswordSchema', {
  title: 'Confirm Reset Password',
  description: 'Payload for confirming a password reset',
})

export type ConfirmResetPasswordDto = z.infer<typeof ConfirmResetPasswordSchema>

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).openapi('ChangePasswordSchema', {
  title: 'Change Password',
  description: 'Payload for changing user password',
})

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>
