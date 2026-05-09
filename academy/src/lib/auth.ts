export const AUTH_STORAGE_KEY = 'rubikcon_academy_auth'

export type StoredAuth = {
  token: string
  user: {
    id: string
    email: string
    name: string | null
    role: string
    onboardingCompleted: boolean
  }
}

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as StoredAuth
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function setStoredAuth(auth: StoredAuth) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
  window.dispatchEvent(new CustomEvent('rubikcon-auth-change'))
}

export function clearStoredAuth() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('rubikcon-auth-change'))
}

export function getAuthToken() {
  return getStoredAuth()?.token ?? null
}

export function isAdmin() {
  const role = getStoredAuth()?.user.role
  return role === 'ADMIN' || role === 'SUPER_ADMIN'
}

export function isSuperAdmin() {
  return getStoredAuth()?.user.role === 'SUPER_ADMIN'
}

export function needsOnboarding() {
  const auth = getStoredAuth()
  return auth !== null && auth.user.onboardingCompleted === false
}
