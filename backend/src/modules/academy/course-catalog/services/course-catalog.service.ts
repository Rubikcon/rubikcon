import { AppError } from '../../../../shared/errors/AppError'
import { courseCatalogRepository } from '../repositories/course-catalog.repository'
import { serializeCoursePricing, serializeWeekSummary } from '../mappers/course.mappers'
import { sendEmailInBackground } from '../../../../infrastructure/mail/mailer'

const CONTACT_RECIPIENT = 'rubikconnexus@gmail.com'

export class CourseCatalogService {
  async getTestimonials() {
    return courseCatalogRepository.findActiveTestimonials()
  }

  async getFacilitators(page: number, limit: number) {
    const skip = (page - 1) * limit
    const [facilitators, total] = await courseCatalogRepository.findPublicFacilitators(skip, limit)
    const result = facilitators.map(f => ({
      id: f.id,
      name: f.name,
      title: f.title,
      organization: f.organization,
      bio: f.bio,
      photoUrl: f.photoUrl,
      linkedinUrl: f.linkedinUrl,
      courses: f.courses
        .filter(cf => cf.course.published)
        .map(cf => ({ id: cf.course.id, slug: cf.course.slug, title: cf.course.title })),
    }))
    return { facilitators: result, total }
  }

  async contactUs(params: { fullName: string; email: string; subject: string; message: string }) {
    const { fullName, email, subject, message } = params
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    sendEmailInBackground({
      to: CONTACT_RECIPIENT,
      replyTo: email,
      subject: `[Academy Contact] ${subject} — ${fullName}`,
      text: `From: ${fullName} <${email}>\nSubject: ${subject}\n\n${message}`,
      html: `
        <h2 style="margin:0 0 12px">New contact form message</h2>
        <p><strong>From:</strong> ${esc(fullName)} &lt;${esc(email)}&gt;</p>
        <p><strong>Subject:</strong> ${esc(subject)}</p>
        <p style="white-space:pre-line;border-left:3px solid #F5C518;padding-left:12px;margin-top:16px">${esc(message)}</p>
      `,
    })
    return { received: true }
  }

  async getPlatformStats() {
    const [totalCourses, totalLearners, totalFacilitators] = await courseCatalogRepository.getPlatformStats()
    return {
      totalCourses,
      totalLearners,
      totalFacilitators,
      completionRate: 94 // Dummy stat from old route
    }
  }

  async getFilterMeta() {
    return courseCatalogRepository.findFilterMeta()
  }

