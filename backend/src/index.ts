import express from 'express'
import cors, { CorsOptions } from 'cors'
import compression from 'compression'
import { config } from './config/env'
import prisma from './config/database'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'
import { sendEmailInBackground } from './utils/mailer'
import { bugAlertEmail } from './utils/emailTemplates'

const BUG_ALERT_RECIPIENT = 'bdlsmdsadiq@gmail.com'

function alertProcessError(label: string, err: unknown): void {
  const error = err instanceof Error ? err : new Error(String(err))
  console.error(`[${label}]`, error)
  const tpl = bugAlertEmail({
    errorName: `${label}: ${error.name}`,
    errorMessage: error.message,
    stack: error.stack ?? '',
    method: 'PROCESS',
    path: label,
    timestamp: new Date().toISOString(),
  })
  sendEmailInBackground({ to: BUG_ALERT_RECIPIENT, subject: tpl.subject, html: tpl.html, text: tpl.text })
}

process.on('uncaughtException', (err) => {
  alertProcessError('uncaughtException', err)
  // Give the mailer a moment to fire before the process exits
  setTimeout(() => process.exit(1), 1000)
})

process.on('unhandledRejection', (reason) => {
  alertProcessError('unhandledRejection', reason)
})

// Routes
import authRoutes from './modules/auth/auth.routes'
import academyRoutes from './modules/academy/academy.routes'
import gamesRoutes from './modules/games/games.routes'
import gigsRoutes from './modules/gigs/gigs.routes'

const app = express()

// ─── Global Middleware ────────────────────────────────────────────────────────

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks, etc.)
    if (!origin) return callback(null, true)
    if (config.allowedOrigins.includes(origin)) return callback(null, true)
    // Return false (no header) rather than throwing — avoids a 500 on bad origins
    callback(null, false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

// Compression middleware for faster responses
app.use(compression())

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// API responses are personalised (optionalAuth mixes enrollment state into
// otherwise-public payloads), so nothing here may be cached by shared caches.
// A previous "cache API GETs for 5 minutes, public" rule was the root of
// courses appearing and disappearing between refreshes — never reintroduce
// `public` caching on these routes.
app.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

// Request logger (dev only)
if (config.isDev) {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
    next()
  })
}

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'rubikcon-api',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
})

app.get('/health/db', async (_req, res, next) => {
  try {
    const [schema] = await prisma.$queryRaw<Array<{
      usersExists: boolean
      userProfilesExists: boolean
    }>>`
      SELECT
        to_regclass('public.users') IS NOT NULL AS "usersExists",
        to_regclass('public.user_profiles') IS NOT NULL AS "userProfilesExists"
    `
    const userCount = schema.usersExists ? await prisma.user.count() : null

    res.json({
      status: schema.usersExists && schema.userProfilesExists ? 'ok' : 'schema_mismatch',
      database: {
        usersExists: schema.usersExists,
        userProfilesExists: schema.userProfilesExists,
        userCount,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    next(err)
  }
})

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/auth', authRoutes)
app.use('/academy', academyRoutes)
app.use('/games', gamesRoutes)
app.use('/gigs', gigsRoutes)

// ─── 404 + Error Handlers ─────────────────────────────────────────────────────

app.use(notFoundHandler)
app.use(errorHandler)

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(config.port, () => {
  console.log(`
╔═══════════════════════════════════════╗
║       Rubikcon API Server             ║
╠═══════════════════════════════════════╣
║  Port    : ${config.port}                       ║
║  Env     : ${config.nodeEnv.padEnd(14)}         ║
║  Health  : http://localhost:${config.port}/health  ║
╚═══════════════════════════════════════╝
  `)
})

export default app
