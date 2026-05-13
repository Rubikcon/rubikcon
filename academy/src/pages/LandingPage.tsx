import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, BookOpen, Clock, CheckCircle, Play } from 'lucide-react'
import {
  COURSE_BLOCKCHAIN,
  CURRICULUM_TOPICS,
} from '../data/courseData'
import AcademyNavbar from '../components/AcademyNavbar'
import { apiRequest } from '../lib/api'

type PublicCourse = {
  id: string
  slug: string
  title: string
  tagline: string | null
  level: string | null
  estimatedDuration: string | null
  heroImage: string | null
  weekCount: number
  facilitators: Array<{ id: string; name: string; title: string; organization: string; photoUrl: string | null }>
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
}

const LEVEL_COLORS: Record<string, string> = {
  'Beginner → Intermediate': 'bg-[#F5C518] text-[#0A0A0A]',
  'Intermediate': 'bg-[#1C1C1C] text-white border border-white/20',
  'Beginner → Advanced': 'bg-[#1C1C1C] text-white border border-white/20',
  'Advanced': 'bg-[#1C1C1C] text-white border border-white/20',
  'Beginner': 'bg-[#F5C518] text-[#0A0A0A]',
  'BEGINNER': 'bg-[#F5C518] text-[#0A0A0A]',
  'INTERMEDIATE': 'bg-[#E8E0D0] text-[#1C1C1C]',
  'ADVANCED': 'bg-[#1C1C1C] text-white',
}

const INSTRUCTOR_COLORS = [
  'from-[#3D2F00] to-[#1A1400]',
  'from-[#002D2D] to-[#001515]',
  'from-[#2D0000] to-[#150000]',
  'from-[#1A0030] to-[#0A0018]',
]

