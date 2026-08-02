import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'wouter'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { apiRequest, apiPaginatedRequest } from '../lib/api'
import { getStoredAuth } from '../lib/auth'
import AcademyNavbar from '../components/AcademyNavbar'
import AcademyFooter from '../components/AcademyFooter'

// ─── Types ────────────────────────────────────────────────────────────────────

type CourseListItem = {
  id: string
  slug: string
  title: string
  tagline: string | null
  level: string | null
  isPaid: boolean
  isFeatured: boolean
  priceUsd: number | null
  priceNgn: number | null
  discountPercent: number
  discountedPriceUsd: number | null
  discountedPriceNgn: number | null
  estimatedDuration: string | null
  phaseLabel: string | null
  heroImage: string | null
  contentUnit: string
  weekCount: number
  facilitators: Array<{
    id: string
    name: string
    title: string
    organization: string
    photoUrl: string | null
  }>
  enrolled: boolean
}

type FilterMeta = {
  levels: string[]
  phaseLabels: string[]
}

const COURSES_PER_PAGE = 9

// ─── URL helpers ──────────────────────────────────────────────────────────────

function buildQueryString(params: Record<string, string | number | undefined>) {
  const parts: string[] = []
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '' && v !== 1) {
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    }
  }
  return parts.length ? `?${parts.join('&')}` : ''
}

