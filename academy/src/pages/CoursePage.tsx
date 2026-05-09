import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'wouter'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, CheckCircle2, Clock3, Loader2, PlayCircle, Users } from 'lucide-react'
import AcademyNavbar from '../components/AcademyNavbar'
import { apiRequest } from '../lib/api'
import { getStoredAuth } from '../lib/auth'
import type { CourseSummary } from '../types/academy'

const DEFAULT_COURSE_SLUG = 'blockchain-social-impact'

export default function CoursePage() {
  const params = useParams<{ slug?: string }>()
  const slug = params.slug || DEFAULT_COURSE_SLUG

  const [course, setCourse] = useState<CourseSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enrolling, setEnrolling] = useState(false)
  const auth = getStoredAuth()

  useEffect(() => {
    let cancelled = false
    async function loadCourse() {
      try {
        setLoading(true)
        setError(null)
        const data = await apiRequest<CourseSummary>(`/academy/courses/${slug}`)
        if (!cancelled) setCourse(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load course.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void loadCourse()
    return () => { cancelled = true }
  }, [slug])

  async function handleEnroll() {
    if (!auth) { window.location.href = `/login?redirect=/course/${slug}`; return }
    setEnrolling(true)
    try {
      await apiRequest(`/academy/courses/${slug}/enroll`, { method: 'POST' })
      const data = await apiRequest<CourseSummary>(`/academy/courses/${slug}`)
      setCourse(data)
    } catch {
      /* ignore */
    } finally {
      setEnrolling(false)
    }
  }

  const continueWeek = useMemo(() => {
    if (!course?.weeks.length) return null
    return course.weeks.find(w => w.progress.status !== 'COMPLETE') || course.weeks[0]
  }, [course])

  // Group weeks by module (preserving week order)
  const weekGroups = useMemo(() => {
    if (!course) return []
    const hasModules = course.modules.length > 0 && course.weeks.some(w => w.moduleId)
    if (!hasModules) return [{ module: null, weeks: course.weeks }]

    const groups: Array<{ module: CourseSummary['modules'][number] | null; weeks: typeof course.weeks }> = []
    const unassigned = course.weeks.filter(w => !w.moduleId)

    for (const mod of course.modules) {
      const modWeeks = course.weeks.filter(w => w.moduleId === mod.id)
      if (modWeeks.length > 0) groups.push({ module: mod, weeks: modWeeks })
    }
    if (unassigned.length > 0) groups.push({ module: null, weeks: unassigned })
    return groups
  }, [course])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <AcademyNavbar showBack backHref="/courses" backLabel="All Courses" solid />
        <div className="pt-32 flex flex-col items-center justify-center text-center px-6">
          <Loader2 className="animate-spin text-[#F5C518] mb-4" size={28} />
          <p className="text-white/60">Loading course...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <AcademyNavbar showBack backHref="/courses" backLabel="All Courses" solid />
        <div className="pt-32 max-w-xl mx-auto px-6 text-center">
          <h1 className="font-display text-3xl font-extrabold text-white mb-3">Course unavailable</h1>
          <p className="text-white/55 mb-8">{error || 'We could not load this course right now.'}</p>
          <a href="/courses" className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-semibold px-6 py-3 rounded-full hover:bg-[#E8B800] transition-colors">
            Browse courses <ArrowRight size={16} />
          </a>
        </div>
      </div>
    )
  }

  const unit = course.contentUnit
  const units = `${unit}s`

  // ── Not enrolled: show overview + enroll CTA ─────────────────────────────
  if (!course.enrolled) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <AcademyNavbar showBack backHref="/courses" backLabel="All Courses" solid />
        <main className="pt-24 pb-20 px-4 md:px-6">
          <div className="max-w-4xl mx-auto">

            {/* Hero panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(245,197,24,0.15),transparent_50%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-8 md:p-12 mb-6"
            >
              <div className="flex flex-wrap items-center gap-3 mb-5">
                {course.phaseLabel && (
                  <span className="inline-flex items-center gap-2 border border-white/15 px-3 py-1 rounded-full text-xs font-mono text-white/50 tracking-widest uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518]" /> {course.phaseLabel}
                  </span>
                )}
                {course.level && (
                  <span className="text-xs font-semibold text-white/40 border border-white/10 px-3 py-1 rounded-full">
                    {course.level}
                  </span>
                )}
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
                {course.title}
              </h1>
              <p className="text-white/55 text-base md:text-lg leading-relaxed mb-8 max-w-2xl">
                {course.description}
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-6 text-sm text-white/40 mb-8">
                <span className="inline-flex items-center gap-2">
                  <BookOpen size={14} className="text-[#F5C518]" />
                  {course.totalWeeks} {unit.toLowerCase()}{course.totalWeeks !== 1 ? 's' : ''}
                </span>
                {course.estimatedDuration && (
                  <span className="inline-flex items-center gap-2">
                    <Clock3 size={14} className="text-[#F5C518]" />
                    {course.estimatedDuration}
                  </span>
                )}
                {course.facilitators.length > 0 && (
                  <span className="inline-flex items-center gap-2">
                    <Users size={14} className="text-[#F5C518]" />
                    {course.facilitators.length} facilitator{course.facilitators.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Enroll CTA */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-bold px-8 py-3.5 rounded-full hover:bg-[#E8B800] transition-colors disabled:opacity-60 text-base"
                >
                  {enrolling && <Loader2 size={16} className="animate-spin" />}
                  {enrolling ? 'Enrolling...' : 'Enrol now — free'}
                  {!enrolling && <ArrowRight size={16} />}
                </button>
                <a href="/courses" className="text-sm text-white/40 hover:text-white/60 transition-colors">
                  Back to catalog
                </a>
              </div>
            </motion.div>

            {/* Facilitators */}
            {course.facilitators.length > 0 && (
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6 mb-6">
                <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-4">Taught by</p>
                <div className="flex flex-wrap gap-4">
                  {course.facilitators.map(f => {
                    const initials = f.name.replace(/^(Dr|Mr|Ms|Prof)\.\s*/i, '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                    return (
                      <div key={f.id} className="flex items-center gap-3">
                        {f.photoUrl ? (
                          <img src={f.photoUrl} alt={f.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#F5C518]/15 border border-[#F5C518]/25 flex items-center justify-center text-[#F5C518] font-extrabold text-sm">
                            {initials}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-white">{f.name}</p>
                          <p className="text-xs text-white/40">{f.title} · {f.organization}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Course outline preview */}
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
              <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-4">
                Course outline — {course.totalWeeks} {unit.toLowerCase()}{course.totalWeeks !== 1 ? 's' : ''}
              </p>
              <div className="space-y-5">
                {weekGroups.map((group, gi) => (
                  <div key={group.module?.id ?? 'unassigned'}>
                    {group.module && (
                      <p className="text-[11px] font-mono uppercase tracking-widest text-white/30 mb-2 px-1">
                        {group.module.title}
                      </p>
                    )}
                    <div className="space-y-2">
                      {group.weeks.map((week, i) => {
                        const isFirst = gi === 0 && i === 0
                        return (
                          <div key={week.id} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-black/20 px-5 py-4">
                            <div className="font-display text-2xl font-extrabold text-[#F5C518]/40 w-10 shrink-0">
                              {String(week.number).padStart(2, '0')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white/70">{week.title}</p>
                              <p className="text-xs text-white/30 mt-0.5">{week.durationLabel} · {week.estimatedCompletionMinutes} min</p>
                            </div>
                            {isFirst && (
                              <span className="text-[11px] text-emerald-400 border border-emerald-400/25 rounded-full px-2 py-0.5 shrink-0">
                                Preview
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-white/8 flex justify-center">
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-bold px-8 py-3 rounded-full hover:bg-[#E8B800] transition-colors disabled:opacity-60"
                >
                  {enrolling && <Loader2 size={14} className="animate-spin" />}
                  {enrolling ? 'Enrolling...' : `Enrol to unlock all ${units.toLowerCase()}`}
                  {!enrolling && <ArrowRight size={15} />}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ── Enrolled: show full course with progress sidebar ──────────────────────
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AcademyNavbar showBack backHref="/courses" backLabel="All Courses" solid />

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">

          {/* Progress sidebar */}
          <aside className="bg-white/[0.04] border border-white/10 rounded-[28px] p-5 h-fit lg:sticky lg:top-24">
            <div className="mb-5">
              <div className="inline-flex items-center gap-2 border border-white/15 px-3 py-1 rounded-full mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518]" />
                <span className="text-xs font-mono text-white/50 tracking-[0.18em] uppercase">
                  {course.phaseLabel || 'Programme'}
                </span>
              </div>
              <h1 className="font-display text-xl font-extrabold text-white leading-tight mb-1">{course.title}</h1>
              <p className="text-xs text-white/40 leading-relaxed">{course.tagline}</p>
            </div>

            {/* Progress bar */}
            <div className="mb-5 rounded-2xl bg-[#F5C518]/8 border border-[#F5C518]/15 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white">Your progress</span>
                <span className="text-2xl font-display font-extrabold text-[#F5C518]">{course.progressPercent}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/8 overflow-hidden mb-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#F5C518] to-[#E8B800] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${course.progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs text-white/40">
                {course.completedCount} of {course.totalWeeks} {unit.toLowerCase()}{course.totalWeeks !== 1 ? 's' : ''} complete
              </p>
            </div>

            {/* Week list */}
            <div className="space-y-4">
              {weekGroups.map((group, gi) => (
                <div key={group.module?.id ?? 'unassigned'}>
                  {group.module && (
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#F5C518]/60 mb-2 px-1">
                      {group.module.title}
                    </p>
                  )}
                  <div className="space-y-2">
                    {group.weeks.map(week => {
                      const isComplete = week.progress.status === 'COMPLETE'
                      const isInProgress = week.progress.status === 'IN_PROGRESS'
                      return (
                        <a
                          key={week.id}
                          href={`/course/${course.slug}/week/${week.slug}`}
                          className={`flex items-start gap-3 rounded-2xl border p-3.5 hover:border-white/25 transition-colors ${
                            isComplete
                              ? 'border-[#F5C518]/20 bg-[#F5C518]/8'
                              : isInProgress
                                ? 'border-teal-400/20 bg-teal-400/8'
                                : 'border-white/8 bg-white/[0.02]'
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">
                            {isComplete
                              ? <CheckCircle2 size={16} className="text-[#F5C518]" />
                              : <PlayCircle size={16} className={isInProgress ? 'text-teal-400' : 'text-white/25'} />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-0.5">
                              {unit} {week.number}
                            </div>
                            <div className="text-sm font-medium text-white leading-snug truncate">{week.title}</div>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-white/30">
                              <Clock3 size={10} /> {week.durationLabel}
                            </div>
                          </div>
                        </a>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <section className="min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(245,197,24,0.15),_transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-8 md:p-10 mb-6"
            >
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#F5C518] mb-3">
                {course.level || 'Programme'}{course.estimatedDuration ? ` · ${course.estimatedDuration}` : ''}
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white leading-tight mb-3">{course.title}</h2>
              <p className="text-white/55 leading-relaxed mb-6">{course.description}</p>

              {continueWeek && (
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`/course/${course.slug}/week/${continueWeek.slug}`}
                    className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-semibold px-6 py-3 rounded-full hover:bg-[#E8B800] transition-colors"
                  >
                    {course.progressPercent > 0 ? `Continue — ${unit} ${continueWeek.number}` : `Start — ${unit} ${continueWeek.number}`}
                    <ArrowRight size={15} />
                  </a>
                  <a
                    href="/dashboard"
                    className="inline-flex items-center gap-2 border border-white/15 text-white/70 px-5 py-3 rounded-full hover:border-white/30 hover:text-white transition-colors text-sm"
                  >
                    My dashboard
                  </a>
                </div>
              )}
            </motion.div>

            {/* Facilitators */}
            {course.facilitators.length > 0 && (
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 mb-6 flex flex-wrap gap-4">
                {course.facilitators.map(f => {
                  const initials = f.name.replace(/^(Dr|Mr|Ms|Prof)\.\s*/i, '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  return (
                    <div key={f.id} className="flex items-center gap-3">
                      {f.photoUrl ? (
                        <img src={f.photoUrl} alt={f.name} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#F5C518]/15 border border-[#F5C518]/25 flex items-center justify-center text-[#F5C518] font-extrabold text-xs">
                          {initials}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-white">{f.name}</p>
                        <p className="text-xs text-white/40">{f.title}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Weekly roadmap */}
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
              <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.18em] text-white/30 mb-1">{unit} roadmap</p>
                  <h3 className="font-display text-2xl font-extrabold text-white">{course.totalWeeks} {units}</h3>
                </div>
                {continueWeek && (
                  <a href={`/course/${course.slug}/week/${continueWeek.slug}`} className="text-sm text-[#F5C518] hover:text-[#FFE070] transition-colors">
                    Jump back in
                  </a>
                )}
              </div>

              <div className="space-y-6">
                {weekGroups.map((group, gi) => {
                  let weekOffset = 0
                  for (let g = 0; g < gi; g++) weekOffset += weekGroups[g].weeks.length
                  return (
                    <div key={group.module?.id ?? 'unassigned'}>
                      {group.module && (
                        <div className="mb-3">
                          <p className="text-[11px] font-mono uppercase tracking-widest text-white/30 leading-none">
                            {group.module.title}
                          </p>
                        </div>
                      )}
                      <div className="space-y-3">
                        {group.weeks.map((week, i) => {
                          const isComplete = week.progress.status === 'COMPLETE'
                          const isInProgress = week.progress.status === 'IN_PROGRESS'
                          const index = weekOffset + i
                          return (
                            <motion.a
                              key={week.id}
                              href={`/course/${course.slug}/week/${week.slug}`}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`grid md:grid-cols-[72px_minmax(0,1fr)_auto] gap-4 items-center rounded-2xl border px-5 py-4 hover:border-white/25 transition-colors ${
                                isComplete
                                  ? 'border-[#F5C518]/20 bg-[#F5C518]/5'
                                  : isInProgress
                                    ? 'border-teal-400/20 bg-teal-400/5'
                                    : 'border-white/8 bg-black/20'
                              }`}
                            >
                              <div>
                                <div className="text-[10px] font-mono tracking-widest uppercase text-white/30 mb-0.5">{unit}</div>
                                <div className={`font-display text-2xl font-extrabold ${isComplete ? 'text-[#F5C518]' : 'text-white/25'}`}>
                                  {String(week.number).padStart(2, '0')}
                                </div>
                              </div>

                              <div className="min-w-0">
                                <h4 className="text-base font-semibold text-white mb-1">{week.title}</h4>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-white/35">
                                  <span className="inline-flex items-center gap-1"><Clock3 size={11} />{week.durationLabel}</span>
                                  <span>{week.estimatedCompletionMinutes} min</span>
                                  <span className={`capitalize ${isComplete ? 'text-[#F5C518]' : isInProgress ? 'text-teal-400' : ''}`}>
                                    {week.progress.status.replace(/_/g, ' ').toLowerCase()}
                                  </span>
                                </div>
                              </div>

                              <div className="justify-self-start md:justify-self-end flex items-center gap-2">
                                {isComplete && <CheckCircle2 size={15} className="text-[#F5C518]" />}
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 px-4 py-2 text-sm text-white/60">
                                  {isComplete ? 'Review' : isInProgress ? 'Continue' : 'Open'} <ArrowRight size={13} />
                                </span>
                              </div>
                            </motion.a>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
