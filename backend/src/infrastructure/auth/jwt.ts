import jwt from 'jsonwebtoken'
import { config } from '../../config/env'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  // The DB Session row this token was issued for. Optional ONLY for legacy
  // tokens issued before the session-binding rollout; newly signed tokens
  // always include it. The auth middleware uses it to:
  //   - reject tokens whose session was logged out / expired
  //   - logout one device without nuking the others
  sessionId?: string
}

export const signToken = (payload: JWTPayload): string => {
  try {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions)
  } catch (err) {
    console.error('[JWT sign failed]', {
      jwtExpiresIn: config.jwtExpiresIn,
      message: err instanceof Error ? err.message : String(err),
    })

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: '30d',
    } as jwt.SignOptions)
  }
}

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.jwtSecret) as JWTPayload
}
