import { URLS } from '../config/urls'
import { getAuthToken, setStoredAuth, type StoredAuth } from './auth'

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
  errors?: unknown
}

export class ApiError extends Error {
  status: number
  errors?: unknown

  constructor(message: string, status: number, errors?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers || {})
  headers.set('Content-Type', 'application/json')

  const token = getAuthToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${URLS.api}${path}`, {
    ...init,
    headers,
  })

  const payload = (await response.json()) as ApiEnvelope<T>
  if (!response.ok || !payload.success) {
    throw new ApiError(payload.message || 'Request failed.', response.status, payload.errors)
  }

  return payload.data
}

type LoginOptions = {
  /** When true and the user is at the device limit, expire other sessions before issuing this login. */
  forceLogoutOthers?: boolean
}

export type LoginResult = {
  user: StoredAuth['user']
  token: string
  /** Present when the user logged in with a blank password during an active password reset window. */
  resetToken?: string
}

export async function login(email: string, password: string, options: LoginOptions = {}): Promise<LoginResult> {
  const result = await apiRequest<LoginResult>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, forceLogoutOthers: options.forceLogoutOthers }),
  })

  setStoredAuth({
    token: result.token,
    user: result.user,
  })

  return result
}

export async function signup(name: string, email: string, password: string) {
  const result = await apiRequest<{ user: StoredAuth['user']; token: string }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })

  setStoredAuth({
    token: result.token,
    user: result.user,
  })

  return result
}
