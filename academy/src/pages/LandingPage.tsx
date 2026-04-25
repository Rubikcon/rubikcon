// import { motion } from 'framer-motion'
// import { Star, Users, Clock, BookOpen, ArrowRight, Play, CheckCircle } from 'lucide-react'
// import { COURSE_DATA } from '../data/courseData'
// import AcademyNavbar from '../components/AcademyNavbar'

// const fadeUp = {
//   hidden: { opacity: 0, y: 24 },
//   visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
// }

// export default function LandingPage() {
//   const totalLessons = COURSE_DATA.modules.reduce((acc, m) => acc + m.lessons.length, 0)

//   return (
//     <div className="min-h-screen bg-[#080A0F]">
//       <AcademyNavbar />
//       <div className="pt-20">
//         {/* Hero */}
//         <section className="relative overflow-hidden py-24 px-6">
//           <div className="absolute inset-0 bg-grid-pattern" />
//           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-cyan-500/8 rounded-full blur-3xl" />
//           <div className="max-w-5xl mx-auto relative">
//             <div className="grid lg:grid-cols-2 gap-16 items-center">
//               <div>
//                 <motion.div variants={fadeUp} initial="hidden" animate="visible"
//                   className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full mb-6">
//                   <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
//                   <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase">Blockchain Fundamentals</span>
//                 </motion.div>

//                 <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
//                   className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4">
//                   {COURSE_DATA.title}
//                   <br /><span className="text-gradient-cyan">{COURSE_DATA.tagline}</span>
//                 </motion.h1>

//                 <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
//                   className="text-gray-400 leading-relaxed mb-8">{COURSE_DATA.description}</motion.p>

//                 {/* Stats row */}
//                 <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
//                   className="flex flex-wrap gap-6 mb-8 text-sm">
//                   <div className="flex items-center gap-1.5 text-amber-400">
//                     <Star size={14} className="fill-amber-400" />
//                     <span className="font-semibold">{COURSE_DATA.rating}</span>
//                     <span className="text-gray-500">rating</span>
//                   </div>
//                   <div className="flex items-center gap-1.5 text-gray-400">
//                     <Users size={14} />
//                     <span>{COURSE_DATA.students.toLocaleString()} students</span>
//                   </div>
//                   <div className="flex items-center gap-1.5 text-gray-400">
//                     <Clock size={14} />
//                     <span>{COURSE_DATA.duration}</span>
//                   </div>
//                   <div className="flex items-center gap-1.5 text-gray-400">
//                     <BookOpen size={14} />
//                     <span>{totalLessons} lessons</span>
//                   </div>
//                 </motion.div>

//                 <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
//                   className="flex items-center gap-3 mb-8">
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-xs font-bold">AO</div>
//                   <div>
//                     <div className="text-sm font-medium text-white">{COURSE_DATA.instructor}</div>
//                     <div className="text-xs text-gray-500">{COURSE_DATA.instructorRole}</div>
//                   </div>
//                 </motion.div>

//                 <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}
//                   className="flex gap-3">
//                   <a href="/course"
//                     className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold px-7 py-3 rounded-xl hover:opacity-90 transition-all hover:scale-105">
//                     Start Learning <ArrowRight size={15} />
//                   </a>
//                   <a href={`/lesson/${COURSE_DATA.modules[0].lessons[0].id}`}
//                     className="inline-flex items-center gap-2 glass text-gray-200 px-6 py-3 rounded-xl hover:bg-white/5 transition-colors">
//                     <Play size={14} /> Preview
//                   </a>
//                 </motion.div>
//               </div>

