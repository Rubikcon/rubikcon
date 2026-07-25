import { registry } from '../../infrastructure/swagger/swagger'
import { SubmitGameScoreSchema } from './schemas/games.schemas'
import { z } from 'zod'

registry.registerPath({
  method: 'post',
  path: '/games/session/start',
  tags: ['Games'],
  summary: 'Start a new game session',
  description: 'Starts a new game session for an optional authenticated user.',
  responses: {
    201: {
      description: 'Session started successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: z.object({
              sessionId: z.string(),
              expiresAt: z.string(),
            }),
            message: z.string(),
          }),
        },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/games/session/{id}',
  tags: ['Games'],
  summary: 'Retrieve an existing session',
  description: 'Gets details for a game session by session ID.',
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Session details retrieved',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: z.object({
              id: z.string(),
              userId: z.string().nullable(),
              expiresAt: z.string(),
            }),
          }),
        },
      },
    },
    404: { description: 'Session not found' },
    410: { description: 'Session has expired' },
  },
})

registry.registerPath({
  method: 'post',
  path: '/games/score',
  tags: ['Games'],
  summary: 'Submit a game score',
  description: 'Submits a score achieved in a game session.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: SubmitGameScoreSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Score saved successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: z.object({
              id: z.string(),
              gameId: z.string(),
              score: z.number(),
              userId: z.string().nullable(),
            }),
            message: z.string(),
          }),
        },
      },
    },
    400: { description: 'Validation Error' },
    404: { description: 'Session not found' },
    410: { description: 'Session expired' },
  },
})

registry.registerPath({
  method: 'get',
  path: '/games/leaderboard/{gameId}',
  tags: ['Games'],
  summary: 'Get leaderboard for a specific game',
  description: 'Retrieves top scores for a specific game.',
  request: {
    params: z.object({
      gameId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Game leaderboard retrieved',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: z.array(z.record(z.unknown())),
          }),
        },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/games/leaderboard',
  tags: ['Games'],
  summary: 'Get global leaderboard across all games',
  description: 'Retrieves top scores across all games.',
  responses: {
    200: {
      description: 'Global leaderboard retrieved',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: z.array(z.record(z.unknown())),
          }),
        },
      },
    },
  },
})
