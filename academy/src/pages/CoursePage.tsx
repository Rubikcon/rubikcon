import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'wouter'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown, Clock3, Loader2, PlayCircle, Users } from 'lucide-react'
import AcademyNavbar from '../components/AcademyNavbar'
import PreviewBanner from '../components/PreviewBanner'
import VideoEmbed from '../components/VideoEmbed'
import EmbedFrame from '../components/EmbedFrame'
import { apiRequest } from '../lib/api'
import { getStoredAuth } from '../lib/auth'
import type { CourseSummary } from '../types/academy'

const DEFAULT_COURSE_SLUG = 'blockchain-social-impact'

/**
 * Convert a slide-deck URL into an embeddable URL.
 *
 * - Google Slides: normalize /edit (or bare /view) to /embed.
 * - Canva: append ?embed — the only URL format Canva allows in iframes.
 *   Works whether the admin pasted a /view, /edit, or share link.
 * - Anything else: pass through as-is.
 */
function getSlideEmbedUrl(url: string): string {
  if (!url) return url

  // Google Slides
  const gsMatch = url.match(/docs\.google\.com\/presentation\/d\/([^/]+)/)
  if (gsMatch && !url.includes('/embed')) {
    return `https://docs.google.com/presentation/d/${gsMatch[1]}/embed?start=false&loop=false&delayms=3000`
  }

  // Canva — strip any existing query/hash and append ?embed
  if (url.includes('canva.com')) {
    if (url.includes('?embed')) return url
    const base = url.split('?')[0].split('#')[0]
    return `${base}?embed`
  }

  return url
}

function facilitatorPhotoUrl(facilitator: { name: string; photoUrl: string | null }) {
  if (facilitator.photoUrl) return facilitator.photoUrl
  if (facilitator.name.toLowerCase().includes('joy egbu')) return '/icons/joy-egbu.jpeg'
  return null
}

