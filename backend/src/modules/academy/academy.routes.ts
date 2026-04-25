import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import prisma from '../../config/database'
import { sendSuccess, sendError } from '../../utils/response'
import { requireAuth, optionalAuth } from '../../middleware/auth.middleware'

const router = Router()

// ─── GET /academy/course — list all published courses ────────────────────────

router.get('/course', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const courses = await prisma.course.findMany({
      where: { published: true },
      include: {
        modules: {
          orderBy: { position: 'asc' },
          include: {
            lessons: {
              orderBy: { position: 'asc' },
              select: { id: true, title: true, duration: true, position: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return sendSuccess(res, courses)
  } catch (err) {
    next(err)
  }
})

// ─── GET /academy/course/:slug — single course ───────────────────────────────

router.get('/course/:slug', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await prisma.course.findUnique({
      where: { slug: req.params.slug },
      include: {
        modules: {
          orderBy: { position: 'asc' },
          include: {
            lessons: {
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    })
    if (!course) return sendError(res, 'Course not found.', 404)
    return sendSuccess(res, course)
  } catch (err) {
    next(err)
  }
})

// ─── GET /academy/lesson/:id — single lesson ─────────────────────────────────

router.get('/lesson/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id },
      include: { module: { include: { course: true } } },
    })
    if (!lesson) return sendError(res, 'Lesson not found.', 404)
    return sendSuccess(res, lesson)
  } catch (err) {
    next(err)
  }
})

// ─── POST /academy/progress — mark a lesson complete ─────────────────────────

const progressSchema = z.object({
  lessonId: z.string().uuid('Invalid lesson ID'),
  completed: z.boolean().default(true),
})

router.post('/progress', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = progressSchema.safeParse(req.body)
    if (!parsed.success) {
      return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const { lessonId, completed } = parsed.data
    const userId = req.user!.userId

    // Verify lesson exists
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
    if (!lesson) return sendError(res, 'Lesson not found.', 404)

    const progress = await prisma.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId, completed },
      update: { completed, updatedAt: new Date() },
    })

    return sendSuccess(res, progress, 'Progress updated.')
  } catch (err) {
    next(err)
  }
})

// ─── GET /academy/progress — get all progress for current user ───────────────

router.get('/progress', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const progress = await prisma.progress.findMany({
      where: { userId: req.user!.userId },
      include: { lesson: { select: { id: true, title: true, moduleId: true } } },
    })
    return sendSuccess(res, progress)
  } catch (err) {
    next(err)
  }
})

export default router
