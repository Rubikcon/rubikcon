import prisma from '../../../infrastructure/prisma/client'

export class PlatformRepository {
  /**
   * Retrieves aggregated platform statistics across all entities.
   */
  async getStats() {
    const [
      totalCourses,
      totalLearners,
      totalFacilitators,
      totalLessons,
      totalAssignments,
      totalQuizzes,
      totalTestimonials,
      totalEnrollments
    ] = await Promise.all([
      prisma.course.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.facilitator.count(),
      prisma.lesson.count(),
      prisma.assignment.count(),
      prisma.quiz.count(),
      prisma.testimonial.count(),
      prisma.courseEnrollment.count()
    ])

    return {
      totalCourses,
      totalLearners,
      totalFacilitators,
      totalLessons,
      totalAssignments,
      totalQuizzes,
      totalTestimonials,
      totalEnrollments
    }
  }
}

export const platformRepository = new PlatformRepository()

