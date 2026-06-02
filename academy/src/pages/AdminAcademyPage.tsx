import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Key,
  Loader2,
  MessageSquare,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react'
import AcademyNavbar from '../components/AcademyNavbar'
import { apiRequest } from '../lib/api'
import { getStoredAuth } from '../lib/auth'
import type { AdminCourse, AdminLearnerProgress, AdminSubmission, CourseStatus } from '../types/academy'

const STATUS_COLORS: Record<CourseStatus, string> = {
  DRAFT:          'border-white/15 text-white/45',
  PENDING_REVIEW: 'border-amber-400/40 text-amber-300',
  APPROVED:       'border-emerald-400/40 text-emerald-300',
  REJECTED:       'border-red-400/40 text-red-300',
}

type Tab = 'courses' | 'progress' | 'submissions' | 'enrollments'

type CourseEnrollment = {
  id: string
  enrolledAt: string
  user: {
    id: string
    email: string
    name: string | null
    createdAt: string
    profile: {
      country: string | null
      experienceLevel: string | null
    } | null
  }
}

function StatCard({ icon: Icon, label, value, sub }: {
  icon: typeof BookOpen
  label: string
  value: number | string
  sub?: string
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-5 flex gap-4 items-start">
      <div className="w-10 h-10 rounded-full bg-[#F5C518]/12 border border-[#F5C518]/20 flex items-center justify-center text-[#F5C518] shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-1">{label}</p>
        <p className="font-display text-2xl font-extrabold text-white">{value}</p>
        {sub && <p className="text-xs text-white/35 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function AdminAcademyPage() {
  const [activeTab, setActiveTab] = useState<Tab>('courses')
  const [progress, setProgress] = useState<AdminLearnerProgress>([])
  const [submissions, setSubmissions] = useState<AdminSubmission>([])
  const [courses, setCourses] = useState<AdminCourse[]>([])
  const [enrollments, setEnrollments] = useState<Record<string, CourseEnrollment[]>>({})
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [loadingEnrollments, setLoadingEnrollments] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({})
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<'ALL' | 'SUBMITTED' | 'REVIEWED'>('ALL')
  const [submissionCourseFilter, setSubmissionCourseFilter] = useState<string>('ALL')
  const [deletingFeedbackId, setDeletingFeedbackId] = useState<string | null>(null)
  const [savingFeedbackId, setSavingFeedbackId] = useState<string | null>(null)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState({
    title: '', slug: '', description: '',
  })

  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [changingPassword, setChangingPassword] = useState(false)

  const auth = getStoredAuth()

  async function loadAdminData() {
    const [progressData, submissionData, coursesData] = await Promise.all([
      apiRequest<AdminLearnerProgress>('/academy/admin/learners/progress'),
      apiRequest<AdminSubmission>('/academy/admin/assignments/submissions'),
      apiRequest<AdminCourse[]>('/academy/admin/courses'),
    ])
    setProgress(progressData)
    setSubmissions(submissionData)
    setCourses(coursesData)
  }

  useEffect(() => {
    if (!auth) { window.location.href = '/login'; return }
    if (auth.user.role !== 'ADMIN' && auth.user.role !== 'SUPER_ADMIN') {
      window.location.href = '/dashboard'; return
    }
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        await loadAdminData()
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load admin data.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])

  const groupedProgress = useMemo(() => {
    const map = new Map<string, AdminLearnerProgress>()
    for (const item of progress) {
      const key = `${item.week.number}-${item.week.slug}`
      const existing = map.get(key) || []
      existing.push(item)
      map.set(key, existing)
    }
    return Array.from(map.entries())
  }, [progress])

  const pendingSubmissions = useMemo(
    () => submissions.filter(s => s.status === 'SUBMITTED'),
    [submissions]
  )

  const completedLearners = useMemo(
    () => new Set(progress.filter(p => p.status === 'COMPLETE').map(p => p.user.id)).size,
    [progress]
  )

  async function submitFeedback(event: FormEvent<HTMLFormElement>, submissionId: string) {
    event.preventDefault()
    const feedback = feedbackDrafts[submissionId]?.trim()
    if (!feedback) return
    try {
      setSavingFeedbackId(submissionId)
      await apiRequest(`/academy/admin/assignments/submissions/${submissionId}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ feedback }),
      })
      setFeedbackDrafts(current => ({ ...current, [submissionId]: '' }))
      await loadAdminData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save feedback.')
    } finally {
      setSavingFeedbackId(null)
    }
  }

  async function deleteFeedback(submissionId: string, feedbackId: string) {
    if (!confirm('Delete this feedback? The learner will no longer see it. If this was the only feedback, the submission will move back to "Pending review".')) return
    try {
      setDeletingFeedbackId(feedbackId)
      setError(null)
      await apiRequest(`/academy/admin/assignments/submissions/${submissionId}/feedback/${feedbackId}`, {
        method: 'DELETE',
      })
      await loadAdminData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete feedback.')
    } finally {
      setDeletingFeedbackId(null)
    }
  }

  async function loadEnrollments(courseId: string) {
    if (enrollments[courseId]) {
      setSelectedCourseId(courseId)
      return
    }
    setLoadingEnrollments(true)
    setError(null)
    try {
      const data = await apiRequest<CourseEnrollment[]>(`/academy/admin/courses/${courseId}/enrollments`)
      setEnrollments(prev => ({ ...prev, [courseId]: data }))
      setSelectedCourseId(courseId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load enrollments.')
    } finally {
      setLoadingEnrollments(false)
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setChangingPassword(true)
    setError(null)
    try {
      await apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })
      setShowPasswordChange(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password.')
    } finally {
      setChangingPassword(false)
    }
  }

  async function createCourse(e: FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const course = await apiRequest<AdminCourse>('/academy/admin/courses', {
        method: 'POST',
        body: JSON.stringify(createForm),
      })
      // POST /admin/courses returns the raw course row without facilitators/weekCount.
      // Normalize so list-rendering code (which expects these fields) doesn't crash.
      const normalized: AdminCourse = {
        ...course,
        facilitators: course.facilitators ?? [],
        weekCount: course.weekCount ?? 0,
      }
      setCourses(prev => [normalized, ...prev])
      setShowCreateForm(false)
      setCreateForm({ title: '', slug: '', description: '' })
      window.location.href = `/admin/courses/${course.id}`
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course.')
    } finally {
      setCreating(false)
    }
  }

  async function deleteCourse(courseId: string, courseTitle: string) {
    if (!confirm(`Delete "${courseTitle}"? This action cannot be undone.`)) return
    setDeletingId(courseId)
    setError(null)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}`, { method: 'DELETE' })
      setCourses(prev => prev.filter(c => c.id !== courseId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course.')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <AcademyNavbar solid />
        <div className="pt-32 flex flex-col items-center justify-center text-center px-6">
          <Loader2 className="animate-spin text-[#F5C518] mb-4" size={28} />
          <p className="text-white/60">Loading your dashboard…</p>
        </div>
      </div>
    )
  }

  const TABS: Array<{ id: Tab; label: string; icon: typeof BookOpen; count: number; highlight?: boolean }> = [
    { id: 'courses',     label: 'My Courses',      icon: BookOpen,       count: courses.length },
    { id: 'enrollments', label: 'Enrollments',     icon: Users,          count: selectedCourseId && enrollments[selectedCourseId] ? enrollments[selectedCourseId].length : 0 },
    { id: 'submissions', label: 'Submissions',      icon: ClipboardList,  count: submissions.length, highlight: pendingSubmissions.length > 0 },
    { id: 'progress',    label: 'Learner Progress', icon: Users,          count: progress.length },
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AcademyNavbar solid />

      <main className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#F5C518]/25 bg-[#F5C518]/10 px-4 py-2 text-sm text-[#F5C518] mb-4">
                <ShieldCheck size={15} />
                {auth?.user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Facilitator'} dashboard
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white mb-2">
                Welcome back{auth?.user.name ? `, ${auth.user.name.split(' ')[0]}` : ''}.
              </h1>
              <p className="text-white/45">
                Build courses, review submissions, and track your learners' progress.
              </p>
            </div>
            <button
              onClick={() => setShowPasswordChange(true)}
              className="shrink-0 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white/60 hover:border-white/30 hover:text-white transition-colors"
            >
              <Key size={14} />
              Change password
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={BookOpen}      label="Courses"            value={courses.length}         sub={`${courses.filter(c => c.status === 'APPROVED').length} published`} />
            <StatCard icon={Users}         label="Learner records"    value={progress.length}        sub={`${completedLearners} with completions`} />
            <StatCard icon={ClipboardList} label="Submissions"        value={submissions.length}     sub={`${pendingSubmissions.length} pending review`} />
            <StatCard icon={MessageSquare} label="Content units taught" value={new Set(progress.map(p => p.week.id)).size} />
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100 flex items-center justify-between">
              {error}
              <button onClick={() => setError(null)} className="ml-4 text-red-200/50 hover:text-red-100">✕</button>
            </div>
          )}

          {/* Tab nav */}
          <div className="flex gap-1 mb-6 border-b border-white/10 overflow-x-auto">
            {TABS.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors relative ${
                    isActive
                      ? 'border-[#F5C518] text-[#F5C518]'
                      : 'border-transparent text-white/40 hover:text-white/70'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    isActive
                      ? 'bg-[#F5C518]/20'
                      : tab.highlight
                        ? 'bg-amber-400/20 text-amber-300'
                        : 'bg-white/8'
                  }`}>
                    {tab.count}
                  </span>
                  {/* Pulsing dot when there's something needing attention */}
                  {tab.highlight && !isActive && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </button>
              )
            })}
          </div>

          {/* ── Courses tab ──────────────────────────────────────────────────── */}
          {activeTab === 'courses' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-white/45">{courses.length} course{courses.length !== 1 ? 's' : ''}</p>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#F5C518] px-5 py-2.5 text-sm font-semibold text-[#0A0A0A] hover:bg-[#E8B800] transition-colors"
                >
                  <Plus size={14} /> New course
                </button>
              </div>

              {showCreateForm && (
                <form onSubmit={createCourse} className="mb-6 rounded-[24px] border border-[#F5C518]/20 bg-[#F5C518]/5 p-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[#F5C518]">Create new course</h3>
                    <p className="text-xs text-white/40 mt-1">Just the essentials — you'll fill in the rest (level, duration, intro video, etc.) in the course builder.</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { key: 'title', label: 'Title *', required: true, placeholder: 'Blockchain for Social Impact' },
                      { key: 'slug',  label: 'Slug * (lowercase, hyphens only)', required: true, placeholder: 'blockchain-social-impact' },
                    ].map(({ key, label, required, placeholder }) => (
                      <div key={key}>
                        <label className="block text-xs text-white/40 mb-1">{label}</label>
                        <input
                          value={createForm[key as keyof typeof createForm]}
                          onChange={e => {
                            const val = key === 'slug'
                              ? e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                              : e.target.value
                            setCreateForm(p => ({ ...p, [key]: val }))
                          }}
                          required={required}
                          placeholder={placeholder}
                          className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]/40"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Description * (min 10 characters)</label>
                    <textarea
                      value={createForm.description}
                      onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))}
                      required
                      minLength={10}
                      rows={3}
                      placeholder="A short description of what learners will gain..."
                      className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]/40"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={creating} className="rounded-full bg-[#F5C518] px-5 py-2.5 text-sm font-semibold text-[#0A0A0A] disabled:opacity-50">
                      {creating ? 'Creating…' : 'Create & open builder'}
                    </button>
                    <button type="button" onClick={() => setShowCreateForm(false)} className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/50 hover:border-white/20">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {courses.length === 0 ? (
                <div className="rounded-[24px] border border-white/8 bg-white/[0.02] p-14 text-center">
                  <BookOpen size={32} className="text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 mb-4">No courses yet. Create your first one.</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#F5C518] px-5 py-2.5 text-sm font-semibold text-[#0A0A0A]"
                  >
                    <Plus size={14} /> New course
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {courses.map(course => {
                    // SUPER_ADMIN can delete any course; regular admins only their drafts/rejected
                    const isSuperAdmin = auth?.user.role === 'SUPER_ADMIN'
                    const canDelete = isSuperAdmin || course.status === 'DRAFT' || course.status === 'REJECTED'
                    const facilitators = course.facilitators ?? []
                    const weekCount = course.weekCount ?? 0
                    const contentUnit = course.contentUnit ?? 'lesson'
                    return (
                      <div
                        key={course.id}
                        className="relative rounded-[24px] border border-white/10 bg-white/[0.04] p-5 hover:border-white/25 transition-colors group flex flex-col gap-3"
                      >
                        <a
                          href={`/admin/courses/${course.id}`}
                          className="absolute inset-0 rounded-[24px]"
                          aria-label={`Open ${course.title}`}
                        />
                        <div className="relative flex items-start justify-between gap-3 pointer-events-none">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-mono ${STATUS_COLORS[course.status]}`}>
                            {course.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-white/30">{weekCount} {contentUnit.toLowerCase()}{weekCount !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="relative pointer-events-none">
                          <h3 className="font-semibold text-white group-hover:text-[#F5C518] transition-colors mb-0.5">{course.title}</h3>
                          <p className="text-xs text-white/30">/{course.slug}</p>
                        </div>
                        {facilitators.length > 0 && (
                          <div className="relative flex flex-wrap gap-1 pointer-events-none">
                            {facilitators.slice(0, 3).map(f => (
                              <span key={f.id} className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs text-white/50">{f.name}</span>
                            ))}
                            {facilitators.length > 3 && (
                              <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs text-white/30">+{facilitators.length - 3}</span>
                            )}
                          </div>
                        )}
                        {course.status === 'REJECTED' && course.approvalNotes && (
                          <p className="relative text-xs text-red-300/70 line-clamp-2 border border-red-400/15 bg-red-400/5 rounded-xl px-3 py-2 pointer-events-none">
                            {course.approvalNotes}
                          </p>
                        )}
                        {course.status === 'PENDING_REVIEW' && (
                          <p className="relative text-xs text-amber-300/70 border border-amber-400/15 bg-amber-400/5 rounded-xl px-3 py-2 pointer-events-none">
                            Awaiting super admin review
                          </p>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              deleteCourse(course.id, course.title)
                            }}
                            disabled={deletingId === course.id}
                            title="Delete course"
                            className="absolute top-3 right-3 z-10 inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/40 border border-white/10 text-white/50 hover:text-red-400 hover:border-red-400/40 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          >
                            {deletingId === course.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Enrollments tab ──────────────────────────────────────────────── */}
          {activeTab === 'enrollments' && (
            <div>
              <div className="mb-6">
                <p className="text-sm text-white/50 mb-3">Select a course to view enrollments:</p>
                <div className="flex flex-wrap gap-2">
                  {courses.map(course => (
                    <button
                      key={course.id}
                      onClick={() => loadEnrollments(course.id)}
                      className={`rounded-full px-4 py-2 text-sm transition-colors border ${
                        selectedCourseId === course.id
                          ? 'border-[#F5C518] bg-[#F5C518]/10 text-[#F5C518]'
                          : 'border-white/15 text-white/60 hover:border-white/30'
                      }`}
                    >
                      {course.title}
                    </button>
                  ))}
                </div>
              </div>

              {selectedCourseId ? (
                <div>
                  {loadingEnrollments ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="animate-spin text-[#F5C518]" size={24} />
                    </div>
                  ) : enrollments[selectedCourseId]?.length === 0 ? (
                    <div className="rounded-[24px] border border-white/8 bg-white/[0.02] p-12 text-center">
                      <Users size={28} className="text-white/20 mx-auto mb-3" />
                      <p className="text-white/40">No enrollments yet.</p>
                    </div>
                  ) : (
                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] overflow-hidden">
                      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/8 text-[10px] font-mono uppercase tracking-widest text-white/25">
                        <span>Learner</span>
                        <span>Experience</span>
                        <span>Enrolled</span>
                        <span>Joined</span>
                      </div>
                      {enrollments[selectedCourseId]?.map(enrollment => {
                        const initials = (enrollment.user.name || enrollment.user.email).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                        return (
                          <div key={enrollment.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-[#F5C518]/12 border border-[#F5C518]/20 flex items-center justify-center text-[#F5C518] text-xs font-extrabold shrink-0">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">{enrollment.user.name || '—'}</p>
                                <p className="text-xs text-white/35 truncate">{enrollment.user.email}</p>
                              </div>
                            </div>
                            <span className="text-xs text-white/40">{enrollment.user.profile?.experienceLevel || '—'}</span>
                            <span className="text-xs text-white/30 shrink-0">
                              {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-white/25 shrink-0">
                              {new Date(enrollment.user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-[24px] border border-white/8 bg-white/[0.02] p-12 text-center">
                  <Users size={28} className="text-white/20 mx-auto mb-3" />
                  <p className="text-white/40">Select a course to view its enrollments.</p>
                </div>
              )}
            </div>
          )}

          {/* ── Submissions tab ──────────────────────────────────────────────── */}
          {activeTab === 'submissions' && (() => {
            // Build the unique course list from the loaded submissions (only the courses
            // this facilitator actually has student work in show up as filter chips).
            const courseSet = new Map<string, string>()
            for (const s of submissions) {
              const c = s.assignment.week.course
              if (c) courseSet.set(c.id, c.title)
            }
            const courseOptions = Array.from(courseSet.entries()).map(([id, title]) => ({ id, title }))

            const filtered = submissions.filter(s => {
              if (submissionStatusFilter !== 'ALL' && s.status !== submissionStatusFilter) return false
              if (submissionCourseFilter !== 'ALL' && s.assignment.week.course?.id !== submissionCourseFilter) return false
              return true
            })

            return (
              <div className="space-y-5">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex gap-1.5">
                    {(['ALL', 'SUBMITTED', 'REVIEWED'] as const).map(s => {
                      const count = s === 'ALL'
                        ? submissions.length
                        : submissions.filter(x => x.status === s).length
                      return (
                        <button
                          key={s}
                          onClick={() => setSubmissionStatusFilter(s)}
                          className={`rounded-full px-4 py-1.5 text-sm transition-colors border ${
                            submissionStatusFilter === s
                              ? 'border-[#F5C518] bg-[#F5C518]/10 text-[#F5C518]'
                              : 'border-white/15 text-white/60 hover:border-white/30'
                          }`}
                        >
                          {s === 'ALL' ? 'All' : s === 'SUBMITTED' ? 'Pending' : 'Reviewed'}
                          <span className="ml-1.5 text-xs opacity-60">{count}</span>
                        </button>
                      )
                    })}
                  </div>

                  {courseOptions.length > 1 && (
                    <select
                      value={submissionCourseFilter}
                      onChange={e => setSubmissionCourseFilter(e.target.value)}
                      className="rounded-full border border-white/15 bg-black/30 px-4 py-1.5 text-sm text-white/70 focus:outline-none focus:border-white/30 [color-scheme:dark]"
                    >
                      <option value="ALL">All courses</option>
                      {courseOptions.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  )}
                </div>

                {pendingSubmissions.length > 0 && submissionStatusFilter !== 'SUBMITTED' && (
                  <div className="rounded-2xl border border-amber-400/15 bg-amber-400/5 px-5 py-3 text-sm text-amber-300 flex items-center justify-between gap-3">
                    <span>
                      {pendingSubmissions.length} submission{pendingSubmissions.length !== 1 ? 's' : ''} waiting for your feedback
                    </span>
                    <button
                      onClick={() => setSubmissionStatusFilter('SUBMITTED')}
                      className="text-xs underline hover:text-amber-200"
                    >
                      Show pending only
                    </button>
                  </div>
                )}

                {submissions.length === 0 ? (
                  <div className="rounded-[24px] border border-white/8 bg-white/[0.02] p-12 text-center">
                    <ClipboardList size={28} className="text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 mb-1">No submissions for your courses yet.</p>
                    <p className="text-xs text-white/30">When a learner submits an assignment in one of your courses, it'll appear here.</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="rounded-[24px] border border-white/8 bg-white/[0.02] p-12 text-center">
                    <ClipboardList size={28} className="text-white/20 mx-auto mb-3" />
                    <p className="text-white/40">No submissions match the current filters.</p>
                    <button
                      onClick={() => { setSubmissionStatusFilter('ALL'); setSubmissionCourseFilter('ALL') }}
                      className="mt-3 text-xs text-[#F5C518] hover:text-[#E8B800] underline"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : filtered.map(submission => (
                  <div key={submission.id} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {submission.assignment.week.course && (
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#F5C518]/80 rounded-full bg-[#F5C518]/8 border border-[#F5C518]/15 px-2 py-0.5">
                              {submission.assignment.week.course.title}
                            </span>
                          )}
                          <span className="text-xs font-mono text-white/30">Week {submission.assignment.week.number}</span>
                          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-mono ${
                            submission.status === 'SUBMITTED'
                              ? 'border-amber-400/30 text-amber-300 bg-amber-400/8'
                              : submission.status === 'REVIEWED'
                                ? 'border-emerald-400/30 text-emerald-300'
                                : 'border-white/15 text-white/40'
                          }`}>
                            {submission.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-0.5">{submission.assignment.title}</h3>
                        <p className="text-sm text-white/40">
                          {submission.user.name || submission.user.email} · {submission.assignment.week.title}
                        </p>
                      </div>
                      <p className="text-xs text-white/30 whitespace-nowrap">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>

                    {submission.choice && (
                      <div className="mb-3 rounded-xl border border-[#F5C518]/15 bg-[#F5C518]/8 px-4 py-2.5">
                        <p className="text-xs text-[#F5C518]/60 mb-0.5">Selected option</p>
                        <p className="text-sm font-medium text-[#F5C518]">{submission.choice.title}</p>
                      </div>
                    )}

                    {submission.textResponse && (
                      <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-relaxed text-white/65 mb-4 whitespace-pre-line">
                        {submission.textResponse}
                      </div>
                    )}

                    {submission.attachmentUrl && (
                      <a
                        href={submission.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 mb-4 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-xs text-white/70 hover:text-white hover:border-white/25 transition-colors"
                      >
                        📎 {submission.attachmentName || 'Attachment'}
                      </a>
                    )}

                    {submission.feedback.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {submission.feedback.map(fb => {
                          const isMine = fb.reviewer.id === auth?.user.id
                          const canDelete = isMine || auth?.user.role === 'SUPER_ADMIN'
                          return (
                            <div key={fb.id} className="rounded-2xl border border-teal-400/15 bg-teal-400/10 p-4">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="min-w-0">
                                  <p className="text-xs font-mono uppercase tracking-[0.16em] text-teal-100/60">
                                    {isMine ? 'Your feedback' : `Feedback by ${fb.reviewer.name || fb.reviewer.email}`}
                                  </p>
                                  <p className="text-[10px] text-teal-100/40 mt-0.5">
                                    {new Date(fb.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                {canDelete && (
                                  <button
                                    onClick={() => void deleteFeedback(submission.id, fb.id)}
                                    disabled={deletingFeedbackId === fb.id}
                                    title="Delete this feedback"
                                    className="p-1.5 text-teal-100/40 hover:text-red-400 transition-colors disabled:opacity-40 flex-shrink-0"
                                  >
                                    {deletingFeedbackId === fb.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                  </button>
                                )}
                              </div>
                              <p className="text-sm text-white/75 whitespace-pre-line">{fb.feedback}</p>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    <form onSubmit={e => void submitFeedback(e, submission.id)} className="space-y-3">
                      <textarea
                        value={feedbackDrafts[submission.id] ?? ''}
                        onChange={e => setFeedbackDrafts(cur => ({ ...cur, [submission.id]: e.target.value }))}
                        rows={3}
                        placeholder={submission.feedback.length > 0 ? 'Add additional feedback…' : 'Leave feedback for this learner…'}
                        className="w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#F5C518]/40"
                      />
                      <button
                        type="submit"
                        disabled={savingFeedbackId === submission.id || !feedbackDrafts[submission.id]?.trim()}
                        className="rounded-full bg-[#F5C518] px-5 py-2.5 text-sm font-semibold text-[#0A0A0A] hover:bg-[#E8B800] transition-colors disabled:opacity-40"
                      >
                        {savingFeedbackId === submission.id ? 'Saving…' : 'Save feedback'}
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* ── Learner Progress tab ─────────────────────────────────────────── */}
          {activeTab === 'progress' && (
            <div>
              {groupedProgress.length === 0 ? (
                <div className="rounded-[24px] border border-white/8 bg-white/[0.02] p-12 text-center">
                  <Users size={28} className="text-white/20 mx-auto mb-3" />
                  <p className="text-white/40">No learner activity yet.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {groupedProgress.map(([key, items]) => {
                    const completedCount = items.filter(i => i.status === 'COMPLETE').length
                    const inProgressCount = items.filter(i => i.status === 'IN_PROGRESS').length
                    return (
                      <div key={key} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <p className="text-xs font-mono uppercase tracking-[0.16em] text-white/30 mb-1">
                              Week {items[0].week.number}
                            </p>
                            <h3 className="text-lg font-semibold text-white">{items[0].week.title}</h3>
                          </div>
                          <div className="flex gap-3 text-xs text-right shrink-0">
                            <div>
                              <p className="text-[#F5C518] font-extrabold font-display text-lg">{completedCount}</p>
                              <p className="text-white/30">complete</p>
                            </div>
                            <div>
                              <p className="text-teal-400 font-extrabold font-display text-lg">{inProgressCount}</p>
                              <p className="text-white/30">in progress</p>
                            </div>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="h-1.5 rounded-full bg-white/8 overflow-hidden mb-4">
                          <div
                            className="h-full bg-gradient-to-r from-[#F5C518] to-[#E8B800] rounded-full transition-all"
                            style={{ width: `${items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0}%` }}
                          />
                        </div>

                        <div className="space-y-2">
                          {items.map(item => (
                            <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-black/20 px-4 py-2.5">
                              <div>
                                <p className="text-sm text-white">{item.user.name || item.user.email}</p>
                                <p className="text-xs text-white/30">{item.user.email}</p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                {item.quizSubmitted && (
                                  <CheckCircle2 size={13} className="text-[#F5C518]" aria-label="Quiz done" />
                                )}
                                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-mono ${
                                  item.status === 'COMPLETE'
                                    ? 'border-[#F5C518]/30 text-[#F5C518]'
                                    : item.status === 'IN_PROGRESS'
                                      ? 'border-teal-400/30 text-teal-400'
                                      : 'border-white/12 text-white/40'
                                }`}>
                                  {item.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Password change modal */}
      {showPasswordChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[24px] border border-white/10 bg-[#111] p-6">
            <h2 className="font-display text-xl font-extrabold text-white mb-1">Change password</h2>
            <p className="text-sm text-white/50 mb-5">Update your account password</p>
            <form onSubmit={changePassword} className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 mb-1">Current password *</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                  className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C518]/40"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">New password *</label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                  placeholder="Min. 8 characters"
                  className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C518]/40"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Confirm new password *</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C518]/40"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex-1 rounded-full bg-[#F5C518] px-5 py-3 text-sm font-semibold text-[#0A0A0A] hover:bg-[#E8B800] transition-colors disabled:opacity-50"
                >
                  {changingPassword ? 'Changing…' : 'Change password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordChange(false)
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  }}
                  disabled={changingPassword}
                  className="rounded-full border border-white/10 px-5 py-3 text-sm text-white/60 hover:border-white/20 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
