import { NotFoundError, ValidationError } from '../../../shared/errors/AppError'
import { userManagementRepository } from '../repositories/user-management.repository'

export class UserManagementService {
  async getLearners() {
    const learners = await userManagementRepository.findLearners()
    return { learners }
  }

  async getLearnerById(userId: string) {
    const learner = await userManagementRepository.findLearnerById(userId)
    if (!learner) throw new NotFoundError('Learner not found.')
    return { learner }
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

  async getUsers() {
    const users = await userManagementRepository.findUsers()
    return { users }
  }

  private async checkLastSuperAdminGuard(errorMessage: string) {
    const superAdmins = (await userManagementRepository.findUsers()).filter((u) => u.role === 'SUPER_ADMIN')
    if (superAdmins.length <= 1) {
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
}

export const userManagementService = new UserManagementService()
