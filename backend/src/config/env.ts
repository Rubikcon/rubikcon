import dotenv from 'dotenv'
dotenv.config()

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'https://www.rubikconacademy.xyz',
  'https://rubikcon.vercel.app',
  'https://rubikcon-games.vercel.app',
  'https://rubikcon-blockgigs.vercel.app',
]

const configuredAllowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET?.trim() || 'rubikcon-dev-secret',
  // JWT lifetime matches the session row's 30-day expiry so tokens and DB
  // sessions live and die together. The auth middleware slides the session
  // window on activity, so active users effectively never have to re-login.
  jwtExpiresIn: process.env.JWT_EXPIRES_IN?.trim() || '30d',
  allowedOrigins: [...new Set([...defaultAllowedOrigins, ...configuredAllowedOrigins])],
  isDev: process.env.NODE_ENV !== 'production',

  // Email (Resend). If RESEND_API_KEY is unset, the mailer no-ops and just logs,
  // so the app keeps running locally / before email is configured.
  resendApiKey: process.env.RESEND_API_KEY?.trim() || '',
  emailFrom: process.env.EMAIL_FROM?.trim() || 'Rubikcon Academy <noreply@rubikconacademy.xyz>',
  // Public academy URL used to build deep links in emails
  academyUrl: process.env.ACADEMY_URL?.trim() || 'https://www.rubikconacademy.xyz',
}
