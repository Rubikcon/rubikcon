import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Play,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from 'lucide-react'
import AcademyNavbar from '../components/AcademyNavbar'
import { apiRequest } from '../lib/api'
import { getStoredAuth } from '../lib/auth'

type PublicCourse = {
  id: string
  slug: string
  title: string
  tagline: string | null
  level: string | null
  estimatedDuration: string | null
  heroImage: string | null
  weekCount: number
  contentUnit: string
  enrolled: boolean
  progressPercent?: number
  facilitators: Array<{ id: string; name: string; title: string; organization: string; photoUrl: string | null }>
}

// Deterministic rich gradient from course id
const GRADIENTS = [
  { from: '#1a1a2e', to: '#16213e', accent: '#4F8EF7' },
  { from: '#0f2027', to: '#203a43', accent: '#00d2ff' },
  { from: '#1a0533', to: '#2d1b69', accent: '#a855f7' },
  { from: '#0d1b2a', to: '#1b4332', accent: '#34d399' },
  { from: '#1c0a00', to: '#3d1a00', accent: '#fb923c' },
  { from: '#001219', to: '#005f73', accent: '#06b6d4' },
  { from: '#10002b', to: '#3c096c', accent: '#c084fc' },
  { from: '#0a1628', to: '#1e3a5f', accent: '#60a5fa' },
]

function courseGrad(id: string) {
  const n = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return GRADIENTS[n % GRADIENTS.length]
}

function levelKey(level: string | null) {
  return (level ?? '').split(' ')[0].toUpperCase()
}

const LEVEL_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  BEGINNER:     { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/25', label: 'Beginner' },
  INTERMEDIATE: { color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/25',     label: 'Intermediate' },
  ADVANCED:     { color: 'text-red-400',      bg: 'bg-red-400/10 border-red-400/25',         label: 'Advanced' },
}

// ── Compact progress bar ───────────────────────────────────────────────────────

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1 rounded-full bg-white/10 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="h-full bg-[#F5C518] rounded-full"
      />
    </div>
  )
}

// ── Course card ────────────────────────────────────────────────────────────────

