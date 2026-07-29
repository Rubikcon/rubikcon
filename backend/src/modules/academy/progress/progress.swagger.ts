import { registry } from '../../../infrastructure/swagger/swagger';
import { z } from 'zod';
import { SubmitLegacyProgressSchema, SubmitRatingSchema, SaveGlossaryTermSchema } from './schemas/progress.schemas';

registry.registerPath({
  method: 'get',
  path: '/academy/dashboard',
  tags: ['academy/progress'],
  summary: 'Get dashboard',
  security: [{ bearerAuth: [] }],
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
  path: '/academy/admin/stats',
  tags: ['academy/progress'],
  summary: 'Get admin stats',
  security: [{ bearerAuth: [] }],
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
  path: '/academy/legacy/progress',
  tags: ['academy/progress'],
  summary: 'Get legacy progress',
  security: [{ bearerAuth: [] }],
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
  method: 'post',
  path: '/academy/legacy/progress',
  tags: ['academy/progress'],
  summary: 'Sync legacy progress',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: SubmitLegacyProgressSchema,
        },
      },
    },
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
  method: 'post',
  path: '/academy/weeks/:weekSlug/progress',
  tags: ['academy/progress'],
  summary: 'Sync week progress',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      weekSlug: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.any(),
        },
      },
    },
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
  method: 'post',
  path: '/academy/weeks/:weekSlug/rating',
  tags: ['academy/progress'],
  summary: 'Rate week',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      weekSlug: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: SubmitRatingSchema,
        },
      },
    },
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
  method: 'post',
  path: '/academy/glossary/save',
  tags: ['academy/progress'],
  summary: 'Save glossary term',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: SaveGlossaryTermSchema,
        },
      },
    },
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
  method: 'delete',
  path: '/academy/glossary/:termId/save',
  tags: ['academy/progress'],
  summary: 'Unsave glossary term',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      termId: z.string(),
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
  method: 'post',
  path: '/academy/resources/:resourceId/mark-read',
  tags: ['academy/progress'],
  summary: 'Mark resource as read',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      resourceId: z.string(),
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
  method: 'delete',
  path: '/academy/resources/:resourceId/mark-read',
  tags: ['academy/progress'],
  summary: 'Unmark resource',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      resourceId: z.string(),
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

