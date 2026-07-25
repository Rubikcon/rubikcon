export interface SubmitScoreParams {
  sessionId: string
  gameId: string
  score: number
  userId?: string | null
}
