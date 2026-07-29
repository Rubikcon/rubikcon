import { Role } from '@prisma/client'
import prisma from '../../../infrastructure/prisma/client'

export class UserManagementRepository {
  async findLearners() {
    return prisma.user.findMany({
      where: { role: 'USER' },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findLearnerById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId, role: 'USER' },
      include: {
        courseEnrollments: {
          include: {
            course: { select: { id: true, title: true, slug: true } }
          }
        },
        weekProgress: {
          include: {
            week: { select: { id: true, title: true, courseId: true } }
          }
        },
        quizAttempts: {
          include: {
            quiz: { select: { id: true, title: true, passMark: true } }
          }
        },
        assignmentSubmissions: {
          include: {
            assignment: { select: { id: true, title: true } }
          }
        }
      }
    })
  }

  async findFacilitators() {
    return prisma.facilitator.findMany({
      orderBy: { name: 'asc' },
    })
  }

  async createFacilitator(data: any) {
    return prisma.facilitator.create({ data })
  }

  async findFacilitatorById(id: string) {
    return prisma.facilitator.findUnique({ where: { id } })
  }

  async updateFacilitator(id: string, data: any) {
    return prisma.facilitator.update({
      where: { id },
      data,
    })
  }

  async deleteFacilitator(id: string) {
    return prisma.facilitator.delete({ where: { id } })
  }

  async findFacilitatorByEmail(email: string) {
    return prisma.facilitator.findUnique({ where: { email } })
  }

  async findAdminUsers() {
    return prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { name: 'asc' },
    })
  }

  async findUsers() {
    return prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  }

  async updateUserRole(id: string, role: Role) {
    return prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    })
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } })
  }
}

export const userManagementRepository = new UserManagementRepository()
