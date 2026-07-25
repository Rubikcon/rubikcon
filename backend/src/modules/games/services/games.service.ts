import { AppError } from '../../../shared/errors/AppError'
import { gamesRepository } from '../repositories/games.repository'
import { SESSION_TTL_HOURS } from '../constants/games.constants'
import { SubmitScoreParams } from '../types/games.types'

export class GamesService {
  async startSession(userId: string | null = null) {
    const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000)
    const session = await gamesRepository.create({ userId, expiresAt })
    return { sessionId: session.id, expiresAt }
  }

  async getSession(sessionId: string) {
    const session = await gamesRepository.findById(sessionId)
    if (!session) {
      throw new AppError('Session not found.', 404)
    }
    if (session.expiresAt < new Date()) {
      throw new AppError('Session has expired.', 410)
    }
    return session
  }

  async submitScore(params: SubmitScoreParams) {
    const session = await gamesRepository.findById(params.sessionId)
    if (!session) {
      throw new AppError('Session not found.', 404)
    }
    if (session.expiresAt < new Date()) {
      throw new AppError('Session has expired.', 410)
    }

    const newScore = await gamesRepository.createScore({
      sessionId: params.sessionId,
      gameId: params.gameId,
      score: params.score,
      userId: params.userId ?? null,
    })
    return newScore
  }

  async getLeaderboard(gameId?: string) {
    if (gameId) {
      return gamesRepository.getLeaderboardByGame(gameId, 20)
    }
    return gamesRepository.getGlobalLeaderboard(50)
  }
}

export const gamesService = new GamesService()
