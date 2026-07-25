import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CourseCatalogService } from '../services/course-catalog.service'
import { courseCatalogRepository } from '../repositories/course-catalog.repository'

// Mock the repository to isolate business logic
vi.mock('../repositories/course-catalog.repository')

describe('CourseCatalogService', () => {
  let service: CourseCatalogService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new CourseCatalogService()
  })

  it('getCourseDetails should throw NotFoundError if course does not exist', async () => {
    vi.mocked(courseCatalogRepository.findBySlug).mockResolvedValue(null)

    await expect(service.getCourseDetails('non-existent-slug')).rejects.toThrow('Course not found')
  })

  it('getCourseDetails should return course data when found', async () => {
    const mockCourse = { id: 'course-1', slug: 'test-course', title: 'Test Course', published: true, weeks: [], enrollments: [], courseFacilitators: [] }
    vi.mocked(courseCatalogRepository.findBySlug).mockResolvedValue(mockCourse as any)

    const result = await service.getCourseDetails('test-course')
    expect(result.title).toBe('Test Course')
    expect(courseCatalogRepository.findBySlug).toHaveBeenCalledWith('test-course', undefined)
  })
})
