import prisma from '../../../../infrastructure/prisma/client'

export class EnrollmentRepository {
  /**
   * Find a course by its unique identifier.
   */
  async findCourseById(courseId: string) {
    return prisma.course.findUnique({
      where: { id: courseId },
      select: { createdById: true },
    })
  }

  /**
   * Find all user enrollments for a given course ID.
   */
  async findCourseEnrollments(courseId: string) {
    return prisma.courseEnrollment.findMany({
      where: { courseId },
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
  }
}

export const enrollmentRepository = new EnrollmentRepository()
