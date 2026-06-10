import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import prisma from '../../config/database'
import { sendSuccess, sendError, sendPaginated } from '../../utils/response'
import { optionalAuth, requireAdmin, requireAuth, requireSuperAdmin } from '../../middleware/auth.middleware'
import { AssignmentSubmissionStatus, CourseStatus, Prisma, QuizAttemptStatus, WeekProgressStatus } from '@prisma/client'
import { sendEmailInBackground } from '../../utils/mailer'
import { assignmentFeedbackEmail, lessonDeepLink, newSubmissionEmail } from '../../utils/emailTemplates'

const router = Router()

const legacyProgressSchema = z.object({
  lessonId: z.string().uuid('Invalid lesson ID'),
  completed: z.boolean().default(true),
})

const saveTermSchema = z.object({
  termId: z.string().uuid('Invalid term ID'),
})

const quizSubmissionSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().uuid('Invalid question ID'),
    selectedOptionId: z.string().uuid('Invalid option ID'),
  })).min(1, 'At least one answer is required'),
})

const assignmentSubmissionSchema = z.object({
  choiceId: z.string().uuid('Invalid choice ID').optional(),
  textResponse: z.string().trim().min(1).max(10000).optional(),
  attachmentName: z.string().trim().min(1).max(255).optional(),
  attachmentUrl: z.string().url('Invalid attachment URL').optional(),
  attachmentMimeType: z.string().trim().min(1).max(120).optional(),
  attachmentSizeBytes: z.number().int().positive().max(10_000_000).optional(),
}).superRefine((value, ctx) => {
  if (!value.textResponse && !value.attachmentUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['textResponse'],
      message: 'Provide a text response or attachment URL.',
    })
  }
})

const feedbackSchema = z.object({
  feedback: z.string().trim().min(2).max(5000),
  rating: z.number().int().min(1).max(5).optional(),
})

const unlockRetakeSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
})

const adminWeekFilterSchema = z.object({
  weekSlug: z.string().optional(),
})

function maskEmail(email: string) {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  if (local.length <= 2) return `${local[0] || '*'}***@${domain}`
  return `${local.slice(0, 2)}***@${domain}`
}

type ProgressSignals = {
  hasQuiz: boolean
  quizSubmitted: boolean
  assignmentCount: number
  assignmentSubmitted: boolean
  manuallyCompleted: boolean
  firstOpenedAt: Date | null
}

/**
 * Derive the WeekProgress status from the lesson's structure + the learner's
 * actions. The rules:
 *
 *   - If the learner explicitly clicked "Mark complete" → COMPLETE
 *   - If the lesson has structured requirements (quiz and/or assignment) and
 *     ALL of them are satisfied → COMPLETE
 *   - If any submission has been made, OR the learner has opened the lesson
 *     at least once → IN_PROGRESS
 *   - Otherwise → NOT_STARTED
 *
 * Side note: lessons with no quiz AND no assignment can only reach COMPLETE
 * via the manual "Mark complete" button. That's intentional — there's no other
 * objective signal to derive completion from.
 */
function deriveWeekProgressStatus(s: ProgressSignals): WeekProgressStatus {
  if (s.manuallyCompleted) return WeekProgressStatus.COMPLETE

  const hasStructured = s.hasQuiz || s.assignmentCount > 0
  if (hasStructured) {
    const quizOk = !s.hasQuiz || s.quizSubmitted
    const assignmentOk = s.assignmentCount === 0 || s.assignmentSubmitted
    if (quizOk && assignmentOk) return WeekProgressStatus.COMPLETE
  }

  if (s.quizSubmitted || s.assignmentSubmitted || s.firstOpenedAt) {
    return WeekProgressStatus.IN_PROGRESS
  }

  return WeekProgressStatus.NOT_STARTED
}

/**
 * Recompute and persist a learner's progress for a lesson. Honors existing
 * `manuallyCompleted` and `firstOpenedAt` markers (we don't clobber them).
 * Pass `touchOpened: true` to stamp `firstOpenedAt` if it's null (used when
 * the learner visits the lesson page).
 */
async function syncWeekProgress(userId: string, weekId: string, opts: { touchOpened?: boolean; manuallyComplete?: boolean } = {}) {
  // Pull current row (if any) so we preserve manuallyCompleted / firstOpenedAt
  // AND so we can implement the "never demote COMPLETE" guarantee — once a
  // learner has passed a lesson, their progress is permanent.
  const existing = await prisma.weekProgress.findUnique({
    where: { userId_weekId: { userId, weekId } },
    select: { status: true, manuallyCompleted: true, firstOpenedAt: true, completedAt: true },
  })

  // Pull the lesson's structure (does it have a quiz, how many assignments).
  // Cheap counts/find on indexed columns.
  const [quizExists, assignmentCount, quizAttempt, assignmentSubmission] = await Promise.all([
    prisma.quiz.findFirst({ where: { weekId }, select: { id: true } }),
    prisma.assignment.count({ where: { weekId } }),
    prisma.quizAttempt.findFirst({ where: { userId, quiz: { weekId } }, select: { id: true } }),
    prisma.assignmentSubmission.findFirst({ where: { userId, assignment: { weekId } }, select: { id: true } }),
  ])

  // Hard guarantee: a learner who has already passed a lesson stays passed,
  // regardless of what happens to the underlying signals (quiz deletion,
  // facilitator restructuring, etc.). We achieve this by treating any
  // pre-existing COMPLETE row as manually-completed from here on.
  const wasAlreadyComplete = existing?.status === WeekProgressStatus.COMPLETE
  const manuallyCompleted = opts.manuallyComplete === true
    || existing?.manuallyCompleted === true
    || wasAlreadyComplete

  const firstOpenedAt = existing?.firstOpenedAt ?? (opts.touchOpened ? new Date() : null)
  const quizSubmitted = Boolean(quizAttempt)
  const assignmentSubmitted = Boolean(assignmentSubmission)

  const status = deriveWeekProgressStatus({
    hasQuiz: Boolean(quizExists),
    quizSubmitted,
    assignmentCount,
    assignmentSubmitted,
    manuallyCompleted,
    firstOpenedAt,
  })

  // Preserve the original completion timestamp — if the learner already
  // completed this lesson before, that date shouldn't change.
  const completedAt = status === WeekProgressStatus.COMPLETE
    ? (existing?.completedAt ?? new Date())
    : null

  return prisma.weekProgress.upsert({
    where: { userId_weekId: { userId, weekId } },
    create: {
      userId,
      weekId,
      quizSubmitted,
      assignmentSubmitted,
      manuallyCompleted,
      firstOpenedAt,
      status,
      completedAt,
    },
    update: {
      quizSubmitted,
      assignmentSubmitted,
      manuallyCompleted,
      firstOpenedAt,
      status,
      completedAt,
    },
  })
}

function serializeWeekSummary(
  week: {
    id: string
    number: number
    slug: string
    title: string
    durationLabel: string
    estimatedCompletionMinutes: number
    moduleId?: string | null
    module?: { id: string; title: string; description: string | null } | null
  },
  progress?: {
    status: WeekProgressStatus
    quizSubmitted: boolean
    assignmentSubmitted: boolean
    completedAt: Date | null
  } | null
) {
  return {
    id: week.id,
    number: week.number,
    slug: week.slug,
    title: week.title,
    durationLabel: week.durationLabel,
    estimatedCompletionMinutes: week.estimatedCompletionMinutes,
    moduleId: week.moduleId ?? null,
    module: week.module ? { id: week.module.id, title: week.module.title, description: week.module.description } : null,
    progress: progress
      ? {
          status: progress.status,
          quizSubmitted: progress.quizSubmitted,
          assignmentSubmitted: progress.assignmentSubmitted,
          completedAt: progress.completedAt,
        }
      : {
          status: WeekProgressStatus.NOT_STARTED,
          quizSubmitted: false,
          assignmentSubmitted: false,
          completedAt: null,
        },
  }
}

function serializeQuizForDelivery(
  quiz: {
    id: string
    title: string
    passMark: number
    attemptLimit: number
    questions: Array<{
      id: string
      prompt: string
      explanation: string
      position: number
      options: Array<{
        id: string
        label: string
        position: number
        isCorrect: boolean
      }>
    }>
  },
  latestAttempt?: {
    id: string
    score: number
    percentage: number
    submittedAt: Date
    status: QuizAttemptStatus
    answers: Array<{
      questionId: string
      selectedOptionId: string
    }>
  } | null,
  unlockGranted?: boolean
) {
  const selectedOptionByQuestion = new Map(
    (latestAttempt?.answers ?? []).map(answer => [answer.questionId, answer.selectedOptionId])
  )

  return {
    id: quiz.id,
    title: quiz.title,
    passMark: quiz.passMark,
    attemptLimit: quiz.attemptLimit,
    unlockGranted: Boolean(unlockGranted),
    submitted: Boolean(latestAttempt),
    latestAttempt: latestAttempt
      ? {
          id: latestAttempt.id,
          score: latestAttempt.score,
          percentage: latestAttempt.percentage,
          submittedAt: latestAttempt.submittedAt,
          status: latestAttempt.status,
        }
      : null,
    questions: quiz.questions.map(question => ({
      id: question.id,
      prompt: question.prompt,
      explanation: latestAttempt ? question.explanation : null,
      position: question.position,
      options: question.options.map(option => ({
        id: option.id,
        label: option.label,
        position: option.position,
        isCorrect: latestAttempt ? option.isCorrect : undefined,
        isSelected: latestAttempt ? selectedOptionByQuestion.get(question.id) === option.id : false,
      })),
    })),
  }
}

function serializeAssignmentsForDelivery(
  assignments: Array<{
    id: string
    title: string
    instructions: string
    deadline: Date
    allowTextSubmission: boolean
    allowFileUpload: boolean
    position: number
    choices: Array<{
      id: string
      title: string
      description: string
      position: number
    }>
  }>,
  submissions: Array<{
    id: string
    assignmentId: string
    choiceId: string | null
    textResponse: string | null
    attachmentName: string | null
    attachmentUrl: string | null
    attachmentMimeType: string | null
    attachmentSizeBytes: number | null
    status: AssignmentSubmissionStatus
    submittedAt: Date
    reviewedAt: Date | null
    feedback: Array<{
      id: string
      feedback: string
      rating: number | null
      createdAt: Date
      reviewer: {
        id: string
        name: string | null
        email: string
      }
    }>
  }>
) {
  const latestSubmissionByAssignment = new Map<string, typeof submissions[number]>()
  for (const submission of submissions) {
    const existing = latestSubmissionByAssignment.get(submission.assignmentId)
    if (!existing || submission.submittedAt > existing.submittedAt) {
      latestSubmissionByAssignment.set(submission.assignmentId, submission)
    }
  }

  return assignments.map(assignment => {
    const latestSubmission = latestSubmissionByAssignment.get(assignment.id)
    return {
      id: assignment.id,
      title: assignment.title,
      instructions: assignment.instructions,
      deadline: assignment.deadline,
      allowTextSubmission: assignment.allowTextSubmission,
      allowFileUpload: assignment.allowFileUpload,
      position: assignment.position,
      status: latestSubmission?.status ?? 'NOT_STARTED',
      choices: assignment.choices,
      latestSubmission: latestSubmission
        ? {
            id: latestSubmission.id,
            choiceId: latestSubmission.choiceId,
            textResponse: latestSubmission.textResponse,
            attachmentName: latestSubmission.attachmentName,
            attachmentUrl: latestSubmission.attachmentUrl,
            attachmentMimeType: latestSubmission.attachmentMimeType,
            attachmentSizeBytes: latestSubmission.attachmentSizeBytes,
            status: latestSubmission.status,
            submittedAt: latestSubmission.submittedAt,
            reviewedAt: latestSubmission.reviewedAt,
            feedback: latestSubmission.feedback.map(item => ({
              id: item.id,
              feedback: item.feedback,
              rating: item.rating,
              createdAt: item.createdAt,
              reviewerName: item.reviewer.name ?? item.reviewer.email,
            })),
          }
        : null,
    }
  })
}

async function getCourseProgressMap(userId: string, weekIds: string[]) {
  const items = await prisma.weekProgress.findMany({
    where: { userId, weekId: { in: weekIds } },
  })

  return new Map(items.map(item => [item.weekId, item]))
}

