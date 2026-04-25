import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import prisma from '../../config/database'
import { sendSuccess, sendError } from '../../utils/response'
import { optionalAuth } from '../../middleware/auth.middleware'

const router = Router()

const SESSION_TTL_HOURS = 24

// ─── POST /games/session/start ───────────────────────────────────────────────

router.post('/session/start', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000)

    const session = await prisma.session.create({
      data: {
        userId: req.user?.userId ?? null,
        expiresAt,
      },
    })

    return sendSuccess(res, { sessionId: session.id, expiresAt }, 'Session started.', 201)
  } catch (err) {
    next(err)
  }
})

// ─── GET /games/session/:id ───────────────────────────────────────────────────

router.get('/session/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await prisma.session.findUnique({
      where: { id: req.params.id },
      include: {
        scores: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    if (!session) return sendError(res, 'Session not found.', 404)

    if (session.expiresAt < new Date()) {
      return sendError(res, 'Session has expired.', 410)
    }

    return sendSuccess(res, session)
  } catch (err) {
    next(err)
  }
})

// ─── POST /games/score ────────────────────────────────────────────────────────

const scoreSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  gameId: z.string().min(1, 'Game ID is required'),
  score: z.number().int().nonnegative('Score must be a non-negative integer'),
})

router.post('/score', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = scoreSchema.safeParse(req.body)
    if (!parsed.success) {
      return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const { sessionId, gameId, score } = parsed.data

    // Validate session
    const session = await prisma.session.findUnique({ where: { id: sessionId } })
    if (!session) return sendError(res, 'Session not found.', 404)
    if (session.expiresAt < new Date()) return sendError(res, 'Session has expired.', 410)

    const newScore = await prisma.score.create({
      data: {
        sessionId,
        gameId,
        score,
        userId: req.user?.userId ?? null,
      },
    })

    return sendSuccess(res, newScore, 'Score saved.', 201)
  } catch (err) {
    next(err)
  }
})

// ─── GET /games/leaderboard/:gameId ──────────────────────────────────────────

router.get('/leaderboard/:gameId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const scores = await prisma.score.findMany({
      where: { gameId: req.params.gameId },
      orderBy: { score: 'desc' },
      take: 20,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })
    return sendSuccess(res, scores)
  } catch (err) {
    next(err)
  }
})

// ─── GET /games/leaderboard — global top scores ──────────────────────────────

router.get('/leaderboard', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const scores = await prisma.score.findMany({
      orderBy: { score: 'desc' },
      take: 50,
      include: {
        user: { select: { id: true, name: true } },
      },
    })
    return sendSuccess(res, scores)
  } catch (err) {
    next(err)
  }
})

export default router
