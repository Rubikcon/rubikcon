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

  async getSuperAdminOverview() {
    const [
      totalUsers,
      adminCount,
      learnerCount,
      totalEnrollments,
      totalCourses,
      courseGroups,
      totalSubmissions,
      pendingSubmissions,
      totalWeeks,
      recentUsersList
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.courseEnrollment.count(),
      prisma.course.count(),
      prisma.course.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.assignmentSubmission.count(),
      prisma.assignmentSubmission.count({ where: { status: 'SUBMITTED' } }),
      prisma.week.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true }
      })
    ])

    const coursesByStatus = courseGroups.reduce((acc, curr) => {
      acc[curr.status] = curr._count.status
      return acc
    }, {} as Record<string, number>)

    return {
      totalUsers,
      adminCount,
      learnerCount,
      totalEnrollments,
      totalCourses,
      coursesByStatus,
      totalSubmissions,
      pendingSubmissions,
      totalWeeks,
      recentUsers: recentUsersList
    }
  }
}

export const platformRepository = new PlatformRepository()

