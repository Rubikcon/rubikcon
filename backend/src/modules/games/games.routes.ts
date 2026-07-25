import './games.swagger';
import './games.swagger'
import { Router } from 'express'
import { optionalAuth } from '../../middleware/auth.middleware'
import { gamesController } from './controllers/games.controller'

const router = Router()

// Start a new game session
router.post('/session/start', optionalAuth, gamesController.startSession)

// Retrieve an existing session
router.get('/session/:id', gamesController.getSession)

// Submit a game score
router.post('/score', optionalAuth, gamesController.submitScore)

// Get leaderboard for a specific game
router.get('/leaderboard/:gameId', gamesController.getGameLeaderboard)

// Get global leaderboard across all games
router.get('/leaderboard', gamesController.getGlobalLeaderboard)

export default router
