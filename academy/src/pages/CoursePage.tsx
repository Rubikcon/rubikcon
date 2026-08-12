import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'wouter'
import { motion } from 'framer-motion'
import { ArrowRight, Award, BookOpen, CheckCircle2, ChevronDown, Clock3, Loader2, PlayCircle, Users, Lock } from 'lucide-react'
import AcademyNavbar from '../components/AcademyNavbar'
import PreviewBanner from '../components/PreviewBanner'
import VideoEmbed from '../components/VideoEmbed'
import EmbedFrame from '../components/EmbedFrame'
import { apiRequest } from '../lib/api'
import { getStoredAuth } from '../lib/auth'
import { coursePriceInfo } from '../lib/pricing'
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
  if ((facilitator.name || '').toLowerCase().includes('joy egbu')) return '/icons/joy-egbu.jpeg'
  return null
}

function CoursePageInner() {
  const params = useParams<{ slug?: string }>()
  const slug = params.slug || DEFAULT_COURSE_SLUG

  const [course, setCourse] = useState<CourseSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)
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
    setEnrollError(null)
    try {
      await apiRequest(`/academy/courses/${slug}/enroll`, { method: 'POST' })
      const data = await apiRequest<CourseSummary>(`/academy/courses/${slug}`)
      setCourse(data)
    } catch (err) {
      setEnrollError(err instanceof Error ? err.message : 'Enrolment failed. Please try again.')
    } finally {
      setEnrolling(false)
    }
  }

  const continueWeek = useMemo(() => {
    if (!(course?.weeks || []).length) return null
    return (course?.weeks || []).find(w => w?.progress?.status !== 'COMPLETE') || (course?.weeks || [])[0]
  }, [course])

  // Group weeks by module (preserving week order)
  const weekGroups = useMemo(() => {
    if (!course) return []
    const hasModules = (course.modules?.length ?? 0) > 0 && (course.weeks || []).some(w => w.moduleId)
    if (!hasModules) return [{ module: null, weeks: course.weeks || [] }]

    const groups: Array<{ module: CourseSummary['modules'][number] | null; weeks: typeof course.weeks }> = []
    const unassigned = (course.weeks || []).filter(w => !w.moduleId)

    for (const mod of (course.modules || [])) {
      const modWeeks = (course.weeks || []).filter(w => w.moduleId === mod.id)
      if (modWeeks.length > 0) groups.push({ module: mod, weeks: modWeeks })
    }
    if (unassigned.length > 0) groups.push({ module: null, weeks: unassigned })
    return groups
  }, [course])

  const defaultExpandedModuleId = useMemo(() => {
    if (!course) return null
    if (continueWeek && continueWeek.moduleId) return continueWeek.moduleId
    return course.modules?.[0]?.id || null
  }, [course, continueWeek])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <AcademyNavbar showBack backHref="/" backLabel="Home" solid />
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
        <AcademyNavbar showBack backHref="/" backLabel="Home" solid />
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

  const unit = course.contentUnit || 'Lesson'
  const learnerUnit = 'Module'
  const learnerUnits = 'Modules'
  const units = `${unit}s`

  // ── Not enrolled: show overview + enroll CTA ─────────────────────────────
  const price = coursePriceInfo(course)
  if (!course.enrolled) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <AcademyNavbar showBack backHref="/" backLabel="Home" solid />
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
                  {(course.modules?.length || 0) || course.totalWeeks} {learnerUnit.toLowerCase()}{((course.modules?.length || 0) || course.totalWeeks) !== 1 ? 's' : ''}
                </span>
                {course.estimatedDuration && (
                  <span className="inline-flex items-center gap-2">
                    <Clock3 size={14} className="text-[#F5C518]" />
                    {course.estimatedDuration}
                  </span>
                )}
                {(course.facilitators?.length || 0) > 0 && (
                  <span className="inline-flex items-center gap-2">
                    <Users size={14} className="text-[#F5C518]" />
                    {(course.facilitators?.length || 0)} facilitator{(course.facilitators?.length || 0) !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Pricing */}
              {price ? (
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  {price.discounted && (
                    <span className="text-white/35 line-through decoration-white/40 text-lg">{price.original}</span>
                  )}
                  <span className="font-display text-2xl font-extrabold text-[#F5C518]">{price.current}</span>
                  {price.discounted && (
                    <span className="rounded-full bg-[#F5C518]/15 border border-[#F5C518]/30 text-[#F5C518] text-xs font-bold px-2.5 py-1">
                      Save {price.discountPercent}%
                    </span>
                  )}
                  <span className="w-full text-xs text-white/35">
                    Online payment (card via Paystack &amp; crypto) is launching soon — enrol now to reserve your seat and our team will follow up on payment.
                  </span>
                </div>
              ) : (
                <p className="mb-6 text-xs text-white/40 max-w-xl leading-relaxed">
                  Programme fees and cohort schedules are announced before each intake. From time to time we also
                  offer funded or subsidised cohorts through partnerships with ecosystem organisations and sponsors —{' '}
                  <a href="/contact" className="text-[#F5C518] hover:text-[#FFE070] underline underline-offset-2">contact us</a>{' '}
                  about current pricing, scholarships, or funded opportunities.
                </p>
              )}

              {/* Enroll CTA */}
              {enrollError && (
                <div className="mb-4 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {enrollError}
                </div>
              )}
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
                <a href="/" className="text-sm text-white/40 hover:text-white/60 transition-colors">
                  Back to Home
                </a>
              </div>
            </motion.div>

            {/* Facilitators */}
            {(course.facilitators?.length || 0) > 0 && (
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6 mb-6">
                <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-4">Taught by</p>
                <div className="flex flex-wrap gap-4">
                  {(course.facilitators || []).map(f => {
                    const initials = (f.name || '').replace(/^(Dr|Mr|Ms|Prof)\.\s*/i, '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
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
                Course outline — {(course.modules?.length || 0) || course.totalWeeks} {learnerUnit.toLowerCase()}{((course.modules?.length || 0) || course.totalWeeks) !== 1 ? 's' : ''}
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
                        return (
                          <div key={week?.id} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-black/20 px-5 py-4">
                            <div className="font-display text-2xl font-extrabold text-[#F5C518]/40 w-10 shrink-0">
                              {String(week?.number).padStart(2, '0')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white/70">{week?.title}</p>
                              <p className="text-xs text-white/30 mt-0.5">{week?.durationLabel} · {week?.estimatedCompletionMinutes} min</p>
                            </div>
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

  // Determine which module to expand by default


  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: prev[moduleId] !== undefined ? !prev[moduleId] : moduleId !== defaultExpandedModuleId
    }))
  }

  const isModuleExpanded = (moduleId: string) => {
    if (expandedModules[moduleId] !== undefined) return expandedModules[moduleId]
    return moduleId === defaultExpandedModuleId
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {isFacilitatorPreview && (
        <PreviewBanner
          status={course.status}
          published={course.published}
          backToAdminUrl={`/admin/courses/${course.id}`}
          contextMessage="You're seeing this course exactly as learners will. Unpublished weeks are included."
        />
      )}
      <AcademyNavbar solid />
      
      {/* 1. Header Banner */}
      <header className="pt-28 pb-10 px-4 md:px-6 border-b border-white/10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#F5C518]/10 via-[#0A0A0A] to-[#0A0A0A]">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <p className="text-xs font-mono uppercase tracking-widest text-[#F5C518] mb-3">
              {course.level || 'Programme'}{course.estimatedDuration ? ` • ${course.estimatedDuration}` : ''}
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
              {course.title}
            </h1>
            
            {/* Contextual Description */}
            {course.description && (
              <p className="text-white/60 text-sm md:text-base max-w-2xl leading-relaxed line-clamp-2 mb-6">
                {course.description}
              </p>
            )}

            <div className="flex items-center gap-4 max-w-md">
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#F5C518] to-[#E8B800] rounded-full"
                  style={{ width: `${course.progressPercent}%` }}
                />
              </div>
              <span className="text-sm font-bold text-white shrink-0">{course.progressPercent}%</span>
            </div>
            <p className="text-xs text-white/40 mt-2">
              {course.completedCount} of {course.totalWeeks} {unit.toLowerCase()}{course.totalWeeks !== 1 ? 's' : ''} complete
            </p>
          </div>
          
          <div className="shrink-0 flex flex-col items-start md:items-end">
            {continueWeek && (
              <a
                href={`/course/${course.slug}/week/${continueWeek?.slug}`}
                className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-bold px-8 py-3.5 rounded-full hover:bg-[#E8B800] transition-colors whitespace-nowrap mb-2"
              >
                {course.progressPercent === 100 
                  ? 'Review Course' 
                  : course.progressPercent > 0 
                    ? 'Continue Learning' 
                    : 'Start Learning'}
                <ArrowRight size={16} />
              </a>
            )}
            {continueWeek && course.progressPercent < 100 && (
              <p className="text-xs text-white/50 pl-2 md:pl-0 mt-2 md:mt-3">
                Up next: <span className="text-white/80 font-medium">{learnerUnit} {continueWeek?.number}</span>
              </p>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Content Grid */}
      <main className="flex-1 px-4 md:px-6 py-10 md:py-12">
        <div className="max-w-[1100px] mx-auto grid lg:grid-cols-[1fr_320px] gap-10 items-start">
          
          {/* Left Column: Curriculum */}
          <section className="min-w-0 order-2 lg:order-1">
            <h2 className="text-xl font-display font-extrabold text-white mb-6">Course Curriculum</h2>
            
            <div className="space-y-4">
              {weekGroups.map((group, gi) => {
                const moduleId = group.module?.id ?? `unassigned-${gi}`
                const isExpanded = isModuleExpanded(moduleId)
                const moduleWeeks = group.weeks
                const completedCount = moduleWeeks.filter(w => w?.progress?.status === 'COMPLETE').length
                const totalMin = moduleWeeks.reduce((s, w) => s + w.estimatedCompletionMinutes, 0)
                const allDone = completedCount === moduleWeeks.length && moduleWeeks.length > 0
                
                return (
                  <div key={moduleId} className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden transition-colors hover:border-white/20">
                    <button
                      onClick={() => toggleModule(moduleId)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 focus:outline-none focus:bg-white/[0.04]"
                      aria-expanded={isExpanded}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`text-[10px] font-mono uppercase tracking-[0.15em] ${allDone ? 'text-[#F5C518]' : 'text-white/40'}`}>
                            {learnerUnit} {gi + 1}
                          </span>
                          {allDone && <span className="text-[10px] font-bold text-[#F5C518] uppercase tracking-wider bg-[#F5C518]/10 px-2 py-0.5 rounded">Complete</span>}
                        </div>
                        <h3 className="text-base font-semibold text-white leading-snug pr-4">
                          {group.module?.title ?? 'Additional Lessons'}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                          <span className="flex items-center gap-1.5"><BookOpen size={12} /> {moduleWeeks.length} lessons</span>
                          {totalMin > 0 && <span className="flex items-center gap-1.5"><Clock3 size={12} /> {totalMin >= 60 ? `${Math.round(totalMin / 60)}h` : `${totalMin}m`}</span>}
                          <span>{completedCount}/{moduleWeeks.length} done</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-white/40 transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                        <ChevronDown size={20} />
                      </div>
                    </button>
                    
                    {/* Lessons List (Progressive Disclosure) */}
                    {isExpanded && (
                      <div className="border-t border-white/5 bg-black/20">
                        {moduleWeeks.map((week, wi) => {
                          const isComplete = week?.progress?.status === 'COMPLETE'
                          const isCurrent = week?.id === continueWeek?.id
                          const isLocked = false
                          
                          return (
                            <a
                              key={week?.id}
                              href={isLocked ? '#' : `/course/${course.slug}/week/${week?.slug}`}
                              className={`flex items-center gap-4 p-4 border-b border-white/5 last:border-b-0 transition-colors ${
                                isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/[0.04]'
                              }`}
                              aria-disabled={isLocked}
                              tabIndex={isLocked ? -1 : 0}
                            >
                              <div className="shrink-0">
                                {isComplete ? (
                                  <CheckCircle2 size={18} className="text-[#F5C518]" />
                                ) : isCurrent ? (
                                  <PlayCircle size={18} className="text-[#F5C518]" />
                                ) : isLocked ? (
                                  <Lock size={18} className="text-white/20" />
                                ) : (
                                  <div className="w-[18px] h-[18px] rounded-full border-2 border-white/20" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${isCurrent ? 'text-[#F5C518]' : 'text-white'}`}>
                                  <span className="text-white/40 font-normal mr-2">{wi + 1}.</span>
                                  {week?.title}
                                </p>
                              </div>
                              {week?.durationLabel && (
                                <span className="shrink-0 text-xs text-white/30">{week?.durationLabel}</span>
                              )}
                            </a>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* Right Column: Resources Sidebar */}
          <aside className="order-1 lg:order-2 space-y-6">

            {/* Certificate Highlight */}
            <div className="rounded-2xl border border-[#F5C518]/20 bg-[#F5C518]/[0.05] p-5">
              <div className="w-10 h-10 rounded-xl bg-[#F5C518]/15 border border-[#F5C518]/30 flex items-center justify-center mb-3">
                <Award size={20} className="text-[#F5C518]" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">Certificate of Completion</h3>
              <p className="text-xs text-white/60 leading-relaxed mb-4">
                Finish all lessons, assignments, and quizzes to unlock your certificate and showcase it on LinkedIn.
              </p>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-2">
                <div className="h-full bg-[#F5C518]" style={{ width: `${course.progressPercent}%` }} />
              </div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#F5C518] text-right">
                {course.progressPercent}% Earned
              </p>
            </div>

            {/* Course Overview Slides */}
            {course.overviewSlideUrl && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <BookOpen size={16} className="text-[#F5C518]" />
                  Course Slides
                </h3>
                <div className="mb-3 rounded-lg overflow-hidden border border-white/10">
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
                  Open in full screen <ArrowRight size={12} />
                </a>
              </div>
            )}

            {/* Facilitators */}
            {(course.facilitators || []).length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Users size={16} className="text-[#F5C518]" />
                  Facilitators
                </h3>
                <div className="space-y-4">
                  {(course.facilitators || []).map(f => (
                    <div key={f.id} className="flex items-center gap-3">
                      {facilitatorPhotoUrl(f) ? (
                        <img src={facilitatorPhotoUrl(f)!} alt={f.name} className="w-10 h-10 rounded-full object-cover bg-white/10 shrink-0 border border-white/10" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                          <Users size={16} className="text-white/40" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{f.name}</p>
                        <p className="text-xs text-white/50 truncate">{f.title || f.organization}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

        </div>
      </main>
    </div>
  )
}





class ErrorBoundary extends React.Component<{children: React.ReactNode}, {error: string | null, stack: string | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props)
    this.state = { error: null, stack: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { error: error.message || String(error), stack: error.stack || '' }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-black text-red-500 p-8 font-mono">
          <h1 className="text-3xl font-bold mb-4">CRASH!</h1>
          <p className="text-xl mb-4">{this.state.error}</p>
          <pre className="bg-white/10 p-4 rounded text-sm overflow-auto whitespace-pre-wrap">{this.state.stack}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

export default function CoursePage() {
  return <ErrorBoundary><CoursePageInner /></ErrorBoundary>
}