function parseURLParams() {
  const sp = new URLSearchParams(window.location.search)
  return {
    page: Math.max(1, parseInt(sp.get('page') ?? '1') || 1),
    q: sp.get('q') ?? '',
    level: sp.get('level') ?? '',
    phaseLabel: sp.get('phaseLabel') ?? '',
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CourseSkeleton() {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden animate-pulse">
      <div className="h-44 bg-white/[0.04]" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 bg-white/8 rounded-full" />
        <div className="h-5 w-4/5 bg-white/10 rounded-full" />
        <div className="h-4 w-3/4 bg-white/6 rounded-full" />
        <div className="flex gap-3 pt-2">
          <div className="h-3 w-16 bg-white/5 rounded-full" />
          <div className="h-3 w-12 bg-white/5 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// ─── Featured Banner ──────────────────────────────────────────────────────────

function FeaturedCourseBanner({ course }: { course: CourseListItem }) {
  const isFree = !course.isPaid
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8 mb-12 min-h-[340px] flex flex-col justify-end">
      {/* Background */}
      {course.heroImage ? (
        <img
          src={course.heroImage}
          alt={course.title}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5C518]/10 via-[#0A0A0A] to-[#1a0a30]" />
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent" />

      {/* Content */}
      <div className="relative z-10 p-8 md:p-10 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {course.phaseLabel && (
            <span className="text-[11px] font-bold uppercase tracking-widest bg-[#F5C518] text-[#0A0A0A] rounded-full px-3 py-0.5">
              {course.phaseLabel}
            </span>
          )}
          {course.level && (
            <span className="text-[11px] font-medium uppercase tracking-wider border border-white/20 text-white/60 rounded-full px-3 py-0.5">
              {course.level}
            </span>
          )}
          <span className="text-[11px] font-medium text-white/40 uppercase tracking-wider">Featured Program</span>
        </div>

        <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white leading-tight mb-3">
          {course.title}
        </h2>

        {course.tagline && (
          <p className="text-base text-white/60 leading-relaxed mb-6 max-w-2xl">
            {course.tagline}
          </p>
        )}

        {/* Course meta row */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-white/40">
          {course.estimatedDuration && (
            <span className="flex items-center gap-1.5"><Clock3 size={13} />{course.estimatedDuration}</span>
          )}
          {course.weekCount > 0 && (
            <span className="flex items-center gap-1.5"><BookOpen size={13} />{course.weekCount} {course.contentUnit || 'Lesson'}{course.weekCount !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Price — own visual row for maximum clarity */}
        <div className="flex items-baseline gap-3 mb-6">
          {isFree ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 text-sm font-bold px-3.5 py-1.5 rounded-full">
              Free enrollment
            </span>
          ) : (
            <>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                {course.discountedPriceUsd != null ? `$${course.discountedPriceUsd}` : `$${course.priceUsd ?? 0}`}
                <span className="mx-2 text-white/30 font-medium text-xl">•</span>
                {course.discountedPriceNgn != null ? `₦${course.discountedPriceNgn.toLocaleString()}` : `₦${(course.priceNgn ?? 0).toLocaleString()}`}
              </span>
              {course.discountedPriceUsd != null && course.priceUsd != null && (
                <span className="text-base font-medium text-white/30 line-through">
                  ${course.priceUsd} • ₦{(course.priceNgn ?? 0).toLocaleString()}
                </span>
              )}
              {course.discountPercent > 0 && (
                <span className="text-xs font-bold text-[#F5C518] bg-[#F5C518]/10 border border-[#F5C518]/20 px-2 py-0.5 rounded-full">
                  {course.discountPercent}% off
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={`/course/${course.slug}`}
            className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#FFD020] transition-colors"
          >
            {course.enrolled ? 'Continue Learning' : 'View Course'} <ArrowRight size={15} />
          </a>
          {course.enrolled && (
            <span className="inline-flex items-center gap-1.5 border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 text-xs font-semibold px-4 py-3 rounded-xl">
              Enrolled
            </span>
          )}
        </div>

        {/* Facilitator avatars */}
        {course.facilitators.length > 0 && (
          <div className="flex items-center gap-3 mt-5">
            <div className="flex -space-x-2">
              {course.facilitators.slice(0, 4).map(f => (
                <div key={f.id} className="w-7 h-7 rounded-full border-2 border-[#0A0A0A] overflow-hidden bg-[#F5C518]/20 flex items-center justify-center text-[9px] font-bold text-[#F5C518]">
                  {f.photoUrl
                    ? <img src={f.photoUrl} alt={f.name} className="w-full h-full object-cover" />
                    : f.name.split(' ').map(p => p[0]).join('').slice(0, 2)
                  }
                </div>
              ))}
            </div>
            <p className="text-xs text-white/40">
              {course.facilitators.map(f => f.name.split(' ')[0]).join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({ course, index }: { course: CourseListItem; index: number }) {
  const isFree = !course.isPaid
  return (
    <motion.a
      href={`/course/${course.slug}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="group flex flex-col rounded-2xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.14] transition-all duration-200 overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="relative h-44 bg-gradient-to-br from-[#F5C518]/8 to-transparent overflow-hidden">
        {course.heroImage ? (
          <img
            src={course.heroImage}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:opacity-80 transition-opacity duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen size={32} className="text-white/10" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {course.phaseLabel && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F5C518] text-[#0A0A0A] rounded-full px-2.5 py-0.5">
              {course.phaseLabel}
            </span>
          )}
          {course.level && (
            <span className="text-[10px] font-medium uppercase tracking-wider bg-black/50 backdrop-blur-sm text-white/70 border border-white/15 rounded-full px-2.5 py-0.5">
              {course.level}
            </span>
          )}
        </div>
        {course.enrolled && (
          <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 rounded-full px-2.5 py-0.5 backdrop-blur-sm">
            Enrolled
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-display text-base font-bold text-white leading-snug mb-1.5 group-hover:text-[#F5C518] transition-colors duration-200 line-clamp-2">
          {course.title}
        </h3>
        {course.tagline && (
          <p className="text-sm text-white/45 leading-relaxed mb-4 flex-1 line-clamp-2">
            {course.tagline}
          </p>
        )}

        {/* Price row — clear, prominent, above the meta strip */}
        <div className="flex items-baseline gap-2 mt-auto mb-3">
          {isFree ? (
            <span className="text-sm font-bold text-emerald-400">Free</span>
          ) : (
            <>
              <span className="text-base font-extrabold text-white">
                {course.discountedPriceUsd != null ? `$${course.discountedPriceUsd}` : `$${course.priceUsd ?? 0}`}
                <span className="mx-1.5 text-white/30 font-medium text-sm">•</span>
                {course.discountedPriceNgn != null ? `₦${course.discountedPriceNgn.toLocaleString()}` : `₦${(course.priceNgn ?? 0).toLocaleString()}`}
              </span>
              {course.discountedPriceUsd != null && course.priceUsd != null && (
                <span className="text-xs font-medium text-white/30 line-through">
                  ${course.priceUsd} • ₦{(course.priceNgn ?? 0).toLocaleString()}
                </span>
              )}
              {course.discountPercent > 0 && (
                <span className="text-[10px] font-bold text-[#F5C518] ml-1">{course.discountPercent}% off</span>
              )}
            </>
          )}
        </div>

        {/* Secondary meta: duration + lesson count */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/28 pt-3 border-t border-white/6">
          {course.estimatedDuration && (
            <span className="flex items-center gap-1.5"><Clock3 size={11} />{course.estimatedDuration}</span>
          )}
          {course.weekCount > 0 && (
            <span className="flex items-center gap-1.5"><BookOpen size={11} />{course.weekCount} {course.contentUnit || 'Lesson'}{course.weekCount !== 1 ? 's' : ''}</span>
          )}
        </div>

        {course.facilitators.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <div className="flex -space-x-2">
              {course.facilitators.slice(0, 3).map(f => (
                <div key={f.id} className="w-6 h-6 rounded-full border-2 border-[#0F0F11] overflow-hidden bg-[#F5C518]/20 flex items-center justify-center text-[8px] font-bold text-[#F5C518]">
                  {f.photoUrl
                    ? <img src={f.photoUrl} alt={f.name} className="w-full h-full object-cover" />
                    : f.name.split(' ').map(p => p[0]).join('').slice(0, 2)
                  }
                </div>
              ))}
            </div>
            <p className="text-[11px] text-white/30 truncate">
              {course.facilitators.map(f => f.name.split(' ')[0]).join(', ')}
            </p>
          </div>
        )}
      </div>
    </motion.a>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function PaginationBar({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-12" role="navigation" aria-label="Pagination">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white bg-white/5 hover:bg-white/10 border border-white/8 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeft size={15} />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-white/20 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold border transition-all ${
              p === page
                ? 'bg-[#F5C518] text-[#0A0A0A] border-[#F5C518]'
                : 'bg-white/5 text-white/50 border-white/8 hover:bg-white/10 hover:text-white'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white bg-white/5 hover:bg-white/10 border border-white/8 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  )
}

// ─── Filter Chips ─────────────────────────────────────────────────────────────

function FilterChips({
  label,
  options,
  active,
  onSelect,
}: {
  label: string
  options: string[]
  active: string
  onSelect: (v: string) => void
}) {
  if (options.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-mono uppercase tracking-widest text-white/25 mr-1">{label}</span>
      {['', ...options].map(opt => (
        <button
          key={opt || 'all'}
          onClick={() => onSelect(opt)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
            active === opt
              ? 'bg-[#F5C518] text-[#0A0A0A] border-[#F5C518]'
              : 'border-white/12 text-white/50 hover:border-white/25 hover:text-white bg-white/[0.03]'
          }`}
        >
          {opt === '' ? 'All' : opt}
        </button>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CoursesListPage() {
  const [, navigate] = useLocation()
  const auth = getStoredAuth()

  // Parse initial state from URL
  const initial = parseURLParams()

  const [page, setPageState] = useState(initial.page)
  const [q, setQ] = useState(initial.q)
  const [inputQ, setInputQ] = useState(initial.q) // uncontrolled search input
  const [activeLevel, setActiveLevel] = useState(initial.level)
  const [activePhase, setActivePhase] = useState(initial.phaseLabel)

  const [courses, setCourses] = useState<CourseListItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [meta, setMeta] = useState<FilterMeta>({ levels: [], phaseLabels: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metaLoaded, setMetaLoaded] = useState(false)

  // ── Sync URL ────────────────────────────────────────────────────────────────
  const syncURL = useCallback((p: number, query: string, level: string, phase: string) => {
    const qs = buildQueryString({
      page: p > 1 ? p : undefined,
      q: query || undefined,
      level: level || undefined,
      phaseLabel: phase || undefined,
    })
    navigate(`/courses${qs}`, { replace: true })
  }, [navigate])

  // ── Load filter meta once ────────────────────────────────────────────────────
  useEffect(() => {
    apiRequest<FilterMeta>('/academy/courses/meta')
      .then(data => { setMeta(data); setMetaLoaded(true) })
      .catch(() => setMetaLoaded(true)) // non-fatal — filters just won't show
  }, [])

  // ── Load courses on filter/page change ───────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    async function fetchCourses() {
      setLoading(true)
      setError(null)
      try {
        const qs = new URLSearchParams({ page: String(page), limit: String(COURSES_PER_PAGE) })
        if (q) qs.set('q', q)
        if (activeLevel) qs.set('level', activeLevel)
        if (activePhase) qs.set('phaseLabel', activePhase)

        const { data, pagination } = await apiPaginatedRequest<CourseListItem[]>(`/academy/courses?${qs}`)
        if (!cancelled) {
          setCourses(data ?? [])
          setTotalPages(pagination.totalPages)
          setTotalCount(pagination.total)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load programs.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void fetchCourses()
    return () => { cancelled = true }
  }, [page, q, activeLevel, activePhase])

  // ── Search debounce ──────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      if (inputQ !== q) {
        setQ(inputQ)
        setPageState(1)
        syncURL(1, inputQ, activeLevel, activePhase)
      }
    }, 350)
    return () => clearTimeout(t)
  }, [inputQ]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (p: number) => {
    setPageState(p)
    syncURL(p, q, activeLevel, activePhase)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLevelChange = (level: string) => {
    setActiveLevel(level)
    setPageState(1)
    syncURL(1, q, level, activePhase)
  }

  const handlePhaseChange = (phase: string) => {
    setActivePhase(phase)
    setPageState(1)
    syncURL(1, q, activeLevel, phase)
  }

  const clearAllFilters = () => {
    setInputQ('')
    setQ('')
    setActiveLevel('')
    setActivePhase('')
    setPageState(1)
    syncURL(1, '', '', '')
  }

  const hasActiveFilters = q || activeLevel || activePhase
  const featuredCourse = courses.find((c) => c.isFeatured) || courses[0]
  const gridCourses = courses // show all in grid, including featured
  const showBanner = !loading && !error && featuredCourse && page === 1 && !hasActiveFilters

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      <AcademyNavbar solid />

      <main className="flex-1 pt-24 pb-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8">

          {/* ── Page header ── */}
          <div className="mb-10">
            <p className="text-xs font-mono uppercase tracking-widest text-[#F5C518]/60 mb-3">Rubikcon Academy</p>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white mb-4">
              Programs
            </h1>
            <p className="text-white/45 text-lg max-w-xl leading-relaxed">
              Practical blockchain and impact finance education designed for changemakers.
            </p>
          </div>

          {/* ── Featured banner (first result, unfiltered, page 1 only) ── */}
          <AnimatePresence>
            {showBanner && featuredCourse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FeaturedCourseBanner course={featuredCourse} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Search + Filter bar ── */}
          <div className="mb-8 space-y-4">
            {/* Search input */}
            <div className="relative max-w-xl">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                id="course-search"
                type="search"
                placeholder="Search programs…"
                value={inputQ}
                onChange={e => setInputQ(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#F5C518]/35 focus:bg-white/[0.07] transition-all"
                aria-label="Search programs"
              />
              {inputQ && (
                <button
                  onClick={() => { setInputQ(''); setQ(''); setPageState(1); syncURL(1, '', activeLevel, activePhase) }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter chips — only show after meta loads and if there are options */}
            {metaLoaded && (meta.levels.length > 0 || meta.phaseLabels.length > 0) && (
              <div className="flex flex-wrap gap-4">
                <FilterChips
                  label="Level"
                  options={meta.levels}
                  active={activeLevel}
                  onSelect={handleLevelChange}
                />
                {meta.phaseLabels.length > 0 && (
                  <FilterChips
                    label="Phase"
                    options={meta.phaseLabels}
                    active={activePhase}
                    onSelect={handlePhaseChange}
                  />
                )}
              </div>
            )}

            {/* Active filter summary + clear */}
            {hasActiveFilters && (
              <div className="flex items-center gap-3 text-sm">
                <SlidersHorizontal size={13} className="text-white/30" />
                <span className="text-white/40">
                  Filtered{totalCount > 0 ? ` · ${totalCount} result${totalCount !== 1 ? 's' : ''}` : ''}
                </span>
                <button
                  onClick={clearAllFilters}
                  className="text-[#F5C518] hover:text-[#FFD020] transition-colors text-xs font-semibold"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* ── Loading state ── */}
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: COURSES_PER_PAGE }).map((_, i) => <CourseSkeleton key={i} />)}
            </div>
          )}

          {/* ── Error state ── */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/8 p-10 text-center">
              <p className="text-white/55 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm font-semibold text-[#F5C518] hover:text-[#FFD020] transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* ── No courses at all ── */}
          {!loading && !error && courses.length === 0 && !hasActiveFilters && (
            <div className="py-28 text-center">
              <BookOpen size={40} className="mx-auto text-white/12 mb-4" />
              <h2 className="font-display text-xl font-bold text-white mb-2">Programs coming soon</h2>
              <p className="text-white/35 text-sm">Check back soon — new cohorts are on their way.</p>
            </div>
          )}

          {/* ── No search/filter results ── */}
          {!loading && !error && courses.length === 0 && hasActiveFilters && (
            <div className="py-24 text-center">
              <Search size={36} className="mx-auto text-white/12 mb-4" />
              <h2 className="font-display text-xl font-bold text-white mb-2">No programs match</h2>
              <p className="text-white/35 text-sm mb-6">
                {q && <span>No results for <span className="text-white/60">"{q}"</span>. </span>}
                {(activeLevel || activePhase) && <span>Try removing the active filters.</span>}
              </p>
              <button
                onClick={clearAllFilters}
                className="text-sm font-semibold text-[#F5C518] hover:text-[#FFD020] transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* ── Course grid ── */}
          {!loading && !error && gridCourses.length > 0 && (
            <>
              {/* Results header */}
              {!hasActiveFilters && totalCount > 0 && (
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-bold text-white">
                    All Programs
                  </h2>
                  <span className="text-sm text-white/30">{totalCount} program{totalCount !== 1 ? 's' : ''}</span>
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {gridCourses.map((course, i) => (
                  <CourseCard key={course.id} course={course} index={i} />
                ))}
              </div>

              <PaginationBar page={page} totalPages={totalPages} onChange={handlePageChange} />
            </>
          )}

          {/* ── Auth CTA ── */}
          {!auth && !loading && courses.length > 0 && (
            <div className="mt-20 rounded-2xl border border-[#F5C518]/12 bg-[#F5C518]/[0.04] p-10 text-center max-w-2xl mx-auto">
              <p className="font-display text-2xl font-bold text-white mb-3">Start your learning journey</p>
              <p className="text-white/45 text-sm mb-7 leading-relaxed max-w-md mx-auto">
                Create a free account to track progress, submit assignments, take quizzes, and earn your certificate.
              </p>
              <a
                href="/login"
                className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-bold rounded-full px-7 py-3.5 text-sm hover:bg-[#FFD020] transition-colors"
              >
                Get started — it's free <ArrowRight size={15} />
              </a>
            </div>
          )}
        </div>
      </main>

      <AcademyFooter />
    </div>
  )
}
