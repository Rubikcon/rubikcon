import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { CourseCatalogController } from '../controllers/course-catalog.controller'
import { courseCatalogService } from '../services/course-catalog.service'

// Mock the service to isolate HTTP contract logic
vi.mock('../services/course-catalog.service')

describe('CourseCatalogController', () => {
  let controller: CourseCatalogController
  let req: Partial<Request>
  let res: Partial<Response>
  let next: NextFunction

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new CourseCatalogController()
    req = { params: { slug: 'test-course' } }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    }
    next = vi.fn()
  })

  it('getCourseDetails should call service and return 200 on success', async () => {
    const mockResult = { course: { id: '1', title: 'Test' } }
    vi.mocked(courseCatalogService.getCourseDetails).mockResolvedValue(mockResult as any)

    await controller.getCourseDetails(req as Request, res as Response, next)

    expect(courseCatalogService.getCourseDetails).toHaveBeenCalledWith('test-course', undefined)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: mockResult
    }))
  })

  it('getCourseDetails should call next(error) on failure', async () => {
    const error = new Error('Service Error')
    vi.mocked(courseCatalogService.getCourseDetails).mockRejectedValue(error)

    await controller.getCourseDetails(req as Request, res as Response, next)

    expect(next).toHaveBeenCalledWith(error)
  })
})
