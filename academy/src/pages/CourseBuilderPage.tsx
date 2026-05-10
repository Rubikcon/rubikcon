import { FormEvent, useEffect, useState } from 'react'
import { useParams } from 'wouter'
import {
  BookOpen, ChevronDown, ChevronUp, Image, Loader2, Plus, Send, Trash2, Users, Video, X,
} from 'lucide-react'
import AcademyNavbar from '../components/AcademyNavbar'
import { VideoSourceBadge } from '../components/VideoEmbed'
import { apiRequest } from '../lib/api'
import { getStoredAuth } from '../lib/auth'
import type { AdminCourseDetail, AdminWeek, FacilitatorSummary } from '../types/academy'

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'border-white/20 text-white/50',
  PENDING_REVIEW: 'border-amber-400/40 text-amber-300',
  APPROVED: 'border-emerald-400/40 text-emerald-300',
  REJECTED: 'border-red-400/40 text-red-300',
}

const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const
const DURATIONS = ['2 weeks', '4 weeks', '6 weeks', '8 weeks', '10 weeks', '12 weeks', 'Self-paced'] as const
const CONTENT_UNITS = ['Lesson', 'Week', 'Module', 'Session', 'Chapter', 'Unit'] as const

export default function CourseBuilderPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const auth = getStoredAuth()
  const isOwner = true // enforced server-side; optimistic for UI gating

  const [course, setCourse] = useState<AdminCourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Edit course info
  const [editInfo, setEditInfo] = useState(false)
  const [infoForm, setInfoForm] = useState({
    title: '', description: '', tagline: '', level: '', estimatedDuration: '', slug: '', contentUnit: 'Lesson', introVideoUrl: '', isPaid: false,
  })

  // Facilitators
  const [allFacilitators, setAllFacilitators] = useState<FacilitatorSummary[]>([])
  const [showFacilitatorPanel, setShowFacilitatorPanel] = useState(false)
  const [addingFacilitator, setAddingFacilitator] = useState(false)
  const [newFacForm, setNewFacForm] = useState({ name: '', title: '', organization: '', email: '', linkedinUrl: '', photoUrl: '', bio: '' })

  // Weeks
  const [expandedWeekId, setExpandedWeekId] = useState<string | null>(null)
  const [showAddWeek, setShowAddWeek] = useState(false)
  const [weekForm, setWeekForm] = useState({
    number: 1, title: '', slug: '', durationLabel: '', difficulty: 'BEGINNER' as typeof DIFFICULTIES[number],
    hook: '', whatToExpect: '', summary: '', estimatedCompletionMinutes: 60,
    videoTitle: '', videoUrl: '', topics: '', objectives: '',
  })

  // Quiz builder
  const [quizForms, setQuizForms] = useState<Record<string, QuizDraft>>({})

  // Assignment builder
  const [assignForms, setAssignForms] = useState<Record<string, AssignmentDraft>>({})

  // Lesson content drafts (weekId -> content string)
  const [contentDrafts, setContentDrafts] = useState<Record<string, string>>({})

  // Image form drafts (weekId -> { url, alt, caption })
  const [imageForms, setImageForms] = useState<Record<string, { url: string; alt: string; caption: string }>>({})

  // Multi-video drafts (weekId -> { title, url, description })
  const [videoNewForms, setVideoNewForms] = useState<Record<string, { title: string; url: string; description: string }>>({})

  // Module drafts
  const [showAddModule, setShowAddModule] = useState(false)
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' })

  async function reload() {
    const data = await apiRequest<AdminCourseDetail>(`/academy/admin/courses/${courseId}`)
    setCourse(data)
    setInfoForm({
      title: data.title,
      description: data.description,
      tagline: data.tagline ?? '',
      level: data.level ?? '',
      estimatedDuration: data.estimatedDuration ?? '',
      slug: data.slug,
      contentUnit: data.contentUnit,
      introVideoUrl: data.introVideoUrl ?? '',
      isPaid: data.isPaid ?? false,
    })
  }

  useEffect(() => {
    if (!getStoredAuth()) { window.location.href = '/login'; return }

    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const [courseData, facData] = await Promise.all([
          apiRequest<AdminCourseDetail>(`/academy/admin/courses/${courseId}`),
          apiRequest<FacilitatorSummary[]>('/academy/admin/facilitators'),
        ])
        if (!cancelled) {
          setCourse(courseData)
          setAllFacilitators(facData)
          setInfoForm({
            title: courseData.title,
            description: courseData.description,
            tagline: courseData.tagline ?? '',
            level: courseData.level ?? '',
            estimatedDuration: courseData.estimatedDuration ?? '',
            slug: courseData.slug,
            contentUnit: courseData.contentUnit,
            introVideoUrl: courseData.introVideoUrl ?? '',
            isPaid: courseData.isPaid ?? false,
          })
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load course.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [courseId])

  const isPrivileged = auth?.user.role === 'ADMIN' || auth?.user.role === 'SUPER_ADMIN'
  const locked = !isPrivileged && (course?.status === 'PENDING_REVIEW' || course?.status === 'APPROVED')

  async function saveInfo(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}`, {
        method: 'PATCH',
        body: JSON.stringify(infoForm),
      })
      await reload()
      setEditInfo(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  async function submitForReview() {
    if (!confirm('Submit this course for super admin review? You cannot edit it while it is under review.')) return
    setSaving(true)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/submit`, { method: 'POST' })
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit.')
    } finally {
      setSaving(false)
    }
  }

  async function addFacilitatorToCourse(facilitatorId: string) {
    setSaving(true)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/facilitators`, {
        method: 'POST',
        body: JSON.stringify({ facilitatorId }),
      })
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add facilitator.')
    } finally {
      setSaving(false)
    }
  }

  async function removeFacilitator(facilitatorId: string) {
    if (!confirm('Remove this facilitator from the course?')) return
    setSaving(true)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/facilitators/${facilitatorId}`, { method: 'DELETE' })
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove facilitator.')
    } finally {
      setSaving(false)
    }
  }

  async function createFacilitator(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const fac = await apiRequest<FacilitatorSummary>('/academy/admin/facilitators', {
        method: 'POST',
        body: JSON.stringify(newFacForm),
      })
      setAllFacilitators(prev => [...prev, fac])
      setNewFacForm({ name: '', title: '', organization: '', email: '', linkedinUrl: '', photoUrl: '', bio: '' })
      setAddingFacilitator(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create facilitator.')
    } finally {
      setSaving(false)
    }
  }

  async function addWeek(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks`, {
        method: 'POST',
        body: JSON.stringify({
          ...weekForm,
          topics: weekForm.topics.split('\n').map(s => s.trim()).filter(Boolean),
          objectives: weekForm.objectives.split('\n').map(s => s.trim()).filter(Boolean),
          videoTitle: weekForm.videoTitle || undefined,
          videoUrl: weekForm.videoUrl || undefined,
        }),
      })
      await reload()
      setShowAddWeek(false)
      setWeekForm({ number: (course?.weeks.length ?? 0) + 2, title: '', slug: '', durationLabel: '', difficulty: 'BEGINNER', hook: '', whatToExpect: '', summary: '', estimatedCompletionMinutes: 60, videoTitle: '', videoUrl: '', topics: '', objectives: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add week.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteWeek(weekId: string) {
    if (!confirm('Delete this week and all its content?')) return
    setSaving(true)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}`, { method: 'DELETE' })
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete week.')
    } finally {
      setSaving(false)
    }
  }

  async function saveQuiz(weekId: string) {
    const draft = quizForms[weekId]
    if (!draft) return
    setSaving(true)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/quiz`, {
        method: 'POST',
        body: JSON.stringify(draft),
      })
      await reload()
      setQuizForms(prev => { const n = { ...prev }; delete n[weekId]; return n })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save quiz.')
    } finally {
      setSaving(false)
    }
  }

  async function saveAssignment(weekId: string) {
    const draft = assignForms[weekId]
    if (!draft) return
    setSaving(true)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/assignments`, {
        method: 'POST',
        body: JSON.stringify({ ...draft, deadline: new Date(draft.deadline).toISOString() }),
      })
      await reload()
      setAssignForms(prev => { const n = { ...prev }; delete n[weekId]; return n })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save assignment.')
    } finally {
      setSaving(false)
    }
  }

  async function saveContent(weekId: string) {
    const content = contentDrafts[weekId]
    if (content === undefined) return
    setSaving(true)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/content`, {
        method: 'PATCH',
        body: JSON.stringify({ lessonContent: content }),
      })
      await reload()
      setContentDrafts(prev => { const n = { ...prev }; delete n[weekId]; return n })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content.')
    } finally {
      setSaving(false)
    }
  }

  async function addImage(weekId: string) {
    const form = imageForms[weekId]
    if (!form?.url) return
    setSaving(true)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/images`, {
        method: 'POST',
        body: JSON.stringify({ url: form.url, alt: form.alt || undefined, caption: form.caption || undefined }),
      })
      await reload()
      setImageForms(prev => ({ ...prev, [weekId]: { url: '', alt: '', caption: '' } }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add image.')
    } finally {
      setSaving(false)
    }
  }

  async function removeImage(weekId: string, imageId: string) {
    setSaving(true)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/images/${imageId}`, { method: 'DELETE' })
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove image.')
    } finally {
      setSaving(false)
    }
  }

  async function addVideo(weekId: string) {
    const form = videoNewForms[weekId]
    if (!form?.url || !form?.title) return
    setSaving(true)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/videos`, {
        method: 'POST',
        body: JSON.stringify({ title: form.title, url: form.url, description: form.description || undefined }),
      })
      await reload()
      setVideoNewForms(prev => ({ ...prev, [weekId]: { title: '', url: '', description: '' } }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add video.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteVideo(weekId: string, videoId: string) {
    setSaving(true)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/videos/${videoId}`, { method: 'DELETE' })
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete video.')
    } finally {
      setSaving(false)
    }
  }

  async function assignWeekModule(weekId: string, moduleId: string | null) {
    setSaving(true)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/module`, {
        method: 'PATCH',
        body: JSON.stringify({ moduleId }),
      })
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign module.')
    } finally {
      setSaving(false)
    }
  }

  async function addModule(e: React.FormEvent) {
    e.preventDefault()
    if (!moduleForm.title.trim()) return
    setSaving(true)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/modules`, {
        method: 'POST',
        body: JSON.stringify({ title: moduleForm.title, description: moduleForm.description || undefined }),
      })
      await reload()
      setModuleForm({ title: '', description: '' })
      setShowAddModule(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add module.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteModule(moduleId: string) {
    if (!confirm('Delete this module? Weeks assigned to it will become unassigned.')) return
    setSaving(true)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/modules/${moduleId}`, { method: 'DELETE' })
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete module.')
    } finally {
      setSaving(false)
    }
  }

  const assignedFacilitatorIds = new Set(course?.courseFacilitators.map(cf => cf.facilitator.id) ?? [])
  const availableToAdd = allFacilitators.filter(f => !assignedFacilitatorIds.has(f.id))

  const unit = course?.contentUnit ?? 'Lesson'
  const units = `${unit}s`

  // Prerequisites
  const prereqMet = (course?.courseFacilitators.length ?? 0) >= 1 && (course?.weeks.length ?? 0) >= 1 && (course?.description?.length ?? 0) >= 10

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <AcademyNavbar showBack backHref="/admin/academy" backLabel="Back to Admin" solid />
        <div className="pt-32 flex flex-col items-center justify-center text-center px-6">
          <Loader2 className="animate-spin text-[#F5C518] mb-4" size={28} />
          <p className="text-white/60">Loading course builder...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <AcademyNavbar showBack backHref="/admin/academy" backLabel="Back to Admin" solid />
        <div className="pt-32 text-center px-6">
          <p className="text-red-400">{error ?? 'Course not found.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AcademyNavbar showBack backHref="/admin/academy" backLabel="Back to Admin" solid />

      <main className="pt-28 pb-20 px-4 md:px-6">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-mono mb-2 ${STATUS_COLORS[course.status]}`}>
                {course.status.replace('_', ' ')}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white">{course.title}</h1>
              <p className="text-white/40 text-sm mt-1">/{course.slug}</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {(course.status === 'DRAFT' || course.status === 'REJECTED') && (
                <button
                  onClick={submitForReview}
                  disabled={!prereqMet || saving}
                  className="inline-flex items-center gap-2 rounded-full bg-[#F5C518] px-5 py-2.5 text-sm font-semibold text-[#0A0A0A] hover:bg-[#E8B800] transition-colors disabled:opacity-40"
                >
                  <Send size={14} />
                  Submit for Review
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          {course.status === 'APPROVED' && (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/8 px-5 py-4 flex items-start gap-3">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <div>
                <p className="text-sm font-semibold text-emerald-300">This course is published</p>
                <p className="text-xs text-emerald-400/60 mt-0.5">
                  {isPrivileged
                    ? 'As an admin, you can edit this course even while it is live.'
                    : 'Approved courses are live on the platform and cannot be edited. Contact a Super Admin to make changes.'}
                </p>
              </div>
            </div>
          )}

          {course.status === 'PENDING_REVIEW' && (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/8 px-5 py-4 flex items-start gap-3">
              <span className="text-amber-400 mt-0.5">⏳</span>
              <div>
                <p className="text-sm font-semibold text-amber-300">Awaiting Super Admin review</p>
                <p className="text-xs text-amber-400/60 mt-0.5">
                  {isPrivileged
                    ? 'As an admin, you can still edit this course while it awaits review.'
                    : "This course is locked while under review. You'll be notified once a decision is made."}
                </p>
              </div>
            </div>
          )}

          {course.approvalNotes && course.status === 'REJECTED' && (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
              <p className="text-xs font-mono uppercase tracking-widest text-red-400/70 mb-1">Rejection notes</p>
              {course.approvalNotes}
            </div>
          )}

          {/* Prerequisites checklist */}
          {(course.status === 'DRAFT' || course.status === 'REJECTED') && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-mono uppercase tracking-widest text-white/40 mb-3">Submission prerequisites</p>
              <ul className="space-y-2 text-sm">
                {[
                  { label: 'Course has a description', met: (course.description?.length ?? 0) >= 10 },
                  { label: 'At least one facilitator assigned', met: course.courseFacilitators.length >= 1 },
                  { label: `At least one ${unit.toLowerCase()} added`, met: course.weeks.length >= 1 },
                ].map(item => (
                  <li key={item.label} className={`flex items-center gap-2 ${item.met ? 'text-emerald-400' : 'text-white/40'}`}>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${item.met ? 'border-emerald-400 bg-emerald-400/20' : 'border-white/20'}`}>
                      {item.met && <span className="text-[10px]">✓</span>}
                    </span>
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Course Info */}
          <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><BookOpen size={16} /> Course Info</h2>
              {!locked && (
                <button onClick={() => setEditInfo(!editInfo)} className="text-sm text-[#F5C518] hover:text-[#E8B800]">
                  {editInfo ? 'Cancel' : 'Edit'}
                </button>
              )}
            </div>

            {editInfo ? (
              <form onSubmit={saveInfo} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Title</label>
                    <input value={infoForm.title} onChange={e => setInfoForm(p => ({ ...p, title: e.target.value }))} required
                      className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]/40" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Slug</label>
                    <input value={infoForm.slug} onChange={e => setInfoForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))} required
                      className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]/40" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Tagline</label>
                    <input value={infoForm.tagline} onChange={e => setInfoForm(p => ({ ...p, tagline: e.target.value }))} placeholder="Short hook for the course"
                      className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]/40" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Level</label>
                    <select value={infoForm.level} onChange={e => setInfoForm(p => ({ ...p, level: e.target.value }))}
                      className="w-full rounded-xl border border-white/12 bg-[#111] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]/40 [color-scheme:dark]">
                      <option value="">-- Select level --</option>
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Estimated duration</label>
                    <select value={infoForm.estimatedDuration} onChange={e => setInfoForm(p => ({ ...p, estimatedDuration: e.target.value }))}
                      className="w-full rounded-xl border border-white/12 bg-[#111] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]/40 [color-scheme:dark]">
                      <option value="">-- Select duration --</option>
                      {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Content unit</label>
                    <select value={infoForm.contentUnit} onChange={e => setInfoForm(p => ({ ...p, contentUnit: e.target.value }))}
                      className="w-full rounded-xl border border-white/12 bg-[#111] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]/40 [color-scheme:dark]">
                      {CONTENT_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Intro Video URL</label>
                    <input value={infoForm.introVideoUrl} onChange={e => setInfoForm(p => ({ ...p, introVideoUrl: e.target.value }))} type="url" placeholder="YouTube, Vimeo, or Loom URL"
                      className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]/40" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-white/60 cursor-pointer">
                      <input type="checkbox" checked={infoForm.isPaid} onChange={e => setInfoForm(p => ({ ...p, isPaid: e.target.checked }))} className="accent-[#F5C518]" />
                      <span className="text-xs">This is a paid course</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Description</label>
                  <textarea
                    value={infoForm.description}
                    onChange={e => setInfoForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    placeholder="Write a compelling course description visible to learners..."
                    className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40"
                  />
                </div>
                <button type="submit" disabled={saving} className="rounded-full bg-[#F5C518] px-5 py-2 text-sm font-semibold text-[#0A0A0A] disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </form>
            ) : (
              <dl className="grid md:grid-cols-2 gap-3 text-sm">
                {[
                  ['Title', course.title],
                  ['Slug', `/${course.slug}`],
                  ['Tagline', course.tagline],
                  ['Level', course.level],
                  ['Duration', course.estimatedDuration],
                  ['Content unit', course.contentUnit],
                  ['Type', course.isPaid ? 'Paid' : 'Free'],
                  ['Intro Video', course.introVideoUrl],
                ].map(([label, val]) => val && (
                  <div key={label as string}>
                    <dt className="text-white/35 text-xs mb-0.5">{label}</dt>
                    <dd className="text-white">{val}</dd>
                  </div>
                ))}
                <div className="md:col-span-2">
                  <dt className="text-white/35 text-xs mb-0.5">Description</dt>
                  <dd className="text-white/75 leading-relaxed">{course.description}</dd>
                </div>
              </dl>
            )}
          </section>

          {/* Facilitators */}
          <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Users size={16} /> Facilitators</h2>
              {!locked && (
                <button onClick={() => setShowFacilitatorPanel(!showFacilitatorPanel)} className="text-sm text-[#F5C518] hover:text-[#E8B800]">
                  {showFacilitatorPanel ? 'Done' : '+ Add'}
                </button>
              )}
            </div>

            {course.courseFacilitators.length === 0 && (
              <p className="text-sm text-white/35">No facilitators assigned yet.</p>
            )}

            <div className="space-y-2">
              {course.courseFacilitators.map(cf => (
                <div key={cf.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-black/20 px-4 py-3">
                  {cf.facilitator.photoUrl && (
                    <img src={cf.facilitator.photoUrl} alt={cf.facilitator.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{cf.facilitator.name}</p>
                    <p className="text-xs text-white/40">{cf.facilitator.title} · {cf.facilitator.organization}</p>
                  </div>
                  {!locked && (
                    <button onClick={() => void removeFacilitator(cf.facilitator.id)} className="text-white/30 hover:text-red-400 transition-colors flex-shrink-0">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {showFacilitatorPanel && !locked && (
              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4 space-y-3">
                {availableToAdd.length > 0 && (
                  <div>
                    <p className="text-xs text-white/40 mb-2">Add existing facilitator</p>
                    <div className="space-y-2">
                      {availableToAdd.map(f => (
                        <button
                          key={f.id}
                          onClick={() => void addFacilitatorToCourse(f.id)}
                          className="w-full text-left flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-2 hover:border-[#F5C518]/30 transition-colors"
                        >
                          {f.photoUrl && (
                            <img src={f.photoUrl} alt={f.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white">{f.name}</p>
                            <p className="text-xs text-white/35">{f.title} · {f.organization}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-white/8 pt-3">
                  <button onClick={() => setAddingFacilitator(!addingFacilitator)} className="text-xs text-[#F5C518]">
                    {addingFacilitator ? '— Cancel new facilitator' : '+ Create new facilitator'}
                  </button>
                  {addingFacilitator && (
                    <form onSubmit={createFacilitator} className="mt-3 space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        {(['name', 'title', 'organization', 'email', 'linkedinUrl'] as const).map(field => (
                          <div key={field}>
                            <label className="block text-xs text-white/40 mb-1 capitalize">{field.replace(/Url$/, 'URL')}</label>
                            <input
                              value={newFacForm[field]}
                              onChange={e => setNewFacForm(prev => ({ ...prev, [field]: e.target.value }))}
                              required
                              type={field === 'email' ? 'email' : field.includes('Url') ? 'url' : 'text'}
                              className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]/40"
                            />
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="block text-xs text-white/40 mb-1">Photo URL</label>
                        <input
                          value={newFacForm.photoUrl}
                          onChange={e => setNewFacForm(prev => ({ ...prev, photoUrl: e.target.value }))}
                          type="url"
                          placeholder="https://example.com/photo.jpg"
                          className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]/40"
                        />
                        {newFacForm.photoUrl && (
                          <div className="mt-2 rounded-xl overflow-hidden border border-white/10 w-20 h-20">
                            <img src={newFacForm.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-white/40 mb-1">Bio</label>
                        <textarea
                          value={newFacForm.bio}
                          onChange={e => setNewFacForm(prev => ({ ...prev, bio: e.target.value }))}
                          rows={2}
                          className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]/40"
                        />
                      </div>
                      <button type="submit" disabled={saving} className="rounded-full bg-[#F5C518] px-4 py-2 text-sm font-semibold text-[#0A0A0A] disabled:opacity-50">
                        {saving ? 'Creating...' : 'Create facilitator'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Weeks */}
          <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Course {units}</h2>
              {!locked && (
                <button onClick={() => setShowAddWeek(!showAddWeek)} className="text-sm text-[#F5C518] hover:text-[#E8B800]">
                  {showAddWeek ? 'Cancel' : `+ Add ${unit.toLowerCase()}`}
                </button>
              )}
            </div>

            {showAddWeek && !locked && (
              <form onSubmit={addWeek} className="mb-5 rounded-xl border border-[#F5C518]/20 bg-[#F5C518]/5 p-5 space-y-4">
                <p className="text-sm font-semibold text-[#F5C518]">New {unit}</p>
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1">{unit} #</label>
                    <input type="number" value={weekForm.number} onChange={e => setWeekForm(p => ({ ...p, number: +e.target.value }))} required min={1}
                      className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-white/40 mb-1">Title</label>
                    <input value={weekForm.title} onChange={e => setWeekForm(p => ({ ...p, title: e.target.value }))} required
                      className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Slug</label>
                    <input value={weekForm.slug} onChange={e => setWeekForm(p => ({ ...p, slug: e.target.value }))} required placeholder="week-1-intro"
                      className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Duration label</label>
                    <input value={weekForm.durationLabel} onChange={e => setWeekForm(p => ({ ...p, durationLabel: e.target.value }))} required placeholder="4 hours"
                      className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Difficulty</label>
                    <select value={weekForm.difficulty} onChange={e => setWeekForm(p => ({ ...p, difficulty: e.target.value as typeof DIFFICULTIES[number] }))}
                      className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none">
                      {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Estimated minutes</label>
                    <input type="number" value={weekForm.estimatedCompletionMinutes} onChange={e => setWeekForm(p => ({ ...p, estimatedCompletionMinutes: +e.target.value }))} required min={1}
                      className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Hook / tagline</label>
                    <input value={weekForm.hook} onChange={e => setWeekForm(p => ({ ...p, hook: e.target.value }))} required
                      className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">What to expect</label>
                  <textarea value={weekForm.whatToExpect} onChange={e => setWeekForm(p => ({ ...p, whatToExpect: e.target.value }))} required rows={2}
                    className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Summary</label>
                  <textarea value={weekForm.summary} onChange={e => setWeekForm(p => ({ ...p, summary: e.target.value }))} required rows={3}
                    className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none" />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Topics (one per line)</label>
                    <textarea value={weekForm.topics} onChange={e => setWeekForm(p => ({ ...p, topics: e.target.value }))} rows={3} placeholder="Blockchain basics&#10;DeFi overview"
                      className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Objectives (one per line)</label>
                    <textarea value={weekForm.objectives} onChange={e => setWeekForm(p => ({ ...p, objectives: e.target.value }))} rows={3} placeholder="Understand what a blockchain is&#10;Explain consensus mechanisms"
                      className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Video title (optional)</label>
                    <input value={weekForm.videoTitle} onChange={e => setWeekForm(p => ({ ...p, videoTitle: e.target.value }))}
                      className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Video URL (optional)</label>
                    <input value={weekForm.videoUrl} onChange={e => setWeekForm(p => ({ ...p, videoUrl: e.target.value }))} placeholder="https://..."
                      className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                </div>
                <button type="submit" disabled={saving} className="rounded-full bg-[#F5C518] px-5 py-2 text-sm font-semibold text-[#0A0A0A] disabled:opacity-50">
                  {saving ? 'Adding...' : `Add ${unit.toLowerCase()}`}
                </button>
              </form>
            )}

            {/* Modules */}
            {course.modules.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-2">Modules</p>
                {course.modules.map(mod => (
                  <div key={mod.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">{mod.title}</p>
                      {mod.description && <p className="text-xs text-white/35 mt-0.5">{mod.description}</p>}
                      <p className="text-xs text-white/25 mt-0.5">{course.weeks.filter(w => w.moduleId === mod.id).length} {units.toLowerCase()} assigned</p>
                    </div>
                    {!locked && (
                      <button onClick={() => void deleteModule(mod.id)} className="text-white/25 hover:text-red-400 transition-colors p-1">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!locked && showAddModule && (
              <form onSubmit={e => void addModule(e)} className="mb-4 rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
                <p className="text-sm font-medium text-white">New Module</p>
                <input value={moduleForm.title} onChange={e => setModuleForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Module title (e.g. Module 1: Blockchain Theory & Fundamentals)"
                  className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none" required />
                <input value={moduleForm.description} onChange={e => setModuleForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description (optional)"
                  className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none" />
                <div className="flex gap-2">
                  <button type="submit" disabled={saving} className="rounded-full bg-[#F5C518] px-4 py-2 text-xs font-semibold text-[#0A0A0A] disabled:opacity-40">Create Module</button>
                  <button type="button" onClick={() => setShowAddModule(false)} className="rounded-full border border-white/12 px-4 py-2 text-xs text-white/55">Cancel</button>
                </div>
              </form>
            )}

            {!locked && (
              <button onClick={() => setShowAddModule(true)} className="mb-4 text-xs text-white/35 hover:text-white/60 flex items-center gap-1.5 transition-colors">
                <Plus size={12} /> Add module
              </button>
            )}

            <div className="space-y-3">
              {course.weeks.length === 0 && <p className="text-sm text-white/35">No {units.toLowerCase()} yet.</p>}
              {course.weeks.map(week => (
                <WeekCard
                  key={week.id}
                  week={week}
                  courseId={courseId!}
                  locked={locked}
                  unit={unit}
                  modules={course.modules}
                  expanded={expandedWeekId === week.id}
                  onToggle={() => setExpandedWeekId(prev => prev === week.id ? null : week.id)}
                  onDelete={() => void deleteWeek(week.id)}
                  onAssignModule={modId => void assignWeekModule(week.id, modId)}
                  quizDraft={quizForms[week.id]}
                  onQuizChange={draft => setQuizForms(prev => ({ ...prev, [week.id]: draft }))}
                  onSaveQuiz={() => void saveQuiz(week.id)}
                  assignDraft={assignForms[week.id]}
                  onAssignChange={draft => setAssignForms(prev => ({ ...prev, [week.id]: draft }))}
                  onSaveAssign={() => void saveAssignment(week.id)}
                  contentDraft={contentDrafts[week.id]}
                  onContentChange={val => setContentDrafts(prev => ({ ...prev, [week.id]: val }))}
                  onSaveContent={() => void saveContent(week.id)}
                  imageForm={imageForms[week.id] ?? { url: '', alt: '', caption: '' }}
                  onImageFormChange={val => setImageForms(prev => ({ ...prev, [week.id]: val }))}
                  onAddImage={() => void addImage(week.id)}
                  onRemoveImage={imgId => void removeImage(week.id, imgId)}
                  videoNewForm={videoNewForms[week.id] ?? { title: '', url: '', description: '' }}
                  onVideoNewFormChange={val => setVideoNewForms(prev => ({ ...prev, [week.id]: val }))}
                  onAddVideo={() => void addVideo(week.id)}
                  onDeleteVideo={videoId => void deleteVideo(week.id, videoId)}
                  saving={saving}
                />
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}

// ─── Types for drafts ─────────────────────────────────────────────────────────

type QuizDraft = {
  title: string
  passMark: number
  attemptLimit: number
  questions: Array<{
    prompt: string
    explanation: string
    position: number
    options: Array<{ label: string; isCorrect: boolean; position: number }>
  }>
}

type AssignmentDraft = {
  title: string
  instructions: string
  deadline: string
  allowTextSubmission: boolean
  allowFileUpload: boolean
  choices: Array<{ title: string; description: string; position: number }>
}

// ─── WeekCard component ───────────────────────────────────────────────────────

function WeekCard({
  week, courseId, locked, unit, modules, expanded, onToggle, onDelete, onAssignModule,
  quizDraft, onQuizChange, onSaveQuiz,
  assignDraft, onAssignChange, onSaveAssign,
  contentDraft, onContentChange, onSaveContent,
  imageForm, onImageFormChange, onAddImage, onRemoveImage,
  videoNewForm, onVideoNewFormChange, onAddVideo, onDeleteVideo,
  saving,
}: {
  week: AdminWeek
  courseId: string
  locked: boolean
  unit: string
  modules: import('../types/academy').AdminModule[]
  expanded: boolean
  onToggle: () => void
  onDelete: () => void
  onAssignModule: (moduleId: string | null) => void
  quizDraft?: QuizDraft
  onQuizChange: (d: QuizDraft) => void
  onSaveQuiz: () => void
  assignDraft?: AssignmentDraft
  onAssignChange: (d: AssignmentDraft) => void
  onSaveAssign: () => void
  contentDraft?: string
  onContentChange: (v: string) => void
  onSaveContent: () => void
  imageForm: { url: string; alt: string; caption: string }
  onImageFormChange: (v: { url: string; alt: string; caption: string }) => void
  onAddImage: () => void
  onRemoveImage: (id: string) => void
  videoNewForm: { title: string; url: string; description: string }
  onVideoNewFormChange: (v: { title: string; url: string; description: string }) => void
  onAddVideo: () => void
  onDeleteVideo: (videoId: string) => void
  saving: boolean
}) {
  const initQuiz = (): QuizDraft => ({
    title: week.quiz?.title ?? '',
    passMark: week.quiz?.passMark ?? 70,
    attemptLimit: week.quiz?.attemptLimit ?? 1,
    questions: week.quiz?.questions.map(q => ({
      prompt: q.prompt,
      explanation: q.explanation,
      position: q.position,
      options: q.options.map(o => ({ label: o.label, isCorrect: o.isCorrect, position: o.position })),
    })) ?? [],
  })

  const initAssign = (): AssignmentDraft => ({
    title: '', instructions: '', deadline: '', allowTextSubmission: true, allowFileUpload: false, choices: [],
  })

  function addQuestion(draft: QuizDraft) {
    const pos = draft.questions.length + 1
    onQuizChange({ ...draft, questions: [...draft.questions, { prompt: '', explanation: '', position: pos, options: [{ label: '', isCorrect: true, position: 1 }, { label: '', isCorrect: false, position: 2 }] }] })
  }

  function addOption(draft: QuizDraft, qIdx: number) {
    const questions = draft.questions.map((q, i) => {
      if (i !== qIdx) return q
      const pos = q.options.length + 1
      return { ...q, options: [...q.options, { label: '', isCorrect: false, position: pos }] }
    })
    onQuizChange({ ...draft, questions })
  }

  function addChoice(draft: AssignmentDraft) {
    const pos = draft.choices.length + 1
    onAssignChange({ ...draft, choices: [...draft.choices, { title: '', description: '', position: pos }] })
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <div>
          <span className="text-xs font-mono text-white/35 mr-3">{unit} {week.number}</span>
          <span className="text-sm font-medium text-white">{week.title}</span>
          <span className="ml-3 text-xs text-white/35">{week.difficulty} · {week.durationLabel}</span>
        </div>
        <div className="flex items-center gap-3">
          {!locked && (
            <button onClick={e => { e.stopPropagation(); onDelete() }} className="text-white/25 hover:text-red-400 transition-colors p-1">
              <Trash2 size={13} />
            </button>
          )}
          {expanded ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-5 border-t border-white/8 pt-5">
          {/* Topics & Objectives */}
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-white/35 mb-2">Topics</p>
              {week.topics.length === 0 ? <p className="text-white/25">None</p> : (
                <ul className="space-y-1">{week.topics.map(t => <li key={t.id} className="text-white/65">· {t.title}</li>)}</ul>
              )}
            </div>
            <div>
              <p className="text-xs text-white/35 mb-2">Objectives</p>
              {week.objectives.length === 0 ? <p className="text-white/25">None</p> : (
                <ul className="space-y-1">{week.objectives.map(o => <li key={o.id} className="text-white/65">· {o.body}</li>)}</ul>
              )}
            </div>
          </div>

          {/* Lesson Content */}
          <div className="rounded-xl border border-white/8 bg-black/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white flex items-center gap-2"><BookOpen size={14} /> Lesson Content</p>
              {!locked && contentDraft === undefined && (
                <button onClick={() => onContentChange(week.lessonContent ?? '')} className="text-xs text-[#F5C518]">
                  {week.lessonContent ? 'Edit content' : '+ Add content'}
                </button>
              )}
            </div>

            {contentDraft === undefined && (
              week.lessonContent
                ? <p className="text-xs text-white/40 line-clamp-3 whitespace-pre-line">{week.lessonContent}</p>
                : <p className="text-sm text-white/30">No lesson content yet.</p>
            )}

            {contentDraft !== undefined && (
              <div className="space-y-3">
                <p className="text-xs text-white/40">Write the lesson body. Supports plain text with line breaks. Use **bold**, *italic*, and [link text](url) for basic formatting.</p>
                <textarea
                  value={contentDraft}
                  onChange={e => onContentChange(e.target.value)}
                  rows={12}
                  placeholder="Write your lesson content here. You can include explanations, examples, and context for learners..."
                  className="w-full rounded-xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white/85 placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 leading-relaxed resize-y"
                />
                <div className="flex gap-3">
                  <button onClick={onSaveContent} disabled={saving} className="rounded-full bg-[#F5C518] px-4 py-1.5 text-xs font-semibold text-[#0A0A0A] disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save content'}
                  </button>
                  <button onClick={() => onContentChange(undefined as any)} className="text-xs text-white/30 hover:text-white/60">Discard</button>
                </div>
              </div>
            )}
          </div>

          {/* Images */}
          <div className="rounded-xl border border-white/8 bg-black/20 p-4 space-y-3">
            <p className="text-sm font-medium text-white flex items-center gap-2"><Image size={14} /> Lesson Images</p>

            {week.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {week.images.map(img => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden border border-white/10">
                    <img src={img.url} alt={img.alt ?? ''} className="w-full h-28 object-cover bg-white/5" />
                    {img.caption && (
                      <p className="px-2 py-1 text-xs text-white/50 bg-black/60">{img.caption}</p>
                    )}
                    {!locked && (
                      <button
                        onClick={() => onRemoveImage(img.id)}
                        className="absolute top-1 right-1 rounded-full bg-black/70 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-red-400"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!locked && (
              <div className="rounded-xl border border-white/8 bg-black/20 p-3 space-y-2">
                <p className="text-xs text-white/40">Add image by URL</p>
                <input
                  value={imageForm.url}
                  onChange={e => onImageFormChange({ ...imageForm, url: e.target.value })}
                  placeholder="https://example.com/image.png"
                  className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]/40"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={imageForm.alt}
                    onChange={e => onImageFormChange({ ...imageForm, alt: e.target.value })}
                    placeholder="Alt text (accessibility)"
                    className="rounded-xl border border-white/12 bg-black/30 px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                  <input
                    value={imageForm.caption}
                    onChange={e => onImageFormChange({ ...imageForm, caption: e.target.value })}
                    placeholder="Caption (optional)"
                    className="rounded-xl border border-white/12 bg-black/30 px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <button onClick={onAddImage} disabled={!imageForm.url || saving} className="rounded-full bg-white/10 px-4 py-1.5 text-xs text-white hover:bg-white/15 disabled:opacity-40 transition-colors">
                  Add image
                </button>
              </div>
            )}
          </div>

          {/* Module assignment */}
          {modules.length > 0 && (
            <div className="rounded-xl border border-white/8 bg-black/20 p-4 space-y-2">
              <p className="text-sm font-medium text-white">Module</p>
              <select
                disabled={locked}
                value={week.moduleId ?? ''}
                onChange={e => onAssignModule(e.target.value || null)}
                className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none [color-scheme:dark] disabled:opacity-50"
              >
                <option value="">— Unassigned —</option>
                {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
          )}

          {/* Videos (multiple) */}
          <div className="rounded-xl border border-white/8 bg-black/20 p-4 space-y-3">
            <p className="text-sm font-medium text-white flex items-center gap-2"><Video size={14} /> Videos</p>
            {week.videos.length === 0 && <p className="text-xs text-white/30">No videos added yet.</p>}
            {week.videos.map((v, i) => (
              <div key={v.id} className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs text-white/35">Video {i + 1}</p>
                    <VideoSourceBadge url={v.url} />
                  </div>
                  <p className="text-sm font-medium text-white truncate">{v.title}</p>
                  <a href={v.url} target="_blank" rel="noreferrer" className="text-xs text-[#F5C518] hover:underline break-all">{v.url}</a>
                  {v.description && <p className="text-xs text-white/35 mt-0.5">{v.description}</p>}
                </div>
                {!locked && (
                  <button onClick={() => onDeleteVideo(v.id)} className="text-white/25 hover:text-red-400 transition-colors shrink-0 p-1">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
            {!locked && (
              <div className="space-y-2 pt-2 border-t border-white/8">
                <p className="text-xs text-white/40">Add video</p>
                <input
                  value={videoNewForm.title}
                  onChange={e => onVideoNewFormChange({ ...videoNewForm, title: e.target.value })}
                  placeholder="Video title (e.g. Consensus Mechanisms: PoW & PoS)"
                  className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]/40"
                />
                <input
                  value={videoNewForm.url}
                  onChange={e => onVideoNewFormChange({ ...videoNewForm, url: e.target.value })}
                  placeholder="Video URL (YouTube, Vimeo, Loom, etc.)"
                  className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]/40"
                />
                <input
                  value={videoNewForm.description}
                  onChange={e => onVideoNewFormChange({ ...videoNewForm, description: e.target.value })}
                  placeholder="Brief description (optional)"
                  className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]/40"
                />
                <button
                  onClick={onAddVideo}
                  disabled={!videoNewForm.title.trim() || !videoNewForm.url.trim() || saving}
                  className="rounded-full bg-white/10 px-4 py-2 text-xs text-white hover:bg-white/15 disabled:opacity-40 transition-colors"
                >
                  Add video
                </button>
              </div>
            )}
          </div>

          {/* Quiz section */}
          <div className="rounded-xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-white">Quiz</p>
              {!locked && !quizDraft && (
                <button onClick={() => onQuizChange(initQuiz())} className="text-xs text-[#F5C518]">
                  {week.quiz ? 'Edit quiz' : '+ Add quiz'}
                </button>
              )}
            </div>

            {!quizDraft && week.quiz && (
              <p className="text-sm text-white/60">"{week.quiz.title}" — {week.quiz.questions.length} question{week.quiz.questions.length !== 1 ? 's' : ''}, pass mark {week.quiz.passMark}%</p>
            )}
            {!quizDraft && !week.quiz && <p className="text-sm text-white/30">No quiz added yet.</p>}

            {quizDraft && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="md:col-span-1">
                    <label className="block text-xs text-white/40 mb-1">Quiz title</label>
                    <input value={quizDraft.title} onChange={e => onQuizChange({ ...quizDraft, title: e.target.value })}
                      className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Pass mark (%)</label>
                    <input type="number" value={quizDraft.passMark} min={1} max={100} onChange={e => onQuizChange({ ...quizDraft, passMark: +e.target.value })}
                      className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Attempt limit</label>
                    <input type="number" value={quizDraft.attemptLimit} min={1} max={10} onChange={e => onQuizChange({ ...quizDraft, attemptLimit: +e.target.value })}
                      className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                </div>

                {quizDraft.questions.map((q, qi) => (
                  <div key={qi} className="rounded-xl border border-white/8 bg-black/20 p-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/35 w-6">Q{qi + 1}</span>
                      <input value={q.prompt} onChange={e => {
                        const qs = quizDraft.questions.map((x, i) => i === qi ? { ...x, prompt: e.target.value } : x)
                        onQuizChange({ ...quizDraft, questions: qs })
                      }} placeholder="Question prompt" className="flex-1 rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none" />
                      <button onClick={() => onQuizChange({ ...quizDraft, questions: quizDraft.questions.filter((_, i) => i !== qi) })} className="text-white/25 hover:text-red-400">
                        <X size={13} />
                      </button>
                    </div>
                    <input value={q.explanation} onChange={e => {
                      const qs = quizDraft.questions.map((x, i) => i === qi ? { ...x, explanation: e.target.value } : x)
                      onQuizChange({ ...quizDraft, questions: qs })
                    }} placeholder="Explanation (shown after submission)" className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-xs text-white/60 focus:outline-none" />
                    <div className="space-y-2 pl-6">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input type="radio" name={`correct-${qi}`} checked={opt.isCorrect}
                            onChange={() => {
                              const qs = quizDraft.questions.map((x, i) => i === qi
                                ? { ...x, options: x.options.map((o, j) => ({ ...o, isCorrect: j === oi })) }
                                : x)
                              onQuizChange({ ...quizDraft, questions: qs })
                            }} className="accent-[#F5C518]" />
                          <input value={opt.label} onChange={e => {
                            const qs = quizDraft.questions.map((x, i) => i === qi
                              ? { ...x, options: x.options.map((o, j) => j === oi ? { ...o, label: e.target.value } : o) }
                              : x)
                            onQuizChange({ ...quizDraft, questions: qs })
                          }} placeholder={`Option ${oi + 1}`} className="flex-1 rounded-xl border border-white/12 bg-black/30 px-3 py-1.5 text-sm text-white focus:outline-none" />
                          <button onClick={() => {
                            const qs = quizDraft.questions.map((x, i) => i === qi ? { ...x, options: x.options.filter((_, j) => j !== oi) } : x)
                            onQuizChange({ ...quizDraft, questions: qs })
                          }} className="text-white/20 hover:text-red-400"><X size={11} /></button>
                        </div>
                      ))}
                      <button onClick={() => addOption(quizDraft, qi)} className="text-xs text-white/35 hover:text-white/60">+ option</button>
                    </div>
                  </div>
                ))}

                <div className="flex gap-3">
                  <button onClick={() => addQuestion(quizDraft)} className="text-xs text-white/50 hover:text-white">+ Add question</button>
                  <button onClick={onSaveQuiz} disabled={saving} className="rounded-full bg-[#F5C518] px-4 py-1.5 text-xs font-semibold text-[#0A0A0A] disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save quiz'}
                  </button>
                  <button onClick={() => onQuizChange(undefined as any)} className="text-xs text-white/30 hover:text-white/60">Discard</button>
                </div>
              </div>
            )}
          </div>

          {/* Assignments section */}
          <div className="rounded-xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-white">Assignments ({week.assignments.length})</p>
              {!locked && !assignDraft && (
                <button onClick={() => onAssignChange(initAssign())} className="text-xs text-[#F5C518]">+ Add assignment</button>
              )}
            </div>

            {week.assignments.length > 0 && !assignDraft && (
              <ul className="space-y-1 mb-3">
                {week.assignments.map(a => (
                  <li key={a.id} className="text-sm text-white/60">· {a.title}</li>
                ))}
              </ul>
            )}

            {assignDraft && (
              <div className="space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Title</label>
                    <input value={assignDraft.title} onChange={e => onAssignChange({ ...assignDraft, title: e.target.value })}
                      className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Deadline</label>
                    <input type="datetime-local" value={assignDraft.deadline} onChange={e => onAssignChange({ ...assignDraft, deadline: e.target.value })}
                      className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Instructions</label>
                  <textarea value={assignDraft.instructions} onChange={e => onAssignChange({ ...assignDraft, instructions: e.target.value })} rows={3}
                    className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none" />
                </div>
                <div className="flex gap-4 text-sm">
                  <label className="flex items-center gap-2 text-white/60 cursor-pointer">
                    <input type="checkbox" checked={assignDraft.allowTextSubmission} onChange={e => onAssignChange({ ...assignDraft, allowTextSubmission: e.target.checked })} className="accent-[#F5C518]" />
                    Text submission
                  </label>
                  <label className="flex items-center gap-2 text-white/60 cursor-pointer">
                    <input type="checkbox" checked={assignDraft.allowFileUpload} onChange={e => onAssignChange({ ...assignDraft, allowFileUpload: e.target.checked })} className="accent-[#F5C518]" />
                    File upload
                  </label>
                </div>

                {assignDraft.choices.length > 0 && (
                  <div className="space-y-2">
                    {assignDraft.choices.map((c, ci) => (
                      <div key={ci} className="flex gap-2">
                        <input value={c.title} onChange={e => {
                          const choices = assignDraft.choices.map((x, i) => i === ci ? { ...x, title: e.target.value } : x)
                          onAssignChange({ ...assignDraft, choices })
                        }} placeholder="Choice title" className="flex-1 rounded-xl border border-white/12 bg-black/30 px-3 py-1.5 text-sm text-white focus:outline-none" />
                        <button onClick={() => onAssignChange({ ...assignDraft, choices: assignDraft.choices.filter((_, i) => i !== ci) })} className="text-white/25 hover:text-red-400">
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => addChoice(assignDraft)} className="text-xs text-white/50 hover:text-white">+ Add choice</button>
                  <button onClick={onSaveAssign} disabled={saving} className="rounded-full bg-[#F5C518] px-4 py-1.5 text-xs font-semibold text-[#0A0A0A] disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save assignment'}
                  </button>
                  <button onClick={() => onAssignChange(undefined as any)} className="text-xs text-white/30 hover:text-white/60">Discard</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
