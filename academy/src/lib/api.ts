import { URLS } from '../config/urls'
import { clearStoredAuth, getAuthToken, setStoredAuth, type StoredAuth } from './auth'

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

/**
 * Turn a backend validation-error payload into a single readable sentence.
 *
 * Backend zod errors come back in the shape:
 *   { errors: { url: ["Invalid url"], slideCount: ["..."] } }
 *
 * Without this helper, users only saw the top-level "Validation failed" with
 * no clue which field was bad. Surfacing the field name + reason gives them
 * something to act on.
 */
function formatFieldErrors(message: string, errors: unknown): string {
  if (!errors || typeof errors !== 'object') return message
  // Common case: { fieldName: ["reason"], ... }
  if (!Array.isArray(errors)) {
    const entries = Object.entries(errors as Record<string, unknown>)
      .map(([field, val]) => {
        const reasons = Array.isArray(val) ? val.filter(v => typeof v === 'string') : [String(val)]
        return reasons.length ? `${field}: ${reasons.join(', ')}` : null
      })
      .filter(Boolean)
    if (entries.length > 0) return `${message} — ${entries.join('; ')}`
  }
  return message
}

/**
 * Friendly fallback for a couple of common low-level failure modes that would
 * otherwise reach the user as "Failed to fetch" or "TypeError" — useless
 * without context. We map them to something actionable.
 */
function networkFriendlyMessage(err: unknown): string {
  if (err instanceof TypeError) {
    return 'Can\'t reach the server. Check your internet connection — if it looks fine, the backend might be restarting (try again in a minute).'
  }
  return err instanceof Error ? err.message : 'Unexpected error.'
}

/**
 * A 401 on a request that carried a token means the session is dead (expired,
 * revoked by logout-elsewhere, or wiped server-side). Retrying can never
 * succeed — the only fix is a fresh login. Clear the stale credentials and
 * send the user to the login page with a return path, so buttons like "Enrol"
 * stop failing silently forever.
 */
function handleSessionExpired(): never {
  clearStoredAuth()
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    const redirect = encodeURIComponent(window.location.pathname + window.location.search)
    window.location.href = `/login?redirect=${redirect}&reason=session-expired`
  }
  throw new ApiError('Your session has expired. Please log in again.', 401)
}

const RETRYABLE_STATUS = new Set([502, 503, 504])
const RETRY_DELAYS_MS = [2000, 5000]

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method || 'GET').toUpperCase()
  // Only GETs are retried — they're idempotent, and the hosted backend cold-starts
  // after idle periods, which used to surface as "courses sometimes don't load".
  const maxAttempts = method === 'GET' ? RETRY_DELAYS_MS.length + 1 : 1

  let lastError: ApiError = new ApiError('Request failed.', 0)
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAYS_MS[attempt - 1])
    try {
      return await apiRequestOnce<T>(path, init)
    } catch (err) {
      if (!(err instanceof ApiError)) throw err
      const retryable = err.status === 0 || RETRYABLE_STATUS.has(err.status)
      if (!retryable || attempt === maxAttempts - 1) throw err
      lastError = err
    }
  }
  throw lastError
}

async function apiRequestOnce<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers || {})
  headers.set('Content-Type', 'application/json')

  const token = getAuthToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(`${URLS.api}${path}`, { ...init, headers })
  } catch (err) {
    // fetch() throws only on network failure (DNS, offline, CORS preflight reject).
    // Translate to a friendly message rather than letting the bare error reach the UI.
    throw new ApiError(networkFriendlyMessage(err), 0)
  }

  // Auth endpoints return 401 for wrong credentials — that must reach the login
  // form as-is, not be treated as an expired session.
  if (response.status === 401 && token && !path.startsWith('/auth/')) {
    handleSessionExpired()
  }

  let payload: ApiEnvelope<T>
  try {
    payload = (await response.json()) as ApiEnvelope<T>
  } catch {
    // Non-JSON response (e.g. 502 HTML page from a proxy when the backend is down).
    throw new ApiError(
      response.status >= 500
        ? `Server error (${response.status}). The backend might be restarting — try again in a minute.`
        : `Request failed (${response.status}).`,
      response.status,
    )
  }

  if (!response.ok || !payload.success) {
    const baseMessage = payload.message || 'Request failed.'
    const friendly = formatFieldErrors(baseMessage, payload.errors)
    throw new ApiError(friendly, response.status, payload.errors)
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
