import { FormEvent, useMemo, useState } from 'react'
import { useLocation } from 'wouter'
import { Check, X, KeyRound, ShieldAlert, Loader2 } from 'lucide-react'
import AcademyNavbar from '../components/AcademyNavbar'
import { apiRequest, login, signup, ApiError } from '../lib/api'
import type { StoredAuth } from '../lib/auth'
import { setStoredAuth, getStoredAuth } from '../lib/auth'

export default function LoginPage() {
  const [, setLocation] = useLocation()
  const initialMode = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('mode') === 'signup' ? 'signup' : 'login'
  }, [])

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Device limit handling
  const [deviceLimitHit, setDeviceLimitHit] = useState<{ count: number } | null>(null)
  const [signingOutOthers, setSigningOutOthers] = useState(false)

  // Forgot password info dialog
  const [showForgotInfo, setShowForgotInfo] = useState(false)

  // Set new password flow (entered after login with blank password during reset window)
  const [resetContext, setResetContext] = useState<{ resetToken: string; user: StoredAuth['user'] } | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [savingNewPassword, setSavingNewPassword] = useState(false)

  // Validation helpers
  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  const isPasswordValid = (p: string) => p.length >= 8
  const isNameValid = (n: string) => n.length >= 2

  const passwordStrength = useMemo(() => {
    if (!password) return 0
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }, [password])

  // Login allows blank password (so users can sign in with the reset window after
  // an admin has initiated a password reset). Signup still requires full credentials.
  const canSubmit = mode === 'login'
    ? !!email && isValidEmail(email)
    : !!name && isNameValid(name) && !!email && isValidEmail(email) && isPasswordValid(password)

  function redirectAfterAuth(user: StoredAuth['user']) {
    if (user.role === 'SUPER_ADMIN') return setLocation('/admin/superadmin')
    if (user.role === 'ADMIN') return setLocation('/admin/academy')
    if (!user.onboardingCompleted) return setLocation('/onboarding')
    setLocation('/dashboard')
  }

  async function attemptLogin(opts: { forceLogoutOthers?: boolean } = {}) {
    const result = await login(email, password, opts)

    // If the user was given a reset token (logged in with blank password during reset),
    // hold them at the "set new password" form before sending them on.
    if (result.resetToken) {
      setResetContext({ resetToken: result.resetToken, user: result.user })
      return
    }
    redirectAfterAuth(result.user)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setSubmitting(true)
      setError(null)
      setDeviceLimitHit(null)
      if (mode === 'login') {
        await attemptLogin()
      } else {
        const result = await signup(name, email, password)
        redirectAfterAuth(result.user)
      }
    } catch (err) {
      // Detect device-limit error by error code on the API response
      if (err instanceof ApiError && (err.errors as any)?.code === 'DEVICE_LIMIT') {
        setDeviceLimitHit({ count: (err.errors as any).activeSessions ?? 5 })
      }
      setError(err instanceof Error ? err.message : 'Unable to authenticate.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSignOutOthers() {
    try {
      setSigningOutOthers(true)
      setError(null)
      await attemptLogin({ forceLogoutOthers: true })
      setDeviceLimitHit(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign out other devices.')
    } finally {
      setSigningOutOthers(false)
    }
  }

  async function handleSetNewPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!resetContext) return
    if (!isPasswordValid(newPassword)) {
      setError('New password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match')
      return
    }
    try {
      setSavingNewPassword(true)
      setError(null)
      await apiRequest('/auth/confirm-reset-password', {
        method: 'POST',
        body: JSON.stringify({
          resetToken: resetContext.resetToken,
          newPassword,
        }),
      })
      // Keep the existing token but ensure the stored user record is fresh
      const existing = getStoredAuth()
      if (existing) {
        setStoredAuth({ token: existing.token, user: resetContext.user })
      }
      redirectAfterAuth(resetContext.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to set new password.')
    } finally {
      setSavingNewPassword(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AcademyNavbar showBack backHref="/" backLabel="Back to Academy" solid />

      <main className="pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(245,197,24,0.16),_transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 md:p-10">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#F5C518] mb-4">Rubikcon Academy</p>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white leading-[1.05] mb-4">
              Sign in to learn.
            </h1>
            <p className="text-white/60 leading-relaxed max-w-2xl">
              Track your weekly progress, reading completion, quiz results, and assignment submissions — all tied to your learner profile.
            </p>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
            <div className="flex gap-2 mb-6">
              {(['login', 'signup'] as const).map(item => (
                <button
                  key={item}
                  onClick={() => setMode(item)}
                  className={`rounded-full px-4 py-2 text-sm transition-colors ${
                    mode === item ? 'bg-[#F5C518] text-[#0A0A0A]' : 'border border-white/12 text-white/65'
                  }`}
                >
                  {item === 'login' ? 'Log in' : 'Sign up'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'signup' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-white">Full name</label>
                    {name && (
                      isNameValid(name) ? (
                        <Check size={16} className="text-emerald-400" />
                      ) : (
                        <X size={16} className="text-red-400" />
                      )
                    )}
                  </div>
                  <input
                    value={name}
                    onChange={event => setName(event.target.value)}
                    className={`w-full rounded-2xl border bg-black/20 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none transition-colors ${
                      !name ? 'border-white/12 focus:border-[#F5C518]/40'
                      : isNameValid(name) ? 'border-emerald-400/40 focus:border-emerald-400/60'
                      : 'border-red-400/40 focus:border-red-400/60'
                    }`}
                    placeholder="Your full name"
                  />
                  {name && !isNameValid(name) && (
                    <p className="text-xs text-red-400 mt-1">Name must be at least 2 characters</p>
                  )}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-white">Email</label>
                  {email && (
                    isValidEmail(email) ? (
                      <Check size={16} className="text-emerald-400" />
                    ) : (
                      <X size={16} className="text-red-400" />
                    )
                  )}
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  className={`w-full rounded-2xl border bg-black/20 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none transition-colors ${
                    !email ? 'border-white/12 focus:border-[#F5C518]/40'
                    : isValidEmail(email) ? 'border-emerald-400/40 focus:border-emerald-400/60'
                    : 'border-red-400/40 focus:border-red-400/60'
                  }`}
                  placeholder="you@example.com"
                />
                {email && !isValidEmail(email) && (
                  <p className="text-xs text-red-400 mt-1">Please enter a valid email address</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-white">Password</label>
                  {mode === 'signup' && password && (
                    isPasswordValid(password) ? (
                      <Check size={16} className="text-emerald-400" />
                    ) : (
                      <X size={16} className="text-red-400" />
                    )
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  className={`w-full rounded-2xl border bg-black/20 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none transition-colors ${
                    !password ? 'border-white/12 focus:border-[#F5C518]/40'
                    : (mode === 'login' || isPasswordValid(password)) ? 'border-emerald-400/40 focus:border-emerald-400/60'
                    : 'border-red-400/40 focus:border-red-400/60'
                  }`}
                  placeholder="••••••••"
                />
                {mode === 'signup' && password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full ${
                            i < passwordStrength ? 'bg-[#F5C518]' : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    {!isPasswordValid(password) && (
                      <p className="text-xs text-red-400">Password must be at least 8 characters</p>
                    )}
                    {isPasswordValid(password) && (
                      <p className="text-xs text-emerald-400">Password meets requirements</p>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                  {deviceLimitHit && (
                    <button
                      type="button"
                      onClick={handleSignOutOthers}
                      disabled={signingOutOthers}
                      className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full border border-red-300/40 bg-red-500/20 px-4 py-2 text-xs font-semibold text-red-100 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                      {signingOutOthers ? <Loader2 size={12} className="animate-spin" /> : <ShieldAlert size={12} />}
                      Sign out other devices and log in here
                    </button>
                  )}
                </div>
              )}

              {mode === 'signup' && !canSubmit && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
                  <p className="font-medium mb-1">Complete all requirements to continue:</p>
                  <ul className="space-y-0.5 ml-1">
                    {!isNameValid(name) && <li>• Name: at least 2 characters</li>}
                    {!isValidEmail(email) && <li>• Email: valid email address</li>}
                    {!isPasswordValid(password) && <li>• Password: at least 8 characters</li>}
                  </ul>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !canSubmit}
                className={`w-full rounded-full px-6 py-3 text-sm font-semibold transition-colors ${
                  canSubmit
                    ? 'bg-[#F5C518] text-[#0A0A0A] hover:bg-[#E8B800]'
                    : 'bg-white/10 text-white/50 cursor-not-allowed'
                }`}
              >
                {submitting ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
              </button>

              {mode === 'login' && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotInfo(true)}
                    className="text-xs text-white/50 hover:text-[#F5C518] transition-colors inline-flex items-center gap-1"
                  >
                    <KeyRound size={11} />
                    Forgot password?
                  </button>
                </div>
              )}
            </form>
          </section>
        </div>
      </main>

      {/* ─── Forgot password info dialog ───────────────────────────────── */}
      {showForgotInfo && (
        <div
          onClick={() => setShowForgotInfo(false)}
          className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md rounded-[24px] border border-white/10 bg-[#0F0F11] p-6 space-y-4"
          >
            <div className="flex items-center gap-2 text-[#F5C518]">
              <KeyRound size={18} />
              <h3 className="text-lg font-semibold text-white">Forgot your password?</h3>
            </div>
            <div className="text-sm text-white/70 space-y-3 leading-relaxed">
              <p>
                Email a super admin at{' '}
                <a href="mailto:support@rubikconnexus.com" className="text-[#F5C518] hover:text-[#E8B800] underline">
                  support@rubikconnexus.com
                </a>{' '}
                from the email address tied to your account.
              </p>
              <ol className="list-decimal ml-5 space-y-1.5 text-white/65">
                <li>A super admin will initiate a password reset on your account.</li>
                <li>
                  Within 10 minutes of the reset, come back to this page, enter your email, and <strong className="text-white">leave the password field blank</strong>.
                </li>
                <li>Click <strong className="text-white">Log in</strong>.</li>
                <li>You'll then be prompted to set a new password.</li>
              </ol>
              <p className="text-xs text-white/40">
                Tip: keep this page open while emailing the admin so you can sign in immediately after they confirm.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowForgotInfo(false)}
                className="rounded-full bg-[#F5C518] px-4 py-2 text-xs font-semibold text-black hover:bg-[#E8B800] transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Set new password (post-reset login) ────────────────────────── */}
      {resetContext && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[24px] border border-[#F5C518]/30 bg-[#0F0F11] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound size={18} className="text-[#F5C518]" />
              <h3 className="text-lg font-semibold text-white">Set a new password</h3>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              You signed in using a password reset. Choose a new password before continuing.
            </p>
            <form onSubmit={handleSetNewPassword} className="space-y-3">
              <div>
                <label className="block text-xs text-white/50 mb-1">New password (min 8 chars)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  autoFocus
                  className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C518]/40 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Confirm new password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C518]/40 transition-colors"
                />
              </div>
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-100">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={savingNewPassword || newPassword.length < 8 || newPassword !== confirmNewPassword}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#F5C518] px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-40 hover:bg-[#E8B800] transition-colors"
              >
                {savingNewPassword ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Set new password & continue
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
