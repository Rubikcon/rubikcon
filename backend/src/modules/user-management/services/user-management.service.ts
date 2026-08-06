import { Role } from '@prisma/client'
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError'
import { userManagementRepository } from '../repositories/user-management.repository'

export class UserManagementService {
  async getLearners(q?: string, page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit
    const { learners, total } = await userManagementRepository.findLearners(q, skip, limit, status)
    
    const mappedLearners = learners.map((learner: any) => {
      const now = new Date()
      const lastActive = learner.lastActivityAt || learner.createdAt
      const daysSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 3600 * 24)
      
      const enrollmentCount = learner._count.courseEnrollments
      const completedLessons = learner.weekProgress.filter((wp: any) => wp.status === 'COMPLETE').length
      const inProgressLessons = learner.weekProgress.filter((wp: any) => wp.status === 'IN_PROGRESS').length
      
      const totalSubmissions = learner.assignmentSubmissions.length
      const quizAttempts = learner.quizAttempts.length

      const hasStarted = completedLessons > 0 || inProgressLessons > 0 || totalSubmissions > 0 || quizAttempts > 0
      
      let status = 'Not Started'
      let statusReason = undefined

      if (daysSinceActive >= 30) {
        status = 'Inactive'
        statusReason = `No activity for ${Math.floor(daysSinceActive)} days`
      } else if (hasStarted && daysSinceActive >= 14) {
        status = 'At Risk'
        statusReason = `Started learning but stalled for ${Math.floor(daysSinceActive)} days`
      } else if (!hasStarted && enrollmentCount > 0 && daysSinceActive >= 7) {
        status = 'At Risk'
        statusReason = `Enrolled but never started (inactive for ${Math.floor(daysSinceActive)} days)`
      } else if (hasStarted) {
        status = 'In Progress'
      }

      return {
        id: learner.id,
        name: learner.name,
        email: learner.email,
        country: learner.profile?.country || null,
        createdAt: learner.createdAt,
        lastActivityAt: learner.lastActivityAt,
        signupSource: learner.signupSource,
        onboardingCompleted: learner.profile?.onboardingCompleted || false,
        enrollmentCount,
        completedLessons,
        inProgressLessons,
        totalSubmissions,
        quizAttempts,
        gigApplications: 0, // Mock for now if not tracked
        status,
        statusReason
      }
    })

    return { 
      learners: mappedLearners, 
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

    const now = new Date()
    const lastActive = learner.lastActivityAt || learner.createdAt
    const daysSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 3600 * 24)

    const enrollmentCount = learner.courseEnrollments.length
    const completedLessons = learner.weekProgress.filter((wp: any) => wp.status === 'COMPLETE').length
    const inProgressLessons = learner.weekProgress.filter((wp: any) => wp.status === 'IN_PROGRESS').length
    
    const totalSubmissions = learner.assignmentSubmissions.length
    const quizAttempts = learner.quizAttempts.length

    const hasStarted = completedLessons > 0 || inProgressLessons > 0 || totalSubmissions > 0 || quizAttempts > 0
    
    let status = 'Not Started'
    let statusReason = undefined

    if (daysSinceActive >= 30) {
      status = 'Inactive'
      statusReason = `No activity for ${Math.floor(daysSinceActive)} days`
    } else if (hasStarted && daysSinceActive >= 14) {
      status = 'At Risk'
      statusReason = `Started learning but stalled for ${Math.floor(daysSinceActive)} days`
    } else if (!hasStarted && enrollmentCount > 0 && daysSinceActive >= 7) {
      status = 'At Risk'
      statusReason = `Enrolled but never started (inactive for ${Math.floor(daysSinceActive)} days)`
    } else if (hasStarted) {
      status = 'In Progress'
    }

    const formattedLearner = {
      user: {
        id: learner.id,
        name: learner.name,
        email: learner.email,
        role: learner.role,
        createdAt: learner.createdAt,
        lastActivityAt: learner.lastActivityAt,
        signupSource: learner.signupSource,
        status,
        statusReason,
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

  async getActiveFacilitators() {
    const facilitators = await userManagementRepository.findActiveFacilitators()
    return { facilitators }
  }

  async updateFacilitator(id: string, data: any) {
    const existing = await userManagementRepository.findFacilitatorById(id)
    if (!existing) throw new NotFoundError('Facilitator not found.')
    const facilitator = await userManagementRepository.updateFacilitator(id, data)
    return { facilitator }
  }

  async getFacilitatorMe(email: string) {
    const facilitator = await userManagementRepository.findFacilitatorByEmail(email)
    if (!facilitator) throw new NotFoundError('Facilitator profile not found.')
    return { facilitator }
  }

  async updateFacilitatorMe(email: string, data: any) {
    const facilitator = await userManagementRepository.findFacilitatorByEmail(email)
    if (!facilitator) throw new NotFoundError('Facilitator profile not found.')

    const mergedData = { ...facilitator, ...data }
    const isProfileComplete = Boolean(
      mergedData.name && 
      mergedData.title && 
      mergedData.bio && 
      mergedData.photoUrl
    )
    
    const updateData = { ...data, isProfileComplete }

    const updated = await userManagementRepository.updateFacilitator(facilitator.id, updateData)

    if (isProfileComplete && facilitator.userId) {
      await userManagementRepository.updateUserProfile(facilitator.userId, { onboardingCompleted: true })
    }

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

  async updateUserRole(userId: string, role: 'SUPER_ADMIN' | 'ADMIN' | 'FACILITATOR' | 'USER') {
    const user = await userManagementRepository.findById(userId)
    if (!user) throw new NotFoundError('User not found.')
    
    if (user.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
      await this.checkLastSuperAdminGuard('Cannot demote the last super admin.')
    }
    
    const updatedUser = await userManagementRepository.updateUserRole(userId, role as Role)

    if (role === 'FACILITATOR') {
      const existingProfile = await userManagementRepository.findFacilitatorByUserId(userId)
      if (!existingProfile) {
        // Check if a facilitator profile already exists for this email (edge case)
        const existingByEmail = await userManagementRepository.findFacilitatorByEmail(user.email)
        if (!existingByEmail) {
          await userManagementRepository.createFacilitator({
            userId: user.id,
            email: user.email,
            name: user.name ?? user.email.split('@')[0], // name is required; fall back to email prefix
            title: '',          // required field — filled during onboarding
            organization: '',   // required field — filled during onboarding
            linkedinUrl: '',    // required field — filled during onboarding
            bio: '',
            isProfileComplete: false,
          })
        } else {
          // Link the existing facilitator profile to this user
          await userManagementRepository.updateFacilitator(existingByEmail.id, { userId: user.id })
        }
      }
    }

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