function CourseCard({
  course,
  onEnroll,
  enrolling,
  index,
}: {
  course: PublicCourse
  onEnroll: (slug: string) => void
  enrolling: boolean
  index: number
}) {
  const lk = levelKey(course.level)
  const cfg = LEVEL_CONFIG[lk]
  const primary = course.facilitators[0]
  const grad = courseGrad(course.id)
  const progress = course.progressPercent ?? 0
  const initials = primary
    ? primary.name.replace(/^(Dr|Mr|Ms|Prof)\.\s*/i, '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'RC'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="group relative flex flex-col rounded-[20px] border border-white/[0.08] bg-[#111217] hover:border-white/20 hover:shadow-[0_8px_48px_rgba(0,0,0,0.6)] transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={() => { window.location.href = `/course/${course.slug}` }}
    >
      {/* ── Thumbnail ── */}
      <div
        className="relative h-44 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.to})` }}
      >
        {course.heroImage && (
          <img src={course.heroImage} alt={course.title} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-500" />
        )}
        {/* Orb glow */}
        <div
          className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-20 blur-2xl group-hover:opacity-35 transition-opacity duration-500"
          style={{ background: grad.accent }}
        />
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <Play size={18} className="text-white ml-0.5" fill="currentColor" />
          </div>
        </div>
        {/* Enrolled badge */}
        {course.enrolled && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-[#F5C518] px-2.5 py-1 text-[10px] font-bold text-[#0A0A0A]">
            <CheckCircle2 size={9} />
            Enrolled
          </div>
        )}
        {/* Week count */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 px-2.5 py-1 text-[10px] text-white/60">
          <BookOpen size={9} />
          {course.weekCount} {course.contentUnit.toLowerCase()}s
        </div>
        {/* Shimmer at bottom */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#111217] to-transparent" />
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-4 pt-3">
        {/* Level badge */}
        {cfg && (
          <span className={`self-start inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider mb-2 ${cfg.color} ${cfg.bg}`}>
            {cfg.label}
          </span>
        )}

        {/* Title */}
        <h3 className="font-display font-extrabold text-white text-[14px] leading-snug mb-1 line-clamp-2 group-hover:text-[#F5C518] transition-colors duration-200">
          {course.title}
        </h3>

        {/* Tagline */}
        {course.tagline && (
          <p className="text-white/38 text-[11px] leading-relaxed mb-3 line-clamp-2">{course.tagline}</p>
        )}

        {/* Instructor */}
        {primary && (
          <div className="flex items-center gap-2 mb-3">
            {primary.photoUrl ? (
              <img src={primary.photoUrl} alt={primary.name} className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-white/10" />
            ) : (
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-extrabold shrink-0"
                style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.accent}30)`, color: grad.accent, border: `1px solid ${grad.accent}40` }}
              >
                {initials}
              </div>
            )}
            <span className="text-[11px] text-white/40 truncate">{primary.name}</span>
            {course.facilitators.length > 1 && (
              <span className="text-[10px] text-white/20 shrink-0">+{course.facilitators.length - 1}</span>
            )}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-[10px] text-white/28 mb-3">
          {course.estimatedDuration && (
            <span className="flex items-center gap-1"><Clock size={9} />{course.estimatedDuration}</span>
          )}
          <span className="flex items-center gap-1">
            <Star size={9} className="text-[#F5C518]/60" fill="currentColor" />
            Free
          </span>
        </div>

        {/* Progress */}
        {course.enrolled && (
          <div className="mb-3">
            <div className="flex justify-between mb-1.5">
              <span className="text-[9px] text-white/25">{progress}% complete</span>
              {progress === 100 && <span className="text-[9px] text-emerald-400 font-semibold">Done!</span>}
            </div>
            <ProgressBar value={progress} />
          </div>
        )}

        <div className="flex-1" />

        {/* CTA */}
        {course.enrolled ? (
          <div className="flex items-center justify-between pt-3 border-t border-white/8">
            <span className="text-[11px] text-white/35">{progress > 0 ? 'Continue' : 'Start'} learning</span>
            <div
              className="w-7 h-7 rounded-full border border-[#F5C518]/30 flex items-center justify-center text-[#F5C518] group-hover:bg-[#F5C518] group-hover:text-[#0A0A0A] transition-all"
            >
              <ArrowRight size={13} />
            </div>
          </div>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); onEnroll(course.slug) }}
            disabled={enrolling}
            className="w-full mt-2 rounded-xl border border-white/10 bg-white/[0.04] text-white/70 text-[12px] font-semibold py-2.5 hover:bg-[#F5C518] hover:border-[#F5C518] hover:text-[#0A0A0A] transition-all duration-200 disabled:opacity-50"
          >
            {enrolling
              ? <span className="flex items-center justify-center gap-2"><Loader2 size={12} className="animate-spin" />Enrolling…</span>
              : 'Enrol'}
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ── Continue learning rail ────────────────────────────────────────────────────

function ContinueRail({ courses, onSelect }: { courses: PublicCourse[]; onSelect: (slug: string) => void }) {
  const railRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  function scroll(dir: 'left' | 'right') {
    if (!railRef.current) return
    railRef.current.scrollBy({ left: dir === 'right' ? 280 : -280, behavior: 'smooth' })
  }

  function updateArrows() {
    const el = railRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 8)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }

  if (courses.length === 0) return null

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-[#F5C518]" />
          <h2 className="font-display text-lg font-extrabold text-white">My learning</h2>
          <span className="rounded-full bg-[#F5C518]/15 text-[#F5C518] text-[10px] font-mono px-2 py-0.5">{courses.length}</span>
        </div>
        {courses.length > 2 && (
          <div className="flex gap-1.5">
            <button
              onClick={() => scroll('left')}
              disabled={!canLeft}
              className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/25 disabled:opacity-25 transition-all"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canRight}
              className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/25 disabled:opacity-25 transition-all"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      <div
        ref={railRef}
        onScroll={updateArrows}
        className="flex gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none' }}
      >
        {courses.map((course, i) => {
          const progress = course.progressPercent ?? 0
          const grad = courseGrad(course.id)
          const primary = course.facilitators[0]
          return (
            <motion.button
              key={course.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => onSelect(course.slug)}
              className="flex-shrink-0 w-60 rounded-[18px] border border-white/[0.08] bg-[#111217] hover:border-[#F5C518]/30 hover:shadow-[0_4px_24px_rgba(245,197,24,0.08)] transition-all overflow-hidden text-left group"
            >
              <div
                className="h-20 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.to})` }}
              >
                {course.heroImage && (
                  <img src={course.heroImage} alt="" className="w-full h-full object-cover opacity-35 group-hover:opacity-50 transition-opacity" />
                )}
                <div
                  className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20 blur-2xl"
                  style={{ background: grad.accent }}
                />
                {/* Progress overlay bar */}
                <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10">
                  <div
                    className="h-full bg-[#F5C518] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="p-3">
                <p className="text-[12px] font-semibold text-white line-clamp-2 group-hover:text-[#F5C518] transition-colors mb-1 leading-snug">{course.title}</p>
                {primary && <p className="text-[10px] text-white/30 truncate mb-2">{primary.name}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-white/25">{progress}% complete</span>
                  <span className="text-[11px] text-[#F5C518] font-semibold flex items-center gap-0.5">
                    {progress > 0 ? 'Continue' : 'Start'} <ArrowRight size={10} />
                  </span>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ── Featured spotlight ────────────────────────────────────────────────────────

function FeaturedSpotlight({ course, onEnroll, enrolling }: { course: PublicCourse; onEnroll: (slug: string) => void; enrolling: boolean }) {
  const grad = courseGrad(course.id)
  const lk = levelKey(course.level)
  const cfg = LEVEL_CONFIG[lk]
  const primary = course.facilitators[0]
  const progress = course.progressPercent ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative mb-10 rounded-[28px] overflow-hidden border border-white/[0.08] cursor-pointer group"
      onClick={() => { window.location.href = `/course/${course.slug}` }}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${grad.from} 0%, ${grad.to} 100%)` }}
      />
      {course.heroImage && (
        <img src={course.heroImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-35 transition-opacity duration-500" />
      )}
      {/* Orb */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-15 blur-3xl"
        style={{ background: grad.accent }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

      <div className="relative p-7 md:p-10 flex flex-col md:flex-row gap-6 items-start md:items-end">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 rounded-full bg-[#F5C518]/20 border border-[#F5C518]/30 px-3 py-1 text-[10px] font-mono text-[#F5C518] uppercase tracking-widest">
              <Sparkles size={9} />
              Featured course
            </div>
            {cfg && (
              <span className={`rounded-full border px-2 py-0.5 text-[9px] font-mono uppercase tracking-wide ${cfg.color} ${cfg.bg}`}>
                {cfg.label}
              </span>
            )}
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-2 leading-tight">{course.title}</h2>
          {course.tagline && (
            <p className="text-white/55 text-sm mb-4 max-w-lg leading-relaxed">{course.tagline}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-white/40">
            {primary && (
              <span className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold text-white/60">
                  {primary.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                {primary.name}
              </span>
            )}
            {course.estimatedDuration && (
              <span className="flex items-center gap-1"><Clock size={11} />{course.estimatedDuration}</span>
            )}
            <span className="flex items-center gap-1"><BookOpen size={11} />{course.weekCount} {course.contentUnit.toLowerCase()}s</span>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-stretch gap-2 min-w-[160px]">
          {course.enrolled ? (
            <div>
              <div className="flex justify-between text-[10px] text-white/40 mb-1.5">
                <span>{progress}% complete</span>
              </div>
              <ProgressBar value={progress} />
              <button className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-[#F5C518] text-[#0A0A0A] text-sm font-bold py-2.5 hover:bg-[#FFD020] transition-colors">
                {progress > 0 ? 'Continue' : 'Start'} <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={e => { e.stopPropagation(); onEnroll(course.slug) }}
              disabled={enrolling}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#F5C518] text-[#0A0A0A] text-sm font-bold px-5 py-2.5 hover:bg-[#FFD020] transition-colors disabled:opacity-50"
            >
              {enrolling ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
              {enrolling ? 'Enrolling…' : 'Enrol'}
            </button>
          )}
          <p className="text-center text-[10px] text-white/25">No credit card required</p>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CoursesPage() {
  const [courses, setCourses] = useState<PublicCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [enrollingId, setEnrollingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const auth = getStoredAuth()

  async function load() {
    try {
      setLoading(true)
      const data = await apiRequest<PublicCourse[]>('/academy/courses')
      setCourses(data)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  async function handleEnroll(slug: string) {
    if (!auth) { window.location.href = `/login?redirect=/courses`; return }
    setEnrollingId(slug)
    try {
      await apiRequest(`/academy/courses/${slug}/enroll`, { method: 'POST' })
      window.location.href = `/course/${slug}`
    } catch {
      setEnrollingId(null)
    }
  }

  const enrolledCourses = useMemo(() => courses.filter(c => c.enrolled), [courses])
  const levels = useMemo(() => [...new Set(courses.map(c => levelKey(c.level)).filter(Boolean))], [courses])
  const featured = useMemo(() => courses.find(c => !c.enrolled) ?? courses[0], [courses])

  const filtered = useMemo(() => courses.filter(c => {
    const matchSearch = !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.tagline ?? '').toLowerCase().includes(search.toLowerCase())
    const matchLevel = !levelFilter || levelKey(c.level) === levelFilter
    return matchSearch && matchLevel
  }), [courses, search, levelFilter])

  const LEVEL_LABELS: Record<string, string> = {
    BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced',
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <AcademyNavbar solid />

      {/* ── Hero ── */}
      <div className="relative pt-16 overflow-hidden border-b border-white/[0.06]">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#F5C518]/[0.04] blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-violet-500/[0.03] blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-64 h-64 rounded-full bg-cyan-500/[0.03] blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 md:px-6 py-16 text-center">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#F5C518]/20 bg-[#F5C518]/8 px-4 py-1.5 text-xs font-mono text-[#F5C518]/80 mb-5 uppercase tracking-widest">
              <Sparkles size={11} />
              Rubikcon Academy
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold text-white leading-[1.1] mb-4">
              Learn Web3.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5C518] via-[#FFD060] to-[#F5C518]">
                Build the future.
              </span>
            </h1>
            <p className="text-white/40 text-base md:text-lg mb-8 max-w-lg mx-auto leading-relaxed">
              Structured, practical courses from people shipping real products on-chain.
            </p>

            {/* Stats */}
            {!loading && courses.length > 0 && (
              <div className="flex items-center justify-center gap-6 mb-8 text-sm">
                {[
                  { val: courses.length, label: 'Courses' },
                  { val: courses.reduce((a, c) => a + c.weekCount, 0), label: 'Lessons' },
                  { val: '100%', label: 'Free' },
                ].map(({ val, label }) => (
                  <div key={label} className="text-center">
                    <div className="font-display text-xl font-extrabold text-white">{val}</div>
                    <div className="text-xs text-white/30 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="relative max-w-lg mx-auto">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search courses or skills..."
                className="w-full rounded-2xl border border-white/12 bg-white/[0.05] pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#F5C518]/50 focus:bg-white/[0.07] transition-all"
              />
            </div>
          </motion.div>
        </div>

        {/* Level filters */}
        {levels.length > 0 && (
          <div className="max-w-6xl mx-auto px-4 md:px-6 pb-5">
            <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={() => setLevelFilter('')}
                className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                  !levelFilter
                    ? 'bg-[#F5C518] border-[#F5C518] text-[#0A0A0A] font-semibold shadow-[0_0_20px_rgba(245,197,24,0.2)]'
                    : 'border-white/10 text-white/45 hover:border-white/20 hover:text-white/70'
                }`}
              >
                All courses
              </button>
              {levels.map(l => (
                <button
                  key={l}
                  onClick={() => setLevelFilter(levelFilter === l ? '' : l)}
                  className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                    levelFilter === l
                      ? 'bg-[#F5C518] border-[#F5C518] text-[#0A0A0A] font-semibold shadow-[0_0_20px_rgba(245,197,24,0.2)]'
                      : 'border-white/10 text-white/45 hover:border-white/20 hover:text-white/70'
                  }`}
                >
                  {LEVEL_LABELS[l] ?? l}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-10 pb-20">

        {/* Continue learning rail */}
        {!loading && enrolledCourses.length > 0 && (
          <ContinueRail
            courses={enrolledCourses}
            onSelect={slug => { window.location.href = `/course/${slug}` }}
          />
        )}

        {/* Featured spotlight — only when not searching/filtering */}
        {!loading && !search && !levelFilter && featured && courses.length > 1 && (
          <FeaturedSpotlight
            course={featured}
            onEnroll={handleEnroll}
            enrolling={enrollingId === featured.slug}
          />
        )}

        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl font-extrabold text-white">
              {levelFilter
                ? `${LEVEL_LABELS[levelFilter] ?? levelFilter} courses`
                : search
                  ? 'Search results'
                  : 'All courses'}
            </h2>
            {!loading && (
              <p className="text-sm text-white/30 mt-0.5">
                {filtered.length} course{filtered.length !== 1 ? 's' : ''} available
              </p>
            )}
          </div>
          {!auth && (
            <a href="/login" className="text-xs text-[#F5C518] hover:text-[#FFE070] transition-colors flex items-center gap-1">
              Sign in to track <ArrowRight size={11} />
            </a>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="animate-spin text-[#F5C518]" size={28} />
            <p className="text-white/25 text-sm">Loading courses…</p>
          </div>
        ) : filtered.length === 0 ? (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-[24px] border border-white/8 bg-white/[0.02] py-24 text-center"
            >
              <BookOpen size={36} className="text-white/12 mx-auto mb-3" />
              <p className="text-white/30 mb-1">
                {courses.length === 0 ? 'No courses published yet.' : 'No courses match your search.'}
              </p>
              <p className="text-white/18 text-sm mb-4">
                {courses.length === 0 ? 'Check back soon!' : 'Try a different search or clear your filters.'}
              </p>
              {(search || levelFilter) && (
                <button
                  onClick={() => { setSearch(''); setLevelFilter('') }}
                  className="text-sm text-[#F5C518] hover:text-[#FFE070] transition-colors"
                >
                  Clear filters
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((course, i) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={handleEnroll}
                enrolling={enrollingId === course.slug}
                index={i}
              />
            ))}
          </div>
        )}

        {/* Bottom CTA for logged-out */}
        {!loading && !auth && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 relative rounded-[32px] overflow-hidden border border-white/[0.08]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a00] via-[#0A0A0B] to-[#0a1628]" />
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#F5C518]/[0.04] blur-3xl" />
            <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-violet-500/[0.03] blur-3xl" />
            <div className="relative p-10 md:p-14 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#F5C518]/20 bg-[#F5C518]/8 px-3 py-1 text-[10px] font-mono text-[#F5C518]/70 mb-4 uppercase tracking-widest">
                <Zap size={9} />
                Free forever
              </div>
              <h3 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight">
                Start your Web3 journey<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5C518] to-[#FFD060]">today.</span>
              </h3>
              <p className="text-white/38 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                Join thousands of learners building on-chain. Track progress, submit assignments, and earn recognition.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a href="/login?mode=signup" className="inline-flex items-center gap-2 rounded-full bg-[#F5C518] px-7 py-3 text-sm font-bold text-[#0A0A0A] hover:bg-[#FFD020] transition-colors shadow-[0_4px_32px_rgba(245,197,24,0.25)]">
                  Create free account <ArrowRight size={14} />
                </a>
                <a href="/login" className="inline-flex items-center gap-2 rounded-full border border-white/12 px-7 py-3 text-sm text-white/60 hover:border-white/25 hover:text-white transition-colors">
                  Log in
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
