import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { apiRequest } from '../lib/api'
import { getStoredAuth, setStoredAuth } from '../lib/auth'

export default function FacilitatorOnboardingPage() {
  const auth = getStoredAuth()
  const [, setLocation] = useLocation()

  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch current profile to pre-fill
    apiRequest('/academy/facilitator/me')
      .then((res: any) => {
        if (res.data) {
          setName(res.data.name || '')
          setTitle(res.data.title || '')
          setBio(res.data.bio || '')
          setPhotoUrl(res.data.photoUrl || '')
        }
      })
      .catch(() => {
        // Handle error silently, just leave blank
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleFinish(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    
    try {
      await apiRequest('/academy/facilitator/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          title,
          bio,
          photoUrl: photoUrl || undefined
        }),
      })
      
      // Update stored auth to mark onboarding as completed if they filled everything
      if (auth && name && title && bio && photoUrl) {
        setStoredAuth({ ...auth, user: { ...auth.user, onboardingCompleted: true } })
      }
      
      setLocation('/facilitator')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const canFinish = name.trim() && title.trim() && bio.trim() && photoUrl.trim()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border border-white/20 border-t-[#F5C518]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-8 h-8 rounded-lg bg-[#F5C518] flex items-center justify-center">
          <span className="font-display font-extrabold text-[#0A0A0A] text-sm leading-none">R</span>
        </div>
        <span className="font-display font-bold text-base text-white">
          Rubikcon <span className="text-[#F5C518]">Nexus</span>
        </span>
      </div>

      {/* Card */}
      <div className="w-full max-w-md">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-7">
          <p className="text-xs font-mono uppercase tracking-widest text-[#F5C518] mb-2">Facilitator Profile</p>
          <h1 className="font-display text-2xl font-extrabold text-white mb-1">Complete Your Profile</h1>
          <p className="text-white/45 text-sm mb-6">Let learners know more about you.</p>

          <form onSubmit={handleFinish} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#F5C518]/40 transition-colors"
                placeholder="e.g. Jane Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Professional Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#F5C518]/40 transition-colors"
                placeholder="e.g. Senior Smart Contract Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Photo URL</label>
              <input
                type="url"
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#F5C518]/40 transition-colors"
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Short Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                required
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#F5C518]/40 transition-colors resize-none"
                placeholder="Tell learners about your experience and background..."
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canFinish || submitting}
              className="w-full mt-4 rounded-full bg-[#F5C518] text-[#0A0A0A] font-semibold py-3 text-sm hover:bg-[#E8B800] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Complete Profile & Continue →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
