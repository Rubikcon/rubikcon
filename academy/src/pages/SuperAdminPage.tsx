import { FormEvent, useEffect, useState } from 'react'
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  Users,
  XCircle,
} from 'lucide-react'
import AcademyNavbar from '../components/AcademyNavbar'
import { apiRequest } from '../lib/api'
import { getStoredAuth } from '../lib/auth'
import type { CourseStatus } from '../types/academy'

// ─── Types ────────────────────────────────────────────────────────────────────

type Overview = {
  totalUsers: number
  adminCount: number
  learnerCount: number
  totalEnrollments: number
  totalCourses: number
  coursesByStatus: Record<string, number>
  totalSubmissions: number
  pendingSubmissions: number
  totalWeeks: number
  recentUsers: Array<{ id: string; name: string | null; email: string; role: string; createdAt: string }>
}

type PlatformUser = {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
  _count: { courseEnrollments: number }
  profile: { country: string | null; onboardingCompleted: boolean } | null
}

type SuperAdminCourse = {
  id: string
  title: string
  slug: string
  tagline: string | null
  status: CourseStatus
  submittedAt: string | null
  createdAt: string
  _count: { weeks: number }
  courseFacilitators: Array<{ facilitator: { id: string; name: string; title: string } }>
  createdBy: { id: string; name: string | null; email: string } | null
  approvals: Array<{
    id: string
    action: 'APPROVED' | 'REJECTED'
    notes: string | null
    createdAt: string
    reviewer: { id: string; name: string | null }
  }>
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<CourseStatus, { label: string; color: string }> = {
  DRAFT:          { label: 'Draft',          color: 'border-white/20 text-white/50' },
  PENDING_REVIEW: { label: 'Pending Review', color: 'border-amber-400/40 text-amber-300 bg-amber-400/10' },
  APPROVED:       { label: 'Approved',       color: 'border-emerald-400/40 text-emerald-300 bg-emerald-400/10' },
  REJECTED:       { label: 'Rejected',       color: 'border-red-400/40 text-red-300 bg-red-400/10' },
}

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  USER:        { label: 'Learner',     color: 'text-white/50 border-white/15' },
  ADMIN:       { label: 'Admin',       color: 'text-[#F5C518] border-[#F5C518]/30' },
  SUPER_ADMIN: { label: 'Super Admin', color: 'text-purple-300 border-purple-400/30' },
}

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'PENDING_REVIEW', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'DRAFT', label: 'Draft' },
]

