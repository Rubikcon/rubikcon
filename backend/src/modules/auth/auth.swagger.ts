import { z } from 'zod'

import { registry } from '../../infrastructure/swagger/swagger'
import {
  ChangePasswordSchema,
  ConfirmResetPasswordSchema,
  ForgotPasswordSchema,
  LoginUserSchema,
  OnboardUserSchema,
  SignupUserSchema,
} from './schemas/auth.schemas'

registry.registerPath({
  method: 'post',
  path: '/auth/signup',
  tags: ['auth'],
  summary: 'Register a new user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: SignupUserSchema,
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
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: ['auth'],
  summary: 'Authenticate a user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: LoginUserSchema,
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
  },
});

registry.registerPath({
  method: 'get',
  path: '/auth/me',
  tags: ['auth'],
  summary: 'Get current user',
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
  path: '/auth/onboarding',
  tags: ['auth'],
  summary: 'Complete onboarding',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: OnboardUserSchema,
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
  path: '/auth/forgot-password',
  tags: ['auth'],
  summary: 'Request password reset',
  request: {
    body: {
      content: {
        'application/json': {
          schema: ForgotPasswordSchema,
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
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/superadmin/users/:userId/reset-password',
  tags: ['auth'],
  summary: 'Superadmin reset password',
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
  method: 'post',
  path: '/auth/confirm-reset-password',
  tags: ['auth'],
  summary: 'Confirm password reset',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: ConfirmResetPasswordSchema,
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
  path: '/auth/change-password',
  tags: ['auth'],
  summary: 'Change password',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: ChangePasswordSchema,
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
  path: '/auth/logout',
  tags: ['auth'],
  summary: 'Logout',
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
  path: '/auth/logout-all',
  tags: ['auth'],
  summary: 'Logout all devices',
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