async function getUserWeekState(userId: string, weekId: string, quizId?: string | null) {
  const [savedTerms, readItems, weekProgress, latestAttempt, quizUnlock, submissions] = await Promise.all([
    prisma.savedGlossaryTerm.findMany({
      where: { userId, term: { weekId } },
      select: { termId: true },
    }),
    prisma.readingProgress.findMany({
      where: { userId, resource: { weekId } },
      select: { resourceId: true },
    }),
    prisma.weekProgress.findUnique({
      where: { userId_weekId: { userId, weekId } },
    }),
    quizId
      ? prisma.quizAttempt.findFirst({
          where: { userId, quizId },
          orderBy: { submittedAt: 'desc' },
          include: {
            answers: {
              select: {
                questionId: true,
                selectedOptionId: true,
              },
            },
          },
        })
      : Promise.resolve(null),
    quizId
      ? prisma.quizRetakeUnlock.findUnique({
          where: { quizId_userId: { quizId, userId } },
          select: { id: true },
        })
      : Promise.resolve(null),
    prisma.assignmentSubmission.findMany({
      where: { userId, assignment: { weekId } },
      include: {
        feedback: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { submittedAt: 'desc' },
    }),
  ])

  return {
    savedTermIds: savedTerms.map(item => item.termId),
    readResourceIds: readItems.map(item => item.resourceId),
    weekProgress,
    latestAttempt,
    unlockGranted: Boolean(quizUnlock),
    submissions,
  }
}

// New LMS endpoints

// Public course catalog (with optional enrollment status if logged in)
router.get('/courses', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(50, parseInt(req.query.limit as string) || 12)
    const skip = (page - 1) * limit

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where: { published: true },
        select: {
          id: true,
          slug: true,
          title: true,
          tagline: true,
          level: true,
          isPaid: true,
          estimatedDuration: true,
          phaseLabel: true,
          heroImage: true,
          contentUnit: true,
          _count: { select: { weeks: true, enrollments: true } },
          courseFacilitators: {
            select: {
              facilitator: {
                select: { id: true, name: true, title: true, organization: true, photoUrl: true },
              },
            },
            orderBy: { position: 'asc' as const },
          },
          enrollments: req.user
            ? { where: { userId: req.user.userId }, select: { id: true } }
            : false,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.course.count({ where: { published: true } }),
    ])

    const result = courses.map(c => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      tagline: c.tagline,
      level: c.level,
      isPaid: c.isPaid,
      estimatedDuration: c.estimatedDuration,
      phaseLabel: c.phaseLabel,
      heroImage: c.heroImage,
      contentUnit: c.contentUnit,
      weekCount: c._count.weeks,
      facilitators: c.courseFacilitators.map(cf => cf.facilitator),
      enrolled: req.user ? (c.enrollments as { id: string }[]).length > 0 : false,
    }))
    return sendPaginated(res, result, total, page, limit)
  } catch (err) {
    next(err)
  }
})

// Enroll in a course
router.post('/courses/:slug/enroll', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await prisma.course.findUnique({
      where: { slug: req.params.slug, published: true },
      select: { id: true, slug: true, title: true },
    })
    if (!course) return sendError(res, 'Course not found.', 404)

    await prisma.courseEnrollment.upsert({
      where: { userId_courseId: { userId: req.user!.userId, courseId: course.id } },
      create: { userId: req.user!.userId, courseId: course.id },
      update: {},
    })
    return sendSuccess(res, { enrolled: true, courseSlug: course.slug })
  } catch (err) {
    next(err)
  }
})

router.get('/courses/:slug', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await prisma.course.findUnique({
      where: { slug: req.params.slug },
      include: {
        modules: {
          orderBy: { position: 'asc' },
          select: { id: true, title: true, description: true, position: true },
        },
        weeks: {
          where: { published: true },
          orderBy: { number: 'asc' },
          select: {
            id: true,
            number: true,
            slug: true,
            title: true,
            durationLabel: true,
            estimatedCompletionMinutes: true,
            moduleId: true,
            module: { select: { id: true, title: true, description: true } },
          },
        },
        courseFacilitators: {
          include: {
            facilitator: {
              select: { id: true, name: true, title: true, organization: true, photoUrl: true },
            },
          },
          orderBy: { position: 'asc' },
        },
        enrollments: req.user
          ? { where: { userId: req.user.userId }, select: { id: true } }
          : false,
      },
    })

    if (!course || !course.published) {
      return sendError(res, 'Course not found.', 404)
    }

    const enrolled = req.user ? (course.enrollments as { id: string }[]).length > 0 : false
    const weekIds = course.weeks.map(week => week.id)
    const progressMap = (req.user && enrolled) ? await getCourseProgressMap(req.user.userId, weekIds) : new Map()

    const completedCount = course.weeks.filter(week => progressMap.get(week.id)?.status === WeekProgressStatus.COMPLETE).length
    const progressPercent = course.weeks.length
      ? Math.round((completedCount / course.weeks.length) * 100)
      : 0

    return sendSuccess(res, {
      id: course.id,
      slug: course.slug,
      title: course.title,
      tagline: course.tagline,
      description: course.description,
      level: course.level,
      estimatedDuration: course.estimatedDuration,
      phaseLabel: course.phaseLabel,
      heroImage: course.heroImage,
      introVideoUrl: course.introVideoUrl,
      overviewSlideUrl: course.overviewSlideUrl,
      contentUnit: course.contentUnit,
      enrolled,
      facilitators: course.courseFacilitators.map(cf => cf.facilitator),
      progressPercent,
      completedCount,
      totalWeeks: course.weeks.length,
      modules: course.modules,
      weeks: course.weeks.map(week => serializeWeekSummary(week, progressMap.get(week.id))),
    })
  } catch (err) {
    next(err)
  }
})

router.get('/courses/:slug/weeks', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await prisma.course.findUnique({
      where: { slug: req.params.slug },
      include: {
        weeks: {
          where: { published: true },
          orderBy: { number: 'asc' },
          select: {
            id: true,
            number: true,
            slug: true,
            title: true,
            durationLabel: true,
            estimatedCompletionMinutes: true,
          },
        },
      },
    })

    if (!course || !course.published) {
      return sendError(res, 'Course not found.', 404)
    }

    const progressMap = req.user ? await getCourseProgressMap(req.user.userId, course.weeks.map(week => week.id)) : new Map()
    return sendSuccess(
      res,
      course.weeks.map(week => serializeWeekSummary(week, progressMap.get(week.id)))
    )
  } catch (err) {
    next(err)
  }
})

router.get('/weeks/:weekSlug', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const week = await prisma.week.findUnique({
      where: { slug: req.params.weekSlug },
      include: {
        course: true,
        module: true,
        facilitators: {
          include: {
            facilitator: true,
          },
          orderBy: { position: 'asc' },
        },
        topics: {
          orderBy: { position: 'asc' },
        },
        objectives: {
          orderBy: { position: 'asc' },
        },
        slideDecks: {
          orderBy: { position: 'asc' },
          include: {
            sections: {
              orderBy: { position: 'asc' },
            },
          },
        },
        glossaryTerms: {
          orderBy: { position: 'asc' },
        },
        readingResources: {
          orderBy: { position: 'asc' },
        },
        quiz: {
          include: {
            questions: {
              orderBy: { position: 'asc' },
              include: {
                options: {
                  orderBy: { position: 'asc' },
                },
              },
            },
          },
        },
        assignments: {
          orderBy: { position: 'asc' },
          include: {
            choices: {
              orderBy: { position: 'asc' },
            },
          },
        },
        images: {
          orderBy: { position: 'asc' },
        },
        videos: {
          orderBy: { position: 'asc' },
        },
      },
    })

    if (!week || !week.published || !week.course.published) {
      return sendError(res, 'Week not found.', 404)
    }

    // Require enrollment to access week content
    if (!req.user) {
      return sendError(res, 'Log in to access this lesson.', 401)
    }

    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { userId_courseId: { userId: req.user.userId, courseId: week.courseId } },
    })

    if (!enrollment) {
      return sendError(res, 'Enrol in this course to access this lesson.', 403)
    }

    // Touch progress on view — moves the lesson from NOT_STARTED → IN_PROGRESS
    // the first time the learner opens it. Subsequent views are no-ops because
    // firstOpenedAt is preserved. We don't await this — it's bookkeeping, not
    // critical-path, so a failure here shouldn't block lesson loading.
    if (req.user) {
      syncWeekProgress(req.user.userId, week.id, { touchOpened: true }).catch(err => {
        console.error('[progress] touch-on-view failed:', err)
      })
    }

    const courseWeeks = await prisma.week.findMany({
      where: { courseId: week.courseId, published: true },
      orderBy: { number: 'asc' },
      select: { id: true, slug: true, title: true, number: true },
    })

    const currentIndex = courseWeeks.findIndex(item => item.id === week.id)
    const prev = currentIndex > 0 ? courseWeeks[currentIndex - 1] : null
    const nextWeek = currentIndex < courseWeeks.length - 1 ? courseWeeks[currentIndex + 1] : null

    const userState = req.user
      ? await getUserWeekState(req.user.userId, week.id, week.quiz?.id)
      : null

    return sendSuccess(res, {
      id: week.id,
      slug: week.slug,
      number: week.number,
      title: week.title,
      durationLabel: week.durationLabel,
      difficulty: week.difficulty,
      hook: week.hook,
      whatToExpect: week.whatToExpect,
      summary: week.summary,
      estimatedCompletionMinutes: week.estimatedCompletionMinutes,
      videos: [
        // Legacy single video migrated into the list
        ...(week.videoUrl
          ? [{ id: 'legacy', title: week.videoTitle ?? week.title, url: week.videoUrl, description: null, position: 0 }]
          : []),
        // New multi-video records
        ...week.videos.map(v => ({ id: v.id, title: v.title, url: v.url, description: v.description, position: v.position })),
      ],
      module: week.module ? { id: week.module.id, title: week.module.title, description: week.module.description } : null,
      course: {
        id: week.course.id,
        slug: week.course.slug,
        title: week.course.title,
        tagline: week.course.tagline,
        phaseLabel: week.course.phaseLabel,
        contentUnit: week.course.contentUnit,
      },
      navigation: {
        previous: prev,
        next: nextWeek,
      },
      heroSlides: [
        {
          id: 'overview',
          title: 'Week Overview',
          subtitle: `Week ${week.number}`,
          headline: week.title,
          body: week.hook,
          facilitatorNames: week.facilitators.map(item => item.facilitator.name),
        },
        {
          id: 'learn',
          title: 'What You Will Learn',
          items: week.objectives.map(item => item.body),
        },
        {
          id: 'expect',
          title: 'What to Expect',
          items: week.topics.map(item => item.title),
          difficulty: week.difficulty,
          estimatedCompletionMinutes: week.estimatedCompletionMinutes,
        },
      ],
      lessonDetails: {
        title: week.title,
        facilitators: week.facilitators.map(item => ({
          id: item.facilitator.id,
          name: item.facilitator.name,
          title: item.facilitator.title,
          organization: item.facilitator.organization,
          emailMasked: maskEmail(item.facilitator.email),
          emailMailto: `mailto:${item.facilitator.email}`,
          linkedinUrl: item.facilitator.linkedinUrl,
          photoUrl: item.facilitator.photoUrl,
          bio: item.facilitator.bio,
        })),
        topics: week.topics.map(item => item.title),
        objectives: week.objectives.map(item => item.body),
        whatToExpect: week.whatToExpect,
        summary: week.summary,
        lessonContent: week.lessonContent ?? null,
        images: week.images.map(img => ({
          id: img.id,
          url: img.url,
          alt: img.alt,
          caption: img.caption,
          position: img.position,
        })),
      },
      resources: {
        // Keep `slideDeck` (first/primary deck) for backwards compatibility
        slideDeck: week.slideDecks[0]
          ? {
              id: week.slideDecks[0].id,
              title: week.slideDecks[0].title,
              url: week.slideDecks[0].url,
              slideCount: week.slideDecks[0].slideCount,
              lastUpdatedAt: week.slideDecks[0].lastUpdatedAt,
              viewerType: week.slideDecks[0].viewerType,
              sections: week.slideDecks[0].sections.map(section => section.label),
            }
          : null,
        // New field — full list of decks for multi-slide rendering
        slideDecks: week.slideDecks.map(deck => ({
          id: deck.id,
          title: deck.title,
          url: deck.url,
          slideCount: deck.slideCount,
          lastUpdatedAt: deck.lastUpdatedAt,
          viewerType: deck.viewerType,
          position: deck.position,
          sections: deck.sections.map(section => section.label),
        })),
        glossary: week.glossaryTerms.map(term => ({
          id: term.id,
          term: term.term,
          definition: term.definition,
          example: term.example,
          position: term.position,
          saved: userState ? userState.savedTermIds.includes(term.id) : false,
        })),
        readings: week.readingResources.map(resource => ({
          id: resource.id,
          title: resource.title,
          source: resource.source,
          url: resource.url,
          description: resource.description,
          type: resource.type,
          position: resource.position,
          read: userState ? userState.readResourceIds.includes(resource.id) : false,
        })),
      },
      assignment: {
        quiz: week.quiz ? serializeQuizForDelivery(week.quiz, userState?.latestAttempt, userState?.unlockGranted) : null,
        tasks: serializeAssignmentsForDelivery(week.assignments, userState?.submissions ?? []),
      },
      progress: userState?.weekProgress
        ? {
            status: userState.weekProgress.status,
            quizSubmitted: userState.weekProgress.quizSubmitted,
            assignmentSubmitted: userState.weekProgress.assignmentSubmitted,
            completedAt: userState.weekProgress.completedAt,
          }
        : {
            status: WeekProgressStatus.NOT_STARTED,
            quizSubmitted: false,
            assignmentSubmitted: false,
            completedAt: null,
          },
    })
  } catch (err) {
    next(err)
  }
})

// ─── POST /weeks/:weekSlug/complete ───────────────────────────────────────
//
// Manual "Mark lesson complete" action by the learner. Used for lessons that
// have no quiz/assignment to derive completion from. Idempotent — calling it
// repeatedly is a no-op after the first success.

router.post('/weeks/:weekSlug/complete', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const week = await prisma.week.findUnique({
      where: { slug: req.params.weekSlug },
      select: { id: true, courseId: true, published: true },
    })
    if (!week || !week.published) return sendError(res, 'Week not found.', 404)

    // Require enrolment — non-enrolled users shouldn't be able to mark
    // lessons complete in someone else's course.
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { userId_courseId: { userId: req.user!.userId, courseId: week.courseId } },
    })
    if (!enrollment) return sendError(res, 'Enrol in this course to track progress.', 403)

    const progress = await syncWeekProgress(req.user!.userId, week.id, {
      manuallyComplete: true,
      touchOpened: true,
    })
    return sendSuccess(res, {
      status: progress.status,
      completedAt: progress.completedAt,
    }, 'Lesson marked complete.')
  } catch (err) {
    next(err)
  }
})

