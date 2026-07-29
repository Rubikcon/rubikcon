# Authentication

## Overview

The authentication system is based on stateless JWT (JSON Web Tokens). It supports standard email/password authentication as well as passwordless flows (onboarding via magic links/codes).

## Roles

The system primarily supports:

- `LEARNER`: Standard end user.
- `FACILITATOR`: Content creator/teacher.
- `SUPER_ADMIN`: Administrative override access.

## Flow

1. User registers or logs in via `/auth/register` or `/auth/login`.
2. A JWT token is issued in the response.
3. The client includes the token in the `Authorization: Bearer <token>` header for protected routes.
4. The `requireAuth` middleware validates the token and attaches the user payload to `req.user`.

## Middleware

- `requireAuth`: Enforces that a valid user is present.
- `optionalAuth`: Extracts the user if present, but does not block the request if absent.
- `requireRole(roles)`: Enforces specific RBAC roles.
