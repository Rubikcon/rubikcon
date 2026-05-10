import express from 'express'
import cors, { CorsOptions } from 'cors'
import compression from 'compression'
import { config } from './config/env'
import prisma from './config/database'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'

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

// Cache headers for static assets and API responses
app.use((req, res, next) => {
  if (req.method === 'GET') {
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
      // Cache static assets for 1 year
      res.set('Cache-Control', 'public, max-age=31536000, immutable')
    } else if (req.path.startsWith('/api/')) {
      // Cache API GET responses for 5 minutes
      res.set('Cache-Control', 'public, max-age=300')
    }
  } else {
    // No cache for non-GET requests
    res.set('Cache-Control', 'no-store')
  }
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
