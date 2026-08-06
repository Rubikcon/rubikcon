import { Role } from '@prisma/client'
import prisma from '../../../infrastructure/prisma/client'

export class UserManagementRepository {
  async findLearners(q?: string, skip = 0, limit = 20, status?: string) {
    const where: any = { role: 'USER' }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ]
    }

    if (status) {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      if (status === 'Inactive') {
        where.lastActivityAt = { lt: thirtyDaysAgo }
      } else if (status === 'At Risk') {
        // We approximate At Risk for DB query:
        // Inactive for 14 days OR (enrolled but no activity for 7 days)
        where.OR = [
          ...(where.OR || []),
          {
            AND: [
              { lastActivityAt: { lt: fourteenDaysAgo } },
              { lastActivityAt: { not: null } }
            ]
          },
          {
            AND: [
              { createdAt: { lt: sevenDaysAgo } },
              { lastActivityAt: null },
              { courseEnrollments: { some: {} } }
            ]
          }
        ]
      }
    }

    const [learners, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { 
          id: true, 
          name: true, 
          email: true, 
          createdAt: true,
          lastActivityAt: true,
          signupSource: true,
          profile: {
            select: { country: true, onboardingCompleted: true }
          },
          _count: {
            select: { courseEnrollments: true }
          },
          weekProgress: {
            select: { status: true }
          },
          assignmentSubmissions: { select: { id: true } },
          quizAttempts: { select: { id: true } }
        },
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
      where: {
        user: {
          role: { in: ['FACILITATOR', 'ADMIN', 'SUPER_ADMIN'] },
        },
      },
      include: {
        _count: { select: { courses: true, weeks: true, lessons: true } },
        user: { select: { role: true, profile: { select: { onboardingCompleted: true } } } },
      },
      orderBy: { name: 'asc' },
    })
  }

  async findActiveFacilitators() {
    return prisma.facilitator.findMany({
      where: { user: { role: { in: ['FACILITATOR', 'ADMIN', 'SUPER_ADMIN'] } } },
      orderBy: { name: 'asc' },
    })
  }

  async findFacilitatorById(id: string) {
    return prisma.facilitator.findUnique({ where: { id } })
  }

  async findFacilitatorByUserId(userId: string) {
    return prisma.facilitator.findUnique({ where: { userId } })
  }

  async updateFacilitator(id: string, data: any) {
    return prisma.facilitator.update({
      where: { id },
      data,
    })
  }

  async findFacilitatorByEmail(email: string) {
    return prisma.facilitator.findUnique({ where: { email } })
  }

  async createFacilitator(data: any) {
    return prisma.facilitator.create({ data })
  }

  async updateUserProfile(userId: string, data: any) {
    return prisma.userProfile.update({
      where: { userId },
      data,
    })
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
