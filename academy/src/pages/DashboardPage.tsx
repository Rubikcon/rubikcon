import { useEffect, useState } from 'react'
import { ArrowRight, BookOpen, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import AcademyNavbar from '../components/AcademyNavbar'
import { apiRequest } from '../lib/api'
import { getStoredAuth } from '../lib/auth'
import type { DashboardData } from '../types/academy'

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    COMPLETE: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
    IN_PROGRESS: 'bg-[#F5C518]/10 text-[#F5C518] border-[#F5C518]/20',
    NOT_STARTED: 'bg-white/5 text-white/35 border-white/10',
  }
  const label: Record<string, string> = {
    COMPLETE: 'Complete',
    IN_PROGRESS: 'In progress',
    NOT_STARTED: 'Not started',
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${map[status] ?? map.NOT_STARTED}`}>
      {label[status] ?? status}
    </span>
  )
}

export default function DashboardPage() {
  const auth = getStoredAuth()
  const firstName = auth?.user.name?.split(' ')[0] ?? auth?.user.email?.split('@')[0] ?? 'Learner'

  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!getStoredAuth()) {
      window.location.href = '/login'
      return
    }

    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await apiRequest<DashboardData>('/academy/dashboard')
        if (!cancelled) setDashboard(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load dashboard.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <AcademyNavbar solid />
        <div className="pt-40 flex flex-col items-center justify-center text-center px-6">
          <Loader2 className="animate-spin text-[#F5C518] mb-4" size={28} />
          <p className="text-white/40 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const enrolledCourses = dashboard?.courses ?? []
  const totalWeeks = enrolledCourses.reduce((s, c) => s + c.weeks.length, 0)
  const completedWeeks = enrolledCourses.reduce(
    (s, c) => s + c.weeks.filter(w => w.progress.status === 'COMPLETE').length, 0
  )

  // Find the next incomplete week across all courses
  const nextWeek = (() => {
    for (const course of enrolledCourses) {
      const w = course.weeks.find(w => w.progress.status !== 'COMPLETE')
      if (w) return { course, week: w }
    }
    return null
  })()

  const primaryUnit = enrolledCourses[0]?.contentUnit ?? 'Lesson'
  const primaryUnits = `${primaryUnit}s`

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AcademyNavbar solid />

      <main className="pt-28 pb-20 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <p className="text-xs font-mono uppercase tracking-widest text-[#F5C518] mb-2">Dashboard</p>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-1">
              Welcome back, {firstName}
            </h1>
            <p className="text-white/40 text-sm">Here's where you left off.</p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          {/* Empty state — not enrolled in anything */}
          {enrolledCourses.length === 0 && !error && (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#F5C518]/10 border border-[#F5C518]/20 flex items-center justify-center mb-5">
                <BookOpen size={24} className="text-[#F5C518]" />
              </div>
              <h2 className="font-display text-xl font-extrabold text-white mb-2">You haven't enrolled in any courses yet</h2>
              <p className="text-white/40 text-sm max-w-sm leading-relaxed mb-7">
                Browse the course catalogue, pick a programme that interests you, and enrol to start tracking your progress here.
              </p>
              <a
                href="/courses"
                className="inline-flex items-center gap-2 rounded-full bg-[#F5C518] text-[#0A0A0A] font-semibold px-6 py-3 text-sm hover:bg-[#E8B800] transition-colors"
              >
                Browse courses <ArrowRight size={14} />
              </a>
            </div>
          )}

          {enrolledCourses.length > 0 && (
            <>
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-2">Courses</p>
                  <p className="font-display text-3xl font-extrabold text-white">{enrolledCourses.length}</p>
                </div>
                <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-2">{primaryUnits} done</p>
                  <p className="font-display text-3xl font-extrabold text-[#F5C518]">{completedWeeks}</p>
                  <p className="text-xs text-white/25 mt-0.5">of {totalWeeks}</p>
                </div>
                <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-2">Assignments</p>
                  <p className="font-display text-3xl font-extrabold text-white">{dashboard?.assignmentSubmissionCount ?? 0}</p>
                </div>
                <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-2">Overall</p>
                  <p className="font-display text-3xl font-extrabold text-white">
                    {totalWeeks ? Math.round((completedWeeks / totalWeeks) * 100) : 0}%
                  </p>
                </div>
              </div>

              {/* Continue banner */}
              {nextWeek && (
                <a
                  href={`/course/${nextWeek.course.slug}/week/${nextWeek.week.slug}`}
                  className="flex items-center justify-between gap-4 rounded-[24px] border border-[#F5C518]/25 bg-[#F5C518]/8 px-6 py-5 mb-8 hover:border-[#F5C518]/50 hover:bg-[#F5C518]/12 transition-all group"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-mono uppercase tracking-widest text-[#F5C518]/70 mb-1">Continue where you left off</p>
                    <p className="font-display font-extrabold text-white text-lg leading-snug truncate">
                      {nextWeek.course.contentUnit} {nextWeek.week.number} — {nextWeek.week.title}
                    </p>
                    <p className="text-xs text-white/35 mt-1">{nextWeek.course.title}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 rounded-full bg-[#F5C518] text-[#0A0A0A] font-semibold px-5 py-2.5 text-sm group-hover:bg-[#E8B800] transition-colors">
                    Continue <ArrowRight size={14} />
                  </div>
                </a>
              )}

              {/* Course sections */}
              <div className="space-y-6">
                {enrolledCourses.map(course => (
                  <section key={course.id} className="rounded-[28px] border border-white/10 bg-white/[0.03] overflow-hidden">

                    {/* Course header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-white/8">
                      <div className="min-w-0">
                        {course.phaseLabel && (
                          <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-1">{course.phaseLabel}</p>
                        )}
                        <h2 className="font-display text-xl font-extrabold text-white leading-snug">{course.title}</h2>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-white/30 mb-1">{course.progressPercent}% complete</p>
                          <div className="w-32 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-[#F5C518] rounded-full transition-all"
                              style={{ width: `${course.progressPercent}%` }}
                            />
                          </div>
                        </div>
                        <a
                          href={`/course/${course.slug}`}
                          className="rounded-full border border-white/15 text-white/55 text-sm px-4 py-2 hover:border-white/30 hover:text-white transition-all"
                        >
                          View course
                        </a>
                      </div>
                    </div>

                    {/* Week list */}
                    <div className="divide-y divide-white/[0.05]">
                      {course.weeks.map(week => {
                        const isComplete = week.progress.status === 'COMPLETE'
                        const isInProgress = week.progress.status === 'IN_PROGRESS'

                        return (
                          <a
                            key={week.id}
                            href={`/course/${course.slug}/week/${week.slug}`}
                            className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors group"
                          >
                            {/* Status icon */}
                            <div className="shrink-0">
                              {isComplete ? (
                                <CheckCircle2 size={18} className="text-[#F5C518]" />
                              ) : (
                                <div className={`w-[18px] h-[18px] rounded-full border-2 ${isInProgress ? 'border-[#F5C518]/50' : 'border-white/20'}`} />
                              )}
                            </div>

                            {/* Week info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-mono text-white/30">{course.contentUnit} {week.number}</span>
                                <StatusPill status={week.progress.status} />
                                {week.latestQuizAttempt && (
                                  <span className="text-[11px] text-white/30">
                                    Quiz: {Math.round(week.latestQuizAttempt.percentage)}%
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm font-medium mt-0.5 truncate ${isComplete ? 'text-white/60' : 'text-white'}`}>
                                {week.title}
                              </p>
                            </div>

                            {/* Duration + arrow */}
                            <div className="shrink-0 flex items-center gap-3 text-xs text-white/25">
                              <span className="hidden sm:flex items-center gap-1">
                                <Clock size={11} /> {week.durationLabel}
                              </span>
                              <ArrowRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors" />
                            </div>
                          </a>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>

              {/* Browse more */}
              <div className="mt-8 text-center">
                <a
                  href="/courses"
                  className="inline-flex items-center gap-2 text-sm text-white/35 hover:text-white/60 transition-colors"
                >
                  Browse more courses <ArrowRight size={13} />
                </a>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