type Tab = 'overview' | 'courses' | 'users'

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-mono uppercase tracking-widest text-white/35 mb-2">{label}</p>
      <p className="font-display text-3xl font-extrabold text-white">{value}</p>
      {sub && <p className="text-xs text-white/35 mt-1">{sub}</p>}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  // Overview
  const [overview, setOverview] = useState<Overview | null>(null)
  const [overviewLoading, setOverviewLoading] = useState(true)

  // Courses
  const [courses, setCourses] = useState<SuperAdminCourse[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('PENDING_REVIEW')
  const [actionCourseId, setActionCourseId] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [actionNotes, setActionNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Users
  const [users, setUsers] = useState<PlatformUser[]>([])
  const [usersTotal, setUsersTotal] = useState(0)
  const [usersLoading, setUsersLoading] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('')
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null)

  // Create admin form
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '' })
  const [creating, setCreating] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const currentAuth = getStoredAuth()

  useEffect(() => {
    if (!currentAuth) { window.location.href = '/login'; return }
    if (currentAuth.user.role !== 'SUPER_ADMIN') { window.location.href = '/dashboard'; return }
    void loadOverview()
  }, [])

  useEffect(() => {
    if (activeTab === 'courses') void loadCourses(statusFilter)
  }, [activeTab, statusFilter])

  useEffect(() => {
    if (activeTab === 'users') void loadUsers()
  }, [activeTab, userSearch, userRoleFilter])

  async function loadOverview() {
    try {
      setOverviewLoading(true)
      const data = await apiRequest<Overview>('/academy/superadmin/overview')
      setOverview(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load overview.')
    } finally {
      setOverviewLoading(false)
    }
  }

  async function loadCourses(filter = statusFilter) {
    try {
      setCoursesLoading(true)
      setError(null)
      const qs = filter ? `?status=${filter}` : ''
      const data = await apiRequest<SuperAdminCourse[]>(`/academy/superadmin/courses${qs}`)
      setCourses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load courses.')
    } finally {
      setCoursesLoading(false)
    }
  }

  async function loadUsers() {
    try {
      setUsersLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (userSearch) params.set('search', userSearch)
      if (userRoleFilter) params.set('role', userRoleFilter)
      const data = await apiRequest<{ users: PlatformUser[]; total: number }>(`/academy/superadmin/users?${params}`)
      setUsers(data.users)
      setUsersTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load users.')
    } finally {
      setUsersLoading(false)
    }
  }

  async function submitAction(e: FormEvent) {
    e.preventDefault()
    if (!actionCourseId || !actionType) return
    setSubmitting(true)
    try {
      await apiRequest(`/academy/superadmin/courses/${actionCourseId}/${actionType}`, {
        method: 'POST',
        body: JSON.stringify({ notes: actionNotes }),
      })
      setActionCourseId(null); setActionType(null); setActionNotes('')
      await loadCourses(statusFilter)
      await loadOverview()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.')
    } finally {
      setSubmitting(false)
    }
  }

  async function createAdmin(e: FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try {
      await apiRequest('/academy/superadmin/users', {
        method: 'POST',
        body: JSON.stringify(createForm),
      })
      setShowCreateAdmin(false)
      setCreateForm({ name: '', email: '', password: '' })
      await loadUsers()
      await loadOverview()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create admin.')
    } finally {
      setCreating(false)
    }
  }

  async function changeRole(userId: string, role: string) {
    setChangingRoleId(userId)
    setError(null)
    try {
      await apiRequest(`/academy/superadmin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      })
      await loadUsers()
      await loadOverview()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change role.')
    } finally {
      setChangingRoleId(null)
    }
  }

  const actionCourse = courses.find(c => c.id === actionCourseId)

  const TABS: Array<{ id: Tab; label: string; icon: typeof ShieldCheck }> = [
    { id: 'overview', label: 'Overview', icon: ShieldCheck },
    { id: 'courses',  label: 'Courses',  icon: BookOpen },
    { id: 'users',    label: 'Users',    icon: Users },
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AcademyNavbar solid />

      <main className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/25 bg-purple-400/10 px-4 py-2 text-sm text-purple-300 mb-4">
              <ShieldCheck size={15} />
              Super Admin Console
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white mb-2">
              Platform Management
            </h1>
            <p className="text-white/45 max-w-2xl">
              Manage administrators, approve courses, and monitor platform-wide metrics.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100 flex items-center justify-between">
              {error}
              <button onClick={() => setError(null)} className="text-red-200/60 hover:text-red-100 ml-4">✕</button>
            </div>
          )}

          {/* Tab nav */}
          <div className="flex gap-1 mb-8 border-b border-white/10 overflow-x-auto">
            {TABS.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#F5C518] text-[#F5C518]'
                      : 'border-transparent text-white/40 hover:text-white/70'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* ── Overview Tab ─────────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            overviewLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-[#F5C518]" size={28} />
              </div>
            ) : overview ? (
              <div className="space-y-8">
                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Total users"      value={overview.totalUsers}      sub={`${overview.learnerCount} learners`} />
                  <StatCard label="Admins"           value={overview.adminCount}      sub="including facilitators" />
                  <StatCard label="Enrollments"      value={overview.totalEnrollments} sub="across all courses" />
                  <StatCard label="Total courses"    value={overview.totalCourses}    sub={`${overview.coursesByStatus['APPROVED'] ?? 0} published`} />
                  <StatCard label="Weeks / Lessons"  value={overview.totalWeeks} />
                  <StatCard label="Submissions"      value={overview.totalSubmissions} sub={`${overview.pendingSubmissions} pending review`} />
                  <StatCard label="Pending approval" value={overview.coursesByStatus['PENDING_REVIEW'] ?? 0} sub="courses awaiting review" />
                  <StatCard label="Rejected"         value={overview.coursesByStatus['REJECTED'] ?? 0} sub="courses need revision" />
                </div>

                {/* Course status breakdown */}
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
                  <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-5">Course pipeline</p>
                  <div className="flex flex-wrap gap-4">
                    {(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'] as CourseStatus[]).map(status => {
                      const cfg = STATUS_CONFIG[status]
                      const count = overview.coursesByStatus[status] ?? 0
                      const pct = overview.totalCourses > 0 ? Math.round((count / overview.totalCourses) * 100) : 0
                      return (
                        <div key={status} className={`flex-1 min-w-[120px] rounded-2xl border px-4 py-4 ${cfg.color}`}>
                          <p className="text-xs font-mono uppercase tracking-widest opacity-70 mb-1">{cfg.label}</p>
                          <p className="font-display text-2xl font-extrabold">{count}</p>
                          <p className="text-xs opacity-50 mt-0.5">{pct}% of total</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Recent signups */}
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-xs font-mono uppercase tracking-widest text-white/30">Recent signups</p>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="text-xs text-[#F5C518] hover:text-[#FFE070] transition-colors"
                    >
                      View all →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {overview.recentUsers.map(u => {
                      const cfg = ROLE_CONFIG[u.role] ?? ROLE_CONFIG.USER
                      const initials = (u.name || u.email).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                      return (
                        <div key={u.id} className="flex items-center gap-4 rounded-xl border border-white/8 bg-black/20 px-4 py-3">
                          <div className="w-8 h-8 rounded-full bg-[#F5C518]/15 border border-[#F5C518]/20 flex items-center justify-center text-[#F5C518] text-xs font-extrabold shrink-0">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{u.name || '—'}</p>
                            <p className="text-xs text-white/35 truncate">{u.email}</p>
                          </div>
                          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wide ${cfg.color}`}>
                            {cfg.label}
                          </span>
                          <span className="text-xs text-white/25 shrink-0">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => { setActiveTab('courses'); setStatusFilter('PENDING_REVIEW') }}
                    className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-5 py-3 text-sm text-amber-300 hover:bg-amber-400/20 transition-colors"
                  >
                    <Clock size={14} />
                    Review pending courses ({overview.coursesByStatus['PENDING_REVIEW'] ?? 0})
                  </button>
                  <button
                    onClick={() => { setActiveTab('users'); setShowCreateAdmin(true) }}
                    className="inline-flex items-center gap-2 rounded-full bg-[#F5C518] px-5 py-3 text-sm font-semibold text-[#0A0A0A] hover:bg-[#E8B800] transition-colors"
                  >
                    <Plus size={14} />
                    Create admin account
                  </button>
                </div>
              </div>
            ) : null
          )}

          {/* ── Courses Tab ──────────────────────────────────────────────────── */}
          {activeTab === 'courses' && (
            <div>
              <div className="flex gap-2 flex-wrap mb-6">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                      statusFilter === f.value
                        ? 'border-[#F5C518]/50 bg-[#F5C518]/10 text-[#F5C518]'
                        : 'border-white/10 text-white/50 hover:border-white/20'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {coursesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="animate-spin text-[#F5C518]" size={28} />
                </div>
              ) : courses.length === 0 ? (
                <div className="rounded-[24px] border border-white/8 bg-white/[0.02] p-12 text-center">
                  <p className="text-white/40">No courses with this status.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.map(course => {
                    const cfg = STATUS_CONFIG[course.status]
                    return (
                      <div key={course.id} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-mono ${cfg.color}`}>
                                {cfg.label}
                              </span>
                              {course.submittedAt && (
                                <span className="flex items-center gap-1 text-xs text-white/35">
                                  <Clock size={11} />
                                  Submitted {new Date(course.submittedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">{course.title}</h3>
                            <p className="text-sm text-white/40 mb-3">/{course.slug}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-white/50">
                              <span>{course._count.weeks} week{course._count.weeks !== 1 ? 's' : ''}</span>
                              <span>{course.courseFacilitators.length} facilitator{course.courseFacilitators.length !== 1 ? 's' : ''}</span>
                              {course.createdBy && <span>by {course.createdBy.name || course.createdBy.email}</span>}
                            </div>
                            {course.courseFacilitators.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {course.courseFacilitators.map(cf => (
                                  <span key={cf.facilitator.id} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">
                                    {cf.facilitator.name}
                                  </span>
                                ))}
                              </div>
                            )}
                            {course.approvals.length > 0 && (
                              <p className="mt-2 text-xs text-white/30">
                                Last: {course.approvals[0].action} by {course.approvals[0].reviewer.name}
                                {course.approvals[0].notes && ` — "${course.approvals[0].notes}"`}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 flex-shrink-0 flex-wrap">
                            <a
                              href={`/admin/superadmin/courses/${course.id}`}
                              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm text-white/60 hover:border-white/30 hover:text-white transition-colors"
                            >
                              <Eye size={14} /> View
                            </a>
                            {course.status === 'PENDING_REVIEW' && (
                              <>
                                <button
                                  onClick={() => { setActionCourseId(course.id); setActionType('approve'); setActionNotes('') }}
                                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-400/20 transition-colors"
                                >
                                  <CheckCircle2 size={14} /> Approve
                                </button>
                                <button
                                  onClick={() => { setActionCourseId(course.id); setActionType('reject'); setActionNotes('') }}
                                  className="inline-flex items-center gap-1.5 rounded-full border border-red-400/30 bg-red-400/10 px-4 py-2 text-sm text-red-300 hover:bg-red-400/20 transition-colors"
                                >
                                  <XCircle size={14} /> Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Users Tab ────────────────────────────────────────────────────── */}
          {activeTab === 'users' && (
            <div>
              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search by name or email…"
                    className="w-full rounded-full border border-white/12 bg-white/[0.03] py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#F5C518]/40"
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={e => setUserRoleFilter(e.target.value)}
                  className="rounded-full border border-white/12 bg-[#0A0A0A] px-4 py-2.5 text-sm text-white/65 focus:outline-none focus:border-[#F5C518]/40"
                >
                  <option value="">All roles</option>
                  <option value="USER">Learners</option>
                  <option value="ADMIN">Admins</option>
                  <option value="SUPER_ADMIN">Super Admins</option>
                </select>
                <button
                  onClick={() => setShowCreateAdmin(!showCreateAdmin)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#F5C518] px-5 py-2.5 text-sm font-semibold text-[#0A0A0A] hover:bg-[#E8B800] transition-colors"
                >
                  <Plus size={14} /> Create admin
                </button>
              </div>

              {/* Create admin form */}
              {showCreateAdmin && (
                <form
                  onSubmit={createAdmin}
                  className="mb-6 rounded-[24px] border border-[#F5C518]/20 bg-[#F5C518]/5 p-6 space-y-4"
                >
                  <h3 className="text-sm font-semibold text-[#F5C518] mb-1">Create admin / facilitator account</h3>
                  <p className="text-xs text-white/40">This user will have full admin access — they can build courses, review submissions, and manage learners.</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-white/40 mb-1">Full name *</label>
                      <input
                        required
                        value={createForm.name}
                        onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="Dr. Jane Doe"
                        className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C518]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-1">Email address *</label>
                      <input
                        required
                        type="email"
                        value={createForm.email}
                        onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))}
                        placeholder="facilitator@org.com"
                        className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C518]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-1">Temporary password *</label>
                      <input
                        required
                        type="password"
                        value={createForm.password}
                        onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))}
                        placeholder="Min. 8 characters"
                        className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C518]/40"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={creating}
                      className="rounded-full bg-[#F5C518] px-5 py-2.5 text-sm font-semibold text-[#0A0A0A] disabled:opacity-50"
                    >
                      {creating ? 'Creating…' : 'Create admin account'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateAdmin(false)}
                      className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/50 hover:border-white/20"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* User count */}
              <p className="text-xs text-white/35 mb-4">
                {usersTotal} user{usersTotal !== 1 ? 's' : ''} found
              </p>

              {/* User list */}
              {usersLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="animate-spin text-[#F5C518]" size={24} />
                </div>
              ) : (
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] overflow-hidden">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/8 text-[10px] font-mono uppercase tracking-widest text-white/25">
                    <span>User</span>
                    <span>Enrolled</span>
                    <span>Joined</span>
                    <span>Role</span>
                  </div>
                  {users.length === 0 ? (
                    <div className="px-5 py-10 text-center text-sm text-white/30">No users found.</div>
                  ) : (
                    users.map(u => {
                      const cfg = ROLE_CONFIG[u.role] ?? ROLE_CONFIG.USER
                      const initials = (u.name || u.email).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                      const isSelf = u.id === currentAuth?.user.id
                      return (
                        <div key={u.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02] transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[#F5C518]/12 border border-[#F5C518]/20 flex items-center justify-center text-[#F5C518] text-xs font-extrabold shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">{u.name || '—'}</p>
                              <p className="text-xs text-white/35 truncate">{u.email}</p>
                            </div>
                          </div>
                          <span className="text-sm text-white/40 tabular-nums">{u._count.courseEnrollments}</span>
                          <span className="text-xs text-white/30 tabular-nums shrink-0">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                          <div className="relative shrink-0">
                            {isSelf ? (
                              <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-wide ${cfg.color}`}>
                                {cfg.label}
                              </span>
                            ) : (
                              <div className="relative group/role">
                                <button className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-wide cursor-pointer hover:opacity-80 transition-opacity ${cfg.color}`}>
                                  {cfg.label}
                                  <ChevronDown size={10} className="opacity-60" />
                                </button>
                                <div className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-white/12 bg-[#111] shadow-xl z-10 py-1 hidden group-hover/role:block">
                                  {['USER', 'ADMIN', 'SUPER_ADMIN'].map(r => {
                                    const rc = ROLE_CONFIG[r]
                                    return (
                                      <button
                                        key={r}
                                        onClick={() => void changeRole(u.id, r)}
                                        disabled={changingRoleId === u.id || u.role === r}
                                        className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                                          u.role === r
                                            ? 'text-white/25 cursor-default'
                                            : 'text-white/65 hover:text-white hover:bg-white/[0.06]'
                                        }`}
                                      >
                                        {changingRoleId === u.id ? '…' : rc.label}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Course action modal */}
      {actionType && actionCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[24px] border border-white/10 bg-[#111] p-6">
            <h2 className="font-display text-xl font-extrabold text-white mb-1">
              {actionType === 'approve' ? 'Approve course' : 'Reject course'}
            </h2>
            <p className="text-sm text-white/50 mb-5">"{actionCourse.title}"</p>
            <form onSubmit={submitAction} className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 mb-1">
                  {actionType === 'approve' ? 'Notes (optional)' : 'Rejection reason (required)'}
                </label>
                <textarea
                  value={actionNotes}
                  onChange={e => setActionNotes(e.target.value)}
                  required={actionType === 'reject'}
                  rows={4}
                  placeholder={actionType === 'approve' ? 'Optional notes for the admin…' : 'Explain what needs to be fixed…'}
                  className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 rounded-full py-3 text-sm font-semibold transition-colors disabled:opacity-50 ${
                    actionType === 'approve'
                      ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                      : 'bg-red-500 text-white hover:bg-red-400'
                  }`}
                >
                  {submitting ? 'Submitting…' : actionType === 'approve' ? 'Approve & publish' : 'Reject course'}
                </button>
                <button
                  type="button"
                  onClick={() => { setActionCourseId(null); setActionType(null); setActionNotes('') }}
                  className="rounded-full border border-white/10 px-5 py-3 text-sm text-white/60 hover:border-white/20"
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
