import { z } from 'zod'

import { registry } from '../../infrastructure/swagger/swagger'


registry.registerPath({
  method: 'get',
  path: '/platform/admin/stats',
  tags: ['Platform'],
  summary: 'Get platform admin statistics',
  description: 'Retrieves aggregated statistics across courses, learners, facilitators, lessons, assignments, quizzes, testimonials, and enrollments.',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Platform statistics retrieved successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: z.object({
              totalCourses: z.number(),
              totalLearners: z.number(),
              totalFacilitators: z.number(),
              totalLessons: z.number(),
              totalAssignments: z.number(),
              totalQuizzes: z.number(),
              totalTestimonials: z.number(),
              totalEnrollments: z.number(),
            }),
          }),
        },
      },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden - Admin access required' },
  },
})