router.get('/weeks/:weekSlug/resources', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const week = await prisma.week.findUnique({
      where: { slug: req.params.weekSlug },
      include: {
        slideDecks: { orderBy: { position: 'asc' }, include: { sections: { orderBy: { position: 'asc' } } } },
        glossaryTerms: { orderBy: { position: 'asc' } },
        readingResources: { orderBy: { position: 'asc' } },
      },
    })
    if (!week || !week.published) return sendError(res, 'Week not found.', 404)

    const [savedTerms, readItems] = req.user
      ? await Promise.all([
          prisma.savedGlossaryTerm.findMany({
            where: { userId: req.user.userId, term: { weekId: week.id } },
            select: { termId: true },
          }),
          prisma.readingProgress.findMany({
            where: { userId: req.user.userId, resource: { weekId: week.id } },
            select: { resourceId: true },
          }),
        ])
      : [[], []]

    const savedTermIds = new Set(savedTerms.map(item => item.termId))
    const readResourceIds = new Set(readItems.map(item => item.resourceId))

    return sendSuccess(res, {
      slideDeck: week.slideDecks[0]
        ? {
            id: week.slideDecks[0].id,
            title: week.slideDecks[0].title,
            url: week.slideDecks[0].url,
            slideCount: week.slideDecks[0].slideCount,
            lastUpdatedAt: week.slideDecks[0].lastUpdatedAt,
            viewerType: week.slideDecks[0].viewerType,
            sections: week.slideDecks[0].sections.map(item => item.label),
          }
        : null,
      slideDecks: week.slideDecks.map(deck => ({
        id: deck.id,
        title: deck.title,
        url: deck.url,
        slideCount: deck.slideCount,
        lastUpdatedAt: deck.lastUpdatedAt,
        viewerType: deck.viewerType,
        position: deck.position,
        sections: deck.sections.map(item => item.label),
      })),
      glossary: week.glossaryTerms.map(term => ({
        id: term.id,
        term: term.term,
        definition: term.definition,
        example: term.example,
        saved: savedTermIds.has(term.id),
      })),
      readings: week.readingResources.map(resource => ({
        id: resource.id,
        title: resource.title,
        source: resource.source,
        url: resource.url,
        description: resource.description,
        type: resource.type,
        read: readResourceIds.has(resource.id),
      })),
    })
  } catch (err) {
    next(err)
  }
})

router.get('/weeks/:weekSlug/assignment', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const week = await prisma.week.findUnique({
      where: { slug: req.params.weekSlug },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { position: 'asc' },
              include: {
                options: {
                  orderBy: { position: 'asc' },
                },
              },
            },
          },
        },
        assignments: {
          orderBy: { position: 'asc' },
          include: {
            choices: {
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    })
    if (!week || !week.published) return sendError(res, 'Week not found.', 404)

    const userState = req.user
      ? await getUserWeekState(req.user.userId, week.id, week.quiz?.id)
      : null

    return sendSuccess(res, {
      quiz: week.quiz ? serializeQuizForDelivery(week.quiz, userState?.latestAttempt, userState?.unlockGranted) : null,
      tasks: serializeAssignmentsForDelivery(week.assignments, userState?.submissions ?? []),
      progress: userState?.weekProgress
        ? {
            status: userState.weekProgress.status,
            quizSubmitted: userState.weekProgress.quizSubmitted,
            assignmentSubmitted: userState.weekProgress.assignmentSubmitted,
          }
        : {
            status: WeekProgressStatus.NOT_STARTED,
            quizSubmitted: false,
            assignmentSubmitted: false,
          },
    })
  } catch (err) {
    next(err)
  }
})

router.get('/dashboard', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courses = await prisma.course.findMany({
      where: {
        published: true,
        weeks: { some: { published: true } },
        enrollments: { some: { userId: req.user!.userId } },
      },
      include: {
        weeks: {
          where: { published: true },
          orderBy: { number: 'asc' },
          select: {
            id: true,
            number: true,
            slug: true,
            title: true,
            durationLabel: true,
            estimatedCompletionMinutes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const weekIds = courses.flatMap(course => course.weeks.map(week => week.id))
    const progressMap = await getCourseProgressMap(req.user!.userId, weekIds)

    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId: req.user!.userId, quiz: { weekId: { in: weekIds } } },
      include: {
        quiz: { select: { weekId: true } },
      },
      orderBy: { submittedAt: 'desc' },
    })

    const latestAttemptByWeek = new Map<string, typeof quizAttempts[number]>()
    for (const attempt of quizAttempts) {
      if (!latestAttemptByWeek.has(attempt.quiz.weekId)) {
        latestAttemptByWeek.set(attempt.quiz.weekId, attempt)
      }
    }

    const assignmentCounts = await prisma.assignmentSubmission.groupBy({
      by: ['userId'],
      where: { userId: req.user!.userId },
      _count: { _all: true },
    })

    const assignmentCount = assignmentCounts[0]?._count._all ?? 0

    return sendSuccess(res, {
      courses: courses.map(course => {
        const completedCount = course.weeks.filter(week => progressMap.get(week.id)?.status === WeekProgressStatus.COMPLETE).length
        return {
          id: course.id,
          slug: course.slug,
          title: course.title,
          phaseLabel: course.phaseLabel,
          contentUnit: course.contentUnit,
          progressPercent: course.weeks.length ? Math.round((completedCount / course.weeks.length) * 100) : 0,
          weeks: course.weeks.map(week => ({
            ...serializeWeekSummary(week, progressMap.get(week.id)),
            latestQuizAttempt: latestAttemptByWeek.get(week.id)
              ? {
                  score: latestAttemptByWeek.get(week.id)!.score,
                  percentage: latestAttemptByWeek.get(week.id)!.percentage,
                  submittedAt: latestAttemptByWeek.get(week.id)!.submittedAt,
                }
              : null,
          })),
        }
      }),
      assignmentSubmissionCount: assignmentCount,
    })
  } catch (err) {
    next(err)
  }
})

router.post('/glossary/save', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = saveTermSchema.safeParse(req.body)
    if (!parsed.success) {
      return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const term = await prisma.glossaryTerm.findUnique({ where: { id: parsed.data.termId } })
    if (!term) return sendError(res, 'Glossary term not found.', 404)

    const item = await prisma.savedGlossaryTerm.upsert({
      where: { userId_termId: { userId: req.user!.userId, termId: term.id } },
      update: {},
      create: {
        userId: req.user!.userId,
        termId: term.id,
      },
    })

    return sendSuccess(res, item, 'Glossary term saved.', 201)
  } catch (err) {
    next(err)
  }
})

router.delete('/glossary/save/:termId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.savedGlossaryTerm.deleteMany({
      where: { userId: req.user!.userId, termId: req.params.termId },
    })
    return sendSuccess(res, { termId: req.params.termId }, 'Glossary term removed.')
  } catch (err) {
    next(err)
  }
})

router.post('/resources/:resourceId/mark-read', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resource = await prisma.readingResource.findUnique({
      where: { id: req.params.resourceId },
      select: { id: true },
    })
    if (!resource) return sendError(res, 'Reading resource not found.', 404)

    const existing = await prisma.readingProgress.findUnique({
      where: { userId_resourceId: { userId: req.user!.userId, resourceId: resource.id } },
    })

    if (existing) {
      await prisma.readingProgress.delete({
        where: { userId_resourceId: { userId: req.user!.userId, resourceId: resource.id } },
      })
      return sendSuccess(res, { resourceId: resource.id, read: false }, 'Reading resource marked unread.')
    }

    await prisma.readingProgress.create({
      data: {
        userId: req.user!.userId,
        resourceId: resource.id,
      },
    })

    return sendSuccess(res, { resourceId: resource.id, read: true }, 'Reading resource marked read.', 201)
  } catch (err) {
    next(err)
  }
})

router.post('/quizzes/:quizId/submit', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = quizSubmissionSchema.safeParse(req.body)
    if (!parsed.success) {
      return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.quizId },
      include: {
        questions: {
          orderBy: { position: 'asc' },
          include: {
            options: { orderBy: { position: 'asc' } },
          },
        },
      },
    })

    if (!quiz) return sendError(res, 'Quiz not found.', 404)

    const [attemptCount, unlock] = await Promise.all([
      prisma.quizAttempt.count({ where: { userId: req.user!.userId, quizId: quiz.id } }),
      prisma.quizRetakeUnlock.findUnique({
        where: { quizId_userId: { quizId: quiz.id, userId: req.user!.userId } },
      }),
    ])

    const effectiveLimit = quiz.attemptLimit + (unlock ? 1 : 0)
    if (attemptCount >= effectiveLimit) {
      return sendError(res, 'Quiz is locked. A facilitator must unlock a retake for another attempt.', 409)
    }

    const answersByQuestion = new Map(parsed.data.answers.map(answer => [answer.questionId, answer.selectedOptionId]))
    if (answersByQuestion.size !== quiz.questions.length) {
      return sendError(res, 'Every quiz question must be answered exactly once.', 400)
    }

    let score = 0
    for (const question of quiz.questions) {
      const selectedOptionId = answersByQuestion.get(question.id)
      const selectedOption = question.options.find(option => option.id === selectedOptionId)
      if (!selectedOption) {
        return sendError(res, `Invalid option selected for question ${question.id}.`, 400)
      }
      if (selectedOption.isCorrect) score += 1
    }

    const percentage = Number(((score / quiz.questions.length) * 100).toFixed(1))

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: req.user!.userId,
        quizId: quiz.id,
        score,
        percentage,
        status: QuizAttemptStatus.SUBMITTED,
        answers: {
          create: parsed.data.answers.map(answer => ({
            questionId: answer.questionId,
            selectedOptionId: answer.selectedOptionId,
          })),
        },
      },
      include: {
        answers: {
          select: {
            questionId: true,
            selectedOptionId: true,
          },
        },
      },
    })

    await syncWeekProgress(req.user!.userId, quiz.weekId)

    return sendSuccess(res, {
      id: attempt.id,
      score: attempt.score,
      percentage: attempt.percentage,
      passed: percentage >= quiz.passMark,
      submittedAt: attempt.submittedAt,
      questions: quiz.questions.map(question => ({
        id: question.id,
        prompt: question.prompt,
        explanation: question.explanation,
        options: question.options.map(option => ({
          id: option.id,
          label: option.label,
          isCorrect: option.isCorrect,
          isSelected: answersByQuestion.get(question.id) === option.id,
        })),
      })),
    }, 'Quiz submitted successfully.', 201)
  } catch (err) {
    next(err)
  }
})

router.get('/quizzes/:quizId/attempt', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attempt = await prisma.quizAttempt.findFirst({
      where: { userId: req.user!.userId, quizId: req.params.quizId },
      orderBy: { submittedAt: 'desc' },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { position: 'asc' },
              include: { options: { orderBy: { position: 'asc' } } },
            },
          },
        },
        answers: true,
      },
    })

    if (!attempt) return sendError(res, 'No quiz attempt found.', 404)

    const selected = new Map(attempt.answers.map(answer => [answer.questionId, answer.selectedOptionId]))
    return sendSuccess(res, {
      id: attempt.id,
      score: attempt.score,
      percentage: attempt.percentage,
      submittedAt: attempt.submittedAt,
      quiz: {
        id: attempt.quiz.id,
        title: attempt.quiz.title,
        passMark: attempt.quiz.passMark,
      },
      questions: attempt.quiz.questions.map(question => ({
        id: question.id,
        prompt: question.prompt,
        explanation: question.explanation,
        options: question.options.map(option => ({
          id: option.id,
          label: option.label,
          isCorrect: option.isCorrect,
          isSelected: selected.get(question.id) === option.id,
        })),
      })),
    })
  } catch (err) {
    next(err)
  }
})

