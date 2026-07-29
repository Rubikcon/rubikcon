import { z } from 'zod'
import { registry } from '../../../infrastructure/swagger/swagger'

registry.registerPath({
  method: 'post',
  path: '/academy/courses/:courseId/enroll',
  tags: ['academy/enrollment'],
  summary: 'Enroll in course',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      courseId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: z.any(),
        },
      },
    },
    400: { description: 'Bad Request' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/academy/courses/:courseId/enrollment',
  tags: ['academy/enrollment'],
  summary: 'Get course enrollment',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      courseId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: z.any(),
        },
      },
    },
    400: { description: 'Bad Request' },
    401: { description: 'Unauthorized' },
  },
});

