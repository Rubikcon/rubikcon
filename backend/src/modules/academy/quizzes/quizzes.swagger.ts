import { registry } from '../../../infrastructure/swagger/swagger';
import { z } from 'zod';
import { QuizSubmissionSchema, QuizSettingsSchema, QuizQuestionInputSchema } from './schemas/quizzes.schemas';

registry.registerPath({
  method: 'post',
  path: '/academy/quizzes/:quizId/attempt',
  tags: ['academy/quizzes'],
  summary: 'Start quiz attempt',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      quizId: z.string(),
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
  path: '/academy/quizzes/:quizId/attempt',
  tags: ['academy/quizzes'],
  summary: 'Get latest attempt',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      quizId: z.string(),
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
  path: '/academy/quizzes/:quizId/unlock-retake',
  tags: ['academy/quizzes'],
  summary: 'Unlock retake',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      quizId: z.string(),
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
  path: '/academy/weeks/:weekSlug/quiz',
  tags: ['academy/quizzes'],
  summary: 'Create quiz',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      weekSlug: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: QuizSubmissionSchema,
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
  method: 'patch',
  path: '/academy/quizzes/:quizId/settings',
  tags: ['academy/quizzes'],
  summary: 'Update quiz settings',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      quizId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: QuizSettingsSchema,
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
  path: '/academy/quizzes/:quizId/questions',
  tags: ['academy/quizzes'],
  summary: 'Create question',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      quizId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: QuizQuestionInputSchema,
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
  method: 'patch',
  path: '/academy/quizzes/questions/:questionId',
  tags: ['academy/quizzes'],
  summary: 'Update question',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      questionId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: QuizQuestionInputSchema,
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
  path: '/academy/quizzes/questions/:questionId',
  tags: ['academy/quizzes'],
  summary: 'Delete question',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      questionId: z.string(),
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

