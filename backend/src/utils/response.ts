/**
 * @deprecated This file is a temporary compatibility layer.
 * Import API response helpers from 'shared/api/response' and JWT functions from 'infrastructure/auth/jwt'.
 */
export { sendSuccess, sendError, sendPaginated } from '../shared/api/response'
export { signToken, verifyToken, type JWTPayload } from '../infrastructure/auth/jwt'