router.post('/assignments/:assignmentId/submissions', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = assignmentSubmissionSchema.safeParse(req.body)
    if (!parsed.success) {
      return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: req.params.assignmentId },
      include: {
        choices: true,
        week: {
          include: {
            course: {
              include: {
                createdBy: { select: { id: true, name: true, email: true } },
                courseFacilitators: {
                  select: {
                    facilitator: { select: { name: true, email: true } },
                  },
                },
              },
            },
          },
        },
      },
    })
    if (!assignment) return sendError(res, 'Assignment not found.', 404)

    if (parsed.data.choiceId && !assignment.choices.some(choice => choice.id === parsed.data.choiceId)) {
      return sendError(res, 'Selected assignment choice is invalid.', 400)
    }

    const submission = await prisma.assignmentSubmission.create({
      data: {
        userId: req.user!.userId,
        assignmentId: assignment.id,
        choiceId: parsed.data.choiceId ?? null,
        textResponse: parsed.data.textResponse ?? null,
        attachmentName: parsed.data.attachmentName ?? null,
        attachmentUrl: parsed.data.attachmentUrl ?? null,
        attachmentMimeType: parsed.data.attachmentMimeType ?? null,
        attachmentSizeBytes: parsed.data.attachmentSizeBytes ?? null,
        status: AssignmentSubmissionStatus.SUBMITTED,
      },
    })

    await syncWeekProgress(req.user!.userId, assignment.weekId)

    // Notify every facilitator linked to this course — best-effort, non-blocking.
    // Recipients include:
    //   - the course creator (User)
    //   - every Facilitator added to the course (linked by email)
    // Deduplicated case-insensitively so people don't get the same email twice
    // if they're both creator and facilitator on the same course.
    const learner = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { name: true, email: true },
    })
    const creator = assignment.week.course.createdBy
    const recipients: Array<{ name: string | null; email: string }> = []
    if (creator?.email) recipients.push({ name: creator.name, email: creator.email })
    for (const cf of assignment.week.course.courseFacilitators) {
      if (cf.facilitator.email) recipients.push({ name: cf.facilitator.name, email: cf.facilitator.email })
    }
    const seen = new Set<string>()
    const uniqueRecipients = recipients.filter(r => {
      const key = r.email.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    for (const recipient of uniqueRecipients) {
      const email = newSubmissionEmail({
        facilitatorName: recipient.name,
        learnerName: learner?.name ?? null,
        learnerEmail: learner?.email ?? '',
        assignmentTitle: assignment.title,
        lessonTitle: assignment.week.title,
        courseTitle: assignment.week.course.title,
        submissionPreview: parsed.data.textResponse ?? null,
        submittedAt: submission.submittedAt,
      })
      sendEmailInBackground({
        to: recipient.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      })
    }

    return sendSuccess(res, submission, 'Assignment submitted successfully.', 201)
  } catch (err) {
    next(err)
  }
})

router.get('/progress', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const progress = await prisma.weekProgress.findMany({
      where: { userId: req.user!.userId },
      include: {
        week: {
          select: {
            id: true,
            number: true,
            slug: true,
            title: true,
            course: {
              select: {
                id: true,
                slug: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })
    return sendSuccess(res, progress)
  } catch (err) {
    next(err)
  }
})

router.get('/admin/learners/progress', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = adminWeekFilterSchema.safeParse(req.query)
    if (!parsed.success) {
      return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    // Scope: SUPER_ADMIN sees all; regular ADMIN sees progress for courses
    // they created OR are added as a facilitator on.
    const courseScope = facilitatorAccessibleCourseWhere(req.user!)
    const ownership: Prisma.WeekProgressWhereInput =
      Object.keys(courseScope).length === 0 ? {} : { week: { course: courseScope } }
    const slugFilter: Prisma.WeekProgressWhereInput = parsed.data.weekSlug
      ? { week: { slug: parsed.data.weekSlug } }
      : {}
    const where: Prisma.WeekProgressWhereInput = { AND: [ownership, slugFilter] }

    const progress = await prisma.weekProgress.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        week: {
          select: {
            id: true,
            slug: true,
            number: true,
            title: true,
          },
        },
      },
      orderBy: [{ week: { number: 'asc' } }, { updatedAt: 'desc' }],
    })

    return sendSuccess(res, progress)
  } catch (err) {
    next(err)
  }
})

router.get('/admin/assignments/submissions', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // SUPER_ADMIN sees every submission on the platform.
    // Regular ADMIN (facilitator) sees submissions from courses they own AND
    // from courses where they've been added as a facilitator.
    const courseScope = facilitatorAccessibleCourseWhere(req.user!)
    const where: Prisma.AssignmentSubmissionWhereInput =
      Object.keys(courseScope).length === 0
        ? {}
        : { assignment: { week: { course: courseScope } } }

    const submissions = await prisma.assignmentSubmission.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignment: {
          include: {
            week: {
              select: {
                id: true,
                slug: true,
                number: true,
                title: true,
                course: { select: { id: true, title: true, slug: true } },
              },
            },
          },
        },
        choice: true,
        feedback: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { submittedAt: 'desc' },
    })

    return sendSuccess(res, submissions)
  } catch (err) {
    next(err)
  }
})

router.post('/admin/assignments/submissions/:submissionId/feedback', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = feedbackSchema.safeParse(req.body)
    if (!parsed.success) {
      return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: req.params.submissionId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        assignment: {
          include: {
            week: {
              include: {
                course: {
                  select: {
                    createdById: true,
                    title: true,
                    slug: true,
                    courseFacilitators: {
                      select: { facilitator: { select: { email: true } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })
    if (!submission) return sendError(res, 'Submission not found.', 404)

    // Scope: regular admins can leave feedback on submissions from courses they
    // created OR courses where they're added as a facilitator (email match).
    const isSuperAdmin = req.user!.role === 'SUPER_ADMIN'
    const userEmail = req.user!.email.toLowerCase()
    const isCreator = submission.assignment.week.course.createdById === req.user!.userId
    const isAddedFacilitator = submission.assignment.week.course.courseFacilitators.some(
      cf => cf.facilitator.email.toLowerCase() === userEmail
    )
    if (!isSuperAdmin && !isCreator && !isAddedFacilitator) {
      return sendError(res, 'You can only leave feedback on submissions from courses you facilitate.', 403)
    }

    const feedback = await prisma.assignmentFeedback.create({
      data: {
        submissionId: submission.id,
        reviewerId: req.user!.userId,
        feedback: parsed.data.feedback,
        rating: parsed.data.rating ?? null,
      },
    })

    await prisma.assignmentSubmission.update({
      where: { id: submission.id },
      data: {
        status: AssignmentSubmissionStatus.REVIEWED,
        reviewedAt: new Date(),
      },
    })

    // Notify the learner by email (best-effort, non-blocking — never fails the request)
    if (submission.user.email) {
      const reviewer = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { name: true },
      })
      const email = assignmentFeedbackEmail({
        learnerName: submission.user.name,
        assignmentTitle: submission.assignment.title,
        lessonTitle: submission.assignment.week.title,
        courseTitle: submission.assignment.week.course.title,
        feedbackText: parsed.data.feedback,
        reviewerName: reviewer?.name ?? null,
        lessonUrl: lessonDeepLink(submission.assignment.week.course.slug, submission.assignment.week.slug),
      })
      sendEmailInBackground({
        to: submission.user.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      })
    }

    return sendSuccess(res, feedback, 'Feedback saved.', 201)
  } catch (err) {
    next(err)
  }
})

/**
 * Delete a feedback entry on a submission.
 *
 * Rules:
 *   - The reviewer who left the feedback can always delete their own.
 *   - SUPER_ADMIN can delete any feedback.
 *   - Other facilitators on the same course CANNOT delete a colleague's feedback —
 *     deletion is treated as a personal "I want to retract my own remark" action.
 *
 * After deletion, if no feedback remains on the submission, the submission's
 * status flips back from REVIEWED → SUBMITTED so the work re-appears in the
 * "Pending review" queue.
 */
router.delete('/admin/assignments/submissions/:submissionId/feedback/:feedbackId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const feedback = await prisma.assignmentFeedback.findUnique({
      where: { id: req.params.feedbackId },
      include: { submission: { select: { id: true } } },
    })
    if (!feedback) return sendError(res, 'Feedback not found.', 404)
    if (feedback.submission.id !== req.params.submissionId) {
      return sendError(res, 'Feedback does not belong to this submission.', 400)
    }

    const isSuperAdmin = req.user!.role === 'SUPER_ADMIN'
    const isAuthor = feedback.reviewerId === req.user!.userId
    if (!isSuperAdmin && !isAuthor) {
      return sendError(res, 'You can only delete feedback you wrote yourself.', 403)
    }

    await prisma.assignmentFeedback.delete({ where: { id: feedback.id } })

    // If this was the last piece of feedback, move the submission back to
    // SUBMITTED so it shows up in the pending-review queue again.
    const remaining = await prisma.assignmentFeedback.count({
      where: { submissionId: feedback.submission.id },
    })
    if (remaining === 0) {
      await prisma.assignmentSubmission.update({
        where: { id: feedback.submission.id },
        data: {
          status: AssignmentSubmissionStatus.SUBMITTED,
          reviewedAt: null,
        },
      })
    }

    return sendSuccess(res, { id: feedback.id, statusReverted: remaining === 0 }, 'Feedback deleted.')
  } catch (err) {
    next(err)
  }
})

router.post('/admin/quizzes/:quizId/unlock-retake', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = unlockRetakeSchema.safeParse(req.body)
    if (!parsed.success) {
      return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const quiz = await prisma.quiz.findUnique({ where: { id: req.params.quizId } })
    if (!quiz) return sendError(res, 'Quiz not found.', 404)

    const unlock = await prisma.quizRetakeUnlock.upsert({
      where: { quizId_userId: { quizId: quiz.id, userId: parsed.data.userId } },
      update: {
        unlockedAt: new Date(),
        unlockedById: req.user!.userId,
      },
      create: {
        quizId: quiz.id,
        userId: parsed.data.userId,
        unlockedById: req.user!.userId,
      },
    })

    return sendSuccess(res, unlock, 'Quiz retake unlocked.', 201)
  } catch (err) {
    next(err)
  }
})

// Legacy endpoints retained for compatibility

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

router.get('/lesson/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id },
      include: {
        module: { include: { course: true } },
        videos: { orderBy: { position: 'asc' } },
      },
    })
    if (!lesson) return sendError(res, 'Lesson not found.', 404)
    return sendSuccess(res, lesson)
  } catch (err) {
    next(err)
  }
})

router.patch('/lesson/:id', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = z.object({
      title: z.string().trim().min(1).max(200).optional(),
      content: z.string().trim().max(50000).optional(),
      duration: z.number().int().positive().optional(),
    }).safeParse(req.body)

    if (!parsed.success) {
      return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const updated = await prisma.lesson.update({
      where: { id: req.params.id },
      data: Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined)),
      include: {
        module: { include: { course: true } },
        videos: { orderBy: { position: 'asc' } },
      },
    })

    return sendSuccess(res, updated, 'Lesson updated.')
  } catch (err) {
    next(err)
  }
})

router.post('/lessons/:lessonId/videos', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = z.object({
      title: z.string().trim().min(1).max(200),
      url: z.string().url('Invalid video URL'),
      description: z.string().trim().max(1000).optional(),
    }).safeParse(req.body)

    if (!parsed.success) {
      return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.lessonId },
      include: { videos: true },
    })
    if (!lesson) return sendError(res, 'Lesson not found.', 404)

    const nextPosition = (lesson.videos.length || 0) + 1

    const video = await prisma.lessonVideo.create({
      data: {
        lessonId: req.params.lessonId,
        position: nextPosition,
        title: parsed.data.title,
        url: parsed.data.url,
        description: parsed.data.description || null,
      },
    })

    return sendSuccess(res, video, 'Video added to lesson.', 201)
  } catch (err) {
    next(err)
  }
})

router.put('/lesson-videos/:videoId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = z.object({
      title: z.string().trim().min(1).max(200).optional(),
      url: z.string().url('Invalid video URL').optional(),
      description: z.string().trim().max(1000).optional(),
      position: z.number().int().positive().optional(),
    }).safeParse(req.body)

    if (!parsed.success) {
      return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const video = await prisma.lessonVideo.update({
      where: { id: req.params.videoId },
      data: Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined)),
    })

    return sendSuccess(res, video, 'Video updated.')
  } catch (err) {
    next(err)
  }
})

router.delete('/lesson-videos/:videoId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.lessonVideo.delete({ where: { id: req.params.videoId } })
    return sendSuccess(res, {}, 'Video deleted.')
  } catch (err) {
    next(err)
  }
})

router.post('/progress', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = legacyProgressSchema.safeParse(req.body)
    if (!parsed.success) {
      return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const { lessonId, completed } = parsed.data
    const userId = req.user!.userId
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

router.get('/legacy-progress', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
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

// ─── Course Management (Admin) ────────────────────────────────────────────────

const createCourseSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(5000),
  tagline: z.string().trim().max(300).optional(),
  level: z.string().trim().max(100).optional(),
  estimatedDuration: z.string().trim().max(100).optional(),
  phaseLabel: z.string().trim().max(100).optional(),
  heroImage: z.string().url().optional(),
  introVideoUrl: z.string().url().optional(),
  overviewSlideUrl: z.string().url().optional().nullable(),
  contentUnit: z.enum(['Lesson', 'Week', 'Module', 'Session', 'Chapter', 'Unit']).default('Lesson').optional(),
  isPaid: z.boolean().default(false).optional(),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens').min(3).max(100),
})

const updateCourseSchema = createCourseSchema.partial()

const createWeekSchema = z.object({
  number: z.number().int().min(1),
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens').min(3).max(100),
  // The wizard creates "skeleton" weeks where the admin fills detail later.
  // These fields default to placeholders so the create call doesn't require
  // 10 inputs upfront — they're still required at the DB level so the
  // placeholder strings keep the row valid until the admin edits them.
  durationLabel: z.string().trim().min(1).max(100).default('30 min'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  hook: z.string().trim().min(1).max(500).default('Hook coming soon.'),
  whatToExpect: z.string().trim().min(1).max(2000).default('Details coming soon.'),
  summary: z.string().trim().min(1).max(5000).default('Summary coming soon.'),
  estimatedCompletionMinutes: z.number().int().min(1).max(600).default(30),
  // Optional module assignment — wizard sets this when creating under a module
  moduleId: z.string().uuid().optional().nullable(),
  videoTitle: z.string().trim().max(200).optional(),
  videoUrl: z.string().url().optional(),
  lessonContent: z.string().trim().max(50000).optional(),
  topics: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
  objectives: z.array(z.string().trim().min(1).max(500)).max(20).default([]),
})

const updateWeekSchema = createWeekSchema.partial()

const quizQuestionInputSchema = z.object({
  prompt: z.string().trim().min(5).max(2000),
  explanation: z.string().trim().max(2000).default(''),
  options: z.array(z.object({
    label: z.string().trim().min(1).max(500),
    isCorrect: z.boolean().default(false),
  })).min(2).max(8),
})

const createQuizSchema = z.object({
  title: z.string().trim().min(3).max(200),
  passMark: z.number().int().min(1).max(100).default(70),
  attemptLimit: z.number().int().min(1).max(10).default(1),
  // Allow creating an empty-quiz shell so admins can add questions one by one
  // afterwards. Backwards compatible — existing callers can still send a full
  // list of questions in one shot.
  questions: z.array(z.object({
    prompt: z.string().trim().min(5).max(2000),
    explanation: z.string().trim().max(2000).default(''),
    position: z.number().int().min(1),
    options: z.array(z.object({
      label: z.string().trim().min(1).max(500),
      isCorrect: z.boolean().default(false),
      position: z.number().int().min(1),
    })).min(2).max(8),
  })).min(0).max(30).default([]),
})

const quizSettingsSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  passMark: z.number().int().min(1).max(100).optional(),
  attemptLimit: z.number().int().min(1).max(10).optional(),
})

