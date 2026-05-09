import { FormEvent, useMemo, useState } from 'react'
import { useLocation } from 'wouter'
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm text-white/65 mb-2">Full name</label>
                  <input
                    value={name}
                    onChange={event => setName(event.target.value)}
                    className="w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40"
                    placeholder="Your full name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-white/65 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm text-white/65 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-[#F5C518] px-6 py-3 text-sm font-semibold text-[#0A0A0A] hover:bg-[#E8B800] transition-colors disabled:opacity-60"
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
