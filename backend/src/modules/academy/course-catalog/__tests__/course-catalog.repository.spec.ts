import { describe, it, expect, vi, beforeEach } from 'vitest'
import { courseCatalogRepository } from '../repositories/course-catalog.repository'
import prisma from '../../../../infrastructure/prisma/client'

// Mock Prisma Client to prevent actual DB writes during unit tests
// Note: In real repository tests, a test DB or setup/teardown is preferred,
// but for canonical unit isolation, mocking the ORM is acceptable.
vi.mock('../../../../infrastructure/prisma/client', () => ({
  default: {
    course: {
      findUnique: vi.fn()
    }
  }
}))

describe('CourseCatalogRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('findCourseBySlug should query the database correctly', async () => {
    const mockDbResponse = { id: 'course-1', slug: 'test', title: 'Test Course' }
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mockDbResponse as any)

    const result = await courseCatalogRepository.findBySlug('test')

    expect(prisma.course.findUnique).toHaveBeenCalledWith({
      where: { slug: 'test' },
      include: expect.any(Object)
    })
    expect(result).toEqual(mockDbResponse)
  })
})