const createAssignmentSchema = z.object({
  title: z.string().trim().min(3).max(200),
  instructions: z.string().trim().min(10).max(10000),
  deadline: z.string().datetime({ offset: true }),
  allowTextSubmission: z.boolean().default(true),
  allowFileUpload: z.boolean().default(false),
  position: z.number().int().min(1).optional(),
  choices: z.array(z.object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(1000).default(''),
    position: z.number().int().min(1),
  })).max(10).default([]),
})

const createFacilitatorSchema = z.object({
  name: z.string().trim().min(2).max(200),
  title: z.string().trim().min(2).max(200),
  organization: z.string().trim().min(2).max(200),
  email: z.string().email(),
  linkedinUrl: z.string().url(),
  photoUrl: z.string().url().optional(),
  bio: z.string().trim().max(2000).optional(),
})

// Helper to check course ownership
/**
 * If a regular ADMIN edits an APPROVED course, flip the course status back to
 * PENDING_REVIEW so a SUPER_ADMIN can audit and re-approve the changes.
 *
 * SUPER_ADMIN edits are not flagged — their changes go live immediately.
 * Course stays `published: true` during the pending review so learners don't
 * lose access while edits are pending audit.
 */
async function markCourseDirtyIfNeeded(courseId: string, role: string, currentStatus: string) {
  if (role === 'SUPER_ADMIN') return
  if (currentStatus !== 'APPROVED') return
  await prisma.course.update({
    where: { id: courseId },
    data: { status: 'PENDING_REVIEW', submittedAt: new Date() },
  })
}

/**
 * Build a Prisma `where` fragment that constrains a query to courses the user
 * has facilitator-level access to.
 *
 * - SUPER_ADMIN: returns `{}` (no constraint, sees everything).
 * - Regular ADMIN: returns a clause matching courses where they're either the
 *   creator OR added as a facilitator. Facilitator linkage is by email
 *   (User.email <-> Facilitator.email, case-insensitive — admins entering a
 *   facilitator's email may use any casing).
 *
 * Use by composing into the surrounding `where` clause, e.g.
 *   { week: { course: facilitatorAccessibleCourseWhere(req.user) } }
 */
function facilitatorAccessibleCourseWhere(user: { userId: string; email: string; role: string }): Prisma.CourseWhereInput {
  if (user.role === 'SUPER_ADMIN') return {}
  return {
    OR: [
      { createdById: user.userId },
      { courseFacilitators: { some: { facilitator: { email: { equals: user.email, mode: 'insensitive' } } } } },
    ],
  }
}

async function getCourseOrFail(courseId: string, userId: string, role: string, res: Response) {
  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course) {
    sendError(res, 'Course not found.', 404)
    return null
  }
  if (role !== 'SUPER_ADMIN' && role !== 'ADMIN' && course.createdById !== userId) {
    sendError(res, 'Forbidden. You do not own this course.', 403)
    return null
  }
  return course
}

// List all available facilitators
router.get('/admin/facilitators', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const facilitators = await prisma.facilitator.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, title: true, organization: true, email: true, linkedinUrl: true, photoUrl: true, bio: true },
    })
    return sendSuccess(res, facilitators)
  } catch (err) {
    next(err)
  }
})

// Create a new facilitator
router.post('/admin/facilitators', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createFacilitatorSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

    // Normalize email to lowercase so future linkage to User accounts is reliable
    // (User.email is always stored lowercase).
    const normalizedEmail = parsed.data.email.trim().toLowerCase()
    const existing = await prisma.facilitator.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    })
    if (existing) return sendError(res, 'A facilitator with this email already exists.', 409)

    const facilitator = await prisma.facilitator.create({ data: { ...parsed.data, email: normalizedEmail } })
    return sendSuccess(res, facilitator, 'Facilitator created.', 201)
  } catch (err) {
    next(err)
  }
})

// ─── Facilitator self-service profile updates ─────────────────────────────
//
// Lets an admin update their own Facilitator record — currently just the
// photo, but the schema is extensible. The facilitator is identified by
// matching their User.email (case-insensitive) against Facilitator.email.

const PHOTO_MAX_KB_ENCODED = 150 // leaves comfortable headroom over the
                                  // client-side 100KB target after compression

const updateOwnFacilitatorSchema = z.object({
  // Accept either a `data:image/...;base64,...` URL, an https URL, or null to clear.
  photoUrl: z
    .string()
    .nullable()
    .refine(
      val => {
        if (val === null) return true
        if (val.startsWith('https://') || val.startsWith('http://')) return true
        return /^data:image\/(jpeg|jpg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(val)
      },
      { message: 'photoUrl must be a base64 data URL (jpeg, png, or webp) or an https URL.' }
    )
    .refine(
      val => val === null || val.length <= PHOTO_MAX_KB_ENCODED * 1024,
      { message: `Image too large — keep it under ${PHOTO_MAX_KB_ENCODED} KB after encoding.` }
    )
    .optional(),
  bio: z.string().trim().max(2000).optional().nullable(),
})

router.patch('/admin/facilitators/me', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = updateOwnFacilitatorSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

    const userEmail = req.user!.email.toLowerCase()
    const facilitator = await prisma.facilitator.findFirst({
      where: { email: { equals: userEmail, mode: 'insensitive' } },
    })
    if (!facilitator) {
      return sendError(
        res,
        'You\'re not registered as a facilitator yet. A super admin needs to add you under Admin → Facilitators first.',
        404
      )
    }

    const data: { photoUrl?: string | null; bio?: string | null } = {}
    if (parsed.data.photoUrl !== undefined) data.photoUrl = parsed.data.photoUrl
    if (parsed.data.bio !== undefined) data.bio = parsed.data.bio

    const updated = await prisma.facilitator.update({
      where: { id: facilitator.id },
      data,
    })
    return sendSuccess(res, updated, 'Profile updated.')
  } catch (err) {
    next(err)
  }
})

router.get('/admin/facilitators/me', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userEmail = req.user!.email.toLowerCase()
    const facilitator = await prisma.facilitator.findFirst({
      where: { email: { equals: userEmail, mode: 'insensitive' } },
      select: {
        id: true, name: true, title: true, organization: true, email: true,
        linkedinUrl: true, photoUrl: true, bio: true,
      },
    })
    if (!facilitator) {
      return sendError(
        res,
        'You\'re not registered as a facilitator yet.',
        404
      )
    }
    return sendSuccess(res, facilitator)
  } catch (err) {
    next(err)
  }
})

// Create a new course (draft)
router.post('/admin/courses', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createCourseSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

    const existing = await prisma.course.findUnique({ where: { slug: parsed.data.slug } })
    if (existing) return sendError(res, 'A course with this slug already exists.', 409)

    const created = await prisma.course.create({
      data: { ...parsed.data, createdById: req.user!.userId, status: 'DRAFT' },
    })

    // Return shape compatible with the AdminCourse list type so the frontend can
    // prepend the new course to its list without rendering crashes.
    const course = {
      ...created,
      weekCount: 0,
      facilitators: [] as Array<{ id: string; name: string; title: string | null; photoUrl: string | null }>,
      createdBy: req.user ? { id: req.user.userId, name: null, email: req.user.email } : null,
    }
    return sendSuccess(res, course, 'Course created.', 201)
  } catch (err) {
    next(err)
  }
})

// List admin's own courses
router.get('/admin/courses', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10)
    const skip = (page - 1) * limit

    // SUPER_ADMIN can see all courses
    const where = req.user!.role === 'SUPER_ADMIN' ? {} : { createdById: userId }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        select: {
          id: true,
          title: true,
          slug: true,
          tagline: true,
          status: true,
          published: true,
          isPaid: true,
          contentUnit: true,
          approvalNotes: true,
          submittedAt: true,
          approvedAt: true,
          createdAt: true,
          updatedAt: true,
          createdBy: { select: { id: true, name: true, email: true } },
          _count: { select: { weeks: true } },
          courseFacilitators: {
            select: {
              facilitator: { select: { id: true, name: true, title: true, photoUrl: true } },
            },
            orderBy: { position: 'asc' as const },
          },
        },
      }),
      prisma.course.count({ where }),
    ])

    const result = courses.map(c => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      tagline: c.tagline,
      status: c.status,
      published: c.published,
      isPaid: c.isPaid,
      contentUnit: c.contentUnit,
      weekCount: c._count.weeks,
      facilitators: c.courseFacilitators.map(cf => cf.facilitator),
      createdBy: c.createdBy,
      approvalNotes: c.approvalNotes,
      submittedAt: c.submittedAt,
      approvedAt: c.approvedAt,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }))

    return sendPaginated(res, result, total, page, limit)
  } catch (err) {
    next(err)
  }
})

// Get full course detail (for builder)
router.get('/admin/courses/:courseId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await prisma.course.findUnique({
      where: { id: req.params.courseId },
      include: {
        courseFacilitators: {
          include: { facilitator: true },
          orderBy: { position: 'asc' },
        },
        modules: {
          orderBy: { position: 'asc' },
        },
        weeks: {
          orderBy: { number: 'asc' },
          include: {
            topics: { orderBy: { position: 'asc' } },
            objectives: { orderBy: { position: 'asc' } },
            quiz: { include: { questions: { orderBy: { position: 'asc' }, include: { options: { orderBy: { position: 'asc' } } } } } },
            assignments: { orderBy: { position: 'asc' }, include: { choices: { orderBy: { position: 'asc' } } } },
            images: { orderBy: { position: 'asc' } },
            videos: { orderBy: { position: 'asc' } },
            readingResources: { orderBy: { position: 'asc' } },
            slideDecks: { orderBy: { position: 'asc' } },
            glossaryTerms: { orderBy: { position: 'asc' } },
          },
        },
        approvals: {
          orderBy: { createdAt: 'desc' },
          include: { reviewer: { select: { id: true, name: true, email: true } } },
        },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    })

    if (!course) return sendError(res, 'Course not found.', 404)
    if (req.user!.role !== 'SUPER_ADMIN' && course.createdById !== userId) {
      return sendError(res, 'Forbidden.', 403)
    }

    return sendSuccess(res, course)
  } catch (err) {
    next(err)
  }
})

// Update course basic info
router.patch('/admin/courses/:courseId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return

    const isPrivileged = req.user!.role === 'SUPER_ADMIN' || req.user!.role === 'ADMIN'
    if (!isPrivileged && (course.status === 'PENDING_REVIEW' || course.status === 'APPROVED')) {
      return sendError(res, 'Cannot edit a course that is pending review or approved.', 400)
    }

    const parsed = updateCourseSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

    if (parsed.data.slug && parsed.data.slug !== course.slug) {
      const existing = await prisma.course.findUnique({ where: { slug: parsed.data.slug } })
      if (existing) return sendError(res, 'A course with this slug already exists.', 409)
    }

    const updated = await prisma.course.update({ where: { id: course.id }, data: parsed.data })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, updated, 'Course updated.')
  } catch (err) {
    next(err)
  }
})

// Delete a course
// SUPER_ADMIN can delete a course in any state. Regular admins are restricted
// to DRAFT or REJECTED courses (so they can't accidentally pull a published
// course out from under enrolled learners).
router.delete('/admin/courses/:courseId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return

    const isSuperAdmin = req.user!.role === 'SUPER_ADMIN'
    if (!isSuperAdmin && course.status !== 'DRAFT' && course.status !== 'REJECTED') {
      return sendError(res, 'Only DRAFT or REJECTED courses can be deleted. Contact a super admin to remove a published course.', 400)
    }

    await prisma.course.delete({ where: { id: course.id } })
    return sendSuccess(res, { id: course.id }, 'Course deleted.')
  } catch (err) {
    next(err)
  }
})

