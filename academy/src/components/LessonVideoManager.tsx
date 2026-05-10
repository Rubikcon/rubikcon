import { useState } from 'react'
import { Plus, Trash2, GripVertical, Loader2 } from 'lucide-react'
import { apiRequest } from '../lib/api'
import { VideoSourceBadge } from './VideoEmbed'

export type LessonVideo = {
  id: string
  title: string
  url: string
  description: string | null
  position: number
}

type Props = {
  lessonId: string
  videos: LessonVideo[]
  onVideoAdded?: (video: LessonVideo) => void
  onVideoDeleted?: (videoId: string) => void
  editable?: boolean
}

export default function LessonVideoManager({
  lessonId,
  videos,
  onVideoAdded,
  onVideoDeleted,
  editable = false,
}: Props) {
  const [isAdding, setIsAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', url: '', description: '' })
  const [error, setError] = useState<string | null>(null)

  async function addVideo(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.url.trim()) return

    try {
      setError(null)
      const video = await apiRequest<LessonVideo>(`/academy/lessons/${lessonId}/videos`, {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          url: form.url,
          description: form.description || undefined,
        }),
      })
      setForm({ title: '', url: '', description: '' })
      setIsAdding(false)
      onVideoAdded?.(video)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add video')
    }
  }

  async function deleteVideo(videoId: string) {
    if (!confirm('Delete this video?')) return
    try {
      setDeleting(videoId)
      setError(null)
      await apiRequest(`/academy/lesson-videos/${videoId}`, { method: 'DELETE' })
      onVideoDeleted?.(videoId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete video')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Video list */}
      <div className="space-y-3">
        {videos.length === 0 ? (
          <p className="text-sm text-white/50">No videos yet</p>
        ) : (
          videos.map((video, idx) => (
            <div
              key={video.id}
              className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="text-white/40 pt-1">
                <GripVertical size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-white">
                    {idx + 1}. {video.title}
                  </p>
                  <VideoSourceBadge url={video.url} />
                </div>
                <p className="text-xs text-white/50 truncate">{video.url}</p>
                {video.description && (
                  <p className="text-xs text-white/40 mt-2">{video.description}</p>
                )}
              </div>
              {editable && (
                <button
                  onClick={() => deleteVideo(video.id)}
                  disabled={deleting === video.id}
                  className="text-red-400/50 hover:text-red-400 transition-colors p-2 disabled:opacity-50"
                  title="Delete video"
                >
                  {deleting === video.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add video form */}
      {editable && (
        <>
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/60 hover:border-white/40 hover:text-white transition-colors"
            >
              <Plus size={14} /> Add video
            </button>
          ) : (
            <form onSubmit={addVideo} className="rounded-lg border border-white/20 bg-white/[0.05] p-4 space-y-3">
              <div>
                <label className="block text-xs text-white/60 mb-1">Video title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., Introduction, Part 2"
                  className="w-full rounded-lg border border-white/12 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Video URL *</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full rounded-lg border border-white/12 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Optional description"
                  rows={2}
                  className="w-full rounded-lg border border-white/12 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 resize-none"
                />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-[#F5C518] px-3 py-2 text-xs font-semibold text-[#0A0A0A] hover:bg-[#E8B800] transition-colors disabled:opacity-50"
                >
                  Add video
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false)
                    setForm({ title: '', url: '', description: '' })
                    setError(null)
                  }}
                  className="rounded-lg border border-white/20 px-3 py-2 text-xs text-white/60 hover:border-white/40 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  )
}
