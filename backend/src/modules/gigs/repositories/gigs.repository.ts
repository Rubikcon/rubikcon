import prisma from '../../../infrastructure/prisma/client'

export class GigsRepository {
  async findMany(where: any, skip: number, take: number) {
    const [gigs, total] = await Promise.all([
      prisma.gig.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
        include: {
          poster: { select: { id: true, name: true, email: true } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.gig.count({ where }),
    ])
    return { gigs, total }
  }

  async findById(id: string) {
    return prisma.gig.findUnique({
      where: { id },
      include: {
        poster: { select: { id: true, name: true, email: true, createdAt: true } },
        _count: { select: { applications: true } },
      },
    })
  }

  async create(data: any) {
    return prisma.gig.create({
      data,
      include: {
        poster: { select: { id: true, name: true, email: true } },
      },
    })
  }

  async findApplication(gigId: string, userId: string) {
    return prisma.application.findUnique({
      where: { gigId_userId: { gigId, userId } },
    })
  }

  async createApplication(data: { gigId: string; userId: string; proposal: string; rate: number | null }) {
    return prisma.application.create({
      data,
      include: {
        gig: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    })
  }

  async findApplicationsByGigId(gigId: string) {
    return prisma.application.findMany({
      where: { gigId },
      include: {
        user: { select: { id: true, name: true, email: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}

export const gigsRepository = new GigsRepository()