// Submit course for super-admin review
router.post('/admin/courses/:courseId/submit', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return

    if (course.status !== 'DRAFT' && course.status !== 'REJECTED') {
      return sendError(res, 'Only DRAFT or REJECTED courses can be submitted for review.', 400)
    }

    // Prerequisites check
    const weekCount = await prisma.week.count({ where: { courseId: course.id } })
    const facilitatorCount = await prisma.courseFacilitator.count({ where: { courseId: course.id } })
    const errors: string[] = []
    if (weekCount < 1) errors.push('Add at least one week before submitting.')
    if (facilitatorCount < 1) errors.push('Assign at least one facilitator before submitting.')
    if (!course.description || course.description.length < 10) errors.push('Add a course description.')
    if (errors.length > 0) return sendError(res, 'Prerequisites not met.', 400, errors)

    const updated = await prisma.course.update({
      where: { id: course.id },
      data: { status: 'PENDING_REVIEW', submittedAt: new Date() },
    })
    return sendSuccess(res, updated, 'Course submitted for review.')
  } catch (err) {
    next(err)
  }
})

// Add a week to a course
router.post('/admin/courses/:courseId/weeks', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return

    if (course.status === 'APPROVED' && req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'ADMIN') return sendError(res, 'Cannot edit an approved course.', 400)

    const parsed = createWeekSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

    const slugExists = await prisma.week.findUnique({ where: { slug: parsed.data.slug } })
    if (slugExists) return sendError(res, 'A week with this slug already exists.', 409)

    const numberExists = await prisma.week.findUnique({ where: { courseId_number: { courseId: course.id, number: parsed.data.number } } })
    if (numberExists) return sendError(res, `Week ${parsed.data.number} already exists in this course.`, 409)

    // If moduleId is provided, verify it belongs to this course
    if (parsed.data.moduleId) {
      const mod = await prisma.module.findFirst({ where: { id: parsed.data.moduleId, courseId: course.id } })
      if (!mod) return sendError(res, 'Module not found in this course.', 404)
    }

    const { topics, objectives, ...weekData } = parsed.data

    const week = await prisma.week.create({
      data: {
        ...weekData,
        courseId: course.id,
        // If the course is already approved/published, new weeks must be
        // published too — otherwise the public course page won't show them
        // (it filters weeks by `published: true`).
        published: course.status === 'APPROVED',
        topics: {
          create: topics.map((title, i) => ({ title, position: i + 1 })),
        },
        objectives: {
          create: objectives.map((body, i) => ({ body, position: i + 1 })),
        },
      },
      include: {
        topics: { orderBy: { position: 'asc' } },
        objectives: { orderBy: { position: 'asc' } },
      },
    })

    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, week, 'Week added.', 201)
  } catch (err) {
    next(err)
  }
})

// Update a week
router.patch('/admin/courses/:courseId/weeks/:weekId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return
    if (course.status === 'APPROVED' && req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'ADMIN') return sendError(res, 'Cannot edit an approved course.', 400)

    const week = await prisma.week.findFirst({ where: { id: req.params.weekId, courseId: course.id } })
    if (!week) return sendError(res, 'Week not found.', 404)

    const parsed = updateWeekSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

    const { topics, objectives, ...weekData } = parsed.data

    // Replace topics and objectives if provided
    await prisma.$transaction(async (tx) => {
      if (topics !== undefined) {
        await tx.weekTopic.deleteMany({ where: { weekId: week.id } })
        await tx.weekTopic.createMany({ data: topics.map((title, i) => ({ weekId: week.id, title, position: i + 1 })) })
      }
      if (objectives !== undefined) {
        await tx.weekObjective.deleteMany({ where: { weekId: week.id } })
        await tx.weekObjective.createMany({ data: objectives.map((body, i) => ({ weekId: week.id, body, position: i + 1 })) })
      }
      if (Object.keys(weekData).length > 0) {
        await tx.week.update({ where: { id: week.id }, data: weekData })
      }
    })

    const updated = await prisma.week.findUnique({
      where: { id: week.id },
      include: { topics: { orderBy: { position: 'asc' } }, objectives: { orderBy: { position: 'asc' } } },
    })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, updated, 'Week updated.')
  } catch (err) {
    next(err)
  }
})

// Delete a week
router.delete('/admin/courses/:courseId/weeks/:weekId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return
    if (course.status === 'APPROVED' && req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'ADMIN') return sendError(res, 'Cannot edit an approved course.', 400)

    const week = await prisma.week.findFirst({ where: { id: req.params.weekId, courseId: course.id } })
    if (!week) return sendError(res, 'Week not found.', 404)

    await prisma.week.delete({ where: { id: week.id } })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, { id: week.id }, 'Week deleted.')
  } catch (err) {
    next(err)
  }
})

// Save lesson content for a week
router.patch('/admin/courses/:courseId/weeks/:weekId/content', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return
    if (course.status === 'APPROVED' && req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'ADMIN') return sendError(res, 'Cannot edit an approved course.', 400)

    const week = await prisma.week.findFirst({ where: { id: req.params.weekId, courseId: course.id } })
    if (!week) return sendError(res, 'Week not found.', 404)

    const { lessonContent } = z.object({ lessonContent: z.string().trim().max(50000) }).parse(req.body)
    const updated = await prisma.week.update({ where: { id: week.id }, data: { lessonContent } })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, { lessonContent: updated.lessonContent }, 'Lesson content saved.')
  } catch (err) {
    next(err)
  }
})

// Add image to a week
router.post('/admin/courses/:courseId/weeks/:weekId/images', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return
    if (course.status === 'APPROVED' && req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'ADMIN') return sendError(res, 'Cannot edit an approved course.', 400)

    const week = await prisma.week.findFirst({ where: { id: req.params.weekId, courseId: course.id } })
    if (!week) return sendError(res, 'Week not found.', 404)

    const parsed = z.object({
      url: z.string().url('Invalid image URL'),
      alt: z.string().trim().max(500).optional(),
      caption: z.string().trim().max(500).optional(),
    }).safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

    const count = await prisma.weekImage.count({ where: { weekId: week.id } })
    const image = await prisma.weekImage.create({
      data: { weekId: week.id, ...parsed.data, position: count + 1 },
    })
    return sendSuccess(res, image, 'Image added.', 201)
  } catch (err) {
    next(err)
  }
})

// Remove image from a week
router.delete('/admin/courses/:courseId/weeks/:weekId/images/:imageId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return
    if (course.status === 'APPROVED' && req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'ADMIN') return sendError(res, 'Cannot edit an approved course.', 400)

    const image = await prisma.weekImage.findFirst({
      where: { id: req.params.imageId, week: { id: req.params.weekId, courseId: course.id } },
    })
    if (!image) return sendError(res, 'Image not found.', 404)

    await prisma.weekImage.delete({ where: { id: image.id } })
    return sendSuccess(res, { id: image.id }, 'Image removed.')
  } catch (err) {
    next(err)
  }
})

// ─── Week Videos ─────────────────────────────────────────────────────────────

// Add a video to a week
router.post('/admin/courses/:courseId/weeks/:weekId/videos', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return
    if (course.status === 'APPROVED' && req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'ADMIN') return sendError(res, 'Cannot edit an approved course.', 400)

    const week = await prisma.week.findFirst({ where: { id: req.params.weekId, courseId: course.id } })
    if (!week) return sendError(res, 'Week not found.', 404)

    const parsed = z.object({
      title: z.string().trim().min(1).max(200),
      url: z.string().url('Invalid video URL'),
      description: z.string().trim().max(1000).optional(),
    }).safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

    const count = await prisma.weekVideo.count({ where: { weekId: week.id } })
    const video = await prisma.weekVideo.create({
      data: { weekId: week.id, ...parsed.data, position: count + 1 },
    })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, video, 'Video added.', 201)
  } catch (err) {
    next(err)
  }
})

// Update a video
router.patch('/admin/courses/:courseId/weeks/:weekId/videos/:videoId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return
    if (course.status === 'APPROVED' && req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'ADMIN') return sendError(res, 'Cannot edit an approved course.', 400)

    const video = await prisma.weekVideo.findFirst({
      where: { id: req.params.videoId, week: { id: req.params.weekId, courseId: course.id } },
    })
    if (!video) return sendError(res, 'Video not found.', 404)

    const parsed = z.object({
      title: z.string().trim().min(1).max(200).optional(),
      url: z.string().url('Invalid video URL').optional(),
      description: z.string().trim().max(1000).optional(),
    }).safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

    const updated = await prisma.weekVideo.update({ where: { id: video.id }, data: parsed.data })
    return sendSuccess(res, updated, 'Video updated.')
  } catch (err) {
    next(err)
  }
})

// Delete a video
router.delete('/admin/courses/:courseId/weeks/:weekId/videos/:videoId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return
    if (course.status === 'APPROVED' && req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'ADMIN') return sendError(res, 'Cannot edit an approved course.', 400)

    const video = await prisma.weekVideo.findFirst({
      where: { id: req.params.videoId, week: { id: req.params.weekId, courseId: course.id } },
    })
    if (!video) return sendError(res, 'Video not found.', 404)

    await prisma.weekVideo.delete({ where: { id: video.id } })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, { id: video.id }, 'Video deleted.')
  } catch (err) {
    next(err)
  }
})

// ─── Modules ──────────────────────────────────────────────────────────────────

// Create a module for a course
router.post('/admin/courses/:courseId/modules', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return
    if (course.status === 'APPROVED' && req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'ADMIN') return sendError(res, 'Cannot edit an approved course.', 400)

    const parsed = z.object({
      title: z.string().trim().min(1).max(200),
      description: z.string().trim().max(1000).optional(),
      introVideoUrl: z.string().url().optional().nullable(),
    }).safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

    const count = await prisma.module.count({ where: { courseId: course.id } })
    const mod = await prisma.module.create({
      data: { courseId: course.id, ...parsed.data, position: count + 1 },
    })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, mod, 'Module created.', 201)
  } catch (err) {
    next(err)
  }
})

// Update a module
router.patch('/admin/courses/:courseId/modules/:moduleId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return
    if (course.status === 'APPROVED' && req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'ADMIN') return sendError(res, 'Cannot edit an approved course.', 400)

    const mod = await prisma.module.findFirst({ where: { id: req.params.moduleId, courseId: course.id } })
    if (!mod) return sendError(res, 'Module not found.', 404)

    const parsed = z.object({
      title: z.string().trim().min(1).max(200).optional(),
      description: z.string().trim().max(1000).optional(),
      introVideoUrl: z.string().url().optional().nullable(),
    }).safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

    const updated = await prisma.module.update({ where: { id: mod.id }, data: parsed.data })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, updated, 'Module updated.')
  } catch (err) {
    next(err)
  }
})

// Delete a module
router.delete('/admin/courses/:courseId/modules/:moduleId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return
    if (course.status === 'APPROVED' && req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'ADMIN') return sendError(res, 'Cannot edit an approved course.', 400)

    const mod = await prisma.module.findFirst({ where: { id: req.params.moduleId, courseId: course.id } })
    if (!mod) return sendError(res, 'Module not found.', 404)

    // Unassign all weeks from this module before deleting
    await prisma.week.updateMany({ where: { moduleId: mod.id }, data: { moduleId: null } })
    await prisma.module.delete({ where: { id: mod.id } })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, { id: mod.id }, 'Module deleted.')
  } catch (err) {
    next(err)
  }
})

// Create a lesson in a module
router.post('/admin/courses/:courseId/modules/:moduleId/lessons', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return
    if (course.status === 'APPROVED' && req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'ADMIN') return sendError(res, 'Cannot edit an approved course.', 400)

    const mod = await prisma.module.findFirst({ where: { id: req.params.moduleId, courseId: course.id } })
    if (!mod) return sendError(res, 'Module not found.', 404)

    const parsed = z.object({
      title: z.string().trim().min(1).max(200),
      content: z.string().trim().min(1).max(50000),
      duration: z.number().int().min(1).max(600),
    }).safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

    const lessonCount = await prisma.lesson.count({ where: { moduleId: mod.id } })
    const lesson = await prisma.lesson.create({
      data: {
        ...parsed.data,
        moduleId: mod.id,
        position: lessonCount + 1,
      },
    })

    return sendSuccess(res, lesson, 'Lesson created.', 201)
  } catch (err) {
    next(err)
  }
})

// Delete a lesson
router.delete('/lesson/:lessonId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lesson = await prisma.lesson.findUnique({ where: { id: req.params.lessonId } })
    if (!lesson) return sendError(res, 'Lesson not found.', 404)

    // Verify user has permission (owns the course)
    const course = await prisma.course.findFirst({
      where: {
        modules: { some: { lessons: { some: { id: lesson.id } } } },
      },
    })
    if (!course) return sendError(res, 'Lesson not found.', 404)
    if (req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'ADMIN' && course.createdById !== req.user!.userId) {
      return sendError(res, 'Forbidden.', 403)
    }

    // Delete all videos associated with the lesson
    await prisma.lessonVideo.deleteMany({ where: { lessonId: lesson.id } })

    // Delete all facilitators assigned to the lesson
    await prisma.lessonFacilitator.deleteMany({ where: { lessonId: lesson.id } })

    // Delete the lesson
    await prisma.lesson.delete({ where: { id: lesson.id } })

    return sendSuccess(res, { id: lesson.id }, 'Lesson deleted.')
  } catch (err) {
    next(err)
  }
})

