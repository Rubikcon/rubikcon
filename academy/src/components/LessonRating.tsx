import { useState } from 'react'
import { Star, Loader2, CheckCircle2 } from 'lucide-react'
import { apiRequest } from '../lib/api'

export default function LessonRating({ weekSlug, initialRating }: { weekSlug: string, initialRating?: number | null }) {
  const [rating, setRating] = useState<number>(initialRating || 0)
  const [hover, setHover] = useState<number>(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(!!initialRating)

  const handleRating = async (val: number) => {
    if (rating === val || saving) return
    setRating(val)
    setSaving(true)
    try {
      await apiRequest(`/academy/weeks/${weekSlug}/rating`, {
        method: 'POST',
        body: JSON.stringify({ rating: val })
      })
      setSaved(true)
    } catch (err) {
      console.error(err)
      alert('Failed to save rating.')
      setRating(initialRating || 0)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
      <h4 className="font-semibold text-white mb-3 text-sm">Rate this lesson</h4>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              disabled={saving}
              onClick={() => handleRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="p-1 disabled:opacity-50 transition-transform hover:scale-110"
            >
              <Star
                size={24}
                className={`${
                  star <= (hover || rating)
                    ? 'fill-[#F5C518] text-[#F5C518]'
                    : 'text-white/20'
                } transition-colors`}
              />
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 h-5">
          {saving && <span className="text-xs text-white/50 flex items-center gap-1.5"><Loader2 size={12} className="animate-spin" /> Saving rating...</span>}
          {!saving && saved && <span className="text-xs text-emerald-400 flex items-center gap-1.5"><CheckCircle2 size={12} /> Thanks for your feedback!</span>}
          {!saving && !saved && <span className="text-xs text-white/40">Your feedback helps us improve.</span>}
        </div>
      </div>
    </div>
  )
}