export default function CoursePage() {
  const params = useParams<{ slug?: string }>()
  const slug = params.slug || DEFAULT_COURSE_SLUG

  const [course, setCourse] = useState<CourseSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enrolling, setEnrolling] = useState(false)
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})
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
  const learnerUnit = 'Module'
  const learnerUnits = 'Modules'
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

              {course.heroImage && (
                <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                  <img src={course.heroImage} alt={`${course.title} preview`} loading="lazy" decoding="async" className="aspect-[16/9] w-full object-cover" />
                </div>
              )}

              {/* Stats row */}
              <div className="flex flex-wrap gap-6 text-sm text-white/40 mb-8">
                <span className="inline-flex items-center gap-2">
                  <BookOpen size={14} className="text-[#F5C518]" />
                  {course.modules.length || course.totalWeeks} {learnerUnit.toLowerCase()}{(course.modules.length || course.totalWeeks) !== 1 ? 's' : ''}
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
                  {enrolling ? 'Enrolling...' : 'Enrol now'}
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
                        {facilitatorPhotoUrl(f) ? (
                          <img src={facilitatorPhotoUrl(f)!} alt={f.name} className="w-10 h-10 rounded-full object-cover" />
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
                Course outline — {course.modules.length || course.totalWeeks} {learnerUnit.toLowerCase()}{(course.modules.length || course.totalWeeks) !== 1 ? 's' : ''}
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
                  {enrolling ? 'Enrolling...' : `Enrol to unlock all ${learnerUnits.toLowerCase()}`}
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
  const isFacilitatorPreview = course.viewerMode === 'facilitator-preview'
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {isFacilitatorPreview && (
        <PreviewBanner
          status={course.status}
          published={course.published}
          backToAdminUrl={`/admin/courses/${course.id}`}
          contextMessage="You're seeing this course exactly as learners will. Unpublished weeks are included."
        />
      )}
      <AcademyNavbar showBack backHref="/courses" backLabel="All Courses" solid />

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">

          {/* Progress sidebar */}
          <aside className="bg-white/[0.04] border border-white/10 rounded-[28px] p-5 h-fit lg:sticky lg:top-24">
            <div className="mb-5">
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

            {/* Module list */}
            <div className="space-y-4">
              {weekGroups.map((group, gi) => (
                <div key={group.module?.id ?? 'unassigned'}>
                  {(() => {
                    const completed = group.weeks.filter(w => w.progress.status === 'COMPLETE').length
                    const inProgress = group.weeks.some(w => w.progress.status === 'IN_PROGRESS')
                    const allDone = completed === group.weeks.length && group.weeks.length > 0
                    const target = group.weeks.find(w => w.progress.status !== 'COMPLETE') ?? group.weeks[0]
                    const title = group.module?.title ?? `${learnerUnit} ${gi + 1}`

                    return (
                      <a
                        href={target ? `/course/${course.slug}/week/${target.slug}` : undefined}
                        className={`flex items-start gap-3 rounded-2xl border p-3.5 hover:border-white/25 transition-colors ${
                          allDone
                            ? 'border-[#F5C518]/20 bg-[#F5C518]/8'
                            : inProgress
                              ? 'border-teal-400/20 bg-teal-400/8'
                              : 'border-white/8 bg-white/[0.02]'
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {allDone
                            ? <CheckCircle2 size={16} className="text-[#F5C518]" />
                            : <PlayCircle size={16} className={inProgress ? 'text-teal-400' : 'text-white/25'} />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-0.5">
                            {learnerUnit} {gi + 1}
                          </div>
                          <div className="text-sm font-medium text-white leading-snug truncate">{title}</div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-white/30">
                            <Clock3 size={10} /> {completed}/{group.weeks.length} complete
                          </div>
                        </div>
                      </a>
                    )
                  })()}
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

              {course.heroImage && (
                <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                  <img src={course.heroImage} alt={`${course.title} preview`} loading="lazy" decoding="async" className="aspect-[16/9] w-full object-cover" />
                </div>
              )}

              {/* Course preview video — blended into the hero, sits between the description and the CTAs */}
              {course.introVideoUrl && (
                <div className="mb-6 rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                  <VideoEmbed url={course.introVideoUrl} title={`${course.title} — preview`} />
                </div>
              )}

              {continueWeek && (
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`/course/${course.slug}/week/${continueWeek.slug}`}
                    className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-semibold px-6 py-3 rounded-full hover:bg-[#E8B800] transition-colors"
                  >
                    {course.progressPercent > 0 ? `Continue ${learnerUnit} ${continueWeek.number}` : `Start ${learnerUnit} ${continueWeek.number}`}
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

            {/* Course Overview Slides */}
            {course.overviewSlideUrl && (
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#F5C518]">
                    <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M3 9h18" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <h3 className="text-sm font-mono uppercase tracking-[0.18em] text-white/40">
                    Course overview slides
                  </h3>
                </div>
                {/* Embedded slide preview with skeleton + error fallback */}
                <div className="mb-3">
                  <EmbedFrame
                    src={getSlideEmbedUrl(course.overviewSlideUrl)}
                    fallbackUrl={course.overviewSlideUrl}
                    title="Course overview slides"
                  />
                </div>
                <a
                  href={course.overviewSlideUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#F5C518] hover:text-[#E8B800] transition-colors"
                >
                  Open slides in full screen <ArrowRight size={12} />
                </a>
              </div>
            )}

            {/* Facilitators */}
            {course.facilitators.length > 0 && (
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 mb-6 flex flex-wrap gap-4">
                {course.facilitators.map(f => {
                  const initials = f.name.replace(/^(Dr|Mr|Ms|Prof)\.\s*/i, '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  return (
                    <div key={f.id} className="flex items-center gap-3">
                      {facilitatorPhotoUrl(f) ? (
                        <img src={facilitatorPhotoUrl(f)!} alt={f.name} className="w-9 h-9 rounded-full object-cover" />
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

            {/* Module Browser */}
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 md:p-8 mb-6">
              <div className="mb-6">
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-white/30 mb-1">Course modules</p>
                <h3 className="font-display text-2xl font-extrabold text-white">Explore all {learnerUnits.toLowerCase()}</h3>
              </div>

              <div className="space-y-3">
                {weekGroups.map((group) => (
                  <div key={group.module?.id ?? 'unassigned'}>
                    {group.module ? (
                      <>
                        <button
                          onClick={() => setExpandedModules(p => ({ ...p, [group.module!.id]: !p[group.module!.id] }))}
                          className="w-full flex items-center justify-between gap-3 rounded-xl border border-[#F5C518]/20 bg-[#F5C518]/5 p-4 hover:border-[#F5C518]/40 hover:bg-[#F5C518]/10 transition-colors"
                        >
                          <div className="text-left min-w-0">
                            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#F5C518] mb-1">
                              Module {group.module.position ?? ''}
                            </p>
                            <p className="text-base font-semibold text-white">{group.module.title}</p>
                            <p className="text-xs text-white/40 mt-1">{group.weeks.length} {unit.toLowerCase()}{group.weeks.length !== 1 ? 's' : ''}</p>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`text-white/40 shrink-0 transition-transform duration-200 ${expandedModules[group.module.id] ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {expandedModules[group.module.id] && (
                          <div className="mt-2 ml-2 space-y-2 pl-4 border-l border-white/10">
                            {group.weeks.map(week => {
                              const isComplete = week.progress.status === 'COMPLETE'
                              const isInProgress = week.progress.status === 'IN_PROGRESS'
                              return (
                                <a
                                  key={week.id}
                                  href={`/course/${course.slug}/week/${week.slug}`}
                                  className={`flex items-center justify-between gap-3 rounded-lg p-3 text-sm transition-colors ${
                                    isComplete
                                      ? 'border border-[#F5C518]/20 bg-[#F5C518]/5 text-white'
                                      : isInProgress
                                        ? 'border border-teal-400/20 bg-teal-400/5 text-white'
                                        : 'border border-white/8 bg-white/[0.02] text-white/70 hover:bg-white/[0.05]'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    {isComplete && <CheckCircle2 size={14} className="text-[#F5C518] shrink-0" />}
                                    <div className="min-w-0">
                                      <p className="text-[11px] font-mono text-white/40">{unit} {week.number}</p>
                                      <p className="font-medium truncate">{week.title}</p>
                                    </div>
                                  </div>
                                  <span className="text-[11px] text-white/30 shrink-0">{week.durationLabel}</span>
                                </a>
                              )
                            })}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="space-y-2">
                        {group.weeks.map(week => {
                          const isComplete = week.progress.status === 'COMPLETE'
                          const isInProgress = week.progress.status === 'IN_PROGRESS'
                          return (
                            <a
                              key={week.id}
                              href={`/course/${course.slug}/week/${week.slug}`}
                              className={`flex items-center justify-between gap-3 rounded-lg p-3 text-sm transition-colors ${
                                isComplete
                                  ? 'border border-[#F5C518]/20 bg-[#F5C518]/5 text-white'
                                  : isInProgress
                                    ? 'border border-teal-400/20 bg-teal-400/5 text-white'
                                    : 'border border-white/8 bg-white/[0.02] text-white/70 hover:bg-white/[0.05]'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {isComplete && <CheckCircle2 size={14} className="text-[#F5C518] shrink-0" />}
                                <div className="min-w-0">
                                  <p className="text-[11px] font-mono text-white/40">{unit} {week.number}</p>
                                  <p className="font-medium truncate">{week.title}</p>
                                </div>
                              </div>
                              <span className="text-[11px] text-white/30 shrink-0">{week.durationLabel}</span>
                            </a>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modules roadmap — pictorial flow of the modules in this course */}
            {weekGroups.filter(g => !!g.module).length > 0 && (
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
                <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-[0.18em] text-white/30 mb-1">Modules roadmap</p>
                    <h3 className="font-display text-2xl font-extrabold text-white">Your journey through {weekGroups.filter(g => !!g.module).length} module{weekGroups.filter(g => !!g.module).length !== 1 ? 's' : ''}</h3>
                  </div>
                  {continueWeek && (
                    <a href={`/course/${course.slug}/week/${continueWeek.slug}`} className="text-sm text-[#F5C518] hover:text-[#FFE070] transition-colors">
                      Jump back in →
                    </a>
                  )}
                </div>

                {/* Pictorial: numbered nodes connected by a vertical "track" on the left */}
                <div className="relative pl-2">
                  {/* The connecting track */}
                  <div className="absolute top-6 bottom-6 left-[31px] w-[2px] bg-gradient-to-b from-[#F5C518]/40 via-white/10 to-white/5" />

                  <div className="space-y-5">
                    {weekGroups.filter(g => !!g.module).map((group, gi) => {
                      const moduleWeeks = group.weeks
                      const completedCount = moduleWeeks.filter(w => w.progress.status === 'COMPLETE').length
                      const inProgressCount = moduleWeeks.filter(w => w.progress.status === 'IN_PROGRESS').length
                      const totalMin = moduleWeeks.reduce((s, w) => s + w.estimatedCompletionMinutes, 0)
                      const allDone = completedCount === moduleWeeks.length && moduleWeeks.length > 0
                      const started = completedCount > 0 || inProgressCount > 0
                      const firstUnfinished = moduleWeeks.find(w => w.progress.status !== 'COMPLETE')
                      const ctaWeek = firstUnfinished ?? moduleWeeks[0]
                      return (
                        <motion.div
                          key={group.module!.id}
                          initial={{ opacity: 0, x: -8 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: gi * 0.08 }}
                          className="relative flex items-stretch gap-5"
                        >
                          {/* Numbered node */}
                          <div className="relative flex-shrink-0">
                            <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center font-display text-xl font-extrabold border-4 ${
                              allDone
                                ? 'bg-[#F5C518] text-[#0A0A0A] border-[#F5C518]/30'
                                : started
                                  ? 'bg-teal-400 text-[#0A0A0A] border-teal-400/30'
                                  : 'bg-[#0F0F11] text-white/60 border-white/15'
                            }`}>
                              {allDone ? <CheckCircle2 size={26} /> : gi + 1}
                            </div>
                          </div>

                          {/* Module card */}
                          <a
                            href={ctaWeek ? `/course/${course.slug}/week/${ctaWeek.slug}` : undefined}
                            className={`group flex-1 rounded-2xl border p-5 transition-colors ${
                              allDone
                                ? 'border-[#F5C518]/20 bg-[#F5C518]/[0.04] hover:border-[#F5C518]/40'
                                : started
                                  ? 'border-teal-400/20 bg-teal-400/[0.04] hover:border-teal-400/40'
                                  : 'border-white/10 bg-black/20 hover:border-white/25'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="min-w-0">
                                <p className={`text-[10px] font-mono uppercase tracking-[0.18em] mb-1 ${
                                  allDone ? 'text-[#F5C518]' : started ? 'text-teal-400' : 'text-white/40'
                                }`}>
                                  Module {gi + 1}
                                </p>
                                <h4 className="text-base font-semibold text-white leading-snug">{group.module!.title}</h4>
                              </div>
                              {(allDone || started) && (
                                <span className={`text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap ${
                                  allDone ? 'text-[#F5C518]' : 'text-teal-400'
                                }`}>
                                  {allDone ? 'Complete' : 'In progress'}
                                </span>
                              )}
                            </div>
                            {group.module!.description && (
                              <p className="text-xs text-white/45 leading-relaxed mb-3 line-clamp-2">
                                {group.module!.description}
                              </p>
                            )}
                            {/* Progress bar */}
                            <div className="mb-3">
                              <div className="h-1 rounded-full bg-white/8 overflow-hidden">
                                <div
                                  className={`h-full transition-all ${allDone ? 'bg-[#F5C518]' : 'bg-teal-400'}`}
                                  style={{ width: `${moduleWeeks.length === 0 ? 0 : (completedCount / moduleWeeks.length) * 100}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-xs text-white/45">
                              <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-1"><BookOpen size={11} />{moduleWeeks.length} {unit.toLowerCase()}{moduleWeeks.length !== 1 ? 's' : ''}</span>
                                <span className="inline-flex items-center gap-1"><Clock3 size={11} />{totalMin >= 60 ? `${Math.round(totalMin / 60)}h` : `${totalMin}m`}</span>
                                <span>{completedCount}/{moduleWeeks.length} done</span>
                              </div>
                              {ctaWeek && (
                                <span className="inline-flex items-center gap-1 text-white/60 group-hover:text-white transition-colors">
                                  {allDone ? 'Review' : started ? 'Continue' : 'Start'} <ArrowRight size={11} />
                                </span>
                              )}
                            </div>
                          </a>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