// Add facilitator to lesson
router.post('/lessons/:lessonId/facilitators', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lesson = await prisma.lesson.findUnique({ where: { id: req.params.lessonId } })
    if (!lesson) return sendError(res, 'Lesson not found.', 404)

    const { facilitatorId } = z.object({ facilitatorId: z.string().uuid() }).parse(req.body)

    const facilitator = await prisma.facilitator.findUnique({ where: { id: facilitatorId } })
    if (!facilitator) return sendError(res, 'Facilitator not found.', 404)

    // Check if already assigned
    const existing = await prisma.lessonFacilitator.findUnique({
      where: { lessonId_facilitatorId: { lessonId: lesson.id, facilitatorId } },
    })
    if (existing) return sendError(res, 'Facilitator already assigned to this lesson.', 409)

    const lf = await prisma.lessonFacilitator.create({
      data: { lessonId: lesson.id, facilitatorId },
      include: { facilitator: true },
    })

    return sendSuccess(res, lf.facilitator, 'Facilitator added to lesson.', 201)
  } catch (err) {
    next(err)
  }
})

// Remove facilitator from lesson
router.delete('/lessons/:lessonId/facilitators/:facilitatorId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lesson = await prisma.lesson.findUnique({ where: { id: req.params.lessonId } })
    if (!lesson) return sendError(res, 'Lesson not found.', 404)

    const lf = await prisma.lessonFacilitator.findUnique({
      where: { lessonId_facilitatorId: { lessonId: lesson.id, facilitatorId: req.params.facilitatorId } },
    })
    if (!lf) return sendError(res, 'Facilitator not assigned to this lesson.', 404)

    await prisma.lessonFacilitator.delete({
      where: { lessonId_facilitatorId: { lessonId: lesson.id, facilitatorId: req.params.facilitatorId } },
    })

    return sendSuccess(res, { id: lf.facilitatorId }, 'Facilitator removed from lesson.')
  } catch (err) {
    next(err)
  }
})

// Assign a week to a module
router.patch('/admin/courses/:courseId/weeks/:weekId/module', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return
    if (course.status === 'APPROVED' && req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'ADMIN') return sendError(res, 'Cannot edit an approved course.', 400)

    const week = await prisma.week.findFirst({ where: { id: req.params.weekId, courseId: course.id } })
    if (!week) return sendError(res, 'Week not found.', 404)

    const { moduleId } = z.object({ moduleId: z.string().nullable() }).parse(req.body)

    if (moduleId) {
      const mod = await prisma.module.findFirst({ where: { id: moduleId, courseId: course.id } })
      if (!mod) return sendError(res, 'Module not found.', 404)
    }

    const updated = await prisma.week.update({ where: { id: week.id }, data: { moduleId } })
    return sendSuccess(res, { moduleId: updated.moduleId }, 'Week module assignment updated.')
  } catch (err) {
    next(err)
  }
})

// Create or replace quiz for a week
router.post('/admin/courses/:courseId/weeks/:weekId/quiz', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return
    if (course.status === 'APPROVED' && req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'ADMIN') return sendError(res, 'Cannot edit an approved course.', 400)

    const week = await prisma.week.findFirst({ where: { id: req.params.weekId, courseId: course.id } })
    if (!week) return sendError(res, 'Week not found.', 404)

    const parsed = createQuizSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

    // Delete existing quiz if any
    await prisma.quiz.deleteMany({ where: { weekId: week.id } })

    const quiz = await prisma.quiz.create({
      data: {
        weekId: week.id,
        title: parsed.data.title,
        passMark: parsed.data.passMark,
        attemptLimit: parsed.data.attemptLimit,
        questions: {
          create: parsed.data.questions.map(q => ({
            prompt: q.prompt,
            explanation: q.explanation,
            position: q.position,
            options: {
              create: q.options.map(o => ({
                label: o.label,
                isCorrect: o.isCorrect,
                position: o.position,
              })),
            },
          })),
        },
      },
      include: { questions: { include: { options: true }, orderBy: { position: 'asc' } } },
    })

    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, quiz, 'Quiz saved.', 201)
  } catch (err) {
    next(err)
  }
})

// ─── Granular quiz editing (per-question) ─────────────────────────────────

// Update only quiz settings (title, pass mark, attempt limit) — doesn't touch questions
router.patch('/admin/courses/:courseId/weeks/:weekId/quiz/settings', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return

    const week = await prisma.week.findFirst({ where: { id: req.params.weekId, courseId: course.id } })
    if (!week) return sendError(res, 'Week not found.', 404)

    const quiz = await prisma.quiz.findFirst({ where: { weekId: week.id } })
    if (!quiz) return sendError(res, 'Quiz not found. Create the quiz first.', 404)

    const parsed = quizSettingsSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

    const updated = await prisma.quiz.update({ where: { id: quiz.id }, data: parsed.data })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, updated, 'Quiz settings updated.')
  } catch (err) {
    next(err)
  }
})

// Add a question (with options) to an existing quiz
router.post('/admin/courses/:courseId/weeks/:weekId/quiz/questions', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return

    const week = await prisma.week.findFirst({ where: { id: req.params.weekId, courseId: course.id } })
    if (!week) return sendError(res, 'Week not found.', 404)

    const quiz = await prisma.quiz.findFirst({ where: { weekId: week.id } })
    if (!quiz) return sendError(res, 'Quiz not found. Create the quiz first.', 404)

    const parsed = quizQuestionInputSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

    const count = await prisma.quizQuestion.count({ where: { quizId: quiz.id } })
    if (count >= 30) return sendError(res, 'Quiz cannot have more than 30 questions.', 400)

    const question = await prisma.quizQuestion.create({
      data: {
        quizId: quiz.id,
        prompt: parsed.data.prompt,
        explanation: parsed.data.explanation,
        position: count + 1,
        options: {
          create: parsed.data.options.map((o, i) => ({
            label: o.label,
            isCorrect: o.isCorrect,
            position: i + 1,
          })),
        },
      },
      include: { options: { orderBy: { position: 'asc' } } },
    })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, question, 'Question added.', 201)
  } catch (err) {
    next(err)
  }
})

// Update a single question (prompt + explanation + replace options)
router.patch('/admin/courses/:courseId/weeks/:weekId/quiz/questions/:questionId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return

    const question = await prisma.quizQuestion.findFirst({
      where: { id: req.params.questionId, quiz: { week: { id: req.params.weekId, courseId: course.id } } },
    })
    if (!question) return sendError(res, 'Question not found.', 404)

    const parsed = quizQuestionInputSchema.partial().safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

    // Update question fields; replace options if provided
    await prisma.$transaction(async (tx) => {
      const updateData: { prompt?: string; explanation?: string } = {}
      if (parsed.data.prompt !== undefined) updateData.prompt = parsed.data.prompt
      if (parsed.data.explanation !== undefined) updateData.explanation = parsed.data.explanation
      if (Object.keys(updateData).length > 0) {
        await tx.quizQuestion.update({ where: { id: question.id }, data: updateData })
      }
      if (parsed.data.options) {
        await tx.quizOption.deleteMany({ where: { questionId: question.id } })
        await tx.quizOption.createMany({
          data: parsed.data.options.map((o, i) => ({
            questionId: question.id,
            label: o.label,
            isCorrect: o.isCorrect,
            position: i + 1,
          })),
        })
      }
    })

    const updated = await prisma.quizQuestion.findUnique({
      where: { id: question.id },
      include: { options: { orderBy: { position: 'asc' } } },
    })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, updated, 'Question updated.')
  } catch (err) {
    next(err)
  }
})

// Delete a single question
router.delete('/admin/courses/:courseId/weeks/:weekId/quiz/questions/:questionId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return

    const question = await prisma.quizQuestion.findFirst({
      where: { id: req.params.questionId, quiz: { week: { id: req.params.weekId, courseId: course.id } } },
    })
    if (!question) return sendError(res, 'Question not found.', 404)

    await prisma.quizQuestion.delete({ where: { id: question.id } })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, { id: question.id }, 'Question deleted.')
  } catch (err) {
    next(err)
  }
})

// Create assignment for a week
router.post('/admin/courses/:courseId/weeks/:weekId/assignments', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return
    if (course.status === 'APPROVED' && req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'ADMIN') return sendError(res, 'Cannot edit an approved course.', 400)

    const week = await prisma.week.findFirst({ where: { id: req.params.weekId, courseId: course.id } })
    if (!week) return sendError(res, 'Week not found.', 404)

    const parsed = createAssignmentSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

    const existingCount = await prisma.assignment.count({ where: { weekId: week.id } })
    const { choices, ...assignmentData } = parsed.data

    const assignment = await prisma.assignment.create({
      data: {
        ...assignmentData,
        deadline: new Date(assignmentData.deadline),
        weekId: week.id,
        position: assignmentData.position ?? existingCount + 1,
        choices: {
          create: choices.map(c => ({ title: c.title, description: c.description, position: c.position })),
        },
      },
      include: { choices: { orderBy: { position: 'asc' } } },
    })

    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, assignment, 'Assignment created.', 201)
  } catch (err) {
    next(err)
  }
})

// Delete an assignment from a week
router.delete('/admin/courses/:courseId/weeks/:weekId/assignments/:assignmentId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return
    if (course.status === 'APPROVED' && req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'ADMIN') return sendError(res, 'Cannot edit an approved course.', 400)

    const week = await prisma.week.findFirst({ where: { id: req.params.weekId, courseId: course.id } })
    if (!week) return sendError(res, 'Week not found.', 404)

    const assignment = await prisma.assignment.findFirst({ where: { id: req.params.assignmentId, weekId: week.id } })
    if (!assignment) return sendError(res, 'Assignment not found.', 404)

    await prisma.assignment.delete({ where: { id: assignment.id } })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, { id: assignment.id }, 'Assignment deleted.')
  } catch (err) {
    next(err)
  }
})

// Delete a quiz from a week
router.delete('/admin/courses/:courseId/weeks/:weekId/quiz', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return
    if (course.status === 'APPROVED' && req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'ADMIN') return sendError(res, 'Cannot edit an approved course.', 400)

    const week = await prisma.week.findFirst({ where: { id: req.params.weekId, courseId: course.id } })
    if (!week) return sendError(res, 'Week not found.', 404)

    const result = await prisma.quiz.deleteMany({ where: { weekId: week.id } })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, { deleted: result.count }, 'Quiz deleted.')
  } catch (err) {
    next(err)
  }
})

// ─── Glossary Terms (per week) ────────────────────────────────────────────

const glossaryTermSchema = z.object({
  term: z.string().trim().min(1).max(200),
  definition: z.string().trim().min(1).max(2000),
  example: z.string().trim().max(2000).optional().nullable(),
})

router.post('/admin/courses/:courseId/weeks/:weekId/glossary', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return

    const week = await prisma.week.findFirst({ where: { id: req.params.weekId, courseId: course.id } })
    if (!week) return sendError(res, 'Week not found.', 404)

    const parsed = glossaryTermSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

    // Term is unique per week — reject duplicates with a friendly message
    const existing = await prisma.glossaryTerm.findUnique({
      where: { weekId_term: { weekId: week.id, term: parsed.data.term } },
    })
    if (existing) return sendError(res, `A glossary term "${parsed.data.term}" already exists for this lesson.`, 409)

    const count = await prisma.glossaryTerm.count({ where: { weekId: week.id } })
    const term = await prisma.glossaryTerm.create({
      data: {
        weekId: week.id,
        term: parsed.data.term,
        definition: parsed.data.definition,
        example: parsed.data.example || null,
        position: count + 1,
      },
    })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, term, 'Glossary term added.', 201)
  } catch (err) {
    next(err)
  }
})

router.patch('/admin/courses/:courseId/weeks/:weekId/glossary/:termId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return

    const term = await prisma.glossaryTerm.findFirst({
      where: { id: req.params.termId, week: { id: req.params.weekId, courseId: course.id } },
    })
    if (!term) return sendError(res, 'Glossary term not found.', 404)

    const parsed = glossaryTermSchema.partial().safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

    const updated = await prisma.glossaryTerm.update({
      where: { id: term.id },
      data: {
        ...parsed.data,
        example: parsed.data.example === undefined ? undefined : (parsed.data.example || null),
      },
    })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, updated, 'Glossary term updated.')
  } catch (err) {
    next(err)
  }
})

router.delete('/admin/courses/:courseId/weeks/:weekId/glossary/:termId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return

    const term = await prisma.glossaryTerm.findFirst({
      where: { id: req.params.termId, week: { id: req.params.weekId, courseId: course.id } },
    })
    if (!term) return sendError(res, 'Glossary term not found.', 404)

    await prisma.glossaryTerm.delete({ where: { id: term.id } })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, { id: term.id }, 'Glossary term deleted.')
  } catch (err) {
    next(err)
  }
})

// ─── Reading Resources (per week) ─────────────────────────────────────────

const readingResourceSchema = z.object({
  title: z.string().trim().min(1).max(200),
  source: z.string().trim().min(1).max(200),
  url: z.string().url(),
  description: z.string().trim().max(2000).default(''),
  type: z.enum(['ARTICLE', 'COURSE', 'DOCUMENTATION', 'WHITEPAPER', 'VIDEO', 'INTERACTIVE']),
})

// Add a reading resource (slide link, article, doc, etc.) to a week
router.post('/admin/courses/:courseId/weeks/:weekId/resources', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return

    const week = await prisma.week.findFirst({ where: { id: req.params.weekId, courseId: course.id } })
    if (!week) return sendError(res, 'Week not found.', 404)

    const parsed = readingResourceSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

    const count = await prisma.readingResource.count({ where: { weekId: week.id } })
    const resource = await prisma.readingResource.create({
      data: { weekId: week.id, ...parsed.data, position: count + 1 },
    })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, resource, 'Resource added.', 201)
  } catch (err) {
    next(err)
  }
})

