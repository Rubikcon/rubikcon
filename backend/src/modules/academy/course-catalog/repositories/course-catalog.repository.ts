import { CourseStatus } from '@prisma/client'
import prisma from '../../../../infrastructure/prisma/client'

export class CourseCatalogRepository {
  async findActiveTestimonials() {
    return prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    })
  }

  async findPublicFacilitators(skip: number, limit: number) {
    return Promise.all([
      prisma.facilitator.findMany({
        orderBy: { name: 'asc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          title: true,
          organization: true,
          bio: true,
          photoUrl: true,
          linkedinUrl: true,
          courses: {
            select: {
              course: {
                select: { id: true, slug: true, title: true, published: true },
              },
            },
          },
        },
      }),
      prisma.facilitator.count(),
    ])
  }

  async checkFacilitatorAccess(user: { userId: string; email: string; role: string }, courseId: string) {
    if (user.role === 'SUPER_ADMIN') return true;
    
    const emailMatch: any = {
      email: { equals: user.email, mode: 'insensitive' },
    }
    const count = await prisma.course.count({
      where: {
        id: courseId,
        OR: [
          { createdById: user.userId },
          { courseFacilitators: { some: { facilitator: emailMatch } } },
          { weeks: { some: { facilitators: { some: { facilitator: emailMatch } } } } },
          { modules: { some: { lessons: { some: { facilitators: { some: { facilitator: emailMatch } } } } } } },
        ],
      },
    })
    return count > 0;
  }

  async getCourseProgressMap(userId: string, weekIds: string[]) {
    const items = await prisma.weekProgress.findMany({
      where: { userId, weekId: { in: weekIds } },
    })
    return new Map(items.map((item) => [item.weekId, item]))
  }

  async getPlatformStats() {
    return Promise.all([
      prisma.course.count({ where: { status: 'APPROVED', published: true } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.facilitator.count()
    ])
  }

  async findMany(skip: number, limit: number, userId?: string, q?: string, level?: string, phaseLabel?: string) {
    const andClauses: object[] = [{ published: true }]
    if (q) {
      andClauses.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' as const } },
          { tagline: { contains: q, mode: 'insensitive' as const } },
          { description: { contains: q, mode: 'insensitive' as const } },
          { level: { contains: q, mode: 'insensitive' as const } },
          { phaseLabel: { contains: q, mode: 'insensitive' as const } },
        ],
      })
    }
    if (level) andClauses.push({ level: { equals: level, mode: 'insensitive' as const } })
    if (phaseLabel) andClauses.push({ phaseLabel: { equals: phaseLabel, mode: 'insensitive' as const } })
    const where = andClauses.length === 1 ? andClauses[0] : { AND: andClauses }
    return Promise.all([
      prisma.course.findMany({
        where,
        select: {
          id: true,
          slug: true,
          title: true,
          tagline: true,
          level: true,
          isPaid: true,
          isFeatured: true,
          priceUsd: true,
          priceNgn: true,
          discountPercent: true,
          status: true,
          published: true,
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
          enrollments: userId
            ? { where: { userId }, select: { id: true } }
            : undefined,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.course.count({ where }),
    ])
  }

  async findFilterMeta() {
    const [levels, phaseLabels] = await Promise.all([
      prisma.course.findMany({
        where: { published: true },
        select: { level: true },
        distinct: ['level'],
        orderBy: { level: 'asc' },
      }),
      prisma.course.findMany({
        where: { published: true },
        select: { phaseLabel: true },
        distinct: ['phaseLabel'],
        orderBy: { phaseLabel: 'asc' },
      }),
    ])
    return {
      levels: levels.map(c => c.level).filter((v): v is string => v !== null),
      phaseLabels: phaseLabels.map(c => c.phaseLabel).filter((v): v is string => v !== null),
    }
  }

  async findBySlug(slug: string, userId?: string) {
    return prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          orderBy: { position: 'asc' },
          select: { id: true, title: true, description: true, position: true },
        },
        weeks: {
          orderBy: { number: 'asc' },
          select: {
            id: true,
            number: true,
            slug: true,
            title: true,
            durationLabel: true,
            estimatedCompletionMinutes: true,
            moduleId: true,
            published: true,
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
        enrollments: userId
          ? { where: { userId }, select: { id: true } }
          : false,
      },
    })
  }

  async findCourseWeeks(slug: string, userId?: string) {
    return prisma.course.findUnique({
      where: { slug },
      include: {
        weeks: {
          orderBy: { number: 'asc' },
          include: {
            module: true,
          }
        },
        enrollments: userId
          ? { where: { userId }, select: { id: true } }
          : false,
      }
    })
  }

  // --- Admin Course Management ---

  async create(data: any, createdById: string) {
    return prisma.course.create({
      data: { ...data, createdById, status: 'DRAFT' },
    })
  }

  async findAdminBySlug(slug: string) {
    return prisma.course.findUnique({ where: { slug } })
  }

  async findAdminCoursesPaginated(skip: number, limit: number, userId: string, role: string) {
    const where = role === 'SUPER_ADMIN' ? {} : { createdById: userId }

    return Promise.all([
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
          isFeatured: true,
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
  }

  async findAdminCourseDetails(courseId: string) {
    return prisma.course.findUnique({
      where: { id: courseId },
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
            facilitators: {
              include: { facilitator: { select: { id: true, name: true, title: true, organization: true, photoUrl: true } } },
              orderBy: { position: 'asc' },
            },
          },
        },
        approvals: {
          orderBy: { createdAt: 'desc' },
          include: { reviewer: { select: { id: true, name: true, email: true } } },
        },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    })
  }

  async findById(courseId: string) {
    return prisma.course.findUnique({ where: { id: courseId } })
  }

  async update(courseId: string, data: any) {
    return prisma.course.update({
      where: { id: courseId },
      data,
    })
  }

  async setFeaturedCourse(courseId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.course.updateMany({
        data: { isFeatured: false },
      })
      return tx.course.update({
        where: { id: courseId },
        data: { isFeatured: true },
      })
    })
  }

  async delete(courseId: string) {
    return prisma.course.delete({ where: { id: courseId } })
  }

  async countCoursePrerequisites(courseId: string) {
    return Promise.all([
      prisma.week.count({ where: { courseId } }),
      prisma.courseFacilitator.count({ where: { courseId } })
    ])
  }

  // --- Admin Week Management ---

  async findWeekBySlug(slug: string) {
    return prisma.week.findUnique({ where: { slug } })
  }

  async findWeekByCourseAndNumber(courseId: string, number: number) {
    return prisma.week.findUnique({ where: { courseId_number: { courseId, number } } })
  }

  async findWeekByIdAndCourse(weekId: string, courseId: string) {
    return prisma.week.findFirst({ where: { id: weekId, courseId } })
  }

  async createWeek(courseId: string, isApproved: boolean, weekData: any, topics: string[], objectives: string[]) {
    return prisma.week.create({
      data: {
        ...weekData,
        courseId,
        published: isApproved,
        topics: {
          create: topics.map((title: string, i: number) => ({ title, position: i + 1 })),
        },
        objectives: {
          create: objectives.map((body: string, i: number) => ({ body, position: i + 1 })),
        },
      },
      include: {
        topics: { orderBy: { position: 'asc' } },
        objectives: { orderBy: { position: 'asc' } },
      },
    })
  }

  async updateWeek(weekId: string, weekData: any, topics?: string[], objectives?: string[]) {
    await prisma.$transaction(async (tx) => {
      if (topics !== undefined) {
        await tx.weekTopic.deleteMany({ where: { weekId } })
        await tx.weekTopic.createMany({ data: topics.map((title, i) => ({ weekId, title, position: i + 1 })) })
      }
      if (objectives !== undefined) {
        await tx.weekObjective.deleteMany({ where: { weekId } })
        await tx.weekObjective.createMany({ data: objectives.map((body, i) => ({ weekId, body, position: i + 1 })) })
      }
      if (Object.keys(weekData).length > 0) {
        await tx.week.update({ where: { id: weekId }, data: weekData })
      }
    })

    return prisma.week.findUnique({
      where: { id: weekId },
      include: { topics: { orderBy: { position: 'asc' } }, objectives: { orderBy: { position: 'asc' } } },
    })
  }

  async deleteWeek(weekId: string) {
    return prisma.week.delete({ where: { id: weekId } })
  }

  // --- Admin Module Management ---

  async findModuleByIdAndCourse(moduleId: string, courseId: string) {
    return prisma.module.findFirst({ where: { id: moduleId, courseId } })
  }

  async countModules(courseId: string) {
    return prisma.module.count({ where: { courseId } })
  }

  async createModule(courseId: string, moduleData: any, position: number) {
    return prisma.module.create({
      data: { courseId, ...moduleData, position },
    })
  }

  async updateModule(moduleId: string, moduleData: any) {
    return prisma.module.update({
      where: { id: moduleId },
      data: moduleData,
    })
  }

  async deleteModule(moduleId: string) {
    return prisma.module.delete({ where: { id: moduleId } })
  }

  async updateWeekModule(weekId: string, moduleId: string | null) {
    return prisma.week.update({
      where: { id: weekId },
      data: { moduleId },
    })
  }

  // --- Admin Lesson Content Management ---

  async updateWeekContent(weekId: string, lessonContent: string) {
    return prisma.week.update({
      where: { id: weekId },
      data: { lessonContent },
    })
  }

  // Images
  async countWeekImages(weekId: string) {
    return prisma.weekImage.count({ where: { weekId } })
  }
  
  // Lessons
  async findLessonById(lessonId: string) {
    return prisma.lesson.findUnique({ where: { id: lessonId } })
  }
  async findLessonByIdAndCourse(lessonId: string, courseId: string) {
    return prisma.lesson.findFirst({ where: { id: lessonId, module: { courseId } } })
  }
  async countLessons(moduleId: string) {
    return prisma.lesson.count({ where: { moduleId } })
  }
  async createLesson(moduleId: string, data: any, position: number) {
    return prisma.lesson.create({ data: { ...data, moduleId, position } })
  }
  async deleteLesson(lessonId: string) {
    return prisma.lesson.delete({ where: { id: lessonId } })
  }

  // Lesson Facilitators
  async findLessonFacilitator(lessonId: string, facilitatorId: string) {
    return prisma.lessonFacilitator.findUnique({ where: { lessonId_facilitatorId: { lessonId, facilitatorId } } })
  }
  async createLessonFacilitator(lessonId: string, facilitatorId: string) {
    return prisma.lessonFacilitator.create({ data: { lessonId, facilitatorId } })
  }
  async deleteLessonFacilitator(lessonId: string, facilitatorId: string) {
    return prisma.lessonFacilitator.delete({ where: { lessonId_facilitatorId: { lessonId, facilitatorId } } })
  }

  // --- SuperAdmin ---
  async findCoursesAdmin(status?: CourseStatus, skip = 0, limit = 10) {
    const where = status ? { status } : {}
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
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
      }),
      prisma.course.count({ where }),
    ])
    return { courses, total }
  }

  async findCourseDetailsAdmin(courseId: string) {
    return prisma.course.findUnique({
      where: { id: courseId },
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
  }

  async approveCourse(courseId: string, reviewerId: string, notes?: string) {
    return prisma.$transaction([
      prisma.course.update({
        where: { id: courseId },
        data: { status: 'APPROVED', published: true, publishedAt: new Date(), approvedAt: new Date(), approvalNotes: null },
      }),
      prisma.week.updateMany({
        where: { courseId },
        data: { published: true },
      }),
      prisma.courseApproval.create({
        data: { courseId, reviewerId, action: 'APPROVED', notes: notes ?? null },
      }),
    ])
  }

  async rejectCourse(courseId: string, reviewerId: string, notes: string) {
    return prisma.$transaction([
      prisma.course.update({
        where: { id: courseId },
        data: { status: 'REJECTED', published: false, approvalNotes: notes },
      }),
      prisma.courseApproval.create({
        data: { courseId, reviewerId, action: 'REJECTED', notes },
      }),
    ])
  }

  async createWeekImage(weekId: string, data: any, position: number) {
    return prisma.weekImage.create({ data: { weekId, ...data, position } })
  }
  async findWeekImageByIdAndCourse(imageId: string, weekId: string, courseId: string) {
    return prisma.weekImage.findFirst({ where: { id: imageId, week: { id: weekId, courseId } } })
  }
  async deleteWeekImage(imageId: string) {
    return prisma.weekImage.delete({ where: { id: imageId } })
  }

  // Videos
  async countWeekVideos(weekId: string) {
    return prisma.weekVideo.count({ where: { weekId } })
  }
  async createWeekVideo(weekId: string, data: any, position: number) {
    return prisma.weekVideo.create({ data: { weekId, ...data, position } })
  }
  async findWeekVideoByIdAndCourse(videoId: string, weekId: string, courseId: string) {
    return prisma.weekVideo.findFirst({ where: { id: videoId, week: { id: weekId, courseId } } })
  }
  async updateWeekVideo(videoId: string, data: any) {
    return prisma.weekVideo.update({ where: { id: videoId }, data })
  }
  async deleteWeekVideo(videoId: string) {
    return prisma.weekVideo.delete({ where: { id: videoId } })
  }
  async findWeekVideos(weekId: string, courseId: string) {
    return prisma.weekVideo.findMany({ where: { weekId, week: { courseId } }, select: { id: true } })
  }
  async reorderWeekVideos(videoIds: string[]) {
    await prisma.$transaction(async (tx) => {
      // Phase 1: park everything in negative space
      for (let i = 0; i < videoIds.length; i++) {
        await tx.weekVideo.update({
          where: { id: videoIds[i] },
          data: { position: -(i + 1) },
        })
      }
      // Phase 2: restore to final 1-based index
      for (let i = 0; i < videoIds.length; i++) {
        await tx.weekVideo.update({
          where: { id: videoIds[i] },
          data: { position: i + 1 },
        })
      }
    })
  }

  // Facilitators
  async findFacilitatorById(facilitatorId: string) {
    return prisma.facilitator.findUnique({ where: { id: facilitatorId } })
  }
  async findWeekFacilitator(weekId: string, facilitatorId: string) {
    return prisma.weekFacilitator.findUnique({ where: { weekId_facilitatorId: { weekId, facilitatorId } } })
  }
  async createWeekFacilitator(weekId: string, facilitatorId: string, position: number) {
    return prisma.weekFacilitator.create({ data: { weekId, facilitatorId, position } })
  }
  async countWeekFacilitators(weekId: string) {
    return prisma.weekFacilitator.count({ where: { weekId } })
  }
  async findLessonFacilitatorByIdAndCourse(lessonId: string, facilitatorId: string, courseId: string) {
    // Note: the model is weekFacilitator, but the endpoints say lessonFacilitator sometimes.
    // The previous implementation used prisma.weekFacilitator.findUnique or lessonFacilitator? 
    // Wait, the previous implementation used `weekFacilitator` in `/admin/courses/:courseId/weeks/:weekId/facilitators`.
    return prisma.weekFacilitator.findFirst({
      where: { weekId: lessonId, facilitatorId, week: { courseId } },
    })
  }
  async deleteWeekFacilitator(weekId: string, facilitatorId: string) {
    return prisma.weekFacilitator.delete({
      where: { weekId_facilitatorId: { weekId, facilitatorId } },
    })
  }

  // Glossary
  async countGlossaryTerms(weekId: string) {
    return prisma.glossaryTerm.count({ where: { weekId } })
  }
  async createGlossaryTerm(weekId: string, data: any, position: number) {
    return prisma.glossaryTerm.create({ data: { weekId, ...data, position } })
  }
  async findGlossaryTermByIdAndCourse(termId: string, weekId: string, courseId: string) {
    return prisma.glossaryTerm.findFirst({ where: { id: termId, week: { id: weekId, courseId } } })
  }
  async updateGlossaryTerm(termId: string, data: any) {
    return prisma.glossaryTerm.update({ where: { id: termId }, data })
  }
  async deleteGlossaryTerm(termId: string) {
    return prisma.glossaryTerm.delete({ where: { id: termId } })
  }

  // Resources
  async countReadingResources(weekId: string) {
    return prisma.readingResource.count({ where: { weekId } })
  }
  async createReadingResource(weekId: string, data: any, position: number) {
    return prisma.readingResource.create({ data: { weekId, ...data, position } })
  }
  async findReadingResourceByIdAndCourse(resourceId: string, weekId: string, courseId: string) {
    return prisma.readingResource.findFirst({ where: { id: resourceId, week: { id: weekId, courseId } } })
  }
  async updateReadingResource(resourceId: string, data: any) {
    return prisma.readingResource.update({ where: { id: resourceId }, data })
  }
  async deleteReadingResource(resourceId: string) {
    return prisma.readingResource.delete({ where: { id: resourceId } })
  }

  // Slides
  async countSlideDecks(weekId: string) {
    return prisma.slideDeck.count({ where: { weekId } })
  }
  async createSlideDeck(weekId: string, data: any, position: number) {
    return prisma.slideDeck.create({ data: { weekId, ...data, position } })
  }
  async findSlideDeckByIdAndCourse(slideId: string, weekId: string, courseId: string) {
    return prisma.slideDeck.findFirst({ where: { id: slideId, week: { id: weekId, courseId } } })
  }
  async updateSlideDeck(slideId: string, data: any) {
    return prisma.slideDeck.update({ where: { id: slideId }, data })
  }
  async deleteSlideDeck(slideId: string) {
    return prisma.slideDeck.delete({ where: { id: slideId } })
  }
  // Legacy support
  async getLegacyWeekDetails(weekSlug: string) {
    return prisma.week.findUnique({
      where: { slug: weekSlug },
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
  }

  async getLegacyCourseWeeks(courseId: string) {
    return prisma.week.findMany({
      where: { courseId, published: true },
      orderBy: { number: 'asc' },
      select: { id: true, slug: true, title: true, number: true, moduleId: true },
    })
  }

  async getLegacyCourseEnrollment(userId: string, courseId: string) {
    return prisma.courseEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    })
  }

  async createLegacyModuleFeedback(userId: string, moduleId: string, feedback: string) {
    return prisma.moduleFeedback.create({
      data: {
        userId,
        moduleId,
        feedback,
      }
    })
  }

  async getUserWeekStateData(userId: string, weekId: string, quizId?: string | null) {
    return Promise.all([
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
  }

  // Auto-generated legacy wrappers
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyFindUniqueWeek = async (args: any): Promise<any> => { return prisma.week.findUnique(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyFindUniqueCourseEnrollment = async (args: any): Promise<any> => { return prisma.courseEnrollment.findUnique(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyFindManyWeek = async (args: any): Promise<any> => { return prisma.week.findMany(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyFindUniqueModule = async (args: any): Promise<any> => { return prisma.module.findUnique(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyCreateModuleFeedback = async (args: any): Promise<any> => { return prisma.moduleFeedback.create(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyFindManySavedGlossaryTerm = async (args: any): Promise<any> => { return prisma.savedGlossaryTerm.findMany(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyFindManyReadingProgress = async (args: any): Promise<any> => { return prisma.readingProgress.findMany(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyFindManyCourse = async (args: any): Promise<any> => { return prisma.course.findMany(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyFindUniqueCourse = async (args: any): Promise<any> => { return prisma.course.findUnique(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyFindUniqueLesson = async (args: any): Promise<any> => { return prisma.lesson.findUnique(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyUpdateLesson = async (args: any): Promise<any> => { return prisma.lesson.update(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyCreateLessonVideo = async (args: any): Promise<any> => { return prisma.lessonVideo.create(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyUpdateLessonVideo = async (args: any): Promise<any> => { return prisma.lessonVideo.update(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyDeleteLessonVideo = async (args: any): Promise<any> => { return prisma.lessonVideo.delete(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyFindManyTestimonial = async (args: any): Promise<any> => { return prisma.testimonial.findMany(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyCreateTestimonial = async (args: any): Promise<any> => { return prisma.testimonial.create(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyUpdateTestimonial = async (args: any): Promise<any> => { return prisma.testimonial.update(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyDeleteTestimonial = async (args: any): Promise<any> => { return prisma.testimonial.delete(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyFindUniqueFacilitator = async (args: any): Promise<any> => { return prisma.facilitator.findUnique(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyFindUniqueUser = async (args: any): Promise<any> => { return prisma.user.findUnique(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyFindFirstFacilitator = async (args: any): Promise<any> => { return prisma.facilitator.findFirst(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyCreateFacilitator = async (args: any): Promise<any> => { return prisma.facilitator.create(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyFindUniqueCourseFacilitator = async (args: any): Promise<any> => { return prisma.courseFacilitator.findUnique(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyCountCourseFacilitator = async (args: any): Promise<any> => { return prisma.courseFacilitator.count(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyCreateCourseFacilitator = async (args: any): Promise<any> => { return prisma.courseFacilitator.create(args); }
  // Justification for any: Legacy wrapper waiting for phased removal
  legacyDeleteCourseFacilitator = async (args: any): Promise<any> => { return prisma.courseFacilitator.delete(args); }

  async getPublicVideoContext(courseSlug: string, weekSlug: string) {
    return prisma.week.findFirst({
      where: {
        slug: weekSlug,
        course: { slug: courseSlug, published: true },
        published: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        number: true,
        videoUrl: true,
        videoTitle: true,
        course: {
          select: {
            id: true,
            slug: true,
            title: true,
          }
        },
        module: {
          select: {
            title: true,
          }
        },
        videos: {
          select: {
            id: true,
            title: true,
            url: true,
            description: true,
            position: true,
          },
          orderBy: { position: 'asc' }
        },
        facilitators: {
          select: {
            facilitator: {
              select: {
                name: true,
                title: true,
                organization: true,
                photoUrl: true,
              }
            }
          },
          orderBy: { position: 'asc' }
        }
      }
    })
  }
}

export const courseCatalogRepository = new CourseCatalogRepository();
