import { Role } from '@prisma/client'
import prisma from '../../../infrastructure/prisma/client'

export class UserManagementRepository {
  async findLearners(q?: string) {
    const where: any = { role: 'USER' }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ]
    }
    return prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findLearnerById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId, role: 'USER' },
      include: {
        profile: true,
        courseEnrollments: {
          include: {
            course: {
              select: {
                id: true, title: true, slug: true, contentUnit: true,
                weeks: {
                  select: { id: true, slug: true, number: true, title: true }
                }
              }
            }
          }
        },
        weekProgress: {
          include: {
            week: { select: { id: true, title: true, courseId: true, number: true, slug: true } }
          }
        },
        quizAttempts: {
          include: {
            quiz: {
              select: {
                id: true, title: true, passMark: true,
                week: { select: { id: true, slug: true, number: true, title: true, course: { select: { id: true, slug: true, title: true } } } }
              }
            }
          }
        },
        assignmentSubmissions: {
          include: {
            assignment: {
              select: {
                id: true, title: true,
                week: { select: { id: true, slug: true, number: true, title: true, course: { select: { id: true, slug: true, title: true } } } }
              }
            }
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

  async findUsers(q?: string) {
    const where: any = {}
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ]
    }
    return prisma.user.findMany({
      where,
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