// Update a reading resource
router.patch('/admin/courses/:courseId/weeks/:weekId/resources/:resourceId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return

    const resource = await prisma.readingResource.findFirst({
      where: { id: req.params.resourceId, week: { id: req.params.weekId, courseId: course.id } },
    })
    if (!resource) return sendError(res, 'Resource not found.', 404)

    const parsed = readingResourceSchema.partial().safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

    const updated = await prisma.readingResource.update({ where: { id: resource.id }, data: parsed.data })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, updated, 'Resource updated.')
  } catch (err) {
    next(err)
  }
})

// Delete a reading resource
router.delete('/admin/courses/:courseId/weeks/:weekId/resources/:resourceId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return

    const resource = await prisma.readingResource.findFirst({
      where: { id: req.params.resourceId, week: { id: req.params.weekId, courseId: course.id } },
    })
    if (!resource) return sendError(res, 'Resource not found.', 404)

    await prisma.readingResource.delete({ where: { id: resource.id } })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, { id: resource.id }, 'Resource deleted.')
  } catch (err) {
    next(err)
  }
})

// ─── Slide Decks (multiple per week) ──────────────────────────────────────

const slideDeckSchema = z.object({
  title: z.string().trim().min(1).max(200),
  url: z.string().url(),
  slideCount: z.number().int().min(1).max(500).default(1),
  viewerType: z.enum(['MODAL', 'EXTERNAL']).default('EXTERNAL'),
})

// Add a slide deck to a week (one of many)
router.post('/admin/courses/:courseId/weeks/:weekId/slides', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return

    const week = await prisma.week.findFirst({ where: { id: req.params.weekId, courseId: course.id } })
    if (!week) return sendError(res, 'Week not found.', 404)

    const parsed = slideDeckSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

    const count = await prisma.slideDeck.count({ where: { weekId: week.id } })
    const deck = await prisma.slideDeck.create({
      data: {
        ...parsed.data,
        weekId: week.id,
        lastUpdatedAt: new Date(),
        position: count + 1,
      },
    })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, deck, 'Slide deck added.', 201)
  } catch (err) {
    next(err)
  }
})

// Update a specific slide deck
router.patch('/admin/courses/:courseId/weeks/:weekId/slides/:slideId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return

    const deck = await prisma.slideDeck.findFirst({
      where: { id: req.params.slideId, week: { id: req.params.weekId, courseId: course.id } },
    })
    if (!deck) return sendError(res, 'Slide deck not found.', 404)

    const parsed = slideDeckSchema.partial().safeParse(req.body)
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

    const updated = await prisma.slideDeck.update({
      where: { id: deck.id },
      data: { ...parsed.data, lastUpdatedAt: new Date() },
    })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, updated, 'Slide deck updated.')
  } catch (err) {
    next(err)
  }
})

// Delete a specific slide deck
router.delete('/admin/courses/:courseId/weeks/:weekId/slides/:slideId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return

    const deck = await prisma.slideDeck.findFirst({
      where: { id: req.params.slideId, week: { id: req.params.weekId, courseId: course.id } },
    })
    if (!deck) return sendError(res, 'Slide deck not found.', 404)

    await prisma.slideDeck.delete({ where: { id: deck.id } })
    await markCourseDirtyIfNeeded(course.id, req.user!.role, course.status)
    return sendSuccess(res, { id: deck.id }, 'Slide deck deleted.')
  } catch (err) {
    next(err)
  }
})

// Add facilitator to course
router.post('/admin/courses/:courseId/facilitators', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return
    if (course.status === 'APPROVED' && req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'ADMIN') return sendError(res, 'Cannot edit an approved course.', 400)

    const { facilitatorId } = z.object({ facilitatorId: z.string().uuid() }).parse(req.body)

    const facilitator = await prisma.facilitator.findUnique({ where: { id: facilitatorId } })
    if (!facilitator) return sendError(res, 'Facilitator not found.', 404)

    const existing = await prisma.courseFacilitator.findUnique({
      where: { courseId_facilitatorId: { courseId: course.id, facilitatorId } },
    })
    if (existing) return sendError(res, 'Facilitator already assigned to this course.', 409)

    const count = await prisma.courseFacilitator.count({ where: { courseId: course.id } })
    const cf = await prisma.courseFacilitator.create({
      data: { courseId: course.id, facilitatorId, position: count + 1 },
      include: { facilitator: true },
    })

    return sendSuccess(res, cf.facilitator, 'Facilitator added.', 201)
  } catch (err) {
    next(err)
  }
})

// Remove facilitator from course
router.delete('/admin/courses/:courseId/facilitators/:facilitatorId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
    if (!course) return
    if (course.status === 'APPROVED' && req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'ADMIN') return sendError(res, 'Cannot edit an approved course.', 400)

    const cf = await prisma.courseFacilitator.findUnique({
      where: { courseId_facilitatorId: { courseId: course.id, facilitatorId: req.params.facilitatorId } },
    })
    if (!cf) return sendError(res, 'Facilitator not assigned to this course.', 404)

    await prisma.courseFacilitator.delete({ where: { id: cf.id } })
    return sendSuccess(res, { facilitatorId: req.params.facilitatorId }, 'Facilitator removed.')
  } catch (err) {
    next(err)
  }
})

// ─── Super Admin ──────────────────────────────────────────────────────────────

// List all courses (filterable by status)
router.get('/superadmin/courses', requireAuth, requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as CourseStatus | undefined
    const courses = await prisma.course.findMany({
      where: status ? { status } : {},
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { weeks: true } },
        courseFacilitators: {
          include: { facilitator: { select: { id: true, name: true, title: true, photoUrl: true } } },
          orderBy: { position: 'asc' },
        },
        createdBy: { select: { id: true, name: true, email: true } },
        approvals: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { reviewer: { select: { id: true, name: true } } },
        },
      },
    })
    return sendSuccess(res, courses)
  } catch (err) {
    next(err)
  }
})

// Get a single course detail (super admin view)
router.get('/superadmin/courses/:courseId', requireAuth, requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.courseId },
      include: {
        courseFacilitators: { include: { facilitator: true }, orderBy: { position: 'asc' } },
        weeks: {
          orderBy: { number: 'asc' },
          include: {
            topics: { orderBy: { position: 'asc' } },
            objectives: { orderBy: { position: 'asc' } },
            quiz: { include: { questions: { orderBy: { position: 'asc' }, include: { options: { orderBy: { position: 'asc' } } } } } },
            assignments: { orderBy: { position: 'asc' }, include: { choices: { orderBy: { position: 'asc' } } } },
            images: { orderBy: { position: 'asc' } },
          },
        },
        approvals: {
          orderBy: { createdAt: 'desc' },
          include: { reviewer: { select: { id: true, name: true, email: true } } },
        },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    })
    if (!course) return sendError(res, 'Course not found.', 404)
    return sendSuccess(res, course)
  } catch (err) {
    next(err)
  }
})

// Approve a course
router.post('/superadmin/courses/:courseId/approve', requireAuth, requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.courseId } })
    if (!course) return sendError(res, 'Course not found.', 404)
    if (course.status !== 'PENDING_REVIEW') return sendError(res, 'Only courses pending review can be approved.', 400)

    const { notes } = z.object({ notes: z.string().trim().max(2000).optional() }).parse(req.body)

    await prisma.$transaction([
      prisma.course.update({
        where: { id: course.id },
        data: { status: 'APPROVED', published: true, publishedAt: new Date(), approvedAt: new Date(), approvalNotes: null },
      }),
      // Publish ALL weeks under the course so they appear on the public course page.
      // Without this, learners would see "0 lessons" on a published course because
      // the public /courses/:slug endpoint filters weeks by `published: true`.
      prisma.week.updateMany({
        where: { courseId: course.id },
        data: { published: true },
      }),
      prisma.courseApproval.create({
        data: { courseId: course.id, reviewerId: req.user!.userId, action: 'APPROVED', notes: notes ?? null },
      }),
    ])

    return sendSuccess(res, { id: course.id, status: 'APPROVED' }, 'Course approved and published.')
  } catch (err) {
    next(err)
  }
})

// Reject a course
router.post('/superadmin/courses/:courseId/reject', requireAuth, requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.courseId } })
    if (!course) return sendError(res, 'Course not found.', 404)
    if (course.status !== 'PENDING_REVIEW') return sendError(res, 'Only courses pending review can be rejected.', 400)

    const { notes } = z.object({ notes: z.string().trim().min(1, 'Rejection reason is required').max(2000) }).parse(req.body)

    await prisma.$transaction([
      prisma.course.update({
        where: { id: course.id },
        data: { status: 'REJECTED', published: false, approvalNotes: notes },
      }),
      prisma.courseApproval.create({
        data: { courseId: course.id, reviewerId: req.user!.userId, action: 'REJECTED', notes },
      }),
    ])

    return sendSuccess(res, { id: course.id, status: 'REJECTED' }, 'Course rejected.')
  } catch (err) {
    next(err)
  }
})

// ── Super Admin: Platform overview ────────────────────────────────────────────
router.get('/superadmin/overview', requireAuth, requireSuperAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      adminCount,
      totalEnrollments,
      totalCourses,
      coursesByStatus,
      totalSubmissions,
      pendingSubmissions,
      totalWeeks,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
      prisma.courseEnrollment.count(),
      prisma.course.count(),
      prisma.course.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.assignmentSubmission.count(),
      prisma.assignmentSubmission.count({ where: { status: 'SUBMITTED' } }),
      prisma.week.count(),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
    ])

    const statusMap: Record<string, number> = {}
    for (const s of coursesByStatus) statusMap[s.status] = s._count._all

    return sendSuccess(res, {
      totalUsers,
      adminCount,
      learnerCount: totalUsers - adminCount,
      totalEnrollments,
      totalCourses,
      coursesByStatus: statusMap,
      totalSubmissions,
      pendingSubmissions,
      totalWeeks,
      recentUsers,
    })
  } catch (err) {
    next(err)
  }
})

// ── Super Admin: List users ───────────────────────────────────────────────────
router.get('/superadmin/users', requireAuth, requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, search, page = '1', limit = '30' } = req.query as Record<string, string>
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const where: Prisma.UserWhereInput = {}
    if (role) where.role = role as any
    if (search) where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        select: {
          id: true, name: true, email: true, role: true, createdAt: true,
          _count: { select: { courseEnrollments: true } },
          profile: { select: { country: true, onboardingCompleted: true } },
        },
      }),
      prisma.user.count({ where }),
    ])

    return sendSuccess(res, { users, total, page: parseInt(page), limit: parseInt(limit) })
  } catch (err) {
    next(err)
  }
})

// ── Super Admin: Create admin user ────────────────────────────────────────────
router.post('/superadmin/users', requireAuth, requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = z.object({
      name: z.string().trim().min(2).max(100),
      email: z.string().email().toLowerCase(),
      password: z.string().min(8).max(72),
    }).parse(req.body)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return sendError(res, 'A user with this email already exists.', 409)

    const bcrypt = await import('bcryptjs')
    const hashed = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
        role: 'ADMIN',
        profile: { create: { onboardingCompleted: true } },
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    return sendSuccess(res, user, 'Admin account created.')
  } catch (err) {
    next(err)
  }
})

// ── Super Admin: Change user role ─────────────────────────────────────────────
router.patch('/superadmin/users/:userId/role', requireAuth, requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = z.object({
      role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']),
    }).parse(req.body)

    const user = await prisma.user.findUnique({ where: { id: req.params.userId } })
    if (!user) return sendError(res, 'User not found.', 404)
    if (user.id === req.user!.userId && role !== 'SUPER_ADMIN') {
      return sendError(res, 'You cannot change your own role.', 400)
    }

    const updated = await prisma.user.update({
      where: { id: req.params.userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    })

    return sendSuccess(res, updated, 'User role updated.')
  } catch (err) {
    next(err)
  }
})

// ─── DELETE /superadmin/users/:userId ──────────────────────────────────────────

router.delete('/superadmin/users/:userId', requireAuth, requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.userId } })
    if (!user) return sendError(res, 'User not found.', 404)
    if (user.id === req.user!.userId) {
      return sendError(res, 'You cannot delete yourself.', 400)
    }

    await prisma.user.delete({ where: { id: req.params.userId } })
    return sendSuccess(res, { id: req.params.userId }, 'User deleted.')
  } catch (err) {
    next(err)
  }
})

// ─── DELETE /superadmin/courses/:courseId ──────────────────────────────────────

router.delete('/superadmin/courses/:courseId', requireAuth, requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.courseId } })
    if (!course) return sendError(res, 'Course not found.', 404)

    await prisma.course.delete({ where: { id: req.params.courseId } })
    return sendSuccess(res, { id: req.params.courseId }, 'Course deleted.')
  } catch (err) {
    next(err)
  }
})

// ─── GET /admin/courses/:courseId/enrollments ──────────────────────────────────

router.get('/admin/courses/:courseId/enrollments', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.courseId },
      select: { createdById: true },
    })

    if (!course) return sendError(res, 'Course not found.', 404)

    // Only the creator or a superadmin can view enrollments
    if (course.createdById !== req.user!.userId && req.user!.role !== 'SUPER_ADMIN') {
      return sendError(res, 'Unauthorized.', 403)
    }

    const enrollments = await prisma.courseEnrollment.findMany({
      where: { courseId: req.params.courseId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            profile: {
              select: {
                country: true,
                experienceLevel: true,
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    })

    return sendSuccess(res, enrollments)
  } catch (err) {
    next(err)
  }
})

export default router