//               {/* Course preview card */}
//               <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
//                 className="glass-strong rounded-2xl overflow-hidden">
//                 <div className="bg-gradient-to-br from-cyan-500/20 to-violet-500/20 p-6 border-b border-white/5">
//                   <div className="flex items-center justify-between mb-4">
//                     <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Course Preview</span>
//                     <span className="text-xs glass px-3 py-1 rounded-full text-gray-400">{COURSE_DATA.level}</span>
//                   </div>
//                   <div className="text-4xl font-display font-bold text-white mb-1">Free</div>
//                   <div className="text-sm text-gray-400">to start learning</div>
//                 </div>
//                 <div className="p-6">
//                   <h4 className="text-sm font-semibold text-white mb-4">What you'll learn:</h4>
//                   <ul className="space-y-3">
//                     {[
//                       'Blockchain architecture & cryptography',
//                       'Ethereum EVM & Smart Contracts',
//                       'Solidity from basics to advanced',
//                       'DeFi protocols: DEX, lending, yield',
//                       'NFTs, ERC-721 & digital ownership',
//                       'Web3 career roadmap & portfolio',
//                     ].map(item => (
//                       <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
//                         <CheckCircle size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
//                         {item}
//                       </li>
//                     ))}
//                   </ul>
//                   <a href="/course"
//                     className="block mt-6 text-center bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity">
//                     Enroll Now — Free
//                   </a>
//                 </div>
//               </motion.div>
//             </div>
//           </div>
//         </section>

//         {/* Modules Overview */}
//         <section className="py-20 px-6">
//           <div className="max-w-5xl mx-auto">
//             <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
//               className="font-display text-3xl font-bold mb-10">
//               Course <span className="text-gradient-cyan">Curriculum</span>
//             </motion.h2>
//             <div className="space-y-4">
//               {COURSE_DATA.modules.map((mod, i) => (
//                 <motion.div key={mod.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
//                   viewport={{ once: true }} transition={{ delay: i * 0.07 }}
//                   className="glass rounded-xl overflow-hidden">
//                   <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
//                     <div className="flex items-center gap-3">
//                       <span className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-bold flex items-center justify-center font-mono">
//                         {String(i + 1).padStart(2, '0')}
//                       </span>
//                       <h3 className="font-display font-semibold text-white text-sm">{mod.title}</h3>
//                     </div>
//                     <span className="text-xs text-gray-500">{mod.lessons.length} lessons</span>
//                   </div>
//                   <ul className="divide-y divide-white/5">
//                     {mod.lessons.map(lesson => (
//                       <li key={lesson.id}>
//                         <a href={`/lesson/${lesson.id}`}
//                           className="flex items-center justify-between px-6 py-3 hover:bg-white/3 transition-colors group">
//                           <div className="flex items-center gap-3">
//                             <Play size={12} className="text-gray-600 group-hover:text-cyan-400 transition-colors" />
//                             <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{lesson.title}</span>
//                           </div>
//                           <span className="text-xs text-gray-600">{lesson.duration}</span>
//                         </a>
//                       </li>
//                     ))}
//                   </ul>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </section>
//       </div>
//     </div>
//   )
// }



import { motion } from 'framer-motion'
import { Star, Users, Clock, BookOpen, ArrowRight, CheckCircle } from 'lucide-react'
import { ALL_COURSES, COURSE_BLOCKCHAIN } from '../data/courseData'
import AcademyNavbar from '../components/AcademyNavbar'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
}

const COURSE_COLORS: Record<string, { border: string; accent: string; badge: string; bg: string }> = {
  'blockchain-social-impact': {
    border: 'border-cyan-500/30',
    accent: 'text-cyan-400',
    badge: 'bg-cyan-500/10 text-cyan-400',
    bg: 'from-cyan-500/10 to-transparent',
  },
  'tokenomics-fundamentals': {
    border: 'border-amber-500/30',
    accent: 'text-amber-400',
    badge: 'bg-amber-500/10 text-amber-400',
    bg: 'from-amber-500/10 to-transparent',
  },
  'ai-for-business': {
    border: 'border-violet-500/30',
    accent: 'text-violet-400',
    badge: 'bg-violet-500/10 text-violet-400',
    bg: 'from-violet-500/10 to-transparent',
  },
}

