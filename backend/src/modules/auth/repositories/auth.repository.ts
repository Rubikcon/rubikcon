import prisma from '../../../infrastructure/prisma/client'

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    })
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    })
  }

  async create(data: any) {
    return prisma.user.create({
      data,
    })
  }

  async createProfile(userId: string) {
    return prisma.userProfile.create({
      data: { userId },
    })
  }

  async createSession(data: { userId: string; expiresAt: Date }) {
    return prisma.session.create({
      data,
      select: { id: true },
    })
  }

  async findActiveSessions(userId: string) {
    return prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'asc' },
    })
  }

  async expireAllSessions(userId: string) {
    return prisma.session.updateMany({
      where: { userId, expiresAt: { gt: new Date() } },
      data: { expiresAt: new Date() },
    })
  }

  async expireOtherSessions(userId: string, keepSessionId: string) {
    return prisma.session.updateMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
        NOT: { id: keepSessionId },
      },
      data: { expiresAt: new Date() },
    })
  }

  async expireSessionById(sessionId: string) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { expiresAt: new Date() },
    })
  }

  async findLatestActiveSession(userId: string) {
    return prisma.session.findFirst({
      where: { userId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    })
  }

  async findSessionById(sessionId: string) {
    return prisma.session.findUnique({
      where: { id: sessionId },
      select: { id: true, userId: true, expiresAt: true },
    })
  }

  async extendSession(sessionId: string, newExpiry: Date) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { expiresAt: newExpiry },
    })
  }

  async update(userId: string, data: any) {
    return prisma.user.update({
      where: { id: userId },
      data,
    })
  }

  async upsertProfile(userId: string, profileData: any) {
    return prisma.userProfile.upsert({
      where: { userId },
      create: { userId, ...profileData },
      update: profileData,
    })
  }
}

export const authRepository = new AuthRepository()
