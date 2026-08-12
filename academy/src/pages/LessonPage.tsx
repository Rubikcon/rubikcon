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
  Menu,
  Play,
  Presentation,
  Share2,
  Search,
  X,
} from 'lucide-react'
import { apiRequest, ApiError } from '../lib/api'
import { getStoredAuth } from '../lib/auth'
import VideoEmbed, { getEmbedUrl } from '../components/VideoEmbed'
import EmbedFrame from '../components/EmbedFrame'
import HtmlVideoPlayer from '../components/HtmlVideoPlayer'
import PreviewBanner from '../components/PreviewBanner'
import SlideViewer from '../components/SlideViewer'
import LessonRating from '../components/LessonRating'
import ModuleFeedback from '../components/ModuleFeedback'
import RubikconGamesPopup from '../components/RubikconGamesPopup'
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
  const [showGamesPopup, setShowGamesPopup] = useState(false)
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
  const [isCompleting, setIsCompleting] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const auth = getStoredAuth()

  async function handleMarkComplete() {
    if (!week || !auth || isCompleting || week.progress.status === 'COMPLETE') return
    try {
      setIsCompleting(true)
      await apiRequest(`/academy/weeks/${week.slug}/complete`, { method: 'POST' })
      setWeek(cur => cur ? {
        ...cur,
        progress: { ...cur.progress, status: 'COMPLETE', completedAt: new Date().toISOString() },
      } : cur)
      setCourse(cur => cur ? {
        ...cur,
        completedCount: cur.completedCount + 1,
        progressPercent: Math.round(((cur.completedCount + 1) / cur.totalWeeks) * 100),
      } : cur)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to mark lesson complete.')
    } finally {
      setIsCompleting(false)
    }
  }

  function copyShareLink(videoId: string) {
    const url = `${window.location.origin}/share/course/${courseSlug}/week/${weekSlug}/video/${videoId}`
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    })
  }

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
      const result = await apiRequest<any>(`/academy/quizzes/${week.assignment.quiz.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      })
      await loadWeekPage()
      setActiveTab('quiz')
      if (result.passed) {
        setShowGamesPopup(true)
      }
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

  const SidebarContent = () => (
    <>
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
          course.weeks.map(item => {
            const isActive = item.slug === weekSlug
            const isDone = item.progress.status === 'COMPLETE'
            return (
              <a
                key={item.id}
                href={`/course/${course.slug}/week/${item.slug}`}
                className={`flex items-center gap-3 px-4 py-2.5 border-l-[3px] transition-colors ${
                  isActive ? 'border-[#F5C518] bg-gradient-to-r from-[#F5C518]/15 to-transparent text-white' : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-colors ${isDone ? 'border-[#F5C518] bg-[#F5C518]/15' : 'border-white/20'}`}>
                  {isDone && <CheckCircle2 size={10} className="text-[#F5C518]" />}
                  {isActive && !isDone && <div className="w-2 h-2 rounded-full bg-[#F5C518]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/30 font-mono mb-0.5">{unit} {item.number}</p>
                  <p className="text-[13px] font-semibold truncate">{item.title}</p>
                  <p className="text-[11px] text-white/40 mt-0.5 flex items-center gap-1"><Clock3 size={10} />{item.durationLabel}</p>
                </div>
              </a>
            )
          })
        )}
      </div>
    </>
  )

  const isFacilitatorPreview = week.viewerMode === 'facilitator-preview' || course.viewerMode === 'facilitator-preview'
  return (
    <div className="flex flex-col bg-[#0A0A0A]" style={{ height: '100dvh', overflow: 'hidden' }}>
      {isFacilitatorPreview && (
        <PreviewBanner
          status={course.status}
          published={course.published}
          backToAdminUrl={`/admin/courses/${course.id}`}
          contextMessage={`Lesson preview — '${week.title}'. This is exactly what learners will see when they reach this lesson.`}
        />
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex xl:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative flex flex-col w-[300px] max-w-[80vw] h-full bg-[#0F0F11] border-r border-white/10 shadow-2xl z-10"
          >
            <SidebarContent />
          </motion.div>
        </div>
      )}

      <div className="flex flex-1 min-h-0 relative">

      {/* ── Left Sidebar (Desktop) ── */}
      <aside className="hidden xl:flex flex-col w-[320px] flex-shrink-0 bg-[#0A0A0A] border-r border-white/10 overflow-hidden relative z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5C518]/[0.02] to-transparent pointer-events-none" />
        <SidebarContent />
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-[#0A0A0A] relative z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#F5C518]/5 via-[#0A0A0A]/0 to-transparent pointer-events-none z-0" />

        {/* Top bar */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 md:px-6 py-3 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/10 z-20 relative">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="xl:hidden p-1.5 -ml-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
          >
            <Menu size={20} />
          </button>
          
          <a
            href={`/course/${course.slug}`}
            className="flex items-center gap-1 text-sm font-medium text-white/50 hover:text-white transition-colors shrink-0"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline max-w-[160px] truncate">{course.title}</span>
          </a>
          <div className="w-px h-4 bg-white/15 hidden sm:block" />
          <p className="text-sm font-medium text-white/80 truncate min-w-0">
            {week.module && <span className="text-white/40">{week.module.title} {' · '} </span>}
            <span className="text-white/40">{unit} {week.number} {' · '} </span>
            <span className="text-white/70">{week.title}</span>
          </p>

          {/* Progress controls */}
          <div className="ml-auto flex items-center gap-3 shrink-0 relative z-20">
            {activeVideo && (
              <button
                onClick={() => copyShareLink(activeVideo.id)}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
                title="Copy share link"
              >
                {linkCopied ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span className="hidden sm:inline text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 size={14} />
                    <span className="hidden sm:inline">Share</span>
                  </>
                )}
              </button>
            )}

            {week.progress.status === 'COMPLETE' ? (
              <span
                title={week.progress.completedAt ? `Completed ${new Date(week.progress.completedAt).toLocaleDateString()}` : 'Completed'}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-bold text-emerald-300"
              >
                <CheckCircle2 size={14} /> Completed
              </span>
            ) : (
              <button
                onClick={() => void handleMarkComplete()}
                disabled={isCompleting || !auth}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#F5C518]/30 bg-[#F5C518]/10 px-4 py-2 text-xs font-bold text-[#F5C518] hover:bg-[#F5C518]/20 transition-colors disabled:opacity-40"
                title={auth ? 'Mark this lesson as complete' : 'Sign in to track progress'}
              >
                {isCompleting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Mark complete
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
        <div className="flex-1 overflow-y-auto relative z-10" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>

          {/* ── Video Player ── */}
          {week.videos.length > 0 && (
            <div className="bg-black">
              {/* Player + sidebar layout */}
              <div className={`flex flex-col ${week.videos.length > 1 ? 'lg:flex-row' : ''}`}>
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
                        onEnded={() => void handleMarkComplete()}
                      />
                    )
                  )}
                  {/* Video title + description strip - shown under the player for all multi-video lessons */}
                  {activeVideo && week.videos.length > 1 && (
                    <div className="px-4 py-3 border-t border-white/[0.06] bg-black/40 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[11px] font-mono uppercase tracking-widest text-[#F5C518]/60 mb-0.5">Video {activeVideoIdx + 1} of {week.videos.length}</p>
                        <p className="text-sm font-semibold text-white truncate">{activeVideo.title}</p>
                        {activeVideo.description && (
                          <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{activeVideo.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {activeVideoIdx > 0 && (
                          <button
                            onClick={() => setActiveVideoIdx(i => i - 1)}
                            className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-colors"
                            title="Previous video"
                          >
                            <ChevronLeft size={13} />
                          </button>
                        )}
                        {activeVideoIdx < week.videos.length - 1 && (
                          <button
                            onClick={() => setActiveVideoIdx(i => i + 1)}
                            className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-colors"
                            title="Next video"
                          >
                            <ChevronRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar playlist — only for >1 videos */}
                {week.videos.length > 1 && (
                  <aside className="lg:w-[300px] lg:flex-shrink-0 lg:border-l border-t lg:border-t-0 border-white/[0.07] bg-black/60 lg:max-h-[56.25vw] lg:overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                    <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm px-4 py-3 border-b border-white/[0.07]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#F5C518] text-[#0A0A0A] flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {week.videos.length}
                        </div>
                        <p className="text-sm font-semibold text-white">Videos in this lesson</p>
                      </div>
                    </div>
                    <div className="p-3 space-y-1.5">
                      {week.videos.map((v, i) => (
                        <button
                          key={v.id}
                          onClick={() => setActiveVideoIdx(i)}
                          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                            i === activeVideoIdx
                              ? 'bg-[#F5C518]/15 border border-[#F5C518]/30 text-white'
                              : 'border border-white/8 text-white/60 hover:border-white/20 hover:bg-white/[0.04] hover:text-white/90'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                            i === activeVideoIdx ? 'bg-[#F5C518] text-[#0A0A0A]' : 'bg-white/10 text-white/60'
                          }`}>
                            {i === activeVideoIdx ? <Play size={10} fill="currentColor" /> : <span className="text-[11px] font-semibold">{i + 1}</span>}
                          </div>
                          <span className="flex-1 truncate text-xs leading-snug">{v.title}</span>
                          {i === activeVideoIdx && (
                            <span className="text-[9px] font-semibold uppercase tracking-wider text-[#F5C518] flex-shrink-0">Playing</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </aside>
                )}
              </div>
            </div>
          )}

          {/* ── Tabs ── */}
          <div className="sticky top-0 z-10 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/[0.07]">
            <div className="max-w-4xl mx-auto px-4 md:px-8 flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {TABS.filter(t => !t.hidden).map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex-shrink-0 flex items-center gap-2 px-3 py-3.5 text-sm font-medium transition-colors ${
                      isActive ? 'text-white' : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-[#F5C518]' : ''} />
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeLessonTab"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F5C518]"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
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
              <div className="space-y-10">
                {/* Lesson header */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    {week.module && (
                      <span className="text-xs font-semibold tracking-wide text-[#0A0A0A] bg-[#F5C518] rounded-full px-3 py-1">
                        {week.module.title}
                      </span>
                    )}
                    <span className="text-xs font-medium text-white/50 bg-white/5 rounded-full px-3 py-1 border border-white/10">
                      {unit} {week.number}
                    </span>
                    <span className="text-xs font-medium text-white/50 flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1 border border-white/10">
                      <Clock3 size={12} /> {week.durationLabel}
                    </span>
                  </div>
                  <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                    {week.title}
                  </h1>
                  <p className="text-white/60 leading-relaxed text-lg max-w-3xl">
                    {week.summary}
                  </p>
                </div>

                {/* Lesson rich-text content */}
                {week.lessonDetails.lessonContent && (
                  <div
                    className="prose prose-invert prose-sm max-w-none text-white/60 leading-relaxed [&_h2]:text-white [&_h3]:text-white/90 [&_strong]:text-white/80 [&_a]:text-[#F5C518] [&_a:hover]:underline"
                    dangerouslySetInnerHTML={{ __html: week.lessonDetails.lessonContent }}
                  />
                )}

                {/* Lesson images */}
                {week.lessonDetails.images.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
                    {week.lessonDetails.images.map(img => (
                      <img
                        key={img.id}
                        src={img.url}
                        alt={img.alt || img.caption || week.title}
                        title={img.caption || undefined}
                        className="h-44 w-auto rounded-xl object-cover flex-shrink-0 border border-white/8"
                      />
                    ))}
                  </div>
                )}

                {/* Instructor(s) */}
                {week.lessonDetails.facilitators.length > 0 && (
                  <div className="mt-8">
                    <p className="text-[11px] font-mono uppercase tracking-widest text-white/30 mb-4">Instructor{week.lessonDetails.facilitators.length > 1 ? 's' : ''}</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      {week.lessonDetails.facilitators.map(f => (
                        <div key={f.id} className="relative group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-all">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5C518]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                          <div className="relative flex items-start gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F5C518]/20 to-transparent border border-[#F5C518]/30 text-[#F5C518] flex items-center justify-center font-display font-extrabold text-lg shrink-0 shadow-lg">
                              {f.name.split(' ').map((p: string) => p[0]).join('').slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white text-base">{f.name}</p>
                              <p className="text-sm font-medium text-[#F5C518]/90">{f.title}</p>
                              <p className="text-xs text-white/40 mb-2">{f.organization}</p>
                              {f.bio && <p className="text-sm text-white/60 leading-relaxed mb-3 line-clamp-2">{f.bio}</p>}
                              <div className="flex flex-wrap gap-3 text-sm">
                                <a href={f.emailMailto} className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-xs bg-white/5 rounded-full px-3 py-1 border border-white/10">
                                  <Mail size={12} /> {f.emailMasked}
                                </a>
                                {f.linkedinUrl && (
                                  <a href={f.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#F5C518] hover:text-[#0A0A0A] hover:bg-[#F5C518] transition-colors text-xs bg-[#F5C518]/10 rounded-full px-3 py-1 border border-[#F5C518]/20">
                                    LinkedIn
                                  </a>
                                )}
                              </div>
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

                {/* Lesson Rating */}
                {week.progress && (
                  <LessonRating weekSlug={week.slug} initialRating={week.progress.rating} />
                )}

                {/* Module Feedback (only at the end of a module) */}
                {week.module && 
                 (!week.navigation.next || week.navigation.next.moduleId !== week.module.id) && 
                 week.progress?.status === 'COMPLETE' && (
                  <ModuleFeedback moduleId={week.module.id} moduleTitle={week.module.title} />
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
                <div className="flex flex-wrap items-start justify-between gap-6 bg-gradient-to-r from-white/[0.03] to-transparent p-6 rounded-3xl border border-white/5">
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-widest text-[#F5C518]/80 mb-2">Weekly Assessment</p>
                    <h4 className="font-display text-3xl font-extrabold text-white mb-1.5">{week.assignment.quiz.title}</h4>
                    <p className="text-sm font-medium text-white/50">
                      Pass mark {week.assignment.quiz.passMark}% <span className="mx-2 text-white/20">•</span> {week.assignment.quiz.questions.length} question{week.assignment.quiz.questions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {week.assignment.quiz.latestAttempt && (
                    <div className="relative overflow-hidden rounded-2xl border border-[#F5C518]/20 bg-[#F5C518]/10 px-6 py-4 text-right shadow-lg shadow-[#F5C518]/5">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#F5C518]/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                      <div className="relative">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Your score</p>
                        <p className="font-display text-4xl font-extrabold text-[#F5C518] drop-shadow-md">{week.assignment.quiz.latestAttempt.percentage}%</p>
                        <p className={`text-xs font-semibold mt-1 ${week.assignment.quiz.latestAttempt.percentage >= week.assignment.quiz.passMark ? 'text-emerald-400' : 'text-red-400'}`}>
                          {week.assignment.quiz.latestAttempt.percentage >= week.assignment.quiz.passMark ? 'Passed' : 'Not passed'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {week.assignment.quiz.questions.map((question, index) => (
                    <div key={question.id} className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
                      <p className="text-[11px] font-semibold tracking-widest text-white/40 mb-3">QUESTION {index + 1}</p>
                      <h5 className="text-white text-lg font-semibold mb-6 leading-relaxed">{question.prompt}</h5>
                      <div className="space-y-3">
                        {question.options.map(option => {
                          const submitted = week.assignment.quiz?.submitted
                          const selected = submitted ? option.isSelected : quizSelections[question.id] === option.id
                          const optionCls = submitted
                            ? option.isCorrect
                              ? 'border-emerald-400/50 bg-emerald-400/10 text-white shadow-[0_0_15px_rgba(52,211,153,0.1)]'
                              : option.isSelected
                                ? 'border-red-400/40 bg-red-400/10 text-white shadow-[0_0_15px_rgba(248,113,113,0.1)]'
                                : 'border-white/5 bg-white/[0.01] text-white/30 opacity-70'
                            : selected
                              ? 'border-[#F5C518]/50 bg-[#F5C518]/10 text-white shadow-[0_0_15px_rgba(245,197,24,0.1)] -translate-y-0.5'
                              : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20 hover:bg-white/[0.04] hover:text-white hover:-translate-y-0.5'
                          
                          return (
                            <button
                              key={option.id}
                              onClick={() => !submitted && setQuizSelections(c => ({ ...c, [question.id]: option.id }))}
                              disabled={submitted}
                              className={`w-full text-left rounded-2xl border px-5 py-4 text-sm font-medium transition-all active:scale-[0.99] ${optionCls}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                  submitted
                                    ? option.isCorrect
                                      ? 'border-emerald-400 bg-emerald-400/20'
                                      : option.isSelected
                                        ? 'border-red-400 bg-red-400/20'
                                        : 'border-white/10'
                                    : selected
                                      ? 'border-[#F5C518] bg-[#F5C518]/20'
                                      : 'border-white/20 group-hover:border-white/40'
                                }`}>
                                  {submitted && option.isCorrect && <CheckCircle2 size={12} className="text-emerald-400" />}
                                  {submitted && option.isSelected && !option.isCorrect && <X size={12} className="text-red-400" />}
                                  {!submitted && selected && <div className="w-2.5 h-2.5 rounded-full bg-[#F5C518]" />}
                                </div>
                                <span className="leading-snug">{option.label}</span>
                              </div>
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

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => void submitQuiz()}
                    disabled={quizSubmitting}
                    className="inline-flex items-center gap-2 rounded-full bg-[#F5C518] px-6 py-2.5 text-sm font-bold text-[#0A0A0A] hover:bg-[#FFD020] disabled:opacity-50 transition-colors"
                  >
                    {quizSubmitting ? <><Loader2 size={14} className="animate-spin" />Submitting…</> : (week.assignment.quiz.submitted ? 'Retake quiz' : 'Submit quiz')}
                  </button>
                  {week.assignment.quiz.submitted && (
                    <p className="text-xs text-white/45">You can retake this quiz to improve your score.</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Assignment tab ── */}
            {activeTab === 'assignment' && (
              <div className="space-y-8">
                <div className="mb-8">
                  <p className="text-[11px] font-mono uppercase tracking-widest text-[#F5C518]/80 mb-2">Assignments</p>
                  <h4 className="font-display text-3xl font-extrabold text-white">This week's deliverable</h4>
                </div>

                {week.assignment.tasks.map(task => {
                  const draft = assignmentDrafts[task.id] || {
                    choiceId: task.latestSubmission?.choiceId ?? undefined,
                    textResponse: task.latestSubmission?.textResponse || '',
                  }
                  return (
                    <div key={task.id} className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                        <div>
                          <h5 className="text-xl font-bold text-white leading-tight">{task.title}</h5>
                          <p className="text-sm text-[#F5C518]/80 mt-1">Deadline: {new Date(task.deadline).toLocaleString()}</p>
                        </div>
                        <span className={`rounded-full px-4 py-1.5 text-xs font-bold tracking-wide shadow-lg ${
                          task.status === 'SUBMITTED' ? 'bg-[#F5C518]/20 text-[#F5C518] border border-[#F5C518]/30 shadow-[#F5C518]/5'
                          : task.status === 'REVIEWED' ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30 shadow-emerald-400/5'
                          : 'bg-white/10 text-white/70 border border-white/20'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-base text-white/60 leading-relaxed mb-8">{task.instructions}</p>

                      {!!task.choices.length && (
                        <div className="grid gap-4 md:grid-cols-2 mb-8">
                          {task.choices.map(choice => (
                            <button
                              key={choice.id}
                              onClick={() => setAssignmentDrafts(c => ({ ...c, [task.id]: { ...draft, choiceId: choice.id } }))}
                              className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all active:scale-[0.99] ${
                                draft.choiceId === choice.id 
                                  ? 'border-[#F5C518] bg-[#F5C518]/10 shadow-[0_0_20px_rgba(245,197,24,0.15)] -translate-y-1' 
                                  : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] hover:-translate-y-1'
                              }`}
                            >
                              <div className={`absolute top-0 right-0 w-2 h-2 rounded-full m-4 transition-colors ${draft.choiceId === choice.id ? 'bg-[#F5C518]' : 'bg-transparent'}`} />
                              <h6 className={`font-semibold text-base mb-2 transition-colors ${draft.choiceId === choice.id ? 'text-[#F5C518]' : 'text-white'}`}>{choice.title}</h6>
                              <p className="text-sm text-white/50 leading-relaxed">{choice.description}</p>
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
      <RubikconGamesPopup open={showGamesPopup} onClose={() => setShowGamesPopup(false)} />
      </div>
    </div>
  )
}
