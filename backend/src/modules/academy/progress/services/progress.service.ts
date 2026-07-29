import { progressRepository } from '../repositories/progress.repository'
import { ProgressSignals } from '../types/progress.types'

export class ProgressService {
  async getLearnerProgress(userId: string) {
    return progressRepository.findProgressByUserId(userId)
  }

  async getAdminLearnerProgress(where: any) {
    return progressRepository.findAdminProgress(where)
  }

  async getLegacyProgress(userId: string) {
    return progressRepository.findLegacyProgressByUserId(userId)
  }

  async completeLegacyProgress(userId: string, lessonId: string, completed: boolean) {
    const lesson = await progressRepository.findLessonById(lessonId)
    if (!lesson) {
      return null
    }

    return progressRepository.upsertLegacyProgress(userId, lessonId, completed)
  }

  async manuallyCompleteWeek(userId: string, weekSlug: string) {
    const week = await progressRepository.findWeekBySlug(weekSlug)
    if (!week || !week.published) {
      return { error: 'Week not found.' }
    }

    const enrollment = await progressRepository.findCourseEnrollment(userId, week.courseId)
    if (!enrollment) {
      return { error: 'Enrol in this course to track progress.' }
    }

    const progress = await this.syncWeekProgress(userId, week.id, {
      manuallyComplete: true,
      touchOpened: true,
    })

    return { progress }
  }

  deriveWeekProgressStatus(s: ProgressSignals): string {
    if (s.manuallyCompleted) return 'COMPLETE'

    const hasStructured = s.hasQuiz || s.assignmentCount > 0
    if (hasStructured) {
      const quizOk = !s.hasQuiz || s.quizSubmitted
      const assignmentOk = s.assignmentCount === 0 || s.assignmentSubmitted
      if (quizOk && assignmentOk) return 'COMPLETE'
    } else if (s.firstOpenedAt) {
      return 'COMPLETE'
    }

    if (s.quizSubmitted || s.assignmentSubmitted || s.firstOpenedAt) {
      return 'IN_PROGRESS'
    }

    return 'NOT_STARTED'
  }

  async syncWeekProgress(userId: string, weekId: string, opts: { touchOpened?: boolean; manuallyComplete?: boolean } = {}) {
    const existing = await progressRepository.findWeekProgress(userId, weekId)

    const [quizExists, assignmentCount] = await progressRepository.getLessonStructure(weekId)
    const [quizAttempt, assignmentSubmission] = await progressRepository.getLearnerActions(userId, weekId)

    const wasAlreadyComplete = existing?.status === 'COMPLETE'
    const manuallyCompleted = opts.manuallyComplete === true
      || existing?.manuallyCompleted === true
      || wasAlreadyComplete

    const firstOpenedAt = existing?.firstOpenedAt ?? (opts.touchOpened ? new Date() : null)
    const quizSubmitted = Boolean(quizAttempt && quizAttempt.percentage >= quizAttempt.quiz.passMark)
    const assignmentSubmitted = Boolean(assignmentSubmission)

    const status = this.deriveWeekProgressStatus({
      hasQuiz: Boolean(quizExists),
      quizSubmitted,
      assignmentCount,
      assignmentSubmitted,
      manuallyCompleted,
      firstOpenedAt,
    })

    const completedAt = status === 'COMPLETE'
      ? (existing?.completedAt ?? new Date())
      : null

    return progressRepository.upsertWeekProgress(userId, weekId, status, manuallyCompleted, firstOpenedAt, completedAt)
  }

  async submitRating(userId: string, weekSlug: string, rating: number) {
    const week = await progressRepository.findWeekBySlug(weekSlug)
    if (!week || !week.published) {
      return { error: 'Week not found.', statusCode: 404 }
    }

    const enrollment = await progressRepository.findCourseEnrollment(userId, week.courseId)
    if (!enrollment) {
      return { error: 'Enrol in this course to rate lessons.', statusCode: 403 }
    }

    await this.syncWeekProgress(userId, week.id, { touchOpened: true })
    const progress = await progressRepository.updateWeekRating(userId, week.id, rating)
    
    return { rating: progress.rating }
  }

  async saveGlossaryTerm(userId: string, termId: string) {
    const term = await progressRepository.findGlossaryTermById(termId)
    if (!term) return { error: 'Glossary term not found.', statusCode: 404 }

    const item = await progressRepository.upsertSavedGlossaryTerm(userId, term.id)
    return { item }
  }

  async removeGlossaryTerm(userId: string, termId: string) {
    await progressRepository.deleteSavedGlossaryTerm(userId, termId)
  }

  async markResourceRead(userId: string, resourceId: string) {
    const resource = await progressRepository.findReadingResourceById(resourceId)
    if (!resource) return { error: 'Reading resource not found.' }

    const existing = await progressRepository.findReadingProgress(userId, resource.id)
    if (existing) {
      await progressRepository.deleteReadingProgress(userId, resource.id)
      return { resourceId: resource.id, read: false, message: 'Reading resource marked unread.' }
    }

    await progressRepository.createReadingProgress(userId, resource.id)
    return { resourceId: resource.id, read: true, message: 'Reading resource marked read.' }
  }

  serializeWeekSummary(
    week: any,
    progress?: any
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
            status: 'NOT_STARTED',
            quizSubmitted: false,
            assignmentSubmitted: false,
            completedAt: null,
          },
    }
  }

  async getDashboard(userId: string) {
    const courses = await progressRepository.getDashboardCourses(userId)
    const weekIds = courses.flatMap(course => course.weeks.map(week => week.id))
    
    const progressMap = await progressRepository.getCourseProgressMap(userId, weekIds)
    const quizAttempts = await progressRepository.getQuizAttemptsByWeeks(userId, weekIds)

    const latestAttemptByWeek = new Map<string, typeof quizAttempts[number]>()
    for (const attempt of quizAttempts) {
      if (!latestAttemptByWeek.has(attempt.quiz.weekId)) {
        latestAttemptByWeek.set(attempt.quiz.weekId, attempt)
      }
    }

    const assignmentSubmissionCount = await progressRepository.getAssignmentSubmissionCount(userId)

    return {
      courses: courses.map(course => {
        const completedCount = course.weeks.filter(week => progressMap.get(week.id)?.status === 'COMPLETE').length
        return {
          id: course.id,
          slug: course.slug,
          title: course.title,
          phaseLabel: course.phaseLabel,
          contentUnit: course.contentUnit,
          progressPercent: course.weeks.length ? Math.round((completedCount / course.weeks.length) * 100) : 0,
          weeks: course.weeks.map(week => ({
            ...this.serializeWeekSummary(week, progressMap.get(week.id)),
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
      assignmentSubmissionCount,
    }
  }
}

export const progressService = new ProgressService()
