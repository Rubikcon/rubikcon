import { AppError } from '../../../shared/errors/AppError'
import { gigsRepository } from '../repositories/gigs.repository'
import { CreateGigParams, ApplyGigParams, ListGigsFilters } from '../types/gigs.types'

export class GigsService {
  async listGigs(filters: ListGigsFilters) {
    const skip = (filters.page - 1) * filters.limit
    
    const where: Record<string, unknown> = { status: 'OPEN' }
    if (filters.category) where.category = filters.category
    if (filters.difficulty) where.difficulty = filters.difficulty
    if (filters.currency) where.currency = filters.currency
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    return gigsRepository.findMany(where, skip, filters.limit)
  }

  async getGigById(id: string) {
    const gig = await gigsRepository.findById(id)
    if (!gig) {
      throw new AppError('Gig not found.', 404)
    }
    return gig
  }

  async createGig(params: CreateGigParams) {
    return gigsRepository.create({
      title: params.title,
      description: params.description,
      budget: params.budget,
      budgetType: params.budgetType,
      currency: params.currency,
      category: params.category,
      skills: params.skills,
      difficulty: params.difficulty,
      deadline: params.deadline,
      remote: params.remote,
      posterId: params.posterId
    })
  }

  async applyToGig(params: ApplyGigParams) {
    const gig = await gigsRepository.findById(params.gigId)
    if (!gig) {
      throw new AppError('Gig not found.', 404)
    }
    
    if ((gig as any).status !== 'OPEN') {
      throw new AppError('This gig is no longer accepting applications.', 400)
    }
    
    if (gig.posterId === params.userId) {
      throw new AppError('You cannot apply to your own gig.', 400)
    }

    const existing = await gigsRepository.findApplication(params.gigId, params.userId)
    if (existing) {
      throw new AppError('You have already applied to this gig.', 409)
    }

    return gigsRepository.createApplication({
      gigId: params.gigId,
      userId: params.userId,
      proposal: params.proposal,
      rate: params.rate ?? null,
    })
  }

  async getApplications(gigId: string, userId: string) {
    const gig = await gigsRepository.findById(gigId)
    if (!gig) {
      throw new AppError('Gig not found.', 404)
    }
    if (gig.posterId !== userId) {
      throw new AppError('Only the gig poster can view applications.', 403)
    }

    return gigsRepository.findApplicationsByGigId(gigId)
  }
}

export const gigsService = new GigsService()
