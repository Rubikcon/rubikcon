import { useEffect, useState } from 'react'
import { useParams } from 'wouter'
import { BookOpen, Loader2 } from 'lucide-react'
import AcademyNavbar from '../components/AcademyNavbar'
import LessonVideoManager from '../components/LessonVideoManager'
import { apiRequest } from '../lib/api'
import { getStoredAuth } from '../lib/auth'
import type { AdminLesson, LessonVideo } from '../types/academy'

export default function LessonEditorPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const auth = getStoredAuth()

  const [lesson, setLesson] = useState<AdminLesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', duration: 0 })

  useEffect(() => {
    if (!getStoredAuth()) { window.location.href = '/login'; return }

    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await apiRequest<AdminLesson>(`/academy/lesson/${lessonId}`)
        if (!cancelled) {
          setLesson(data)
          setForm({ title: data.title, content: data.content, duration: data.duration })
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load lesson.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [lessonId])

  async function saveLesson() {
    setSaving(true)
    try {
      const updated = await apiRequest<AdminLesson>(`/academy/lesson/${lessonId}`, {
        method: 'PATCH',
        body: JSON.stringify(form),
      })
      setLesson(updated)
      setForm({ title: updated.title, content: updated.content, duration: updated.duration })
      setEditing(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save lesson.')
    } finally {
      setSaving(false)
    }
  }

  const isPrivileged = auth?.user.role === 'ADMIN' || auth?.user.role === 'SUPER_ADMIN'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <AcademyNavbar showBack backHref={`/admin/courses/${courseId}`} backLabel="Back to Course" solid />
        <div className="pt-32 flex flex-col items-center justify-center text-center px-6">
          <Loader2 className="animate-spin text-[#F5C518] mb-4" size={28} />
          <p className="text-white/60">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <AcademyNavbar showBack backHref={`/admin/courses/${courseId}`} backLabel="Back to Course" solid />
        <div className="pt-32 text-center px-6">
          <p className="text-red-400">{error ?? 'Lesson not found.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AcademyNavbar showBack backHref={`/admin/courses/${courseId}`} backLabel="Back to Course" solid />

      <main className="pt-28 pb-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white">{lesson.title}</h1>
              <p className="text-white/40 text-sm mt-1">
                Module: {lesson.module.title} · Course: {lesson.module.course.title}
              </p>
            </div>
            {isPrivileged && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-[#F5C518] hover:text-[#E8B800]"
              >
                Edit
              </button>
            )}
          </div>

          {error && !editing && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          {/* Lesson Info */}
          <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><BookOpen size={16} /> Lesson Details</h2>
            </div>

            {editing ? (
              <form onSubmit={e => { e.preventDefault(); saveLesson() }} className="space-y-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1">Title</label>
                  <input
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    required
                    className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={e => setForm(p => ({ ...p, duration: +e.target.value }))}
                    required
                    min={1}
                    className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Content</label>
                  <textarea
                    value={form.content}
                    onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                    required
                    rows={8}
                    placeholder="Write lesson content..."
                    className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-[#F5C518] px-5 py-2 text-sm font-semibold text-[#0A0A0A] disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false)
                      setForm({ title: lesson.title, content: lesson.content, duration: lesson.duration })
                    }}
                    className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/60 hover:border-white/40 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-white/35 text-xs mb-0.5">Title</dt>
                  <dd className="text-white">{lesson.title}</dd>
                </div>
                <div>
                  <dt className="text-white/35 text-xs mb-0.5">Duration</dt>
                  <dd className="text-white">{lesson.duration} minutes</dd>
                </div>
                <div>
                  <dt className="text-white/35 text-xs mb-0.5">Content</dt>
                  <dd className="text-white/75 whitespace-pre-line line-clamp-6">{lesson.content}</dd>
                </div>
              </dl>
            )}
          </section>

          {/* Videos Manager */}
          {isPrivileged && (
            <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Lesson Videos</h2>
              <LessonVideoManager
                lessonId={lessonId!}
                videos={lesson.videos}
                editable={isPrivileged}
                onVideoAdded={(video) => {
                  setLesson(prev => prev ? { ...prev, videos: [...prev.videos, video] } : null)
                }}
                onVideoDeleted={(videoId) => {
                  setLesson(prev => prev ? { ...prev, videos: prev.videos.filter(v => v.id !== videoId) } : null)
                }}
              />
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
