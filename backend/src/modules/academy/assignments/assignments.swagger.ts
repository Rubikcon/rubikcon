import { registry } from '../../../infrastructure/swagger/swagger';
import { z } from 'zod';
import { AssignmentSubmissionSchema, FeedbackSchema, CreateAssignmentSchema } from './schemas/assignments.schemas';

registry.registerPath({
  method: 'get',
  path: '/academy/assignments/:id',
  tags: ['academy/assignments'],
  summary: 'Get assignment by ID',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
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
  path: '/academy/courses/:courseId/assignments',
  tags: ['academy/assignments'],
  summary: 'Get course assignments',
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
  path: '/academy/assignments/submissions/:submissionId',
  tags: ['academy/assignments'],
  summary: 'Get submission',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      submissionId: z.string(),
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
  path: '/academy/assignments/:id/submit',
  tags: ['academy/assignments'],
  summary: 'Submit assignment',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: AssignmentSubmissionSchema,
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
  path: '/academy/assignments/submissions/:submissionId/feedback',
  tags: ['academy/assignments'],
  summary: 'Provide feedback',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      submissionId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: FeedbackSchema,
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
  path: '/academy/assignments/feedback/:feedbackId',
  tags: ['academy/assignments'],
  summary: 'Delete feedback',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      feedbackId: z.string(),
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
  path: '/academy/weeks/:weekSlug/assignment',
  tags: ['academy/assignments'],
  summary: 'Create assignment',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      weekSlug: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: CreateAssignmentSchema,
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
  path: '/academy/assignments/:id',
  tags: ['academy/assignments'],
  summary: 'Delete assignment',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
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

