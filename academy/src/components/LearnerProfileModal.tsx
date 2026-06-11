import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { apiRequest } from '../lib/api'

/**
 * LearnerProfileModal — quick-look at a learner's activity.
 *
 * Used from the Submissions tab on both the regular admin (AdminAcademyPage)
 * and super admin (SuperAdminPage) so reviewers can see a learner's overall
 * standing without leaving their feedback context.
 *
 * Endpoint behaviour:
 *  - Pass `endpoint="superadmin"` to use the platform-wide endpoint
 *    (returns activity across all courses).
 *  - Pass `endpoint="admin"` (the default) to use the facilitator-scoped
 *    endpoint (returns only activity in courses the requesting user facilitates).
 */

type LearnerDetail = {
  user: {
    id: string; name: string | null; email: string; role: string; createdAt: string
    profile: {
      country: string | null; experienceLevel: string | null; userRole: string | null
      motivation: string | null; learningInterests: string[]
      telegramHandle: string | null; twitterHandle: string | null
      onboardingCompleted: boolean; completedAt: string | null
    } | null
  }
  enrollments: Array<{
    course: { id: string; slug: string; title: string; contentUnit: string }
    enrolledAt: string
    progressPercent: number
    completedCount: number
    totalCount: number
    weeks: Array<{
      id: string; slug: string; number: number; title: string
      status: string; completedAt: string | null
      quizSubmitted: boolean; assignmentSubmitted: boolean
      manuallyCompleted: boolean; firstOpenedAt: string | null
    }>
  }>
  submissions: Array<{
    id: string; status: string; submittedAt: string; reviewedAt: string | null
    hasFeedback: boolean
    assignment: {
      id: string; title: string
      week: { id: string; slug: string; number: number; title: string; course: { id: string; slug: string; title: string } }
    }
  }>
  quizAttempts: Array<{
    id: string; submittedAt: string; score: number; percentage: number; passed: boolean
    quiz: {
      id: string; title: string; passMark: number
      week: { id: string; slug: string; number: number; title: string; course: { id: string; slug: string; title: string } }
    }
  }>
}

interface Props {
  userId: string
  endpoint?: 'admin' | 'superadmin'
  onClose: () => void
}

