import { useState } from 'react'
import { CheckCircle2, Loader2, Send, Share2 } from 'lucide-react'
import { apiRequest } from '../lib/api'

export default function ModuleFeedback({ moduleId, moduleTitle }: { moduleId: string, moduleTitle: string }) {
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [sharing, setSharing] = useState(false)

  const handleSubmit = async () => {
    if (!feedback.trim() || saving) return
    setSaving(true)
    try {
      await apiRequest(`/academy/modules/${moduleId}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ feedback })
      })
      setSaved(true)
    } catch (err) {
      console.error(err)
      alert('Failed to submit feedback')
    } finally {
      setSaving(false)
    }
  }

  const handleShare = async () => {
    const text = `I just completed "${moduleTitle}" on Rubikcon Nexus Academy! 🚀 Join me in mastering Web3: https://rubikconacademy.xyz`
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rubikcon Nexus Academy',
          text,
          url: 'https://rubikconacademy.xyz'
        })
      } catch (err) {
        console.error('Error sharing', err)
      }
    } else {
      setSharing(true)
      await navigator.clipboard.writeText(text)
      setTimeout(() => setSharing(false), 2000)
    }
  }

  return (
    <div className="rounded-[28px] border border-[#F5C518]/30 bg-[#F5C518]/5 p-6 md:p-8 mt-12 relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#F5C518]/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="relative z-10">
        <h3 className="font-display text-2xl font-extrabold text-white mb-2">
          Module completed! 🎉
        </h3>
        <p className="text-white/60 text-sm mb-6 max-w-md">
          You've reached the end of <span className="font-semibold text-white">{moduleTitle}</span>. 
          We'd love to hear your thoughts before you move on!
        </p>

        <div className="flex flex-col gap-4">
          {!saved ? (
            <div className="space-y-3">
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="What did you enjoy? What could be improved?"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#F5C518]/50 resize-y"
                rows={3}
              />
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <Share2 size={16} />
                  {sharing ? 'Copied to clipboard!' : 'Share achievement'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!feedback.trim() || saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#F5C518] px-5 py-2.5 text-sm font-bold text-[#0A0A0A] hover:bg-[#FFD020] disabled:opacity-50 transition-colors"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Submit feedback
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5 flex items-start gap-4">
              <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={24} />
              <div>
                <p className="font-semibold text-emerald-400">Feedback received!</p>
                <p className="text-sm text-white/60 mt-1">Thank you for helping us improve the academy.</p>
                <button
                  onClick={handleShare}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                >
                  <Share2 size={16} />
                  {sharing ? 'Copied!' : 'Share achievement'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
