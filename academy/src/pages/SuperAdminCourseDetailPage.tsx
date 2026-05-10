import { FormEvent, useEffect, useState } from 'react'
import { useParams } from 'wouter'
import {
  BookOpen, CheckCircle2, ChevronDown, ChevronUp, Clock, Image,
  Loader2, ShieldCheck, Users, Video, XCircle,
} from 'lucide-react'
import AcademyNavbar from '../components/AcademyNavbar'
import { apiRequest } from '../lib/api'
import { getStoredAuth } from '../lib/auth'
import type { AdminCourseDetail, AdminWeek, CourseStatus } from '../types/academy'

const STATUS_CONFIG: Record<CourseStatus, { label: string; color: string }> = {
  DRAFT:          { label: 'Draft',          color: 'border-white/20 text-white/50' },
  PENDING_REVIEW: { label: 'Pending Review', color: 'border-amber-400/40 text-amber-300 bg-amber-400/10' },
  APPROVED:       { label: 'Approved',       color: 'border-emerald-400/40 text-emerald-300 bg-emerald-400/10' },
  REJECTED:       { label: 'Rejected',       color: 'border-red-400/40 text-red-300 bg-red-400/10' },
}

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER:     'text-emerald-400',
  INTERMEDIATE: 'text-amber-400',
  ADVANCED:     'text-red-400',
}

