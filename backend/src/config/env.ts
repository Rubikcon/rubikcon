import dotenv from 'dotenv'
dotenv.config()

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'https://academy.rubikconnexus.com',
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
  jwtExpiresIn: process.env.JWT_EXPIRES_IN?.trim() || '7d',
  allowedOrigins: [...new Set([...defaultAllowedOrigins, ...configuredAllowedOrigins])],
  isDev: process.env.NODE_ENV !== 'production',
}
