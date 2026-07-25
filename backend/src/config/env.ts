import dotenv from 'dotenv'
import { z } from 'zod'
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

const envSchema = z.object({
  PORT: z.string().default('4000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.string().default('development'),
  JWT_SECRET: z.string().trim().min(1).default('rubikcon-dev-secret'),
  JWT_EXPIRES_IN: z.string().trim().default('30d'),
  ALLOWED_ORIGINS: z.string().optional(),
  RESEND_API_KEY: z.string().trim().default(''),
  EMAIL_FROM: z.string().trim().default('Rubikcon Academy <noreply@rubikconacademy.xyz>'),
  ACADEMY_URL: z.string().trim().default('https://www.rubikconacademy.xyz'),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('❌ Invalid environment variables:')
  console.error(JSON.stringify(_env.error.format(), null, 2))
  process.exit(1)
}

const parsedEnv = _env.data

const configuredAllowedOrigins = (parsedEnv.ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

export const config = {
  port: parsedEnv.PORT,
  nodeEnv: parsedEnv.NODE_ENV,
  jwtSecret: parsedEnv.JWT_SECRET,
  jwtExpiresIn: parsedEnv.JWT_EXPIRES_IN,
  allowedOrigins: [...new Set([...defaultAllowedOrigins, ...configuredAllowedOrigins])],
  isDev: parsedEnv.NODE_ENV !== 'production',

  resendApiKey: parsedEnv.RESEND_API_KEY,
  emailFrom: parsedEnv.EMAIL_FROM,
  academyUrl: parsedEnv.ACADEMY_URL,
}