export default function LandingPage() {
  const main = COURSE_BLOCKCHAIN
  const mainLessons = main.modules.reduce((a, m) => a + m.lessons.length, 0)
  const totalStudents = main.students

  const [dynamicCourses, setDynamicCourses] = useState<PublicCourse[]>([])

  useEffect(() => {
    apiRequest<PublicCourse[]>('/academy/courses')
      .then(data => setDynamicCourses(data))
      .catch(() => { /* silently ignore — catalog still renders */ })
  }, [])

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AcademyNavbar dark />

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#0A0A0A]">
        {/* Atmospheric glows — yellow lower-left, teal upper-right */}
        <div className="absolute -bottom-32 -left-32 w-[700px] h-[700px] rounded-full bg-amber-500/25 blur-[180px] pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-[750px] h-[750px] rounded-full bg-teal-400/20 blur-[180px] pointer-events-none" />

        {/* Dashed orbit ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[680px] h-[680px] rounded-full border border-dashed border-white/[0.12]" />
        </div>

        {/* Floating instructor avatars */}
        <div className="absolute top-28 left-14 w-16 h-16 rounded-full bg-[#F5C518] flex items-center justify-center font-display font-extrabold text-[#0A0A0A] text-sm shadow-2xl">AO</div>
        <div className="absolute top-24 right-14 w-16 h-16 rounded-full bg-teal-400 flex items-center justify-center font-display font-extrabold text-[#0A0A0A] text-sm shadow-2xl">MA</div>
        <div className="absolute bottom-40 left-12 w-16 h-16 rounded-full bg-[#F97B72] flex items-center justify-center font-display font-extrabold text-white text-sm shadow-2xl">KB</div>
        <div className="absolute bottom-36 right-12 w-16 h-16 rounded-full bg-violet-400 flex items-center justify-center font-display font-extrabold text-white text-sm shadow-2xl">NT</div>

        <div className="relative max-w-5xl mx-auto px-6 text-center pt-28 pb-20">
          {/* Badge pill */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible"
            className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.14] px-4 py-1.5 rounded-full mb-10">
            <span className="w-1.5 h-1.5 bg-[#F5C518] rounded-full" />
            <span className="text-[11px] font-mono text-white/60 tracking-[0.2em] uppercase">Rubikcon Nexus</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="font-display font-extrabold text-white leading-[1.06] tracking-[-0.025em] mb-7"
            style={{ fontSize: 'clamp(36px, 5vw, 68px)' }}>
            Learn and build in{' '}
            <span className="inline-block bg-[#F5C518] text-[#0A0A0A] px-5 py-1 rounded-full align-middle leading-snug">Web3</span>{' '}
            with confidence
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-white/50 text-[17px] max-w-[520px] mx-auto mb-11 leading-relaxed">
            Practical, project-based courses taught by builders shipping real Web3 products across Africa and beyond.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="flex items-center justify-center gap-4 mb-20 flex-wrap">
            <a href="/courses"
              className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-bold px-8 py-3.5 rounded-full hover:bg-[#E8B800] transition-colors text-[15px]">
              Browse courses →
            </a>
            <a href="/course/blockchain-social-impact/week/week-1-blockchain-fundamentals-history"
              className="inline-flex items-center gap-2 bg-white/[0.07] border border-white/[0.15] text-white px-7 py-3.5 rounded-full hover:bg-white/[0.12] transition-colors text-[15px]">
              <Play size={12} className="fill-white" /> Watch intro
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
            className="flex items-center justify-center gap-14 flex-wrap">
            {[
              { value: '12', label: 'COURSES' },
              { value: totalStudents.toLocaleString(), label: 'LEARNERS' },
              { value: '28', label: 'INSTRUCTORS' },
              { value: '4.9★', label: 'AVG. RATING' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-[32px] font-extrabold text-white leading-none">{stat.value}</div>
                <div className="text-[11px] text-white/35 tracking-[0.14em] mt-2 uppercase">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CURRICULUM OVERVIEW ─── */}
      <section className="bg-[#F2EDE2] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-mono text-[#1C1C1C]/50 tracking-widest uppercase mb-3">Curriculum Overview</p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h2 className="font-display text-4xl md:text-5xl font-extrabold text-[#1C1C1C] leading-tight">
                What you'll learn
              </h2>
              <p className="text-[#1C1C1C]/60 text-sm max-w-sm leading-relaxed md:text-right">
                A grounded path from fundamentals to shipping. Every course is built around a real artifact you'll publish on-chain or to GitHub.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CURRICULUM_TOPICS.map((topic, i) => (
              <motion.div key={topic.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl p-7 hover:shadow-md transition-shadow"
              >
                <span className="inline-block bg-[#F2EDE2] text-[#1C1C1C] text-xs font-mono font-bold px-2.5 py-1 rounded-lg mb-4">{topic.num}</span>
                <h3 className="font-display font-extrabold text-[#1C1C1C] text-lg mb-2 leading-snug">{topic.title}</h3>
                <p className="text-[#1C1C1C]/55 text-sm leading-relaxed">{topic.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COURSES CTA ─── */}
      <section id="courses" className="bg-[#F2EDE2] py-24 px-6 border-t border-black/5">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="text-xs font-mono text-[#1C1C1C]/50 tracking-widest uppercase mb-3">Catalog</p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h2 className="font-display text-4xl md:text-6xl font-extrabold text-[#1C1C1C] leading-none">
                All courses
              </h2>
              <p className="text-[#1C1C1C]/60 text-sm max-w-sm leading-relaxed md:text-right">
                From fundamentals to mainnet launches. Mix and match, learn at your pace.
              </p>
            </div>
          </div>

          {/* Course preview cards */}
          {dynamicCourses.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {dynamicCourses.slice(0, 3).map((course, i) => {
                const level = (course.level ?? '').split(' ')[0].toUpperCase()
                const levelClass = LEVEL_COLORS[level] || 'bg-[#E8E0D0] text-[#1C1C1C]'
                const primaryFacilitator = course.facilitators[0]
                const initials = primaryFacilitator
                  ? primaryFacilitator.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                  : '?'
                return (
                  <motion.div key={course.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col"
                  >
                    <div className="mb-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${levelClass || 'bg-[#E8E0D0] text-[#1C1C1C]'}`}>
                        {level || 'COURSE'}
                      </span>
                    </div>
                    <h3 className="font-display font-extrabold text-[#1C1C1C] text-lg leading-snug mb-2">{course.title}</h3>
                    <p className="text-[#1C1C1C]/55 text-xs leading-relaxed mb-4 flex-1">{course.tagline}</p>
                    <div className="flex items-center gap-4 text-xs text-[#1C1C1C]/40 mb-4">
                      <span className="flex items-center gap-1"><BookOpen size={11} />{course.weekCount} week{course.weekCount !== 1 ? 's' : ''}</span>
                      {course.estimatedDuration && <span className="flex items-center gap-1"><Clock size={11} />{course.estimatedDuration}</span>}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-[#F2EDE2]">
                      {primaryFacilitator ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#0A0A0A] flex items-center justify-center text-[#F5C518] font-display font-extrabold text-[10px]">{initials}</div>
                          <span className="text-xs text-[#1C1C1C]/60 truncate max-w-[100px]">{primaryFacilitator.name}</span>
                        </div>
                      ) : <div />}
                      <a href="/courses" className="text-xs font-semibold text-[#1C1C1C] underline underline-offset-2 hover:text-[#C49A00]">View →</a>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Browse all CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-[#1C1C1C] px-7 py-5">
            <div>
              <p className="text-white font-display font-extrabold text-lg">
                {dynamicCourses.length > 0
                  ? `${dynamicCourses.length} course${dynamicCourses.length !== 1 ? 's' : ''} available now`
                  : 'Courses launching soon'}
              </p>
              <p className="text-white/40 text-sm">Browse the full catalog, filter by level, and enrol in minutes.</p>
            </div>
            <a
              href="/courses"
              className="shrink-0 inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-bold px-6 py-3 rounded-full hover:bg-[#E8B800] transition-colors text-sm whitespace-nowrap"
            >
              <BookOpen size={14} /> Browse all courses →
            </a>
          </div>
        </div>
      </section>

      {/* ─── INSTRUCTORS ─── */}
      <section id="instructors" className="bg-[#0A0A0A] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-mono text-white/30 tracking-widest uppercase mb-3">Who's Teaching</p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Builders, not theorists
              </h2>
              <p className="text-white/40 text-sm max-w-sm leading-relaxed md:text-right">
                Every instructor ships in production. You'll learn the patterns they actually use — including the ones that took them years to find.
              </p>
            </div>
          </div>

          {dynamicCourses.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">Facilitators will appear here once courses are published.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {dynamicCourses.flatMap(c => c.facilitators).filter((f, idx, arr) => arr.findIndex(x => x.id === f.id) === idx).slice(0, 8).map((facilitator, i) => {
                const initials = facilitator.name.replace(/^(Dr|Mr|Ms|Prof)\.\s*/i, '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                return (
                  <motion.div key={facilitator.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-2xl overflow-hidden"
                  >
                    <div className={`bg-gradient-to-br ${INSTRUCTOR_COLORS[i % INSTRUCTOR_COLORS.length]} h-48 flex items-center justify-center`}>
                      {facilitator.photoUrl ? (
                        <img src={facilitator.photoUrl} alt={facilitator.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-display font-extrabold text-[#F5C518] text-6xl">{initials}</span>
                      )}
                    </div>
                    <div className="bg-[#141414] p-4">
                      <div className="font-display font-bold text-white text-sm mb-0.5">{facilitator.name}</div>
                      <div className="text-white/40 text-xs mb-3">{facilitator.title}</div>
                      <div className="text-white/30 text-xs">{facilitator.organization}</div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="bg-[#0D0D0D] py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <p className="text-xs font-mono text-white/30 tracking-widest uppercase mb-3">Learner stories</p>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white leading-tight">
              What our learners say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                quote: "The structured week-by-week format made complex blockchain concepts digestible. I shipped my first smart contract by week 3.",
                name: "Amara Okafor",
                role: "Junior Blockchain Dev",
                org: "Lagos, Nigeria",
                initials: "AO",
                color: "from-[#3D2F00] to-[#1A1400]",
              },
              {
                quote: "Coming from a traditional finance background, this programme bridged the gap between what I knew and what Web3 needs. Game-changer.",
                name: "Kwame Asante",
                role: "DeFi Analyst",
                org: "Accra, Ghana",
                initials: "KA",
                color: "from-[#002D2D] to-[#001515]",
              },
              {
                quote: "The facilitators actually build in production. You get real patterns, not textbook theory. I landed a Web3 role within two months.",
                name: "Ngozi Adeyemi",
                role: "Full-Stack Web3 Engineer",
                org: "Abuja, Nigeria",
                initials: "NA",
                color: "from-[#1A0030] to-[#0A0018]",
              },
              {
                quote: "I appreciated how each assignment built on the last. By the end I had a portfolio project I was genuinely proud to show employers.",
                name: "Tendai Mutasa",
                role: "Smart Contract Auditor",
                org: "Harare, Zimbabwe",
                initials: "TM",
                color: "from-[#002A00] to-[#001200]",
              },
              {
                quote: "The quiz and assignment flow kept me accountable. It felt like a real cohort experience even studying asynchronously.",
                name: "Fatima Al-Hassan",
                role: "Blockchain Consultant",
                org: "Nairobi, Kenya",
                initials: "FA",
                color: "from-[#2D0015] to-[#150009]",
              },
              {
                quote: "From zero blockchain knowledge to deploying on testnet in five weeks. The pacing is perfect for working professionals.",
                name: "Chidi Eze",
                role: "Product Manager, Web3",
                org: "Port Harcourt, Nigeria",
                initials: "CE",
                color: "from-[#2A1800] to-[#130B00]",
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-[24px] border border-white/8 bg-white/[0.03] p-6 flex flex-col gap-4 hover:border-white/15 transition-colors"
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, s) => (
                    <svg key={s} className="w-3.5 h-3.5 text-[#F5C518] fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-white/70 text-sm leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-white/8">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center shrink-0`}>
                    <span className="font-display font-extrabold text-[#F5C518] text-xs">{t.initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-white/35">{t.role} &middot; {t.org}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS BANNER ─── */}
      <section className="bg-[#0A0A0A] py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: `${totalStudents.toLocaleString()}.`, sub: 'Active learners across 34 countries' },
            { value: '12.', sub: 'Production-track courses' },
            { value: '28.', sub: 'Instructors shipping today' },
            { value: '94%', sub: 'Cohort completion rate', yellow: true },
          ].map(stat => (
            <div key={stat.sub}>
              <div className={`font-display text-5xl font-extrabold mb-2 ${stat.yellow ? '' : 'text-white'}`}>
                {stat.yellow
                  ? <><span className="text-white">94</span><span className="text-[#F5C518]">%</span></>
                  : stat.value}
              </div>
              <div className="text-white/40 text-sm leading-snug">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative bg-[#0A0A0A] py-28 px-6 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-yellow-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 border border-white/15 px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 bg-[#F5C518] rounded-full animate-pulse" />
              <span className="text-xs font-mono text-white/50 tracking-widest uppercase">Start today</span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl font-extrabold text-white leading-tight mb-5">
              Ready to build on{' '}
              <span className="text-[#F5C518]">Web3?</span>
            </h2>
            <p className="text-white/50 text-base max-w-lg mx-auto mb-10 leading-relaxed">
              Join {totalStudents.toLocaleString()} learners already studying with Rubikcon Academy.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <a href="/courses"
                className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-semibold px-8 py-3.5 rounded-full hover:bg-[#E8B800] transition-colors text-sm">
                Browse courses →
              </a>
              <a href="/login"
                className="inline-flex items-center gap-2 border border-white/20 text-white px-7 py-3.5 rounded-full hover:border-white/40 transition-colors text-sm">
                Sign in
              </a>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