export default function LandingPage() {
  const main = COURSE_BLOCKCHAIN
  const totalLessons = main.modules.reduce((acc, m) => acc + m.lessons.length, 0)

  return (
    <div className="min-h-screen bg-[#080A0F]">
      <AcademyNavbar />
      <div className="pt-20">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden py-24 px-6">
          <div className="absolute inset-0 bg-grid-pattern" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-cyan-500/8 rounded-full blur-3xl" />

          <div className="max-w-5xl mx-auto relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <motion.div variants={fadeUp} initial="hidden" animate="visible"
                  className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full mb-6">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase">Rubikcon Academy</span>
                </motion.div>

                <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
                  className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4">
                  {main.title}
                  <br /><span className="text-gradient-cyan">{main.tagline}</span>
                </motion.h1>

                <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
                  className="text-gray-400 leading-relaxed mb-8">{main.description}</motion.p>

                {/* Stats */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
                  className="flex flex-wrap gap-6 mb-8 text-sm">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Star size={14} className="fill-amber-400" />
                    <span className="font-semibold">{main.rating}</span>
                    <span className="text-gray-500">rating</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Users size={14} />
                    <span>{main.students.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Clock size={14} />
                    <span>{main.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <BookOpen size={14} />
                    <span>{totalLessons} lessons</span>
                  </div>
                </motion.div>

                {/* Instructor */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
                  className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-xs font-bold">AO</div>
                  <div>
                    <div className="text-sm font-medium text-white">{main.instructor}</div>
                    <div className="text-xs text-gray-500">{main.instructorRole}</div>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}
                  className="flex gap-3">
                  <a href="/course"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold px-7 py-3 rounded-xl hover:opacity-90 transition-all hover:scale-105">
                    Start Learning <ArrowRight size={15} />
                  </a>
                </motion.div>
              </div>

              {/* Enroll card */}
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
                className="glass-strong rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-cyan-500/20 to-violet-500/20 p-6 border-b border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Featured Course</span>
                    <span className="text-xs glass px-3 py-1 rounded-full text-gray-400">{main.level}</span>
                  </div>
                  <div className="text-4xl font-display font-bold text-white mb-1">Free</div>
                  <div className="text-sm text-gray-400">to start learning</div>
                </div>
                <div className="p-6">
                  <h4 className="text-sm font-semibold text-white mb-4">What you'll learn:</h4>
                  <ul className="space-y-3">
                    {[
                      'Blockchain fundamentals for social good',
                      'Smart contracts & transparent donations',
                      'Supply chain transparency',
                      'DAOs & decentralized fundraising',
                      'Real-world impact case studies',
                      'Web3 career roadmap',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <a href="/course"
                    className="block mt-6 text-center bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity">
                    Enroll Now — Free
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── ALL COURSES ── */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="mb-12">
              <h2 className="font-display text-3xl font-bold mb-2">
                All <span className="text-gradient-cyan">Courses</span>
              </h2>
              <p className="text-gray-400 text-sm">Expand your knowledge across blockchain, tokenomics, and AI.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {ALL_COURSES.map((course, i) => {
                const colors = COURSE_COLORS[course.id]
                const lessons = course.modules.reduce((a, m) => a + m.lessons.length, 0)
                return (
                  <motion.div key={course.id}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className={`relative group glass rounded-2xl p-6 border ${colors.border} hover:bg-white/5 transition-all duration-300`}>
                    <div className={`absolute inset-0 bg-gradient-to-b ${colors.bg} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <div className="relative">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium mb-4 inline-block ${colors.badge}`}>
                        {course.level}
                      </span>
                      <h3 className="font-display font-bold text-white text-base leading-snug mb-2">{course.title}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">{course.tagline}</p>

                      <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><BookOpen size={11} />{lessons} lessons</span>
                        <span className="flex items-center gap-1"><Clock size={11} />{course.duration}</span>
                      </div>

                      <div className="flex items-center gap-2 mb-5">
                        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${colors.badge} flex items-center justify-center text-[9px] font-bold text-white`}>
                          {course.instructor.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-xs text-gray-400">{course.instructor}</span>
                      </div>

                      <a href={`/course?id=${course.id}`}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${colors.accent} hover:opacity-80 transition-opacity`}>
                        Start Learning <ArrowRight size={12} />
                      </a>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}