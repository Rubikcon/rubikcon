import { registry } from '../../infrastructure/swagger/swagger'
import { CreateGigSchema, ApplySchema } from './schemas/gigs.schemas'
import { z } from 'zod'

registry.registerPath({
  method: 'get',
  path: '/gigs',
  tags: ['Gigs'],
  summary: 'Retrieve a paginated list of open gigs',
  description: 'Retrieves a list of open gigs with optional filters and pagination.',
  request: {
    query: z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
      category: z.string().optional(),
      difficulty: z.string().optional(),
      currency: z.string().optional(),
      search: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: 'Paginated list of gigs',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: z.array(z.record(z.unknown())),
            pagination: z.object({
              total: z.number(),
              page: z.number(),
              limit: z.number(),
              totalPages: z.number(),
            }),
          }),
        },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/gigs/{id}',
  tags: ['Gigs'],
  summary: 'Retrieve details for a specific gig',
  description: 'Gets full details of a gig by its unique ID.',
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Gig details retrieved',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: z.record(z.unknown()),
          }),
        },
      },
    },
    404: { description: 'Gig not found' },
  },
})

registry.registerPath({
  method: 'post',
  path: '/gigs',
  tags: ['Gigs'],
  summary: 'Create a new gig',
  description: 'Posts a new gig opportunity.',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateGigSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Gig posted successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: z.record(z.unknown()),
            message: z.string(),
          }),
        },
      },
    },
    400: { description: 'Validation Error' },
    401: { description: 'Unauthorized' },
  },
})

registry.registerPath({
  method: 'post',
  path: '/gigs/apply',
  tags: ['Gigs'],
  summary: 'Apply to a specific gig',
  description: 'Submits a proposal/application to an open gig.',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: ApplySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Application submitted successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: z.record(z.unknown()),
            message: z.string(),
          }),
        },
      },
    },
    400: { description: 'Bad Request / Gig no longer accepting applications' },
    401: { description: 'Unauthorized' },
    404: { description: 'Gig not found' },
    409: { description: 'Already applied to this gig' },
  },
})

registry.registerPath({
  method: 'get',
  path: '/gigs/{id}/applications',
  tags: ['Gigs'],
  summary: 'Retrieve applications for a gig (poster only)',
  description: 'Allows the poster of a gig to view all submitted applications.',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Applications list retrieved',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: z.array(z.record(z.unknown())),
          }),
        },
      },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden - Only the gig poster can view applications' },
    404: { description: 'Gig not found' },
  },
})