export default function LearnerProfileModal({ userId, endpoint = 'admin', onClose }: Props) {
  const [detail, setDetail] = useState<LearnerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await apiRequest<LearnerDetail>(
          `/academy/${endpoint}/learners/${userId}`,
        )
        if (!cancelled) setDetail(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load learner profile.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [userId, endpoint])

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[24px] border border-white/10 bg-[#0F0F11] p-6"
      >
        {loading || !detail ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[#F5C518] mb-3" />
            <p className="text-sm text-white/40">{error || 'Loading learner activity…'}</p>
            {error && (
              <button onClick={onClose} className="mt-4 text-xs text-white/60 underline hover:text-white">Close</button>
            )}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full bg-[#F5C518]/15 border border-[#F5C518]/30 flex items-center justify-center text-[#F5C518] font-display font-extrabold shrink-0">
                  {(detail.user.name || detail.user.email).split(/\s+|@/).map(s => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-extrabold text-white truncate">{detail.user.name || 'Unnamed learner'}</h2>
                  <p className="text-sm text-white/45 truncate">{detail.user.email}</p>
                  <p className="text-[11px] text-white/30 mt-0.5">
                    Joined {new Date(detail.user.createdAt).toLocaleDateString()}
                    {detail.user.profile?.country && ` · ${detail.user.profile.country}`}
                    {detail.user.profile?.experienceLevel && ` · ${detail.user.profile.experienceLevel}`}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white text-2xl leading-none">×</button>
            </div>

            {/* Aggregate stat strip */}
            <div className="grid grid-cols-4 gap-2 mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <Stat label="Courses"      value={detail.enrollments.length} />
              <Stat label="Done"         value={detail.enrollments.reduce((s, e) => s + e.completedCount, 0)} accent="text-emerald-300" />
              <Stat label="Submissions"  value={detail.submissions.length} accent="text-[#F5C518]" />
              <Stat label="Quiz tries"   value={detail.quizAttempts.length} accent="text-teal-300" />
            </div>

            {/* Enrollments + per-lesson progress */}
            <Section title={`Course progress (${detail.enrollments.length} enrolled)`}>
              {detail.enrollments.length === 0 ? (
                <p className="text-sm text-white/40">{endpoint === 'admin' ? 'Not enrolled in any course you facilitate.' : 'Not enrolled in any course yet.'}</p>
              ) : (
                <div className="space-y-3">
                  {detail.enrollments.map(e => (
                    <div key={e.course.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">{e.course.title}</p>
                          <p className="text-xs text-white/40">{e.completedCount} / {e.totalCount} {e.course.contentUnit.toLowerCase()}{e.totalCount !== 1 ? 's' : ''} · {e.progressPercent}%</p>
                        </div>
                        <div className="text-xs text-white/30 whitespace-nowrap">Enrolled {new Date(e.enrolledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/8 overflow-hidden mb-3">
                        <div className="h-full bg-[#F5C518] transition-all" style={{ width: `${e.progressPercent}%` }} />
                      </div>
                      <details className="text-xs">
                        <summary className="cursor-pointer text-white/50 hover:text-white/70">Lesson-by-lesson</summary>
                        <ul className="mt-2 space-y-1">
                          {e.weeks.map(w => {
                            const dotColor = w.status === 'COMPLETE'
                              ? 'bg-emerald-400'
                              : w.status === 'IN_PROGRESS' ? 'bg-teal-400' : 'bg-white/15'
                            return (
                              <li key={w.id} className="flex items-center gap-2 py-1">
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                                <span className="font-mono text-white/35 w-6 text-right shrink-0">{w.number}</span>
                                <span className="text-white/70 truncate flex-1">{w.title}</span>
                                <span className="text-[10px] text-white/40 shrink-0">
                                  {w.status === 'COMPLETE' && w.completedAt
                                    ? `✓ ${new Date(w.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                                    : w.status === 'IN_PROGRESS' ? 'In progress' : '—'}
                                </span>
                              </li>
                            )
                          })}
                        </ul>
                      </details>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Submissions */}
            <Section title={`Assignment submissions (${detail.submissions.length})`}>
              {detail.submissions.length === 0 ? (
                <p className="text-sm text-white/40">No submissions yet.</p>
              ) : (
                <div className="space-y-2">
                  {detail.submissions.slice(0, 10).map(s => (
                    <div key={s.id} className="rounded-xl border border-white/8 bg-black/30 p-3 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-white truncate">
                            <span className="text-[10px] font-mono text-[#F5C518] mr-1.5">L{s.assignment.week.number}</span>
                            {s.assignment.title}
                          </p>
                          <p className="text-xs text-white/40 truncate">{s.assignment.week.course.title}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-mono ${
                            s.status === 'REVIEWED' ? 'border-emerald-400/30 text-emerald-300' : 'border-amber-400/30 text-amber-300'
                          }`}>{s.status}</span>
                          <span className="text-[10px] text-white/30">{new Date(s.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {s.hasFeedback && (
                        <p className="text-[10px] text-teal-300/70 mt-1.5">💬 Feedback given</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Quiz attempts */}
            <Section title={`Quiz attempts (${detail.quizAttempts.length})`}>
              {detail.quizAttempts.length === 0 ? (
                <p className="text-sm text-white/40">No quiz attempts yet.</p>
              ) : (
                <div className="space-y-2">
                  {detail.quizAttempts.slice(0, 10).map(a => (
                    <div key={a.id} className="rounded-xl border border-white/8 bg-black/30 p-3 text-sm flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-white truncate">
                          <span className="text-[10px] font-mono text-[#F5C518] mr-1.5">L{a.quiz.week.number}</span>
                          {a.quiz.title}
                        </p>
                        <p className="text-xs text-white/40 truncate">{a.quiz.week.course.title}</p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                          a.passed ? 'border-emerald-400/30 text-emerald-300 bg-emerald-400/8' : 'border-red-400/30 text-red-300 bg-red-400/8'
                        }`}>
                          {Math.round(a.percentage)}% · {a.passed ? 'Pass' : 'Fail'}
                        </span>
                        <span className="text-[10px] text-white/30">{new Date(a.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, accent = 'text-white' }: { label: string; value: number; accent?: string }) {
  return (
    <div className="text-center">
      <p className={`font-display text-lg font-extrabold ${accent} leading-none`}>{value}</p>
      <p className="text-[10px] text-white/35 uppercase tracking-widest mt-1">{label}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="text-xs font-mono uppercase tracking-[0.18em] text-white/35 mb-3">{title}</h3>
      {children}
    </section>
  )
}
