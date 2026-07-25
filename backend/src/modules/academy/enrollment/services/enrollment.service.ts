import { AppError } from '../../../../shared/errors/AppError'
import { enrollmentRepository } from '../repositories/enrollment.repository'

export class EnrollmentService {
  async getCourseEnrollments(courseId: string, userId: string, role: string) {
    const course = await enrollmentRepository.findCourseById(courseId)
    if (!course) {
      throw new AppError('Course not found.', 404)
    }

    this.validateEnrollmentAccess(course.createdById, userId, role)

    return enrollmentRepository.findCourseEnrollments(courseId)
  }

  private validateEnrollmentAccess(createdById: string | null, userId: string, role: string): void {
    if (createdById !== userId && role !== 'SUPER_ADMIN') {
      throw new AppError('Unauthorized.', 403)
    }
  }
}

export const enrollmentService = new EnrollmentService()
