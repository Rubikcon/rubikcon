import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import prisma from '../../config/database'
import { sendSuccess, sendError, sendPaginated } from '../../utils/response'
import { requireAuth, optionalAuth } from '../../middleware/auth.middleware'

const router = Router()

// ─── Validation ───────────────────────────────────────────────────────────────

const createGigSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  budget: z.number().positive('Budget must be positive'),
  budgetType: z.enum(['FIXED', 'HOURLY']).default('FIXED'),
  currency: z.enum(['ETH', 'USDC', 'MATIC']).default('USDC'),
  category: z.string().min(1, 'Category is required'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  difficulty: z.enum(['ENTRY', 'MID', 'SENIOR']).default('MID'),
  deadline: z.string().min(1, 'Deadline is required'),
  remote: z.boolean().default(true),
})

const applySchema = z.object({
  gigId: z.string().uuid('Invalid gig ID'),
  proposal: z.string().min(50, 'Proposal must be at least 50 characters'),
  rate: z.number().positive().optional(),
})

// ─── GET /gigs ────────────────────────────────────────────────────────────────

router.get('/', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(50, parseInt(req.query.limit as string) || 12)
    const skip = (page - 1) * limit
    const category = req.query.category as string | undefined
    const difficulty = req.query.difficulty as string | undefined
    const currency = req.query.currency as string | undefined
    const search = req.query.search as string | undefined

    const where: Record<string, unknown> = { status: 'OPEN' }
    if (category) where.category = category
    if (difficulty) where.difficulty = difficulty
    if (currency) where.currency = currency
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [gigs, total] = await Promise.all([
      prisma.gig.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        include: {
          poster: { select: { id: true, name: true, email: true } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.gig.count({ where }),
    ])

    return sendPaginated(res, gigs, total, page, limit)
  } catch (err) {
    next(err)
  }
})

// ─── GET /gigs/:id ────────────────────────────────────────────────────────────

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gig = await prisma.gig.findUnique({
      where: { id: req.params.id },
      include: {
        poster: { select: { id: true, name: true, email: true, createdAt: true } },
        _count: { select: { applications: true } },
      },
    })
    if (!gig) return sendError(res, 'Gig not found.', 404)
    return sendSuccess(res, gig)
  } catch (err) {
    next(err)
  }
})

// ─── POST /gigs ───────────────────────────────────────────────────────────────

router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createGigSchema.safeParse(req.body)
    if (!parsed.success) {
      return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const gig = await prisma.gig.create({
      data: { ...parsed.data, posterId: req.user!.userId },
      include: {
        poster: { select: { id: true, name: true, email: true } },
      },
    })

    return sendSuccess(res, gig, 'Gig posted successfully.', 201)
  } catch (err) {
    next(err)
  }
})

// ─── POST /gigs/apply ─────────────────────────────────────────────────────────

router.post('/apply', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = applySchema.safeParse(req.body)
    if (!parsed.success) {
      return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const { gigId, proposal, rate } = parsed.data
    const userId = req.user!.userId

    // Check gig exists and is open
    const gig = await prisma.gig.findUnique({ where: { id: gigId } })
    if (!gig) return sendError(res, 'Gig not found.', 404)
    if (gig.status !== 'OPEN') return sendError(res, 'This gig is no longer accepting applications.', 400)
    if (gig.posterId === userId) return sendError(res, 'You cannot apply to your own gig.', 400)

    // Check duplicate application
    const existing = await prisma.application.findUnique({
      where: { gigId_userId: { gigId, userId } },
    })
    if (existing) return sendError(res, 'You have already applied to this gig.', 409)

    const application = await prisma.application.create({
      data: { gigId, userId, proposal, rate: rate ?? null },
      include: {
        gig: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return sendSuccess(res, application, 'Application submitted successfully.', 201)
  } catch (err) {
    next(err)
  }
})

// ─── GET /gigs/:id/applications (poster only) ─────────────────────────────────

router.get('/:id/applications', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gig = await prisma.gig.findUnique({ where: { id: req.params.id } })
    if (!gig) return sendError(res, 'Gig not found.', 404)
    if (gig.posterId !== req.user!.userId) {
      return sendError(res, 'Only the gig poster can view applications.', 403)
    }

    const applications = await prisma.application.findMany({
      where: { gigId: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return sendSuccess(res, applications)
  } catch (err) {
    next(err)
  }
})

export default router
