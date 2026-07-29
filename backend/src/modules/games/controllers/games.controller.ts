import { Request, Response, NextFunction } from 'express'
import { sendSuccess } from '../../../shared/api/response'
import { gamesService } from '../services/games.service'
import { SubmitGameScoreSchema } from '../schemas/games.schemas'
import { AppError } from '../../../shared/errors/AppError'

export class GamesController {
  async startSession(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await gamesService.startSession(req.user?.userId ?? null)
      return sendSuccess(res, result, 'Session started.', 201)
    } catch (err) {
      next(err)
    }
  }

  async getSession(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await gamesService.getSession(req.params.id)
      return sendSuccess(res, session)
    } catch (err) {
      next(err)
    }
  }

  async submitScore(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = SubmitGameScoreSchema.safeParse(req.body)
      if (!parsed.success) {
        throw new AppError('Validation failed', 400, parsed.error.flatten().fieldErrors)
      }

      const newScore = await gamesService.submitScore({
        sessionId: parsed.data.sessionId,
        gameId: parsed.data.gameId,
        score: parsed.data.score,
        userId: req.user?.userId ?? null,
      })

      return sendSuccess(res, newScore, 'Score saved.', 201)
    } catch (err) {
      next(err)
    }
  }

  async getGameLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const scores = await gamesService.getLeaderboard(req.params.gameId)
      return sendSuccess(res, scores)
    } catch (err) {
      next(err)
    }
  }

  async getGlobalLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const scores = await gamesService.getLeaderboard()
      return sendSuccess(res, scores)
    } catch (err) {
      next(err)
    }
  }
}

export const gamesController = new GamesController()