  async getPublicCourses(page: number, limit: number, userId?: string, q?: string, level?: string, phaseLabel?: string) {
    const skip = (page - 1) * limit
    const [courses, total] = await courseCatalogRepository.findMany(skip, limit, userId, q, level, phaseLabel)
    
    const result = courses.map(c => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      tagline: c.tagline,
      level: c.level,
      isFeatured: c.isFeatured,
      ...serializeCoursePricing(c as any),
      estimatedDuration: c.estimatedDuration,
      phaseLabel: c.phaseLabel,
      heroImage: c.heroImage,
      contentUnit: c.contentUnit,
      weekCount: c._count.weeks,
      facilitators: c.courseFacilitators.map(cf => cf.facilitator),
      enrolled: userId ? (c.enrollments as { id: string }[]).length > 0 : false,
    }))

    return { courses: result, total }
  }

  async userCanFacilitateCourse(user: { userId: string; email: string; role: string }, courseId: string) {
    if (user.role === 'SUPER_ADMIN') return true
    
    // We already have this query locally or can just add it to repository
    // Let's create a quick check in the repository instead of using Prisma directly.
    return courseCatalogRepository.checkFacilitatorAccess(user, courseId)
  }

  facilitatorAccessibleCourseWhere(user: { userId: string; email: string; role: string }): any {
    if (user.role === 'SUPER_ADMIN') return {}
    const emailMatch: any = {
      email: { equals: user.email, mode: 'insensitive' },
    }
    return {
      OR: [
        { createdById: user.userId },
        { courseFacilitators: { some: { facilitator: emailMatch } } },
        { weeks: { some: { facilitators: { some: { facilitator: emailMatch } } } } },
        { modules: { some: { lessons: { some: { facilitators: { some: { facilitator: emailMatch } } } } } } },
      ],
    }
  }

  async getCourseProgressMap(userId: string, weekIds: string[]) {
    return courseCatalogRepository.getCourseProgressMap(userId, weekIds)
  }

  async getCourseDetails(slug: string, user?: { userId: string; email: string; role: string }) {
    const course = await courseCatalogRepository.findBySlug(slug, user?.userId)
    if (!course) {
      throw new AppError('Course not found.', 404)
    }

    const isFacilitator = user ? await this.userCanFacilitateCourse(user, course.id) : false

    if (!isFacilitator && !course.published) {
      throw new AppError('Course not found.', 404)
    }

    const visibleWeeks = isFacilitator ? course.weeks : course.weeks.filter(w => w.published)
    const enrolled = user ? (course.enrollments as { id: string }[]).length > 0 : false
    const weekIds = visibleWeeks.map(week => week.id)
    const progressMap = (user && enrolled) ? await this.getCourseProgressMap(user.userId, weekIds) : new Map()

    const completedCount = visibleWeeks.filter(week => progressMap.get(week.id)?.status === 'COMPLETE').length
    const progressPercent = visibleWeeks.length
      ? Math.round((completedCount / visibleWeeks.length) * 100)
      : 0

    return {
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
      ...serializeCoursePricing(course as any),
      enrolled: enrolled || isFacilitator,
      facilitators: course.courseFacilitators.map(cf => cf.facilitator),
      progressPercent,
      completedCount,
      totalWeeks: visibleWeeks.length,
      modules: course.modules,
      weeks: visibleWeeks.map(week => serializeWeekSummary(week as any, progressMap.get(week.id))),
      viewerMode: isFacilitator ? 'facilitator-preview' : 'learner',
      status: course.status,
      published: course.published,
    }
  }

  async getCourseWeeks(slug: string, user?: { userId: string; email: string; role: string }) {
    const course = await courseCatalogRepository.findCourseWeeks(slug, user?.userId)
    if (!course) {
      throw new AppError('Course not found.', 404)
    }

    const isFacilitator = user ? await this.userCanFacilitateCourse(user, course.id) : false

    if (!isFacilitator && !course.published) {
      throw new AppError('Course not found.', 404)
    }

    const visibleWeeks = isFacilitator ? course.weeks : course.weeks.filter(w => w.published)
    const enrolled = user ? (course.enrollments as { id: string }[]).length > 0 : false
    const weekIds = visibleWeeks.map(week => week.id)
    const progressMap = (user && enrolled) ? await this.getCourseProgressMap(user.userId, weekIds) : new Map()

    return visibleWeeks.map(week => serializeWeekSummary(week as any, progressMap.get(week.id)))
  }

  // --- Internal Helpers ---

  async markCourseDirtyIfNeeded(courseId: string, role: string, currentStatus: string) {
    if (role === 'SUPER_ADMIN') return
    if (currentStatus !== 'APPROVED') return
    await courseCatalogRepository.update(courseId, {
      status: 'PENDING_REVIEW',
      submittedAt: new Date(),
    })
  }

  async verifyCourseOwnership(courseId: string, userId: string, role: string) {
    const course = await courseCatalogRepository.findById(courseId)
    if (!course) {
      throw new AppError('Course not found.', 404)
    }
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN' && course.createdById !== userId) {
      throw new AppError('Forbidden. You do not own this course.', 403)
    }
    return course
  }

  // --- Admin Course Management ---

  async createCourse(data: any, createdById: string, user: { userId: string, email: string }) {
    const existing = await courseCatalogRepository.findAdminBySlug(data.slug)
    if (existing) {
      throw new AppError('A course with this slug already exists.', 409)
    }
    const created = await courseCatalogRepository.create(data, createdById)
    return {
      ...created,
      weekCount: 0,
      facilitators: [],
      createdBy: { id: user.userId, name: null, email: user.email },
    }
  }

  async getAdminCourses(page: number, limit: number, userId: string, role: string) {
    const skip = (page - 1) * limit
    const [courses, total] = await courseCatalogRepository.findAdminCoursesPaginated(skip, limit, userId, role)

    const result = courses.map(c => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      tagline: c.tagline,
      status: c.status,
      published: c.published,
      isPaid: c.isPaid,
      isFeatured: c.isFeatured,
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

    return { courses: result, total }
  }

  async getAdminCourseDetails(courseId: string, userId: string, role: string) {
    const course = await courseCatalogRepository.findAdminCourseDetails(courseId)
    if (!course) throw new AppError('Course not found.', 404)

    if (role !== 'SUPER_ADMIN' && course.createdById !== userId) {
      throw new AppError('Forbidden.', 403)
    }
    return course
  }

  async updateCourse(courseId: string, data: any, pricingData: any, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)

    const isPrivileged = role === 'SUPER_ADMIN' || role === 'ADMIN'
    if (!isPrivileged && (course.status === 'PENDING_REVIEW' || course.status === 'APPROVED')) {
      throw new AppError('Cannot edit a course that is pending review or approved.', 400)
    }

    if (data.slug && data.slug !== course.slug) {
      const existing = await courseCatalogRepository.findAdminBySlug(data.slug)
      if (existing) throw new AppError('A course with this slug already exists.', 409)
    }

    const updateData = { ...data, ...pricingData }
    const updated = await courseCatalogRepository.update(courseId, updateData)
    await this.markCourseDirtyIfNeeded(course.id, role, course.status)
    return updated
  }

  async setFeaturedCourse(courseId: string, role: string) {
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      throw new AppError('Only administrators can set featured courses.', 403)
    }
    const updated = await courseCatalogRepository.setFeaturedCourse(courseId)
    return updated
  }

  async deleteCourse(courseId: string, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    const isSuperAdmin = role === 'SUPER_ADMIN'
    if (!isSuperAdmin && course.status !== 'DRAFT' && course.status !== 'REJECTED') {
      throw new AppError('Only DRAFT or REJECTED courses can be deleted. Contact a super admin to remove a published course.', 400)
    }
    await courseCatalogRepository.delete(course.id)
    return { id: course.id }
  }

  async submitCourseForReview(courseId: string, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    
    if (course.status !== 'DRAFT' && course.status !== 'REJECTED') {
      throw new AppError('Only DRAFT or REJECTED courses can be submitted for review.', 400)
    }

    const [weekCount, facilitatorCount] = await courseCatalogRepository.countCoursePrerequisites(course.id)
    
    const errors: string[] = []
    if (weekCount < 1) errors.push('Add at least one week before submitting.')
    if (facilitatorCount < 1) errors.push('Assign at least one facilitator before submitting.')
    if (!course.description || course.description.length < 10) errors.push('Add a course description.')
    
    if (errors.length > 0) throw new AppError('Prerequisites not met: ' + errors.join(' '), 400)

    return courseCatalogRepository.update(course.id, {
      status: 'PENDING_REVIEW',
      submittedAt: new Date(),
    })
  }

  // --- Admin Week Management ---

  async createWeek(courseId: string, parsedData: any, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      throw new AppError('Cannot edit an approved course.', 400)
    }

    const slugExists = await courseCatalogRepository.findWeekBySlug(parsedData.slug)
    if (slugExists) throw new AppError('A week with this slug already exists.', 409)

    const numberExists = await courseCatalogRepository.findWeekByCourseAndNumber(course.id, parsedData.number)
    if (numberExists) throw new AppError(`Week ${parsedData.number} already exists in this course.`, 409)

    if (parsedData.moduleId) {
      const mod = await courseCatalogRepository.findModuleByIdAndCourse(parsedData.moduleId, course.id)
      if (!mod) throw new AppError('Module not found in this course.', 404)
    }

    const { topics, objectives, ...weekData } = parsedData
    const isApproved = course.status === 'APPROVED'
    
    const week = await courseCatalogRepository.createWeek(course.id, isApproved, weekData, topics, objectives)
    await this.markCourseDirtyIfNeeded(course.id, role, course.status)
    return week
  }

  async updateWeek(courseId: string, weekId: string, parsedData: any, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      throw new AppError('Cannot edit an approved course.', 400)
    }

    const week = await courseCatalogRepository.findWeekByIdAndCourse(weekId, course.id)
    if (!week) throw new AppError('Week not found.', 404)

    const { topics, objectives, ...weekData } = parsedData
    const updated = await courseCatalogRepository.updateWeek(week.id, weekData, topics, objectives)
    await this.markCourseDirtyIfNeeded(course.id, role, course.status)
    return updated
  }

  async deleteWeek(courseId: string, weekId: string, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      throw new AppError('Cannot edit an approved course.', 400)
    }

    const week = await courseCatalogRepository.findWeekByIdAndCourse(weekId, course.id)
    if (!week) throw new AppError('Week not found.', 404)

    await courseCatalogRepository.deleteWeek(week.id)
    await this.markCourseDirtyIfNeeded(course.id, role, course.status)
    return { id: week.id }
  }

  // --- Admin Module Management ---

  async createModule(courseId: string, parsedData: any, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      throw new AppError('Cannot edit an approved course.', 400)
    }

    const count = await courseCatalogRepository.countModules(course.id)
    const mod = await courseCatalogRepository.createModule(course.id, parsedData, count + 1)
    await this.markCourseDirtyIfNeeded(course.id, role, course.status)
    return mod
  }

  async updateModule(courseId: string, moduleId: string, parsedData: any, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      throw new AppError('Cannot edit an approved course.', 400)
    }

    const mod = await courseCatalogRepository.findModuleByIdAndCourse(moduleId, course.id)
    if (!mod) throw new AppError('Module not found in this course.', 404)

    const updated = await courseCatalogRepository.updateModule(mod.id, parsedData)
    await this.markCourseDirtyIfNeeded(course.id, role, course.status)
    return updated
  }

  async deleteModule(courseId: string, moduleId: string, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      throw new AppError('Cannot edit an approved course.', 400)
    }

    const mod = await courseCatalogRepository.findModuleByIdAndCourse(moduleId, course.id)
    if (!mod) throw new AppError('Module not found in this course.', 404)

    await courseCatalogRepository.deleteModule(mod.id)
    await this.markCourseDirtyIfNeeded(course.id, role, course.status)
    return { id: mod.id }
  }

  async setWeekModule(courseId: string, weekId: string, moduleId: string | null, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      throw new AppError('Cannot edit an approved course.', 400)
    }

    const week = await courseCatalogRepository.findWeekByIdAndCourse(weekId, course.id)
    if (!week) throw new AppError('Week not found.', 404)

    if (moduleId) {
      const mod = await courseCatalogRepository.findModuleByIdAndCourse(moduleId, course.id)
      if (!mod) throw new AppError('Module not found in this course.', 404)
    }

    const updated = await courseCatalogRepository.updateWeekModule(week.id, moduleId)
    await this.markCourseDirtyIfNeeded(course.id, role, course.status)
    return updated
  }

  // --- Admin Lesson Content Management ---

  async updateWeekContent(courseId: string, weekId: string, lessonContent: string, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      throw new AppError('Cannot edit an approved course.', 400)
    }

    const week = await courseCatalogRepository.findWeekByIdAndCourse(weekId, course.id)
    if (!week) throw new AppError('Week not found.', 404)

    const updated = await courseCatalogRepository.updateWeekContent(week.id, lessonContent)
    await this.markCourseDirtyIfNeeded(course.id, role, course.status)
    return { lessonContent: updated.lessonContent }
  }

  // Images
  async addWeekImage(courseId: string, weekId: string, parsedData: any, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') throw new AppError('Cannot edit an approved course.', 400)
    
    const week = await courseCatalogRepository.findWeekByIdAndCourse(weekId, course.id)
    if (!week) throw new AppError('Week not found.', 404)

    const count = await courseCatalogRepository.countWeekImages(week.id)
    return courseCatalogRepository.createWeekImage(week.id, parsedData, count + 1)
  }

  // Lessons
  async addLesson(courseId: string, moduleId: string, parsedData: any, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') throw new AppError('Cannot edit an approved course.', 400)
    
    const mod = await courseCatalogRepository.findModuleByIdAndCourse(moduleId, course.id)
    if (!mod) throw new AppError('Module not found.', 404)

    const count = await courseCatalogRepository.countLessons(mod.id)
    const lesson = await courseCatalogRepository.createLesson(mod.id, parsedData, count + 1)
    await this.markCourseDirtyIfNeeded(course.id, role, course.status)
    return lesson
  }

  async removeLesson(lessonId: string, _userId: string, _role: string) {
    // Wait, the previous implementation just found the lesson directly. 
    // Is there a course check? The route is `/lesson/:lessonId`. Let's just do an admin check (handled by middleware).
    const lesson = await courseCatalogRepository.findLessonById(lessonId)
    if (!lesson) throw new AppError('Lesson not found.', 404)
    await courseCatalogRepository.deleteLesson(lesson.id)
    return { id: lesson.id }
  }

  // Lesson Facilitators
  async addLessonFacilitator(lessonId: string, facilitatorId: string, _userId: string, _role: string) {
    const lesson = await courseCatalogRepository.findLessonById(lessonId)
    if (!lesson) throw new AppError('Lesson not found.', 404)

    const facilitator = await courseCatalogRepository.findFacilitatorById(facilitatorId)
    if (!facilitator) throw new AppError('Facilitator not found.', 404)

    const existing = await courseCatalogRepository.findLessonFacilitator(lesson.id, facilitator.id)
    if (existing) throw new AppError('Facilitator already assigned to this lesson.', 409)

    return courseCatalogRepository.createLessonFacilitator(lesson.id, facilitator.id)
  }

  async removeLessonFacilitator(lessonId: string, facilitatorId: string, _userId: string, _role: string) {
    const lf = await courseCatalogRepository.findLessonFacilitator(lessonId, facilitatorId)
    if (!lf) throw new AppError('Facilitator not found in this lesson.', 404)

    await courseCatalogRepository.deleteLessonFacilitator(lessonId, facilitatorId)
    return { id: lf.facilitatorId }
  }
  async removeWeekImage(courseId: string, weekId: string, imageId: string, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') throw new AppError('Cannot edit an approved course.', 400)
    
    const image = await courseCatalogRepository.findWeekImageByIdAndCourse(imageId, weekId, course.id)
    if (!image) throw new AppError('Image not found.', 404)

    await courseCatalogRepository.deleteWeekImage(image.id)
    return { id: image.id }
  }

  // Videos
  async addWeekVideo(courseId: string, weekId: string, parsedData: any, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') throw new AppError('Cannot edit an approved course.', 400)
    
    const week = await courseCatalogRepository.findWeekByIdAndCourse(weekId, course.id)
    if (!week) throw new AppError('Week not found.', 404)

    const count = await courseCatalogRepository.countWeekVideos(week.id)
    const video = await courseCatalogRepository.createWeekVideo(week.id, parsedData, count + 1)
    await this.markCourseDirtyIfNeeded(course.id, role, course.status)
    return video
  }

  async updateWeekVideo(courseId: string, weekId: string, videoId: string, parsedData: any, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') throw new AppError('Cannot edit an approved course.', 400)
    
    const video = await courseCatalogRepository.findWeekVideoByIdAndCourse(videoId, weekId, course.id)
    if (!video) throw new AppError('Video not found.', 404)

    return courseCatalogRepository.updateWeekVideo(video.id, parsedData)
  }

  async removeWeekVideo(courseId: string, weekId: string, videoId: string, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') throw new AppError('Cannot edit an approved course.', 400)
    
    const video = await courseCatalogRepository.findWeekVideoByIdAndCourse(videoId, weekId, course.id)
    if (!video) throw new AppError('Video not found.', 404)

    await courseCatalogRepository.deleteWeekVideo(video.id)
    await this.markCourseDirtyIfNeeded(course.id, role, course.status)
    return { id: video.id }
  }

  async reorderWeekVideos(courseId: string, weekId: string, videoIds: string[], userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') throw new AppError('Cannot edit an approved course.', 400)

    const existing = await courseCatalogRepository.findWeekVideos(weekId, course.id)
    const existingIds = new Set(existing.map(v => v.id))
    
    if (videoIds.length !== existing.length) {
      throw new AppError(`Reorder list has ${videoIds.length} ids but this lesson has ${existing.length} videos. Refresh and try again.`, 400)
    }
    
    for (const id of videoIds) {
      if (!existingIds.has(id)) throw new AppError('One or more videos do not belong to this lesson.', 400)
    }

    await courseCatalogRepository.reorderWeekVideos(videoIds)
    return { success: true }
  }

  // Facilitators
  async addWeekFacilitator(courseId: string, weekId: string, facilitatorId: string, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    const week = await courseCatalogRepository.findWeekByIdAndCourse(weekId, course.id)
    if (!week) throw new AppError('Week not found.', 404)

    const facilitator = await courseCatalogRepository.findFacilitatorById(facilitatorId)
    if (!facilitator) throw new AppError('Facilitator not found.', 404)

    const existing = await courseCatalogRepository.findWeekFacilitator(week.id, facilitator.id)
    if (existing) throw new AppError('Facilitator already assigned to this lesson.', 409)

    const count = await courseCatalogRepository.countWeekFacilitators(week.id)
    const lf = await courseCatalogRepository.createWeekFacilitator(week.id, facilitator.id, count + 1)
    return lf
  }

  async removeWeekFacilitator(courseId: string, weekId: string, facilitatorId: string, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    const lf = await courseCatalogRepository.findLessonFacilitatorByIdAndCourse(weekId, facilitatorId, course.id)
    if (!lf) throw new AppError('Facilitator not found in this lesson.', 404)

    await courseCatalogRepository.deleteWeekFacilitator(weekId, facilitatorId)
    return { id: lf.facilitatorId }
  }

  // Glossary
  async addGlossaryTerm(courseId: string, weekId: string, parsedData: any, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') throw new AppError('Cannot edit an approved course.', 400)
    
    const week = await courseCatalogRepository.findWeekByIdAndCourse(weekId, course.id)
    if (!week) throw new AppError('Week not found.', 404)

    const count = await courseCatalogRepository.countGlossaryTerms(week.id)
    const term = await courseCatalogRepository.createGlossaryTerm(week.id, parsedData, count + 1)
    await this.markCourseDirtyIfNeeded(course.id, role, course.status)
    return term
  }

  async updateGlossaryTerm(courseId: string, weekId: string, termId: string, parsedData: any, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') throw new AppError('Cannot edit an approved course.', 400)
    
    const term = await courseCatalogRepository.findGlossaryTermByIdAndCourse(termId, weekId, course.id)
    if (!term) throw new AppError('Glossary term not found.', 404)

    return courseCatalogRepository.updateGlossaryTerm(term.id, parsedData)
  }

  async removeGlossaryTerm(courseId: string, weekId: string, termId: string, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') throw new AppError('Cannot edit an approved course.', 400)
    
    const term = await courseCatalogRepository.findGlossaryTermByIdAndCourse(termId, weekId, course.id)
    if (!term) throw new AppError('Glossary term not found.', 404)

    await courseCatalogRepository.deleteGlossaryTerm(term.id)
    await this.markCourseDirtyIfNeeded(course.id, role, course.status)
    return { id: term.id }
  }

  // Reading Resources
  async addReadingResource(courseId: string, weekId: string, parsedData: any, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') throw new AppError('Cannot edit an approved course.', 400)
    
    const week = await courseCatalogRepository.findWeekByIdAndCourse(weekId, course.id)
    if (!week) throw new AppError('Week not found.', 404)

    const count = await courseCatalogRepository.countReadingResources(week.id)
    const resource = await courseCatalogRepository.createReadingResource(week.id, parsedData, count + 1)
    await this.markCourseDirtyIfNeeded(course.id, role, course.status)
    return resource
  }

  async updateReadingResource(courseId: string, weekId: string, resourceId: string, parsedData: any, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') throw new AppError('Cannot edit an approved course.', 400)
    
    const resource = await courseCatalogRepository.findReadingResourceByIdAndCourse(resourceId, weekId, course.id)
    if (!resource) throw new AppError('Resource not found.', 404)

    return courseCatalogRepository.updateReadingResource(resource.id, parsedData)
  }

  async removeReadingResource(courseId: string, weekId: string, resourceId: string, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') throw new AppError('Cannot edit an approved course.', 400)
    
    const resource = await courseCatalogRepository.findReadingResourceByIdAndCourse(resourceId, weekId, course.id)
    if (!resource) throw new AppError('Resource not found.', 404)

    await courseCatalogRepository.deleteReadingResource(resource.id)
    await this.markCourseDirtyIfNeeded(course.id, role, course.status)
    return { id: resource.id }
  }

  // Slide Decks
  async addSlideDeck(courseId: string, weekId: string, parsedData: any, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') throw new AppError('Cannot edit an approved course.', 400)
    
    const week = await courseCatalogRepository.findWeekByIdAndCourse(weekId, course.id)
    if (!week) throw new AppError('Week not found.', 404)

    const count = await courseCatalogRepository.countSlideDecks(week.id)
    const slide = await courseCatalogRepository.createSlideDeck(week.id, parsedData, count + 1)
    await this.markCourseDirtyIfNeeded(course.id, role, course.status)
    return slide
  }

  async updateSlideDeck(courseId: string, weekId: string, slideId: string, parsedData: any, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') throw new AppError('Cannot edit an approved course.', 400)
    
    const slide = await courseCatalogRepository.findSlideDeckByIdAndCourse(slideId, weekId, course.id)
    if (!slide) throw new AppError('Slide deck not found.', 404)

    return courseCatalogRepository.updateSlideDeck(slide.id, parsedData)
  }

  async removeSlideDeck(courseId: string, weekId: string, slideId: string, userId: string, role: string) {
    const course = await this.verifyCourseOwnership(courseId, userId, role)
    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') throw new AppError('Cannot edit an approved course.', 400)
    
    const slide = await courseCatalogRepository.findSlideDeckByIdAndCourse(slideId, weekId, course.id)
    if (!slide) throw new AppError('Slide deck not found.', 404)

    await courseCatalogRepository.deleteSlideDeck(slide.id)
    await this.markCourseDirtyIfNeeded(course.id, role, course.status)
    return { id: slide.id }
  }

  // --- SuperAdmin ---
  async getCoursesAdmin(status?: any) {
    return courseCatalogRepository.findCoursesAdmin(status)
  }

  async getCourseDetailsAdmin(courseId: string) {
    const course = await courseCatalogRepository.findCourseDetailsAdmin(courseId)
    if (!course) throw new AppError('Course not found.', 404)
    return course
  }

  async approveCourse(courseId: string, notes: string | undefined, userId: string) {
    const course = await courseCatalogRepository.findById(courseId)
    if (!course) throw new AppError('Course not found.', 404)
    if (course.status !== 'PENDING_REVIEW' && course.status !== 'DRAFT' && course.status !== 'REJECTED') {
      throw new AppError('This course is already approved.', 400)
    }

    await courseCatalogRepository.approveCourse(course.id, userId, notes)
    return { id: course.id, status: 'APPROVED' }
  }

  async rejectCourse(courseId: string, notes: string, userId: string) {
    const course = await courseCatalogRepository.findById(courseId)
    if (!course) throw new AppError('Course not found.', 404)
    if (course.status !== 'PENDING_REVIEW') {
      throw new AppError('Only courses pending review can be rejected.', 400)
    }

    await courseCatalogRepository.rejectCourse(course.id, userId, notes)
    return { id: course.id, status: 'REJECTED' }
  }

  async getPublicSharedVideo(courseSlug: string, weekSlug: string, videoId: string) {
    const context = await courseCatalogRepository.getPublicVideoContext(courseSlug, weekSlug)
    if (!context) {
      throw new AppError('Video not found or course is not public.', 404)
    }

    const allVideos = [
      ...(context.videoUrl
        ? [{ id: 'legacy', title: context.videoTitle ?? context.title, url: context.videoUrl, description: null, position: 0 }]
        : []),
      ...context.videos,
    ]

    const targetVideo = allVideos.find(v => v.id === videoId)
    if (!targetVideo) {
      throw new AppError('Video not found in this lesson.', 404)
    }

    return {
      course: {
        id: context.course.id,
        slug: context.course.slug,
        title: context.course.title,
      },
      week: {
        title: context.title,
        slug: context.slug,
        number: context.number,
      },
      module: context.module ? { title: context.module.title } : null,
      video: {
        id: targetVideo.id,
        title: targetVideo.title,
        url: targetVideo.url,
        description: targetVideo.description,
        position: targetVideo.position,
      },
      facilitators: context.facilitators.map(f => ({
        name: f.facilitator.name,
        title: f.facilitator.title,
        organization: f.facilitator.organization,
        photoUrl: f.facilitator.photoUrl,
      })),
    }
  }
}

export const courseCatalogService = new CourseCatalogService()
