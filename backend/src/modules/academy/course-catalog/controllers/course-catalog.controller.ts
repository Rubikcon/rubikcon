import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { sendSuccess, sendPaginated, sendError } from '../../../../shared/api/response'
import { AppError } from '../../../../shared/errors/AppError'
import { courseCatalogService } from '../services/course-catalog.service'
import { courseCatalogRepository } from '../repositories/course-catalog.repository'
import { progressService } from '../../progress/services/progress.service'
import {
  maskEmail,
  serializeQuizForDelivery,
  serializeAssignmentsForDelivery,
  getUserWeekState,
  moduleFeedbackSchema,
  testimonialSchema,
  getCourseOrFail
} from './course-catalog.helpers'
import {
  ContactSchema,
  CreateCourseSchema,
  UpdateCourseSchema,
  CoursePricingSchema,
  CreateWeekSchema,
  UpdateWeekSchema,
  CreateModuleSchema,
  UpdateModuleSchema,
  CreateLessonSchema,
  UpdateWeekContentSchema,
  CreateWeekImageSchema,
  CreateWeekVideoSchema,
  UpdateWeekVideoSchema,
  ReorderWeekVideosSchema,
  AssignWeekFacilitatorSchema,
  GlossaryTermSchema,
  ReadingResourceSchema,
  SlideDeckSchema
} from '../schemas/course-catalog.schemas'

export class CourseCatalogController {
  async getTestimonials(req: Request, res: Response, next: NextFunction) {
    try {
      const testimonials = await courseCatalogService.getTestimonials()
      return sendSuccess(res, testimonials)
    } catch (err) {
      next(err)
    }
  }

  async getFacilitators(req: Request, res: Response, next: NextFunction) {
    try {
      const facilitators = await courseCatalogService.getFacilitators()
      return sendSuccess(res, facilitators)
    } catch (err) {
      next(err)
    }
  }