export default function SuperAdminCourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()

  const [course, setCourse] = useState<AdminCourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedWeekId, setExpandedWeekId] = useState<string | null>(null)

  // Action modal
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [actionNotes, setActionNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const auth = getStoredAuth()
    if (!auth) { window.location.href = '/login'; return }
    if (auth.user.role !== 'SUPER_ADMIN') { window.location.href = '/dashboard'; return }

    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await apiRequest<AdminCourseDetail>(`/academy/superadmin/courses/${courseId}`)
        if (!cancelled) setCourse(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load course.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [courseId])

  async function submitAction(e: FormEvent) {
    e.preventDefault()
    if (!actionType || !course) return
    setSubmitting(true)
    try {
      await apiRequest(`/academy/superadmin/courses/${courseId}/${actionType}`, {
        method: 'POST',
        body: JSON.stringify({ notes: actionNotes }),
      })
      setActionType(null)
      setActionNotes('')
      // Refresh
      const data = await apiRequest<AdminCourseDetail>(`/academy/superadmin/courses/${courseId}`)
      setCourse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <AcademyNavbar showBack backHref="/admin/superadmin" backLabel="Back to Queue" solid />
        <div className="pt-32 flex flex-col items-center justify-center text-center">
          <Loader2 className="animate-spin text-[#F5C518] mb-4" size={28} />
          <p className="text-white/60">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <AcademyNavbar showBack backHref="/admin/superadmin" backLabel="Back to Queue" solid />
        <div className="pt-32 text-center px-6">
          <p className="text-red-400">{error ?? 'Course not found.'}</p>
        </div>
      </div>
    )
  }

  const cfg = STATUS_CONFIG[course.status]

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AcademyNavbar showBack backHref="/admin/superadmin" backLabel="Back to Queue" solid />

      <main className="pt-28 pb-20 px-4 md:px-6">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#F5C518]/25 bg-[#F5C518]/10 px-3 py-1 text-xs text-[#F5C518]">
                  <ShieldCheck size={12} /> Super Admin Review
                </div>
                <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-mono ${cfg.color}`}>
                  {cfg.label}
                </span>
                {course.submittedAt && (
                  <span className="flex items-center gap-1 text-xs text-white/35">
                    <Clock size={11} />
                    Submitted {new Date(course.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-1">{course.title}</h1>
              <p className="text-white/35 text-sm">/{course.slug}</p>
              {course.createdBy && (
                <p className="text-sm text-white/40 mt-1">
                  Created by <span className="text-white/60">{course.createdBy.name || course.createdBy.email}</span>
                </p>
              )}
            </div>

            {course.status === 'PENDING_REVIEW' && (
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => { setActionType('approve'); setActionNotes('') }}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-2.5 text-sm font-medium text-emerald-300 hover:bg-emerald-400/20 transition-colors"
                >
                  <CheckCircle2 size={15} /> Approve & publish
                </button>
                <button
                  onClick={() => { setActionType('reject'); setActionNotes('') }}
                  className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 px-5 py-2.5 text-sm font-medium text-red-300 hover:bg-red-400/20 transition-colors"
                >
                  <XCircle size={15} /> Reject
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>
          )}

          {/* Previous approval notes */}
          {course.approvalNotes && (
            <div className={`rounded-2xl border p-4 text-sm ${course.status === 'REJECTED' ? 'border-red-400/20 bg-red-400/8 text-red-200' : 'border-emerald-400/20 bg-emerald-400/8 text-emerald-200'}`}>
              <p className="text-xs font-mono uppercase tracking-widest opacity-60 mb-1">
                {course.status === 'REJECTED' ? 'Rejection reason' : 'Approval notes'}
              </p>
              {course.approvalNotes}
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Weeks', value: course.weeks.length },
              { label: 'Facilitators', value: course.courseFacilitators.length },
              { label: 'Approval actions', value: course.approvals.length },
            ].map(s => (
              <div key={s.label} className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4 text-center">
                <p className="font-display text-2xl font-extrabold text-[#F5C518]">{s.value}</p>
                <p className="text-xs text-white/40 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Course info */}
          <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-white/35 mb-4">Course Info</h2>
            <dl className="grid md:grid-cols-2 gap-4 text-sm">
              {[
                ['Level', course.level],
                ['Duration', course.estimatedDuration],
                ['Tagline', course.tagline],
              ].map(([label, val]) => val && (
                <div key={label as string}>
                  <dt className="text-xs text-white/35 mb-0.5">{label}</dt>
                  <dd className="text-white/80">{val}</dd>
                </div>
              ))}
              <div className="md:col-span-2">
                <dt className="text-xs text-white/35 mb-1">Description</dt>
                <dd className="text-white/75 leading-relaxed">{course.description}</dd>
              </div>
            </dl>
          </section>

          {/* Facilitators */}
          <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-white/35 mb-4 flex items-center gap-2">
              <Users size={13} /> Facilitators ({course.courseFacilitators.length})
            </h2>
            {course.courseFacilitators.length === 0 ? (
              <p className="text-sm text-white/30">No facilitators assigned.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {course.courseFacilitators.map(cf => (
                  <div key={cf.id} className="rounded-2xl border border-white/8 bg-black/20 p-4 flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F5C518]/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-[#F5C518]">
                      {cf.facilitator.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{cf.facilitator.name}</p>
                      <p className="text-xs text-white/40">{cf.facilitator.title}</p>
                      <p className="text-xs text-white/35">{cf.facilitator.organization}</p>
                      {cf.facilitator.bio && (
                        <p className="text-xs text-white/40 mt-1 line-clamp-2">{cf.facilitator.bio}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Weeks */}
          <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-white/35 mb-4 flex items-center gap-2">
              <BookOpen size={13} /> Course Weeks ({course.weeks.length})
            </h2>
            {course.weeks.length === 0 ? (
              <p className="text-sm text-white/30">No weeks added.</p>
            ) : (
              <div className="space-y-3">
                {course.weeks.map(week => (
                  <WeekReview
                    key={week.id}
                    week={week}
                    expanded={expandedWeekId === week.id}
                    onToggle={() => setExpandedWeekId(prev => prev === week.id ? null : week.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Approval history */}
          {course.approvals.length > 0 && (
            <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-sm font-mono uppercase tracking-widest text-white/35 mb-4">Approval History</h2>
              <div className="space-y-3">
                {course.approvals.map(a => (
                  <div key={a.id} className={`rounded-2xl border p-4 text-sm ${a.action === 'APPROVED' ? 'border-emerald-400/15 bg-emerald-400/8' : 'border-red-400/15 bg-red-400/8'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {a.action === 'APPROVED'
                        ? <CheckCircle2 size={13} className="text-emerald-400" />
                        : <XCircle size={13} className="text-red-400" />
                      }
                      <span className={`font-medium ${a.action === 'APPROVED' ? 'text-emerald-300' : 'text-red-300'}`}>{a.action}</span>
                      <span className="text-white/35 text-xs ml-auto">{new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <p className="text-xs text-white/40">by {a.reviewer.name || a.reviewer.email}</p>
                    {a.notes && <p className="text-white/65 mt-2 leading-relaxed">{a.notes}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Bottom action strip (sticky) */}
          {course.status === 'PENDING_REVIEW' && (
            <div className="sticky bottom-4 rounded-[20px] border border-white/10 bg-[#111]/90 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-white/60">Ready to make a decision on this course?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setActionType('approve'); setActionNotes('') }}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-400/20 transition-colors"
                >
                  <CheckCircle2 size={14} /> Approve & publish
                </button>
                <button
                  onClick={() => { setActionType('reject'); setActionNotes('') }}
                  className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 px-5 py-2 text-sm font-medium text-red-300 hover:bg-red-400/20 transition-colors"
                >
                  <XCircle size={14} /> Reject
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Approve / Reject modal */}
      {actionType && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[24px] border border-white/10 bg-[#111] p-6">
            <div className="flex items-center gap-3 mb-4">
              {actionType === 'approve'
                ? <CheckCircle2 size={20} className="text-emerald-400" />
                : <XCircle size={20} className="text-red-400" />
              }
              <h2 className="font-display text-xl font-extrabold text-white">
                {actionType === 'approve' ? 'Approve & publish' : 'Reject course'}
              </h2>
            </div>
            <p className="text-sm text-white/50 mb-5">
              "{course.title}"
              {actionType === 'approve'
                ? ' — this will publish the course immediately to the academy.'
                : ' — the admin will be able to revise and resubmit.'}
            </p>
            <form onSubmit={submitAction} className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 mb-1.5">
                  {actionType === 'approve' ? 'Notes for the admin (optional)' : 'Rejection reason (required — be specific so they know what to fix)'}
                </label>
                <textarea
                  value={actionNotes}
                  onChange={e => setActionNotes(e.target.value)}
                  required={actionType === 'reject'}
                  rows={5}
                  placeholder={
                    actionType === 'approve'
                      ? 'Great work! A few optional notes...'
                      : 'e.g. Week 2 is missing a quiz. Lesson content for Week 1 needs more depth. Please add facilitator bios.'
                  }
                  className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 leading-relaxed resize-none"
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
                  {submitting ? 'Submitting...' : actionType === 'approve' ? 'Approve & publish' : 'Reject course'}
                </button>
                <button
                  type="button"
                  onClick={() => { setActionType(null); setActionNotes('') }}
                  className="rounded-full border border-white/10 px-5 py-3 text-sm text-white/50 hover:border-white/20"
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

// ─── WeekReview (read-only week card) ────────────────────────────────────────

function WeekReview({ week, expanded, onToggle }: { week: AdminWeek; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
      {/* Header row */}
      <button onClick={onToggle} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-mono text-white/35">Week {week.number}</span>
          <span className="text-sm font-semibold text-white">{week.title}</span>
          <span className={`text-xs ${DIFFICULTY_COLORS[week.difficulty] ?? 'text-white/40'}`}>{week.difficulty}</span>
          <span className="text-xs text-white/35">{week.durationLabel}</span>
          {/* Content indicators */}
          <div className="flex gap-1.5 ml-1">
            {week.lessonContent && <span className="rounded-full bg-[#F5C518]/15 px-2 py-0.5 text-[10px] text-[#F5C518]/80">content</span>}
            {week.images.length > 0 && <span className="rounded-full bg-blue-400/15 px-2 py-0.5 text-[10px] text-blue-300/80">{week.images.length} image{week.images.length !== 1 ? 's' : ''}</span>}
            {week.videoUrl && <span className="rounded-full bg-purple-400/15 px-2 py-0.5 text-[10px] text-purple-300/80">video</span>}
            {week.quiz && <span className="rounded-full bg-teal-400/15 px-2 py-0.5 text-[10px] text-teal-300/80">{week.quiz.questions.length}Q quiz</span>}
            {week.assignments.length > 0 && <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] text-amber-300/80">{week.assignments.length} assign.</span>}
          </div>
        </div>
        {expanded ? <ChevronUp size={15} className="text-white/35 flex-shrink-0" /> : <ChevronDown size={15} className="text-white/35 flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-white/8 px-5 pb-5 pt-4 space-y-5">

          {/* Summary & hook */}
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-white/35 mb-1">Hook</p>
              <p className="text-white/70 leading-relaxed">{week.hook}</p>
            </div>
            <div>
              <p className="text-xs text-white/35 mb-1">What to expect</p>
              <p className="text-white/70 leading-relaxed">{week.whatToExpect}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-white/35 mb-1">Summary</p>
              <p className="text-white/70 leading-relaxed">{week.summary}</p>
            </div>
          </div>

          {/* Topics & objectives */}
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {week.topics.length > 0 && (
              <div>
                <p className="text-xs text-white/35 mb-2">Topics ({week.topics.length})</p>
                <ul className="space-y-1">
                  {week.topics.map(t => <li key={t.id} className="text-white/65">· {t.title}</li>)}
                </ul>
              </div>
            )}
            {week.objectives.length > 0 && (
              <div>
                <p className="text-xs text-white/35 mb-2">Objectives ({week.objectives.length})</p>
                <ul className="space-y-1">
                  {week.objectives.map(o => <li key={o.id} className="text-white/65">· {o.body}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Lesson content */}
          {week.lessonContent && (
            <div className="rounded-xl border border-[#F5C518]/15 bg-[#F5C518]/5 p-4">
              <p className="text-xs text-[#F5C518]/70 font-mono uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <BookOpen size={11} /> Lesson Content
              </p>
              <div className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                {week.lessonContent}
              </div>
            </div>
          )}

          {/* Images */}
          {week.images.length > 0 && (
            <div>
              <p className="text-xs text-white/35 mb-2 flex items-center gap-1.5"><Image size={11} /> Images ({week.images.length})</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {week.images.map(img => (
                  <div key={img.id} className="rounded-xl overflow-hidden border border-white/10">
                    <img src={img.url} alt={img.alt ?? ''} className="w-full h-32 object-cover bg-white/5" />
                    {img.caption && <p className="px-2 py-1.5 text-xs text-white/50 bg-black/50">{img.caption}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video */}
          {week.videoUrl && (
            <div className="rounded-xl border border-white/8 bg-black/20 px-4 py-3">
              <p className="text-xs text-white/35 mb-1 flex items-center gap-1.5"><Video size={11} /> Video</p>
              <p className="text-xs text-white/50 mb-1">{week.videoTitle ?? 'Lesson video'}</p>
              <a href={week.videoUrl} target="_blank" rel="noreferrer" className="text-sm text-[#F5C518] hover:underline break-all">
                {week.videoUrl}
              </a>
            </div>
          )}

          {/* Quiz */}
          {week.quiz && (
            <div className="rounded-xl border border-teal-400/15 bg-teal-400/5 p-4">
              <p className="text-xs text-teal-400/70 font-mono uppercase tracking-widest mb-3">
                Quiz — {week.quiz.title}
              </p>
              <div className="flex gap-4 text-xs text-white/50 mb-3">
                <span>Pass mark: {week.quiz.passMark}%</span>
                <span>Attempt limit: {week.quiz.attemptLimit}</span>
                <span>{week.quiz.questions.length} question{week.quiz.questions.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-3">
                {week.quiz.questions.map((q, i) => (
                  <div key={q.id} className="rounded-xl border border-white/8 bg-black/20 p-3">
                    <p className="text-sm text-white mb-2"><span className="text-white/35 mr-2">Q{i + 1}.</span>{q.prompt}</p>
                    <ul className="space-y-1">
                      {q.options.map(opt => (
                        <li key={opt.id} className={`flex items-center gap-2 text-xs rounded-lg px-2 py-1 ${opt.isCorrect ? 'bg-emerald-400/10 text-emerald-300' : 'text-white/45'}`}>
                          <span className={`w-3 h-3 rounded-full border flex-shrink-0 ${opt.isCorrect ? 'border-emerald-400 bg-emerald-400' : 'border-white/20'}`} />
                          {opt.label}
                        </li>
                      ))}
                    </ul>
                    {q.explanation && (
                      <p className="text-xs text-white/35 mt-2 italic">Explanation: {q.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assignments */}
          {week.assignments.length > 0 && (
            <div className="rounded-xl border border-amber-400/15 bg-amber-400/5 p-4">
              <p className="text-xs text-amber-400/70 font-mono uppercase tracking-widest mb-3">
                Assignments ({week.assignments.length})
              </p>
              <div className="space-y-3">
                {week.assignments.map(a => (
                  <div key={a.id} className="rounded-xl border border-white/8 bg-black/20 p-3">
                    <p className="text-sm font-medium text-white mb-1">{a.title}</p>
                    <p className="text-xs text-white/50 leading-relaxed mb-2">{a.instructions}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-white/35">
                      <span>Deadline: {new Date(a.deadline).toLocaleDateString('en-GB')}</span>
                      {a.allowTextSubmission && <span>Text submission ✓</span>}
                      {a.allowFileUpload && <span>File upload ✓</span>}
                    </div>
                    {a.choices.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {a.choices.map(c => (
                          <p key={c.id} className="text-xs text-white/50">· {c.title}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
