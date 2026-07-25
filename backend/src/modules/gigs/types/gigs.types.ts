export interface CreateGigParams {
  title: string
  description: string
  budget: number
  budgetType: 'FIXED' | 'HOURLY'
  currency: 'ETH' | 'USDC' | 'MATIC'
  category: string
  skills: string[]
  difficulty: 'ENTRY' | 'MID' | 'SENIOR'
  deadline: string
  remote: boolean
  posterId: string
}

export interface ApplyGigParams {
  gigId: string
  userId: string
  proposal: string
  rate?: number
}

export interface ListGigsFilters {
  page: number
  limit: number
  category?: string
  difficulty?: string
  currency?: string
  search?: string
}
