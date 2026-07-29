import { registry } from '../../infrastructure/swagger/swagger';
import { z } from 'zod';
import { CreateFacilitatorSchema, UpdateFacilitatorSchema, UpdateRoleSchema } from './schemas/user-management.schemas';

registry.registerPath({
  method: 'get',
  path: '/users/learners',
  tags: ['user-management'],
  summary: 'Get learners',
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
  path: '/users/learners/:id',
  tags: ['user-management'],
  summary: 'Get learner by ID',
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
  path: '/users/facilitators',
  tags: ['user-management'],
  summary: 'Get facilitators',
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
  path: '/users/facilitators',
  tags: ['user-management'],
  summary: 'Create facilitator',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateFacilitatorSchema,
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
  path: '/users/facilitators/:id',
  tags: ['user-management'],
  summary: 'Update facilitator',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: UpdateFacilitatorSchema,
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
  path: '/users/facilitators/:id',
  tags: ['user-management'],
  summary: 'Delete facilitator',
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
  path: '/users/facilitators/me',
  tags: ['user-management'],
  summary: 'Get current facilitator',
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
  method: 'patch',
  path: '/users/facilitators/me',
  tags: ['user-management'],
  summary: 'Update current facilitator',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: UpdateFacilitatorSchema,
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
  method: 'get',
  path: '/users/admins',
  tags: ['user-management'],
  summary: 'Get admins',
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
  path: '/users/all',
  tags: ['user-management'],
  summary: 'Get all users',
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
  path: '/users/:userId',
  tags: ['user-management'],
  summary: 'Get user by ID',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      userId: z.string(),
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
  method: 'patch',
  path: '/users/:userId/role',
  tags: ['user-management'],
  summary: 'Update user role',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      userId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: UpdateRoleSchema,
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
  path: '/users/:userId',
  tags: ['user-management'],
  summary: 'Delete user',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      userId: z.string(),
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

