import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'wouter'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  HelpCircle,
  Loader2,
  Mail,
  Play,
  Presentation,
  Search,
  X,
} from 'lucide-react'
import { apiRequest, ApiError } from '../lib/api'
import { getStoredAuth } from '../lib/auth'
import VideoEmbed, { getEmbedUrl } from '../components/VideoEmbed'
import EmbedFrame from '../components/EmbedFrame'
import HtmlVideoPlayer from '../components/HtmlVideoPlayer'
import SlideViewer from '../components/SlideViewer'
import type { CourseSummary, CourseWeekSummary, ReadingType, WeekDetail } from '../types/academy'

type LessonTab = 'overview' | 'slides' | 'resources' | 'quiz' | 'assignment'

const RESOURCE_TAGS: ReadingType[] = ['ARTICLE', 'COURSE', 'DOCUMENTATION', 'WHITEPAPER', 'VIDEO', 'INTERACTIVE']

// ── Sidebar group (collapsible module section) ────────────────────────────────

function SidebarGroup({
  label,
  weeks,
  courseSlug,
  currentSlug,
  defaultOpen,
  unit,
}: {
  label: string
  weeks: CourseWeekSummary[]
  courseSlug: string
  currentSlug: string
  defaultOpen: boolean
  unit: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  const doneCount = weeks.filter(w => w.progress.status === 'COMPLETE').length
  const totalMin = weeks.reduce((a, w) => a + w.estimatedCompletionMinutes, 0)

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between gap-2 px-4 py-3 hover:bg-white/[0.04] transition-colors text-left"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white leading-snug">{label}</p>
          <p className="text-[11px] text-white/30 mt-0.5">
            {doneCount}/{weeks.length} {' · '} {Math.round(totalMin / 60 * 10) / 10}h
          </p>
        </div>
        <ChevronDown
          size={14}
          className={`text-white/35 mt-1 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && weeks.map(item => {
        const isActive = item.slug === currentSlug
        const isDone = item.progress.status === 'COMPLETE'
        const isInProgress = item.progress.status === 'IN_PROGRESS'

        return (
          <a
            key={item.id}
            href={`/course/${courseSlug}/week/${item.slug}`}
            className={`flex items-center gap-3 pl-4 pr-3 py-2.5 border-l-2 transition-colors ${
              isActive
                ? 'border-[#F5C518] bg-[#F5C518]/8 text-white'
                : 'border-transparent hover:bg-white/[0.03] text-white/55 hover:text-white/80'
            }`}
          >
            {/* Status circle */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              isDone
                ? 'border-[#F5C518] bg-[#F5C518]/15'
                : isInProgress
                  ? 'border-white/35 bg-white/5'
                  : 'border-white/15'
            }`}>
              {isDone && <CheckCircle2 size={10} className="text-[#F5C518]" />}
              {isActive && !isDone && <div className="w-2 h-2 rounded-full bg-[#F5C518]" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white/25 font-mono mb-0.5">{unit} {item.number}</p>
              <p className="text-[13px] leading-snug truncate font-medium">{item.title}</p>
              <p className="text-[11px] text-white/30 mt-0.5 flex items-center gap-1">
                <Play size={8} />
                {item.durationLabel}
              </p>
            </div>
          </a>
        )
      })}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LessonPage() {
  const params = useParams<{ slug: string; weekSlug: string }>()
  const courseSlug = params.slug
  const weekSlug = params.weekSlug

  const [course, setCourse] = useState<CourseSummary | null>(null)
  const [week, setWeek] = useState<WeekDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<LessonTab>('overview')
  const [glossaryQuery, setGlossaryQuery] = useState('')
  const [resourceFilter, setResourceFilter] = useState<'ALL' | ReadingType>('ALL')
  const [quizSelections, setQuizSelections] = useState<Record<string, string>>({})
  const [quizSubmitting, setQuizSubmitting] = useState(false)
  const [assignmentSavingId, setAssignmentSavingId] = useState<string | null>(null)
  const [assignmentDrafts, setAssignmentDrafts] = useState<Record<string, { choiceId?: string; textResponse: string }>>({})
  const [activeVideoIdx, setActiveVideoIdx] = useState(0)
  // Active slide-deck id when the modal viewer is open (null = closed)
  const [activeSlideDeckId, setActiveSlideDeckId] = useState<string | null>(null)

  const auth = getStoredAuth()

  async function loadWeekPage() {
    const [courseData, weekData] = await Promise.all([
      apiRequest<CourseSummary>(`/academy/courses/${courseSlug}`),
      apiRequest<WeekDetail>(`/academy/weeks/${weekSlug}`),
    ])
    setCourse(courseData)
    setWeek(weekData)
    setActiveVideoIdx(0)
    setQuizSelections({})
    setAssignmentDrafts({})
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        await loadWeekPage()
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError) {
          if (err.status === 401) {
            window.location.href = `/login?redirect=/course/${courseSlug}/${weekSlug}`
            return
          }
          if (err.status === 403) {
            window.location.href = `/course/${courseSlug}`
            return
          }
        }
        setError(err instanceof Error ? err.message : 'Failed to load week content.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [courseSlug, weekSlug])

  const filteredGlossary = useMemo(() => {
    if (!week) return []
    const q = glossaryQuery.trim().toLowerCase()
    return week.resources.glossary.filter(t =>
      !q || t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
    )
  }, [glossaryQuery, week])

  const filteredReadings = useMemo(() => {
    if (!week) return []
    return week.resources.readings.filter(r => resourceFilter === 'ALL' || r.type === resourceFilter)
  }, [resourceFilter, week])

  // Group course weeks by module for the sidebar
  const sidebarGroups = useMemo(() => {
    if (!course) return []
    const byModule = new Map<string | null, CourseWeekSummary[]>()
    for (const w of course.weeks) {
      const key = w.moduleId ?? null
      if (!byModule.has(key)) byModule.set(key, [])
      byModule.get(key)!.push(w)
    }
    const groups: Array<{ moduleId: string | null; label: string; position: number; weeks: CourseWeekSummary[] }> = []
    for (const mod of course.modules) {
      const weeks = byModule.get(mod.id) ?? []
      if (weeks.length) groups.push({ moduleId: mod.id, label: mod.title, position: mod.position, weeks })
    }
    const unassigned = byModule.get(null) ?? []
    if (unassigned.length) groups.push({ moduleId: null, label: 'Course Weeks', position: 999, weeks: unassigned })
    return groups.sort((a, b) => a.position - b.position)
  }, [course])

  async function toggleSavedTerm(termId: string, saved: boolean) {
    if (!auth) { window.location.href = '/login'; return }
    try {
      if (saved) {
        await apiRequest(`/academy/glossary/save/${termId}`, { method: 'DELETE' })
      } else {
        await apiRequest('/academy/glossary/save', { method: 'POST', body: JSON.stringify({ termId }) })
      }
      setWeek(cur => cur ? {
        ...cur,
        resources: {
          ...cur.resources,
          glossary: cur.resources.glossary.map(t => t.id === termId ? { ...t, saved: !saved } : t),
        },
      } : cur)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update glossary term.')
    }
  }

  const [marking, setMarking] = useState(false)
  async function markLessonComplete() {
    if (!auth) { window.location.href = '/login'; return }
    if (!week) return
    try {
      setMarking(true)
      const result = await apiRequest<{ status: string; completedAt: string | null }>(
        `/academy/weeks/${week.slug}/complete`,
        { method: 'POST' }
      )
      // Reflect locally so the UI flips immediately without a full reload.
      setWeek(cur => cur ? {
        ...cur,
        progress: {
          ...cur.progress,
          status: result.status as any,
          completedAt: result.completedAt,
        },
      } : cur)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to mark lesson complete.')
    } finally {
      setMarking(false)
    }
  }

  async function toggleReading(resourceId: string, read: boolean) {
    if (!auth) { window.location.href = '/login'; return }
    try {
      await apiRequest(`/academy/resources/${resourceId}/mark-read`, { method: 'POST' })
      setWeek(cur => cur ? {
        ...cur,
        resources: {
          ...cur.resources,
          readings: cur.resources.readings.map(r => r.id === resourceId ? { ...r, read: !read } : r),
        },
      } : cur)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update reading progress.')
    }
  }

  async function submitQuiz() {
    if (!week?.assignment.quiz || !auth) { if (!auth) window.location.href = '/login'; return }
    const answers = week.assignment.quiz.questions.map(q => ({
      questionId: q.id,
      selectedOptionId: quizSelections[q.id],
    }))
    if (answers.some(a => !a.selectedOptionId)) { setError('Please answer every question.'); return }
    try {
      setQuizSubmitting(true)
      setError(null)
      await apiRequest(`/academy/quizzes/${week.assignment.quiz.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      })
      await loadWeekPage()
      setActiveTab('quiz')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to submit quiz.')
    } finally {
      setQuizSubmitting(false)
    }
  }

  async function submitAssignment(assignmentId: string) {
    if (!week || !auth) { if (!auth) window.location.href = '/login'; return }
    const draft = assignmentDrafts[assignmentId]
    try {
      setAssignmentSavingId(assignmentId)
      setError(null)
      await apiRequest(`/academy/assignments/${assignmentId}/submissions`, {
        method: 'POST',
        body: JSON.stringify({ choiceId: draft?.choiceId, textResponse: draft?.textResponse?.trim() }),
      })
      await loadWeekPage()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit assignment.')
    } finally {
      setAssignmentSavingId(null)
    }
  }

  // ── Loading / error ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#F5C518] mb-3 mx-auto" size={28} />
          <p className="text-white/50 text-sm">Loading lesson…</p>
        </div>
      </div>
    )
  }

  if (error && !week) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-display text-2xl font-extrabold text-white mb-2">Week unavailable</h1>
          <p className="text-white/50 mb-6">{error}</p>
          <a href={`/course/${courseSlug}`} className="inline-flex items-center gap-2 rounded-full bg-[#F5C518] px-6 py-2.5 text-sm font-bold text-[#0A0A0A]">
            Back to course
          </a>
        </div>
      </div>
    )
  }

  if (!week || !course) return null

  const activeVideo = week.videos[activeVideoIdx] ?? null
  const embedSrc = activeVideo ? getEmbedUrl(activeVideo.url) : null
  const unit = week.course.contentUnit   // e.g. "Lesson", "Week", "Module"
  const units = `${unit}s`              // pluralised

  const TABS: Array<{ id: LessonTab; label: string; icon: typeof BookOpen; hidden?: boolean }> = [
    { id: 'overview',    label: 'Overview',    icon: BookOpen },
    { id: 'slides',      label: 'Slides',      icon: Presentation,   hidden: !week.resources.slideDecks?.length },
    { id: 'resources',   label: 'Resources',   icon: ExternalLink,   hidden: !week.resources.readings.length && !week.resources.glossary.length },
    { id: 'quiz',        label: 'Quiz',        icon: HelpCircle,     hidden: !week.assignment.quiz },
    { id: 'assignment',  label: 'Assignment',  icon: ClipboardCheck, hidden: week.assignment.tasks.length === 0 },
  ]

  return (
    <div className="flex bg-[#0A0A0A]" style={{ height: '100dvh', overflow: 'hidden' }}>

      {/* ── Left Sidebar ──────────────────────────────────────────────────── */}
      <aside className="hidden xl:flex flex-col w-[320px] flex-shrink-0 bg-[#0F0F11] border-r border-white/[0.07] overflow-hidden">

        {/* Course header */}
        <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-white/[0.07]">
          <a
            href={`/course/${course.slug}`}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mb-3"
          >
            <X size={13} /> Close player
          </a>
          <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#F5C518]/60 mb-1">
            Programme
          </p>
          <h2 className="text-sm font-bold text-white leading-snug mb-3 line-clamp-2">{course.title}</h2>
          {/* Overall progress */}
          <div className="h-1 rounded-full bg-white/8 overflow-hidden mb-1.5">
            <div className="h-full bg-[#F5C518] transition-all" style={{ width: `${course.progressPercent}%` }} />
          </div>
          <p className="text-[11px] text-white/30">
            {course.completedCount} / {course.totalWeeks} {units.toLowerCase()} complete
          </p>
        </div>

        {/* Week list */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
          {sidebarGroups.length > 0 ? (
            sidebarGroups.map(group => (
              <SidebarGroup
                key={group.moduleId ?? 'ungrouped'}
                label={group.label}
                weeks={group.weeks}
                courseSlug={course.slug}
                currentSlug={weekSlug ?? ''}
                defaultOpen={group.weeks.some(w => w.slug === weekSlug)}
                unit={unit}
              />
            ))
          ) : (
            // Flat list fallback (no modules)
            course.weeks.map(item => {
              const isActive = item.slug === weekSlug
              const isDone = item.progress.status === 'COMPLETE'
              return (
                <a
                  key={item.id}
                  href={`/course/${course.slug}/week/${item.slug}`}
                  className={`flex items-center gap-3 px-4 py-2.5 border-l-2 transition-colors ${
                    isActive ? 'border-[#F5C518] bg-[#F5C518]/8 text-white' : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isDone ? 'border-[#F5C518] bg-[#F5C518]/15' : 'border-white/15'}`}>
                    {isDone && <CheckCircle2 size={10} className="text-[#F5C518]" />}
                    {isActive && !isDone && <div className="w-2 h-2 rounded-full bg-[#F5C518]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-white/25 font-mono mb-0.5">{unit} {item.number}</p>
                    <p className="text-[13px] font-medium truncate">{item.title}</p>
                    <p className="text-[11px] text-white/30 mt-0.5 flex items-center gap-1"><Play size={8} />{item.durationLabel}</p>
                  </div>
                </a>
              )
            })
          )}
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* Top bar */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 md:px-6 py-3 bg-[#0F0F11] border-b border-white/[0.07] z-10">
          <a
            href={`/course/${course.slug}`}
            className="flex items-center gap-1 text-sm text-white/45 hover:text-white transition-colors shrink-0"
          >
            <ChevronLeft size={15} />
            <span className="hidden sm:inline max-w-[160px] truncate">{course.title}</span>
          </a>
          <div className="w-px h-4 bg-white/10 hidden sm:block" />
          <p className="text-sm text-white/60 truncate min-w-0">
            {week.module && <span className="text-white/35">{week.module.title} {' · '} </span>}
            <span className="text-white/35">{unit} {week.number} {' · '} </span>
            <span className="text-white/70">{week.title}</span>
          </p>

          {/* Mark complete / completed indicator */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            {week.progress.status === 'COMPLETE' ? (
              <span
                title={week.progress.completedAt ? `Completed ${new Date(week.progress.completedAt).toLocaleDateString()}` : 'Completed'}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300"
              >
                <CheckCircle2 size={12} /> Completed
              </span>
            ) : (
              <button
                onClick={markLessonComplete}
                disabled={marking}
                title="Mark this lesson complete"
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-400/20 hover:border-emerald-400/50 transition-colors disabled:opacity-50"
              >
                {marking
                  ? <Loader2 size={12} className="animate-spin" />
                  : <CheckCircle2 size={12} />}
                {marking ? 'Saving…' : 'Mark complete'}
              </button>
            )}

            {/* Prev / Next */}
            {week.navigation.previous ? (
              <a
                href={`/course/${course.slug}/week/${week.navigation.previous.slug}`}
                title={week.navigation.previous.title}
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/25 transition-colors"
              >
                <ChevronLeft size={14} />
              </a>
            ) : <div className="w-8" />}
            {week.navigation.next ? (
              <a
                href={`/course/${course.slug}/week/${week.navigation.next.slug}`}
                className="flex items-center gap-1.5 rounded-full bg-[#F5C518] px-4 py-1.5 text-xs font-bold text-[#0A0A0A] hover:bg-[#FFD020] transition-colors"
              >
                Next <ArrowRight size={11} />
              </a>
            ) : null}
          </div>
        </div>

        {/* Scrollable area */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>

          {/* ── Video Player + side playlist (when lesson has multiple videos) ── */}
          {week.videos.length > 0 && (
            <div className="bg-black flex flex-col lg:flex-row">
              {/* Primary player */}
              <div className="flex-1 min-w-0">
                {activeVideo && (
                  embedSrc ? (
                    <EmbedFrame
                      key={activeVideo.id}
                      src={embedSrc}
                      title={activeVideo.title}
                      fallbackUrl={activeVideo.url}
                      className="rounded-none"
                    />
                  ) : (
                    <HtmlVideoPlayer
                      key={activeVideo.id}
                      src={activeVideo.url}
                      title={activeVideo.title}
                    />
                  )
                )}
              </div>

              {/* Video playlist sidebar — sits BESIDE the player on lg+ screens, stacks below on smaller */}
              {week.videos.length > 1 && (
                <aside className="lg:w-[320px] lg:flex-shrink-0 lg:border-l border-t lg:border-t-0 border-white/[0.07] bg-black/60 lg:max-h-[56.25vw] lg:overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                  <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm px-4 py-3 border-b border-white/[0.07]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#F5C518] text-[#0A0A0A] flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        {week.videos.length}
                      </div>
                      <p className="text-sm font-semibold text-white">
                        Videos in this lesson
                      </p>
                    </div>
                    <p className="text-[11px] text-white/40 mt-0.5 ml-8">Click any video to play</p>
                  </div>
                  <div className="p-3 space-y-1.5">
                    {week.videos.map((v, i) => (
                      <button
                        key={v.id}
                        onClick={() => setActiveVideoIdx(i)}
                        className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors ${
                          i === activeVideoIdx
                            ? 'bg-[#F5C518]/15 border border-[#F5C518]/30 text-white'
                            : 'border border-white/8 text-white/60 hover:border-white/20 hover:bg-white/[0.04] hover:text-white/90'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                          i === activeVideoIdx ? 'bg-[#F5C518] text-[#0A0A0A]' : 'bg-white/10 text-white/60'
                        }`}>
                          {i === activeVideoIdx ? (
                            <Play size={10} fill="currentColor" />
                          ) : (
                            <span className="text-[11px] font-semibold">{i + 1}</span>
                          )}
                        </div>
                        <span className="flex-1 truncate text-xs leading-snug">{v.title}</span>
                        {i === activeVideoIdx && (
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-[#F5C518] flex-shrink-0">
                            Playing
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </aside>
              )}
            </div>
          )}

          {/* ── Tabs ── */}
          <div className="sticky top-0 z-10 bg-[#0F0F11]/95 backdrop-blur-sm border-b border-white/[0.07]">
            <div className="max-w-4xl mx-auto px-4 md:px-8 flex items-center gap-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {TABS.filter(t => !t.hidden).map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-[#F5C518] text-white'
                        : 'border-transparent text-white/40 hover:text-white/70'
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Tab content ── */}
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 pb-16">

            {error && (
              <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100 flex items-start justify-between gap-3">
                {error}
                <button onClick={() => setError(null)} className="text-red-200/50 hover:text-red-100 shrink-0">
                  <X size={14} />
                </button>
              </div>
            )}

            {!auth && (
              <div className="mb-6 rounded-2xl border border-[#F5C518]/15 bg-[#F5C518]/8 px-4 py-3 text-sm text-white/65">
                <a href="/login" className="text-[#F5C518] hover:underline">Sign in</a> to save terms, track readings, submit quizzes, and upload assignments.
              </div>
            )}

            {/* ── Overview tab ── */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Lesson header */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {week.module && (
                      <span className="text-xs font-mono uppercase tracking-widest text-[#F5C518]/70 bg-[#F5C518]/10 border border-[#F5C518]/20 rounded-full px-3 py-0.5">
                        {week.module.title}
                      </span>
                    )}
                    <span className="text-xs text-white/30 font-mono">{unit} {week.number}</span>
                    <span className="text-xs text-white/20 font-mono">·</span>
                    <span className="text-xs text-white/30 font-mono flex items-center gap-1"><Clock3 size={10} /> {week.durationLabel}</span>
                  </div>
                  <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-3 leading-tight">{week.title}</h1>
                  <p className="text-white/55 leading-relaxed text-base">{week.summary}</p>
                </div>

                {/* Instructor(s) */}
                {week.lessonDetails.facilitators.length > 0 && (
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-3">Instructor{week.lessonDetails.facilitators.length > 1 ? 's' : ''}</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      {week.lessonDetails.facilitators.map(f => (
                        <div key={f.id} className="flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                          <div className="w-12 h-12 rounded-xl bg-[#F5C518]/15 text-[#F5C518] flex items-center justify-center font-display font-extrabold text-base shrink-0">
                            {f.name.split(' ').map((p: string) => p[0]).join('').slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white">{f.name}</p>
                            <p className="text-sm text-white/50">{f.title}</p>
                            <p className="text-sm text-white/35">{f.organization}</p>
                            <div className="flex flex-wrap gap-3 mt-2 text-sm">
                              <a href={f.emailMailto} className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-xs">
                                <Mail size={12} /> {f.emailMasked}
                              </a>
                              {f.linkedinUrl && (
                                <a href={f.linkedinUrl} target="_blank" rel="noreferrer" className="text-xs text-[#F5C518] hover:text-[#FFE070] transition-colors">
                                  LinkedIn
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Course details (level, duration, etc) */}
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-3">Course details</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/55">
                    {course.estimatedDuration && <span><span className="text-white/30">Duration</span> {course.estimatedDuration}</span>}
                    {course.level && <span><span className="text-white/30">Level</span> {course.level}</span>}
                    <span><span className="text-white/30">Lessons</span> {course.totalWeeks}</span>
                  </div>
                  {course.description && (
                    <div className="mt-4 pt-4 border-t border-white/8">
                      <p className="text-sm text-white/50 leading-relaxed">{course.description}</p>
                    </div>
                  )}
                </div>

                {/* Topics + Objectives */}
                <div className="grid gap-5 md:grid-cols-2">
                  {week.lessonDetails.topics.length > 0 && (
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                      <h4 className="font-semibold text-white mb-3 text-sm">Topics covered</h4>
                      <ol className="space-y-2.5">
                        {week.lessonDetails.topics.map((topic, i) => (
                          <li key={topic} className="flex items-start gap-3 text-white/55 text-sm">
                            <span className="w-5 h-5 rounded-full bg-white/6 text-[10px] font-mono text-[#F5C518]/70 flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                            {topic}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {week.lessonDetails.objectives.length > 0 && (
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                      <h4 className="font-semibold text-white mb-3 text-sm">Learning objectives</h4>
                      <ul className="space-y-2.5">
                        {week.lessonDetails.objectives.map(obj => (
                          <li key={obj} className="flex items-start gap-2.5 text-white/55 text-sm">
                            <CheckCircle2 size={14} className="text-[#F5C518]/70 mt-0.5 shrink-0" />
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* What to expect */}
                {week.lessonDetails.whatToExpect && (
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                    <h4 className="font-semibold text-white mb-3 text-sm">What to expect</h4>
                    <p className="text-sm text-white/50 leading-relaxed">{week.lessonDetails.whatToExpect}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Slides tab — dedicated view for slide decks ── */}
            {activeTab === 'slides' && week.resources.slideDecks && week.resources.slideDecks.length > 0 && (
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-widest text-white/30 mb-1">
                    Slide deck{week.resources.slideDecks.length !== 1 ? 's' : ''}
                  </p>
                  <h3 className="font-display text-2xl font-extrabold text-white">
                    {week.resources.slideDecks.length} slide deck{week.resources.slideDecks.length !== 1 ? 's' : ''} for this lesson
                  </h3>
                </div>
                {week.resources.slideDecks.map(deck => (
                  <div key={deck.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                    {/* Inline embedded preview with skeleton loader + fallback if the embed fails */}
                    <div className="mb-4">
                      <EmbedFrame
                        src={deck.url}
                        fallbackUrl={deck.url}
                        title={deck.title}
                      />
                    </div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-white mb-1 truncate">{deck.title}</h4>
                        <div className="flex flex-wrap gap-3 text-xs text-white/35 mb-2">
                          <span>{deck.slideCount} slide{deck.slideCount !== 1 ? 's' : ''}</span>
                          <span>Updated {new Date(deck.lastUpdatedAt).toLocaleDateString()}</span>
                        </div>
                        {deck.sections.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {deck.sections.map(section => (
                              <span key={section} className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-white/50">{section}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap flex-shrink-0">
                        {deck.viewerType === 'MODAL' && (
                          <button
                            onClick={() => setActiveSlideDeckId(deck.id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#F5C518] px-4 py-2.5 text-sm font-semibold text-[#0A0A0A] hover:bg-[#FFD020] transition-colors"
                          >
                            View Slides
                          </button>
                        )}
                        <a
                          href={deck.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                        >
                          Open <ExternalLink size={13} />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Modal viewer (only mounted when MODAL-type deck is active) */}
                {(() => {
                  const active = week.resources.slideDecks.find(d => d.id === activeSlideDeckId)
                  if (!active) return null
                  return (
                    <SlideViewer
                      url={active.url}
                      title={active.title}
                      slideCount={active.slideCount}
                      sections={active.sections}
                      viewerType={active.viewerType}
                      onClose={() => setActiveSlideDeckId(null)}
                    />
                  )
                })()}
              </div>
            )}

            {/* ── Resources tab ── */}
            {activeTab === 'resources' && (
              <div className="space-y-6">
                {/* Readings */}
                {week.resources.readings.length > 0 && (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div>
                        <p className="text-[11px] font-mono uppercase tracking-widest text-white/30 mb-1">Extra reading</p>
                        <h4 className="font-semibold text-white">Curated references</h4>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => setResourceFilter('ALL')}
                          className={`rounded-full px-3 py-1 text-xs transition-colors ${resourceFilter === 'ALL' ? 'bg-[#F5C518] text-[#0A0A0A] font-semibold' : 'border border-white/10 text-white/55 hover:text-white'}`}
                        >All</button>
                        {RESOURCE_TAGS.map(tag => (
                          <button
                            key={tag}
                            onClick={() => setResourceFilter(tag)}
                            className={`rounded-full px-3 py-1 text-xs transition-colors ${resourceFilter === tag ? 'bg-[#F5C518] text-[#0A0A0A] font-semibold' : 'border border-white/10 text-white/55 hover:text-white'}`}
                          >{tag}</button>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {filteredReadings.map(resource => (
                        <div key={resource.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-mono tracking-widest uppercase text-[#F5C518]/70">{resource.type}</span>
                            <button
                              onClick={() => void toggleReading(resource.id, resource.read)}
                              className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${resource.read ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'border border-white/10 text-white/55 hover:text-white'}`}
                            >{resource.read ? 'Read' : 'Mark read'}</button>
                          </div>
                          <h5 className="font-semibold text-white text-sm mb-0.5">{resource.title}</h5>
                          <p className="text-xs text-white/35 mb-2">{resource.source}</p>
                          <p className="text-sm text-white/50 leading-relaxed mb-3 line-clamp-3">{resource.description}</p>
                          <a href={resource.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-[#F5C518] hover:text-[#FFE070] transition-colors">
                            Open <ExternalLink size={12} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Glossary */}
                {week.resources.glossary.length > 0 && (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div>
                        <p className="text-[11px] font-mono uppercase tracking-widest text-white/30 mb-1">Key terms</p>
                        <h4 className="font-semibold text-white">Glossary</h4>
                      </div>
                      <div className="relative">
                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                        <input
                          value={glossaryQuery}
                          onChange={e => setGlossaryQuery(e.target.value)}
                          placeholder="Search terms…"
                          className="rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-[#F5C518]/40 w-40"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {filteredGlossary.map(term => (
                        <details key={term.id} className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 group">
                          <summary className="flex items-center justify-between gap-3 cursor-pointer list-none">
                            <div className="flex items-center gap-2 min-w-0">
                              <h5 className="text-sm font-medium text-white truncate">{term.term}</h5>
                              {term.example && <span className="text-[10px] text-white/25 shrink-0">+ example</span>}
                            </div>
                            <button
                              type="button"
                              onClick={e => { e.preventDefault(); void toggleSavedTerm(term.id, term.saved) }}
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium shrink-0 transition-colors ${term.saved ? 'bg-[#F5C518] text-[#0A0A0A]' : 'border border-white/10 text-white/45 hover:border-white/20'}`}
                            >{term.saved ? 'Saved' : 'Save'}</button>
                          </summary>
                          <div className="pt-3 mt-3 border-t border-white/8 text-sm text-white/50 leading-relaxed">
                            <p>{term.definition}</p>
                            {term.example && <p className="mt-2 text-white/35"><span className="text-white/55">Example:</span> {term.example}</p>}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Quiz tab ── */}
            {activeTab === 'quiz' && week.assignment.quiz && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-widest text-white/30 mb-2">Weekly quiz</p>
                    <h4 className="font-display text-2xl font-bold text-white">{week.assignment.quiz.title}</h4>
                    <p className="text-sm text-white/45 mt-1">
                      Pass mark {week.assignment.quiz.passMark}% {' · '} {week.assignment.quiz.questions.length} question{week.assignment.quiz.questions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {week.assignment.quiz.latestAttempt && (
                    <div className="rounded-2xl border border-[#F5C518]/20 bg-[#F5C518]/8 px-5 py-3 text-right">
                      <p className="text-[10px] uppercase tracking-widest text-white/35 mb-0.5">Your score</p>
                      <p className="font-display text-3xl font-extrabold text-[#F5C518]">{week.assignment.quiz.latestAttempt.percentage}%</p>
                      <p className={`text-xs mt-0.5 ${week.assignment.quiz.latestAttempt.percentage >= week.assignment.quiz.passMark ? 'text-emerald-400' : 'text-red-400'}`}>
                        {week.assignment.quiz.latestAttempt.percentage >= week.assignment.quiz.passMark ? 'Passed' : 'Not passed'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {week.assignment.quiz.questions.map((question, index) => (
                    <div key={question.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-2">Question {index + 1}</p>
                      <h5 className="text-white font-semibold mb-4 leading-relaxed">{question.prompt}</h5>
                      <div className="space-y-2">
                        {question.options.map(option => {
                          const submitted = week.assignment.quiz?.submitted
                          const selected = submitted ? option.isSelected : quizSelections[question.id] === option.id
                          const optionCls = submitted
                            ? option.isCorrect
                              ? 'border-emerald-400/40 bg-emerald-400/10 text-white'
                              : option.isSelected
                                ? 'border-red-400/30 bg-red-400/10 text-white'
                                : 'border-white/6 bg-white/[0.02] text-white/40'
                            : selected
                              ? 'border-[#F5C518]/40 bg-[#F5C518]/10 text-white'
                              : 'border-white/8 bg-white/[0.02] text-white/60 hover:border-white/18 hover:text-white/80'
                          return (
                            <button
                              key={option.id}
                              disabled={!!week.assignment.quiz?.submitted}
                              onClick={() => setQuizSelections(c => ({ ...c, [question.id]: option.id }))}
                              className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-colors ${optionCls}`}
                            >
                              {option.label}
                            </button>
                          )
                        })}
                      </div>
                      {week.assignment.quiz?.submitted && question.explanation && (
                        <p className="mt-4 pt-4 border-t border-white/8 text-sm text-white/45 leading-relaxed">
                          <span className="text-white/60 font-medium">Explanation: </span>{question.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {!week.assignment.quiz.submitted ? (
                  <button
                    onClick={() => void submitQuiz()}
                    disabled={quizSubmitting}
                    className="inline-flex items-center gap-2 rounded-full bg-[#F5C518] px-6 py-2.5 text-sm font-bold text-[#0A0A0A] hover:bg-[#FFD020] disabled:opacity-50 transition-colors"
                  >
                    {quizSubmitting ? <><Loader2 size={14} className="animate-spin" />Submitting…</> : 'Submit quiz'}
                  </button>
                ) : (
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/45">
                    Quiz submitted. A retake requires facilitator unlock.
                  </div>
                )}
              </div>
            )}

            {/* ── Assignment tab ── */}
            {activeTab === 'assignment' && (
              <div className="space-y-5">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-widest text-white/30 mb-2">Assignments</p>
                  <h4 className="font-display text-2xl font-bold text-white">This week's deliverable</h4>
                </div>

                {week.assignment.tasks.map(task => {
                  const draft = assignmentDrafts[task.id] || {
                    choiceId: task.latestSubmission?.choiceId ?? undefined,
                    textResponse: task.latestSubmission?.textResponse || '',
                  }
                  return (
                    <div key={task.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                        <div>
                          <h5 className="text-lg font-semibold text-white">{task.title}</h5>
                          <p className="text-xs text-white/35 mt-0.5">Deadline: {new Date(task.deadline).toLocaleString()}</p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-mono ${
                          task.status === 'SUBMITTED' ? 'border-[#F5C518]/30 text-[#F5C518]'
                          : task.status === 'REVIEWED' ? 'border-emerald-400/30 text-emerald-400'
                          : 'border-white/10 text-white/45'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-sm text-white/55 leading-relaxed mb-5">{task.instructions}</p>

                      {!!task.choices.length && (
                        <div className="grid gap-3 md:grid-cols-2 mb-5">
                          {task.choices.map(choice => (
                            <button
                              key={choice.id}
                              onClick={() => setAssignmentDrafts(c => ({ ...c, [task.id]: { ...draft, choiceId: choice.id } }))}
                              className={`rounded-2xl border p-4 text-left transition-colors ${draft.choiceId === choice.id ? 'border-[#F5C518]/35 bg-[#F5C518]/8' : 'border-white/8 bg-black/20 hover:border-white/15'}`}
                            >
                              <h6 className="font-semibold text-white text-sm mb-1">{choice.title}</h6>
                              <p className="text-xs text-white/50">{choice.description}</p>
                            </button>
                          ))}
                        </div>
                      )}

                      {task.allowTextSubmission && (
                        <textarea
                          value={draft.textResponse}
                          onChange={e => setAssignmentDrafts(c => ({ ...c, [task.id]: { ...draft, textResponse: e.target.value } }))}
                          rows={7}
                          placeholder="Write your response here…"
                          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 mb-4 resize-y"
                        />
                      )}

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => void submitAssignment(task.id)}
                          disabled={assignmentSavingId === task.id}
                          className="inline-flex items-center gap-2 rounded-full bg-[#F5C518] px-5 py-2.5 text-sm font-bold text-[#0A0A0A] hover:bg-[#FFD020] disabled:opacity-50 transition-colors"
                        >
                          {assignmentSavingId === task.id ? <><Loader2 size={13} className="animate-spin" />Submitting…</> : 'Submit assignment'}
                        </button>
                        {task.latestSubmission && (
                          <span className="text-xs text-white/35">
                            Last submitted {new Date(task.latestSubmission.submittedAt).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {!!task.latestSubmission?.feedback.length && (
                        <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/8 p-4">
                          <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/60 mb-3">Facilitator feedback</p>
                          {task.latestSubmission.feedback.map(item => (
                            <div key={item.id} className="text-sm text-white/75 leading-relaxed">
                              <p>{item.feedback}</p>
                              <p className="mt-1.5 text-xs text-white/35">{item.reviewerName}{item.rating ? ` · ${item.rating}/5` : ''}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
