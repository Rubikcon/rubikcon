import { NotFoundError, ValidationError } from '../../../shared/errors/AppError'
import { userManagementRepository } from '../repositories/user-management.repository'

export class UserManagementService {
  async getLearners(q?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const { learners, total } = await userManagementRepository.findLearners(q, skip, limit)
    return { 
      learners, 
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      } 
    }
  }

  async getLearnerById(userId: string) {
    const learner = await userManagementRepository.findLearnerById(userId)
    if (!learner) throw new NotFoundError('Learner not found.')
    
    // Format into the structure expected by SuperAdminPage
    const enrollments = learner.courseEnrollments.map((enr: any) => {
      const course = enr.course
      const weeks = (course.weeks || []).map((w: any) => {
        const wp = learner.weekProgress.find((p: any) => p.week.id === w.id)
        return {
          id: w.id,
          slug: w.slug,
          number: w.number,
          title: w.title,
          status: wp ? wp.status : 'NOT_STARTED',
          completedAt: wp ? wp.completedAt : null,
          quizSubmitted: wp ? wp.quizSubmitted : false,
          assignmentSubmitted: wp ? wp.assignmentSubmitted : false,
          manuallyCompleted: wp ? wp.manuallyCompleted : false,
          firstOpenedAt: wp ? wp.firstOpenedAt : null,
        }
      })
      const completedCount = weeks.filter((w: any) => w.status === 'COMPLETE').length
      const totalCount = weeks.length
      return {
        course: { id: course.id, slug: course.slug, title: course.title, contentUnit: course.contentUnit },
        enrolledAt: enr.enrolledAt,
        progressPercent: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        completedCount,
        totalCount,
        weeks
      }
    })

    const formattedLearner = {
      user: {
        id: learner.id,
        name: learner.name,
        email: learner.email,
        role: learner.role,
        createdAt: learner.createdAt,
        profile: learner.profile
      },
      enrollments,
      submissions: learner.assignmentSubmissions,
      quizAttempts: learner.quizAttempts
    }
    
    return { learner: formattedLearner }
  }

  async getFacilitators() {
    const facilitators = await userManagementRepository.findFacilitators()
    return { facilitators }
  }

  async createFacilitator(data: any) {
    const facilitator = await userManagementRepository.createFacilitator(data)
    return { facilitator }
  }

  async updateFacilitator(id: string, data: any) {
    const existing = await userManagementRepository.findFacilitatorById(id)
    if (!existing) throw new NotFoundError('Facilitator not found.')
    const facilitator = await userManagementRepository.updateFacilitator(id, data)
    return { facilitator }
  }

  async deleteFacilitator(id: string) {
    const existing = await userManagementRepository.findFacilitatorById(id)
    if (!existing) throw new NotFoundError('Facilitator not found.')
    await userManagementRepository.deleteFacilitator(id)
    return { success: true }
  }

  async getFacilitatorMe(email: string) {
    const facilitator = await userManagementRepository.findFacilitatorByEmail(email)
    if (!facilitator) throw new NotFoundError('Facilitator profile not found.')
    return { facilitator }
  }

  async updateFacilitatorMe(email: string, data: any) {
    const facilitator = await userManagementRepository.findFacilitatorByEmail(email)
    if (!facilitator) throw new NotFoundError('Facilitator profile not found.')
    const updated = await userManagementRepository.updateFacilitator(facilitator.id, data)
    return { facilitator: updated }
  }

  async getAdminUsers() {
    const admins = await userManagementRepository.findAdminUsers()
    return { admins }
  }

  async getUsers(q?: string, role?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const { users, total } = await userManagementRepository.findUsers(q, role, skip, limit)
    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    }
  }

  private async checkLastSuperAdminGuard(errorMessage: string) {
    const { total } = await userManagementRepository.findUsers(undefined, 'SUPER_ADMIN', 0, 1)
    if (total <= 1) {
      throw new ValidationError(errorMessage)
    }
  }

  async updateUserRole(userId: string, role: 'SUPER_ADMIN' | 'ADMIN' | 'USER') {
    const user = await userManagementRepository.findById(userId)
    if (!user) throw new NotFoundError('User not found.')
    
    if (user.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
      await this.checkLastSuperAdminGuard('Cannot demote the last super admin.')
    }
    
    const updatedUser = await userManagementRepository.updateUserRole(userId, role)
    return { user: updatedUser }
  }

  async deleteUser(userId: string) {
    const user = await userManagementRepository.findById(userId)
    if (!user) throw new NotFoundError('User not found.')

    if (user.role === 'SUPER_ADMIN') {
      await this.checkLastSuperAdminGuard('Cannot delete the last super admin.')
    }

    await userManagementRepository.delete(userId)
    return { success: true }
  }

  async submitFacilitatorApplication(data: any) {
    const application = await userManagementRepository.createFacilitatorApplication(data)
    return { application }
  }

  async getFacilitatorApplications() {
    const applications = await userManagementRepository.findFacilitatorApplications()
    return { applications }
  }

  async updateFacilitatorApplicationStatus(id: string, status: string) {
    const application = await userManagementRepository.updateFacilitatorApplicationStatus(id, status)
    return { application }
  }
}

export const userManagementService = new UserManagementService()
