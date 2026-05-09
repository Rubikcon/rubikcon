import { FormEvent, useMemo, useState } from 'react'
import { useLocation } from 'wouter'
import { Check, X } from 'lucide-react'
import AcademyNavbar from '../components/AcademyNavbar'
import { login, signup } from '../lib/api'

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

  const canSubmit = mode === 'login'
    ? email && isValidEmail(email) && password
    : name && isNameValid(name) && email && isValidEmail(email) && isPasswordValid(password)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setSubmitting(true)
      setError(null)
      if (mode === 'login') {
        const result = await login(email, password)
        if (result.user.role === 'SUPER_ADMIN') {
          setLocation('/admin/superadmin')
        } else if (result.user.role === 'ADMIN') {
          setLocation('/admin/academy')
        } else if (!result.user.onboardingCompleted) {
          setLocation('/onboarding')
        } else {
          setLocation('/dashboard')
        }
      } else {
        await signup(name, email, password)
        setLocation('/onboarding')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to authenticate.')
    } finally {
      setSubmitting(false)
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
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
