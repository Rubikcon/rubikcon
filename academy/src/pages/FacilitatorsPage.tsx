import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, ExternalLink, Linkedin, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import AcademyNavbar from '../components/AcademyNavbar'
import AcademyFooter from '../components/AcademyFooter'
import { apiRequest, apiPaginatedRequest } from '../lib/api'

type FacilitatorCourse = {
  id: string
  slug: string
  title: string
}

type Facilitator = {
  id: string
  name: string
  title: string
  organization: string
  bio: string | null
  photoUrl: string | null
  linkedinUrl: string
  courses: FacilitatorCourse[]
}

function FacilitatorCard({ facilitator, index }: { facilitator: Facilitator; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const bioTruncated = facilitator.bio && facilitator.bio.length > 160

  const initials = facilitator.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden hover:border-white/20 transition-colors flex flex-col"
    >
      <div className="block w-full">
        {facilitator.photoUrl ? (
          <img
            src={facilitator.photoUrl}
            alt={facilitator.name}
            loading="lazy"
            decoding="async"
            className="w-full aspect-[16/11] object-cover object-[center_20%]"
          />
        ) : (
          <div className="w-full aspect-[16/11] bg-gradient-to-br from-[#3D2F00] to-[#141414] flex items-center justify-center">
            <div className="w-28 h-28 rounded-full border-2 border-[#F5C518]/40 bg-[#F5C518]/10 flex items-center justify-center">
              <span className="font-display font-extrabold text-[#F5C518] text-4xl">
                {initials}
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6 sm:p-8 flex flex-col gap-4 flex-1">
        <div>
          <h3 className="font-display font-extrabold text-white text-2xl mb-1">
            {facilitator.name}
          </h3>
          <p className="text-[#F5C518] text-sm font-semibold truncate">
            {facilitator.title}
          </p>
          <p className="text-white/45 text-xs mt-0.5 truncate">{facilitator.organization}</p>
        </div>

        {/* Bio */}
        {facilitator.bio && (
          <div>
            <p className="text-white/55 text-[15px] leading-relaxed">
              {expanded || !bioTruncated
                ? facilitator.bio
                : `${facilitator.bio.slice(0, 160)}…`}
            </p>
            {bioTruncated && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="text-[#F5C518]/80 text-xs mt-1.5 hover:text-[#F5C518] transition-colors font-medium"
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {/* Courses */}
        {facilitator.courses.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            <p className="text-white/30 text-[11px] uppercase tracking-widest font-semibold">Teaching</p>
            <div className="flex flex-col gap-1.5">
              {facilitator.courses.map(course => (
                <a
                  key={course.id}
                  href={`/course/${course.slug}`}
                  className="flex items-center gap-2 group"
                >
                  <BookOpen size={12} className="text-white/30 shrink-0 group-hover:text-[#F5C518] transition-colors" />
                  <span className="text-white/55 text-xs leading-snug group-hover:text-white/90 transition-colors truncate">
                    {course.title}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-5 border-t border-white/8">
          <a
            href={facilitator.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-[#F5C518] transition-colors"
          >
            <Linkedin size={13} />
            LinkedIn
            <ExternalLink size={10} className="opacity-60" />
          </a>
        </div>
      </div>
    </motion.div>
  )
}

export default function FacilitatorsPage() {
  const [facilitators, setFacilitators] = useState<Facilitator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    apiPaginatedRequest<Facilitator[]>(`/academy/facilitators?page=${page}&limit=6`)
      .then(res => {
        if (!cancelled) {
          setFacilitators(res.data)
          setTotalPages(res.pagination.totalPages || 1)
        }
      })
      .catch(err => { 
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load facilitators.') 
      })
      .finally(() => { 
        if (!cancelled) setLoading(false) 
      })
    return () => { cancelled = true }
  }, [page])

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AcademyNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <span className="inline-block text-[#F5C518] text-xs font-semibold uppercase tracking-[0.18em] mb-4">
            Our Team
          </span>
          <h1 className="text-white font-bold text-4xl sm:text-5xl leading-tight mb-4 font-display">
            Meet Our Facilitators
          </h1>
          <p className="text-white/50 text-lg max-w-2xl leading-relaxed">
            Behind every great learning experience is a team of practitioners who have built, led, and delivered
            real-world technology solutions. At Rubikcon Nexus Academy, our facilitators combine industry expertise
            with a passion for teaching, ensuring every learner gains practical knowledge they can apply with confidence.
          </p>
        </motion.div>

        {/* States */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="text-[#F5C518] animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-24">
            <p className="text-white/40 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-[#F5C518] text-sm hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && facilitators.length === 0 && (
          <div className="text-center py-24">
            <p className="text-white/40 text-sm">No facilitators yet.</p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && facilitators.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilitators.map((f, i) => (
              <FacilitatorCard key={f.id} facilitator={f} index={i} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-2 border border-white/15 bg-white/[0.03] text-white w-10 h-10 justify-center rounded-full hover:border-white/30 hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-white/50 text-sm font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-2 border border-white/15 bg-white/[0.03] text-white w-10 h-10 justify-center rounded-full hover:border-white/30 hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Guest facilitators */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10"
        >
          <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-4">Guest Facilitators</p>
          <h3 className="font-display font-extrabold text-white text-2xl mb-4">Expert perspectives for every cohort</h3>
          <p className="text-white/55 text-[15px] leading-relaxed max-w-3xl">
            Each cohort may include guest facilitators — industry experts, founders, researchers, and technology
            leaders who bring specialised knowledge and real-world perspectives to selected sessions. Guest
            facilitators are announced before each cohort begins.
          </p>
        </motion.div>

        {/* Partner with our facilitators */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 rounded-3xl border border-[#F5C518]/20 bg-[#F5C518]/[0.06] p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
        >
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#F5C518] mb-4">Partner With Our Facilitators</p>
            <h3 className="font-display font-extrabold text-white text-2xl mb-4">Bring Rubikcon Nexus to your team</h3>
            <p className="text-white/60 text-[15px] leading-relaxed max-w-2xl">
              Interested in bringing Rubikcon Nexus Academy to your organisation? We welcome opportunities to
              collaborate on corporate training, funded learning programmes, university partnerships, workshops,
              speaking engagements, and technology capacity-building initiatives across Africa.
            </p>
          </div>
          <a
            href="/contact"
            className="shrink-0 inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-bold px-7 py-3.5 rounded-full hover:bg-[#E8B800] transition-colors text-[15px] whitespace-nowrap"
          >
            Contact Us →
          </a>
        </motion.div>
      </main>
      <AcademyFooter />
    </div>
  )
}