  async contactUs(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = ContactSchema.safeParse(req.body)
      if (!parsed.success) {
        throw new AppError('Validation failed', 400, parsed.error.flatten().fieldErrors)
      }

      const result = await courseCatalogService.contactUs(parsed.data)
      return sendSuccess(
        res,
        result,
        'Thank you for contacting Rubikcon Nexus Academy. Your message has been received, and a member of our team will respond within 2 business days.',
      )
    } catch (err) {
      next(err)
    }
  }

  async getPlatformStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await courseCatalogService.getPlatformStats()
      return sendSuccess(res, stats)
    } catch (err) {
      next(err)
    }
  }

  async getPublicCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1)
      const limit = Math.min(50, parseInt(req.query.limit as string) || 12)
      
      const { courses, total } = await courseCatalogService.getPublicCourses(page, limit, req.user?.userId)
      
      return sendPaginated(res, courses, total, page, limit)
    } catch (err) {
      next(err)
    }
  }

  async getCourseDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await courseCatalogService.getCourseDetails(req.params.slug, req.user)
      return sendSuccess(res, course)
    } catch (err) {
      next(err)
    }
  }

  async getCourseWeeks(req: Request, res: Response, next: NextFunction) {
    try {
      const weeks = await courseCatalogService.getCourseWeeks(req.params.slug, req.user)
      return sendSuccess(res, weeks)
    } catch (err) {
      next(err)
    }
  }

  // --- Admin Course Management ---

  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = CreateCourseSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

      const course = await courseCatalogService.createCourse(parsed.data, req.user!.userId, req.user!)
      return sendSuccess(res, course, 'Course created.', 201)
    } catch (err) {
      next(err)
    }
  }

  async getAdminCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1)
      const limit = Math.min(50, parseInt(req.query.limit as string) || 10)
      
      const { courses, total } = await courseCatalogService.getAdminCourses(page, limit, req.user!.userId, req.user!.role)
      return sendPaginated(res, courses, total, page, limit)
    } catch (err) {
      next(err)
    }
  }

  async getAdminCourseDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await courseCatalogService.getAdminCourseDetails(req.params.courseId, req.user!.userId, req.user!.role)
      return sendSuccess(res, course)
    } catch (err) {
      next(err)
    }
  }

  async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = UpdateCourseSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

      let pricingData: any = {}
      if (req.user!.role === 'SUPER_ADMIN') {
        const pricingParsed = CoursePricingSchema.safeParse(req.body)
        if (!pricingParsed.success) return sendError(res, 'Validation failed', 400, pricingParsed.error.flatten().fieldErrors)
        pricingData = pricingParsed.data
      }

      const updated = await courseCatalogService.updateCourse(
        req.params.courseId, 
        parsed.data, 
        pricingData, 
        req.user!.userId, 
        req.user!.role
      )
      return sendSuccess(res, updated, 'Course updated.')
    } catch (err) {
      next(err)
    }
  }

  async deleteCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await courseCatalogService.deleteCourse(req.params.courseId, req.user!.userId, req.user!.role)
      return sendSuccess(res, result, 'Course deleted.')
    } catch (err) {
      next(err)
    }
  }

  async submitCourseForReview(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await courseCatalogService.submitCourseForReview(req.params.courseId, req.user!.userId, req.user!.role)
      return sendSuccess(res, updated, 'Course submitted for review.')
    } catch (err) {
      next(err)
    }
  }

  // --- Admin Week Management ---

  async createWeek(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = CreateWeekSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

      const week = await courseCatalogService.createWeek(req.params.courseId, parsed.data, req.user!.userId, req.user!.role)
      return sendSuccess(res, week, 'Week added.', 201)
    } catch (err) {
      next(err)
    }
  }

  async updateWeek(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = UpdateWeekSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

      const updated = await courseCatalogService.updateWeek(req.params.courseId, req.params.weekId, parsed.data, req.user!.userId, req.user!.role)
      return sendSuccess(res, updated, 'Week updated.')
    } catch (err) {
      next(err)
    }
  }

  async deleteWeek(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await courseCatalogService.deleteWeek(req.params.courseId, req.params.weekId, req.user!.userId, req.user!.role)
      return sendSuccess(res, result, 'Week deleted.')
    } catch (err) {
      next(err)
    }
  }

  // --- Admin Module Management ---

  async createModule(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = CreateModuleSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

      const mod = await courseCatalogService.createModule(req.params.courseId, parsed.data, req.user!.userId, req.user!.role)
      return sendSuccess(res, mod, 'Module created.', 201)
    } catch (err) {
      next(err)
    }
  }

  async updateModule(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = UpdateModuleSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

      const updated = await courseCatalogService.updateModule(req.params.courseId, req.params.moduleId, parsed.data, req.user!.userId, req.user!.role)
      return sendSuccess(res, updated, 'Module updated.')
    } catch (err) {
      next(err)
    }
  }

  async deleteModule(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await courseCatalogService.deleteModule(req.params.courseId, req.params.moduleId, req.user!.userId, req.user!.role)
      return sendSuccess(res, result, 'Module deleted.')
    } catch (err) {
      next(err)
    }
  }

  async setWeekModule(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = z.object({ moduleId: z.string().uuid().nullable() }).safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const updated = await courseCatalogService.setWeekModule(req.params.courseId, req.params.weekId, parsed.data.moduleId, req.user!.userId, req.user!.role)
      return sendSuccess(res, { moduleId: updated.moduleId }, 'Week module assignment updated.')
    } catch (err) { next(err) }
  }

  // --- Lessons ---
  async addLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = CreateLessonSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const lesson = await courseCatalogService.addLesson(req.params.courseId, req.params.moduleId, parsed.data, req.user!.userId, req.user!.role)
      return sendSuccess(res, lesson, 'Lesson created.', 201)
    } catch (err) { next(err) }
  }

  async removeLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await courseCatalogService.removeLesson(req.params.lessonId, req.user!.userId, req.user!.role)
      return sendSuccess(res, result, 'Lesson deleted.')
    } catch (err) { next(err) }
  }

  // --- Lesson Facilitators ---
  async addLessonFacilitator(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = AssignWeekFacilitatorSchema.safeParse(req.body) // Same schema structure { facilitatorId }
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const lf = await courseCatalogService.addLessonFacilitator(req.params.lessonId, parsed.data.facilitatorId, req.user!.userId, req.user!.role)
      return sendSuccess(res, lf, 'Facilitator added to lesson.', 201)
    } catch (err) { next(err) }
  }

  async removeLessonFacilitator(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await courseCatalogService.removeLessonFacilitator(req.params.lessonId, req.params.facilitatorId, req.user!.userId, req.user!.role)
      return sendSuccess(res, result, 'Facilitator removed from lesson.')
    } catch (err) { next(err) }
  }

  // --- Admin Lesson Content Management ---

  async updateWeekContent(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = UpdateWeekContentSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const updated = await courseCatalogService.updateWeekContent(req.params.courseId, req.params.weekId, parsed.data.lessonContent, req.user!.userId, req.user!.role)
      return sendSuccess(res, updated, 'Lesson content updated.')
    } catch (err) { next(err) }
  }

  async addWeekImage(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = CreateWeekImageSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const image = await courseCatalogService.addWeekImage(req.params.courseId, req.params.weekId, parsed.data, req.user!.userId, req.user!.role)
      return sendSuccess(res, image, 'Image added to lesson.', 201)
    } catch (err) { next(err) }
  }

  async removeWeekImage(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await courseCatalogService.removeWeekImage(req.params.courseId, req.params.weekId, req.params.imageId, req.user!.userId, req.user!.role)
      return sendSuccess(res, result, 'Image deleted.')
    } catch (err) { next(err) }
  }

  async addWeekVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = CreateWeekVideoSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const video = await courseCatalogService.addWeekVideo(req.params.courseId, req.params.weekId, parsed.data, req.user!.userId, req.user!.role)
      return sendSuccess(res, video, 'Video added to lesson.', 201)
    } catch (err) { next(err) }
  }

  async updateWeekVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = UpdateWeekVideoSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const video = await courseCatalogService.updateWeekVideo(req.params.courseId, req.params.weekId, req.params.videoId, parsed.data, req.user!.userId, req.user!.role)
      return sendSuccess(res, video, 'Video updated.')
    } catch (err) { next(err) }
  }

  async removeWeekVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await courseCatalogService.removeWeekVideo(req.params.courseId, req.params.weekId, req.params.videoId, req.user!.userId, req.user!.role)
      return sendSuccess(res, result, 'Video deleted.')
    } catch (err) { next(err) }
  }

  async reorderWeekVideos(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = ReorderWeekVideosSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const result = await courseCatalogService.reorderWeekVideos(req.params.courseId, req.params.weekId, parsed.data.videoIds, req.user!.userId, req.user!.role)
      return sendSuccess(res, result, 'Videos reordered.')
    } catch (err) { next(err) }
  }

  // Facilitators
  async addWeekFacilitator(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = AssignWeekFacilitatorSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const lf = await courseCatalogService.addWeekFacilitator(req.params.courseId, req.params.weekId, parsed.data.facilitatorId, req.user!.userId, req.user!.role)
      return sendSuccess(res, lf, 'Facilitator added to lesson.', 201)
    } catch (err) { next(err) }
  }

  async removeWeekFacilitator(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await courseCatalogService.removeWeekFacilitator(req.params.courseId, req.params.weekId, req.params.facilitatorId, req.user!.userId, req.user!.role)
      return sendSuccess(res, result, 'Facilitator removed from lesson.')
    } catch (err) { next(err) }
  }

  // Glossary
  async addGlossaryTerm(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = GlossaryTermSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const term = await courseCatalogService.addGlossaryTerm(req.params.courseId, req.params.weekId, parsed.data, req.user!.userId, req.user!.role)
      return sendSuccess(res, term, 'Glossary term added.', 201)
    } catch (err) { next(err) }
  }

  async updateGlossaryTerm(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = GlossaryTermSchema.partial().safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const term = await courseCatalogService.updateGlossaryTerm(req.params.courseId, req.params.weekId, req.params.termId, parsed.data, req.user!.userId, req.user!.role)
      return sendSuccess(res, term, 'Glossary term updated.')
    } catch (err) { next(err) }
  }

  async removeGlossaryTerm(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await courseCatalogService.removeGlossaryTerm(req.params.courseId, req.params.weekId, req.params.termId, req.user!.userId, req.user!.role)
      return sendSuccess(res, result, 'Glossary term deleted.')
    } catch (err) { next(err) }
  }

  // Reading Resources
  async addReadingResource(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = ReadingResourceSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const resource = await courseCatalogService.addReadingResource(req.params.courseId, req.params.weekId, parsed.data, req.user!.userId, req.user!.role)
      return sendSuccess(res, resource, 'Reading resource added.', 201)
    } catch (err) { next(err) }
  }

  async updateReadingResource(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = ReadingResourceSchema.partial().safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const resource = await courseCatalogService.updateReadingResource(req.params.courseId, req.params.weekId, req.params.resourceId, parsed.data, req.user!.userId, req.user!.role)
      return sendSuccess(res, resource, 'Reading resource updated.')
    } catch (err) { next(err) }
  }

  async removeReadingResource(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await courseCatalogService.removeReadingResource(req.params.courseId, req.params.weekId, req.params.resourceId, req.user!.userId, req.user!.role)
      return sendSuccess(res, result, 'Reading resource deleted.')
    } catch (err) { next(err) }
  }

  // Slide Decks
  async addSlideDeck(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = SlideDeckSchema.safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const slide = await courseCatalogService.addSlideDeck(req.params.courseId, req.params.weekId, parsed.data, req.user!.userId, req.user!.role)
      return sendSuccess(res, slide, 'Slide deck added.', 201)
    } catch (err) { next(err) }
  }

  async updateSlideDeck(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = SlideDeckSchema.partial().safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const slide = await courseCatalogService.updateSlideDeck(req.params.courseId, req.params.weekId, req.params.slideId, parsed.data, req.user!.userId, req.user!.role)
      return sendSuccess(res, slide, 'Slide deck updated.')
    } catch (err) { next(err) }
  }

  async removeSlideDeck(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await courseCatalogService.removeSlideDeck(req.params.courseId, req.params.weekId, req.params.slideId, req.user!.userId, req.user!.role)
      return sendSuccess(res, result, 'Slide deck deleted.')
    } catch (err) { next(err) }
  }

  // --- SuperAdmin ---
  async getCoursesAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as any
      const courses = await courseCatalogService.getCoursesAdmin(status)
      return sendSuccess(res, courses)
    } catch (err) { next(err) }
  }

  async getCourseDetailsAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await courseCatalogService.getCourseDetailsAdmin(req.params.courseId)
      return sendSuccess(res, course)
    } catch (err) { next(err) }
  }

  async approveCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = z.object({ notes: z.string().trim().max(2000).optional() }).safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const result = await courseCatalogService.approveCourse(req.params.courseId, parsed.data.notes, req.user!.userId)
      return sendSuccess(res, result, 'Course approved and published.')
    } catch (err) { next(err) }
  }

  async rejectCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = z.object({ notes: z.string().trim().min(1, 'Rejection reason is required').max(2000) }).safeParse(req.body)
      if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
      const result = await courseCatalogService.rejectCourse(req.params.courseId, parsed.data.notes, req.user!.userId)
      return sendSuccess(res, result, 'Course rejected.')
    } catch (err) { next(err) }
  }

    async legacy_get_weeks_weekSlug(req: Request, res: Response, next: NextFunction) {
        try {
        const week = await courseCatalogRepository.legacyFindUniqueWeek({
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

        if (!week) {
          return sendError(res, 'Week not found.', 404)
        }

        if (!req.user) {
          return sendError(res, 'Log in to access this lesson.', 401)
        }

        // Facilitators get a "preview as learner" pass: they can view any week
        // (including unpublished ones, in unpublished courses) without enrolment.
        // Their view doesn't touch progress tracking (they're not learning).
        const isFacilitator = await courseCatalogService.userCanFacilitateCourse(req.user, week.courseId)

        let userEnrollment = null
        if (!isFacilitator) {
          if (!week.published || !week.course.published) {
            return sendError(res, 'Week not found.', 404)
          }
          userEnrollment = await courseCatalogRepository.legacyFindUniqueCourseEnrollment({
            where: { userId_courseId: { userId: req.user.userId, courseId: week.courseId } },
          })
          if (!userEnrollment) {
            return sendError(res, 'Enrol in this course to access this lesson.', 403)
          }
        }

        if (userEnrollment && week.module) {
          const dynamicDeadline = new Date(userEnrollment.enrolledAt)
          dynamicDeadline.setMonth(dynamicDeadline.getMonth() + week.module.position)
          week.assignments.forEach((a: any) => a.deadline = dynamicDeadline)
        }

        // Touch progress on view — moves the lesson from NOT_STARTED → IN_PROGRESS
        // the first time the learner opens it. Subsequent views are no-ops because
        // firstOpenedAt is preserved. We don't await this — it's bookkeeping, not
        // critical-path, so a failure here shouldn't block lesson loading.
        // Skipped for facilitator previews — they're not learning, just reviewing.
        if (req.user && !isFacilitator) {
          progressService.syncWeekProgress(req.user.userId, week.id, { touchOpened: true }).catch((err: any) => {
            console.error('[progress] touch-on-view failed:', err)
          })
        }

        const courseWeeks = await courseCatalogRepository.legacyFindManyWeek({
          where: { courseId: week.courseId, published: true },
          orderBy: { number: 'asc' },
          select: { id: true, slug: true, title: true, number: true, moduleId: true },
        })

        const currentIndex = courseWeeks.findIndex((item: any) => item.id === week.id)
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
            ...week.videos.map((v: any) => ({ id: v.id, title: v.title, url: v.url, description: v.description, position: v.position })),
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
              facilitatorNames: week.facilitators.map((item: any) => item.facilitator.name),
            },
            {
              id: 'learn',
              title: 'What You Will Learn',
              items: week.objectives.map((item: any) => item.body),
            },
            {
              id: 'expect',
              title: 'What to Expect',
              items: week.topics.map((item: any) => item.title),
              difficulty: week.difficulty,
              estimatedCompletionMinutes: week.estimatedCompletionMinutes,
            },
          ],
          lessonDetails: {
            title: week.title,
            facilitators: week.facilitators.map((item: any) => ({
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
            topics: week.topics.map((item: any) => item.title),
            objectives: week.objectives.map((item: any) => item.body),
            whatToExpect: week.whatToExpect,
            summary: week.summary,
            lessonContent: week.lessonContent ?? null,
            images: week.images.map((img: any) => ({
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
                  sections: week.slideDecks[0].sections.map((section: any) => section.label),
                }
              : null,
            // New field — full list of decks for multi-slide rendering
            slideDecks: week.slideDecks.map((deck: any) => ({
              id: deck.id,
              title: deck.title,
              url: deck.url,
              slideCount: deck.slideCount,
              lastUpdatedAt: deck.lastUpdatedAt,
              viewerType: deck.viewerType,
              position: deck.position,
              sections: deck.sections.map((section: any) => section.label),
            })),
            glossary: week.glossaryTerms.map((term: any) => ({
              id: term.id,
              term: term.term,
              definition: term.definition,
              example: term.example,
              position: term.position,
              saved: userState ? userState.savedTermIds.includes(term.id) : false,
            })),
            readings: week.readingResources.map((resource: any) => ({
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
                rating: userState.weekProgress.rating,
              }
            : {
                status: 'NOT_STARTED',
                quizSubmitted: false,
                assignmentSubmitted: false,
                completedAt: null,
                rating: null,
              },
          // Tells the frontend whether to render a "Facilitator preview" banner.
          viewerMode: isFacilitator ? 'facilitator-preview' : 'learner',
        })
        } catch (err) {
        next(err)
        }
    }

    async legacy_post_modules_moduleId_feedback(req: Request, res: Response, next: NextFunction) {
        try {
        const parsed = moduleFeedbackSchema.safeParse(req.body)
        if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

        const moduleRecord = await courseCatalogRepository.legacyFindUniqueModule({
          where: { id: req.params.moduleId },
          include: { course: true }
        })
        if (!moduleRecord) return sendError(res, 'Module not found.', 404)

        const enrollment = await courseCatalogRepository.legacyFindUniqueCourseEnrollment({
          where: { userId_courseId: { userId: req.user!.userId, courseId: moduleRecord.courseId } },
        })
        if (!enrollment) return sendError(res, 'Enrol in this course to leave feedback.', 403)

        const feedback = await courseCatalogRepository.legacyCreateModuleFeedback({
          data: {
            userId: req.user!.userId,
            moduleId: moduleRecord.id,
            feedback: parsed.data.feedback,
          }
        })

        return sendSuccess(res, { feedbackId: feedback.id }, 'Module feedback saved.', 201)
        } catch (err) {
        next(err)
        }
    }

    async legacy_get_weeks_weekSlug_resources(req: Request, res: Response, next: NextFunction) {
        try {
        const week = await courseCatalogRepository.legacyFindUniqueWeek({
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
              courseCatalogRepository.legacyFindManySavedGlossaryTerm({
                where: { userId: req.user.userId, term: { weekId: week.id } },
                select: { termId: true },
              }),
              courseCatalogRepository.legacyFindManyReadingProgress({
                where: { userId: req.user.userId, resource: { weekId: week.id } },
                select: { resourceId: true },
              }),
            ])
          : [[], []]

        const savedTermIds = new Set(savedTerms.map((item: any) => item.termId))
        const readResourceIds = new Set(readItems.map((item: any) => item.resourceId))

        return sendSuccess(res, {
          slideDeck: week.slideDecks[0]
            ? {
                id: week.slideDecks[0].id,
                title: week.slideDecks[0].title,
                url: week.slideDecks[0].url,
                slideCount: week.slideDecks[0].slideCount,
                lastUpdatedAt: week.slideDecks[0].lastUpdatedAt,
                viewerType: week.slideDecks[0].viewerType,
                sections: week.slideDecks[0].sections.map((item: any) => item.label),
              }
            : null,
          slideDecks: week.slideDecks.map((deck: any) => ({
            id: deck.id,
            title: deck.title,
            url: deck.url,
            slideCount: deck.slideCount,
            lastUpdatedAt: deck.lastUpdatedAt,
            viewerType: deck.viewerType,
            position: deck.position,
            sections: deck.sections.map((item: any) => item.label),
          })),
          glossary: week.glossaryTerms.map((term: any) => ({
            id: term.id,
            term: term.term,
            definition: term.definition,
            example: term.example,
            saved: savedTermIds.has(term.id),
          })),
          readings: week.readingResources.map((resource: any) => ({
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
    }

    async legacy_get_course(req: Request, res: Response, next: NextFunction) {
        try {
        const courses = await courseCatalogRepository.legacyFindManyCourse({
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
    }

    async legacy_get_course_slug(req: Request, res: Response, next: NextFunction) {
        try {
        const course = await courseCatalogRepository.legacyFindUniqueCourse({
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
    }

    async legacy_get_lesson_id(req: Request, res: Response, next: NextFunction) {
        try {
        const lesson = await courseCatalogRepository.legacyFindUniqueLesson({
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
    }

    async legacy_patch_lesson_id(req: Request, res: Response, next: NextFunction) {
        try {
        const parsed = z.object({
          title: z.string().trim().min(1).max(200).optional(),
          content: z.string().trim().max(50000).optional(),
          duration: z.number().int().positive().optional(),
        }).safeParse(req.body)

        if (!parsed.success) {
          return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
        }

        const updated = await courseCatalogRepository.legacyUpdateLesson({
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
    }

    async legacy_post_lessons_lessonId_videos(req: Request, res: Response, next: NextFunction) {
        try {
        const parsed = z.object({
          title: z.string().trim().min(1).max(200),
          url: z.string().url('Invalid video URL'),
          description: z.string().trim().max(1000).optional(),
        }).safeParse(req.body)

        if (!parsed.success) {
          return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)
        }

        const lesson = await courseCatalogRepository.legacyFindUniqueLesson({
          where: { id: req.params.lessonId },
          include: { videos: true },
        })
        if (!lesson) return sendError(res, 'Lesson not found.', 404)

        const nextPosition = (lesson.videos.length || 0) + 1

        const video = await courseCatalogRepository.legacyCreateLessonVideo({
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
    }

    async legacy_put_lesson_videos_videoId(req: Request, res: Response, next: NextFunction) {
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

        const video = await courseCatalogRepository.legacyUpdateLessonVideo({
          where: { id: req.params.videoId },
          data: Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined)),
        })

        return sendSuccess(res, video, 'Video updated.')
        } catch (err) {
        next(err)
        }
    }

    async legacy_delete_lesson_videos_videoId(req: Request, res: Response, next: NextFunction) {
        try {
        await courseCatalogRepository.legacyDeleteLessonVideo({ where: { id: req.params.videoId } })
        return sendSuccess(res, {}, 'Video deleted.')
        } catch (err) {
        next(err)
        }
    }

    async legacy_get_admin_testimonials(req: Request, res: Response, next: NextFunction) {
        try {
        const testimonials = await courseCatalogRepository.legacyFindManyTestimonial({
          orderBy: { position: 'asc' },
        })
        return sendSuccess(res, testimonials)
        } catch (err) {
        next(err)
        }
    }

    async legacy_post_admin_testimonials(req: Request, res: Response, next: NextFunction) {
        try {
        const parsed = testimonialSchema.safeParse(req.body)
        if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

        const testimonial = await courseCatalogRepository.legacyCreateTestimonial({ data: parsed.data })
        return sendSuccess(res, testimonial, 'Testimonial created.', 201)
        } catch (err) {
        next(err)
        }
    }

    async legacy_put_admin_testimonials_id(req: Request, res: Response, next: NextFunction) {
        try {
        const parsed = testimonialSchema.safeParse(req.body)
        if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors)

        const testimonial = await courseCatalogRepository.legacyUpdateTestimonial({
          where: { id: req.params.id },
          data: parsed.data,
        })
        return sendSuccess(res, testimonial, 'Testimonial updated.')
        } catch (err) {
        next(err)
        }
    }

    async legacy_delete_admin_testimonials_id(req: Request, res: Response, next: NextFunction) {
        try {
        await courseCatalogRepository.legacyDeleteTestimonial({ where: { id: req.params.id } })
        return sendSuccess(res, null, 'Testimonial deleted.')
        } catch (err) {
        next(err)
        }
    }

    async legacy_post_admin_courses_courseId_facilitators(req: Request, res: Response, next: NextFunction) {
        try {
        const userId = req.user!.userId
        const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
        if (!course) return
        if (course.status === 'APPROVED' && req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'ADMIN') return sendError(res, 'Cannot edit an approved course.', 400)

        const parsed = z.object({
          facilitatorId: z.string().uuid().optional(),
          userId: z.string().uuid().optional(),
        }).safeParse(req.body)
        if (!parsed.success) return sendError(res, 'Provide facilitatorId or userId.', 400)

        let facilitatorId: string

        if (parsed.data.facilitatorId) {
          // Standard flow: use an existing Facilitator record.
          const existing = await courseCatalogRepository.legacyFindUniqueFacilitator({ where: { id: parsed.data.facilitatorId } })
          if (!existing) return sendError(res, 'Facilitator not found.', 404)
          facilitatorId = existing.id
        } else if (parsed.data.userId) {
          // Admin-user flow: find or auto-create the Facilitator record for the user.
          const user = await courseCatalogRepository.legacyFindUniqueUser({
            where: { id: parsed.data.userId },
            select: { id: true, name: true, email: true, role: true },
          })
          if (!user) return sendError(res, 'User not found.', 404)
          if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            return sendError(res, 'Only admin users can be added as facilitators this way.', 400)
          }
          const userEmail = user.email.toLowerCase()
          let facilitatorRecord = await courseCatalogRepository.legacyFindFirstFacilitator({
            where: { email: { equals: userEmail, mode: 'insensitive' } },
          })
          if (!facilitatorRecord) {
            facilitatorRecord = await courseCatalogRepository.legacyCreateFacilitator({
              data: {
                name: user.name || userEmail.split('@')[0],
                email: userEmail,
                title: 'Facilitator',
                organization: 'Rubikcon',
                linkedinUrl: 'https://linkedin.com',
              },
            })
          }
          facilitatorId = facilitatorRecord.id
        } else {
          return sendError(res, 'Provide either facilitatorId or userId.', 400)
        }

        const alreadyLinked = await courseCatalogRepository.legacyFindUniqueCourseFacilitator({
          where: { courseId_facilitatorId: { courseId: course.id, facilitatorId } },
        })
        if (alreadyLinked) return sendError(res, 'Facilitator already assigned to this course.', 409)

        const count = await courseCatalogRepository.legacyCountCourseFacilitator({ where: { courseId: course.id } })
        const cf = await courseCatalogRepository.legacyCreateCourseFacilitator({
          data: { courseId: course.id, facilitatorId, position: count + 1 },
          include: { facilitator: true },
        })

        return sendSuccess(res, cf.facilitator, 'Facilitator added.', 201)
        } catch (err) {
        next(err)
        }
    }

    async legacy_delete_admin_courses_courseId_facilitators_facilitatorId(req: Request, res: Response, next: NextFunction) {
        try {
        const userId = req.user!.userId
        const course = await getCourseOrFail(req.params.courseId, userId, req.user!.role, res)
        if (!course) return
        if (course.status === 'APPROVED' && req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'ADMIN') return sendError(res, 'Cannot edit an approved course.', 400)

        const cf = await courseCatalogRepository.legacyFindUniqueCourseFacilitator({
          where: { courseId_facilitatorId: { courseId: course.id, facilitatorId: req.params.facilitatorId } },
        })
        if (!cf) return sendError(res, 'Facilitator not assigned to this course.', 404)

        await courseCatalogRepository.legacyDeleteCourseFacilitator({ where: { id: cf.id } })
        return sendSuccess(res, { facilitatorId: req.params.facilitatorId }, 'Facilitator removed.')
        } catch (err) {
        next(err)
        }
    }
}

export const courseCatalogController = new CourseCatalogController()
