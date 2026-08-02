import { Role } from '@prisma/client'
import prisma from '../../../infrastructure/prisma/client'

export class UserManagementRepository {
  async findLearners(q?: string, skip = 0, limit = 20) {
    const where: any = { role: 'USER' }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ]
    }
    const [learners, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, createdAt: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where })
    ])
    return { learners, total }
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

  async findUsers(q?: string, role?: string, skip = 0, limit = 20) {
    const where: any = {}
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ]
    }
    if (role) {
      where.role = role
    }
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { 
          id: true, 
          name: true, 
          email: true, 
          role: true, 
          createdAt: true,
          _count: { select: { courseEnrollments: true } } 
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where })
    ])
    return { users, total }
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

  async createFacilitatorApplication(data: any) {
    return prisma.facilitatorApplication.create({ data })
  }

  async findFacilitatorApplications() {
    return prisma.facilitatorApplication.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  async updateFacilitatorApplicationStatus(id: string, status: any) {
    return prisma.facilitatorApplication.update({
      where: { id },
      data: { status },
    })
  }
}

export const userManagementRepository = new UserManagementRepository()
