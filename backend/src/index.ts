import express from 'express'
import cors from 'cors'
import { config } from './config/env'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'

// Routes
import authRoutes from './modules/auth/auth.routes'
import academyRoutes from './modules/academy/academy.routes'
import gamesRoutes from './modules/games/games.routes'
import gigsRoutes from './modules/gigs/gigs.routes'

const app = express()

// ─── Global Middleware ────────────────────────────────────────────────────────

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true)
    if (config.allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS: Origin ${origin} not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

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
