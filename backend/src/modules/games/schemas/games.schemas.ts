import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const SubmitGameScoreSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  gameId: z.string().min(1, 'Game ID is required'),
  score: z.number().int().nonnegative('Score must be a non-negative integer'),
}).openapi('SubmitGameScoreSchema', {
  description: 'Payload for submitting a game score',
})

export type SubmitGameScoreDto = z.infer<typeof SubmitGameScoreSchema>
