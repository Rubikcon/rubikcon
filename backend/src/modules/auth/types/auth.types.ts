export interface SanitizeUserResult {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
  onboardingCompleted: boolean
}
