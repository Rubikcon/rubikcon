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

export async function login(email: string, password: string) {
  const result = await apiRequest<{ user: StoredAuth['user']; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
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
