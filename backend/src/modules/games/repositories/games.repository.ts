import prisma from '../../../infrastructure/prisma/client'

export class GamesRepository {
  async create(data: { userId: string | null; expiresAt: Date }) {
    return prisma.session.create({
      data,
    })
  }

  async findById(id: string) {
    return prisma.session.findUnique({
      where: { id },
      include: {
        scores: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  }

  async createScore(data: { sessionId: string; gameId: string; score: number; userId: string | null }) {
    return prisma.score.create({
      data,
    })
  }

  async getLeaderboardByGame(gameId: string, limit: number) {
    return prisma.score.findMany({
      where: { gameId },
      orderBy: { score: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })
  }

  async getGlobalLeaderboard(limit: number) {
    return prisma.score.findMany({
      orderBy: { score: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, name: true } },
      },
    })
  }
}

export const gamesRepository = new GamesRepository()
