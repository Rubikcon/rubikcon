// import { useState } from 'react'
// import { motion } from 'framer-motion'
// import { ChevronDown, ChevronRight, Play, CheckCircle, Clock, Lock } from 'lucide-react'
// import { COURSE_DATA } from '../data/courseData'
// import AcademyNavbar from '../components/AcademyNavbar'

// export default function CoursePage() {
//   const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set([COURSE_DATA.modules[0].id]))
//   const [completed] = useState<Set<string>>(new Set(['l-1-1']))

//   const toggle = (id: string) => {
//     setExpandedModules(prev => {
//       const next = new Set(prev)
//       next.has(id) ? next.delete(id) : next.add(id)
//       return next
//     })
//   }

//   const totalLessons = COURSE_DATA.modules.reduce((a, m) => a + m.lessons.length, 0)
//   const completedCount = completed.size
//   const progress = Math.round((completedCount / totalLessons) * 100)

//   return (
//     <div className="min-h-screen bg-[#080A0F]">
//       <AcademyNavbar showBack backHref="/" backLabel="Back to Academy" />
//       <div className="pt-20 max-w-5xl mx-auto px-6 py-12">
//         {/* Header */}
//         <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
//           <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{COURSE_DATA.title}</h1>
//           <p className="text-gray-400">{COURSE_DATA.tagline}</p>
//         </motion.div>

//         {/* Progress bar */}
//         <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
//           className="glass rounded-xl p-5 mb-8">
//           <div className="flex justify-between items-center mb-3">
//             <span className="text-sm font-medium text-white">Your Progress</span>
//             <span className="text-sm text-cyan-400 font-mono">{completedCount}/{totalLessons} lessons</span>
//           </div>
//           <div className="w-full bg-white/5 rounded-full h-2">
//             <motion.div
//               initial={{ width: 0 }}
//               animate={{ width: `${progress}%` }}
//               transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
//               className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
//             />
//           </div>
//           <div className="mt-2 text-xs text-gray-500">{progress}% complete</div>
//         </motion.div>

//         {/* Module list */}
//         <div className="space-y-3">
//           {COURSE_DATA.modules.map((mod, mi) => {
//             const isOpen = expandedModules.has(mod.id)
//             const modCompleted = mod.lessons.filter(l => completed.has(l.id)).length
//             return (
//               <motion.div key={mod.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.05 * mi }} className="glass rounded-xl overflow-hidden">
//                 <button
//                   onClick={() => toggle(mod.id)}
//                   className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/3 transition-colors"
//                 >
//                   <div className="flex items-center gap-4">
//                     <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-cyan-400 text-xs font-bold font-mono flex items-center justify-center">
//                       {String(mi + 1).padStart(2, '0')}
//                     </span>
//                     <div className="text-left">
//                       <div className="font-display font-semibold text-white text-sm">{mod.title}</div>
//                       <div className="text-xs text-gray-500 mt-0.5">
//                         {modCompleted}/{mod.lessons.length} completed · {mod.lessons.reduce((a, l) => a + parseInt(l.duration), 0)} min
//                       </div>
//                     </div>
//                   </div>
//                   {isOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
//                 </button>

//                 {isOpen && (
//                   <ul className="border-t border-white/5 divide-y divide-white/5">
//                     {mod.lessons.map((lesson, li) => {
//                       const isDone = completed.has(lesson.id)
//                       const isLocked = mi > 0 && li > 0 && !completed.has(COURSE_DATA.modules[mi - 1]?.lessons[0]?.id)
//                       return (
//                         <li key={lesson.id}>
//                           <a
//                             href={isLocked ? undefined : `/lesson/${lesson.id}`}
//                             className={`flex items-center gap-4 px-6 py-4 transition-colors ${isLocked ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/3 group cursor-pointer'}`}
//                           >
//                             <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${isDone ? 'bg-cyan-500/20' : 'bg-white/5'}`}>
//                               {isLocked ? <Lock size={11} className="text-gray-500" /> :
//                                 isDone ? <CheckCircle size={14} className="text-cyan-400" /> :
//                                   <Play size={11} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />}
//                             </div>
//                             <div className="flex-1 min-w-0">
//                               <div className={`text-sm ${isDone ? 'text-cyan-400' : 'text-gray-300 group-hover:text-white'} transition-colors truncate`}>
//                                 {lesson.title}
//                               </div>
//                               <div className="text-xs text-gray-600 mt-0.5">{lesson.description}</div>
//                             </div>
//                             <div className="flex items-center gap-1.5 text-gray-600 text-xs flex-shrink-0">
//                               <Clock size={11} /> {lesson.duration}
//                             </div>
//                           </a>
//                         </li>
//                       )
//                     })}
//                   </ul>
//                 )}
//               </motion.div>
//             )
//           })}
//         </div>

//         {/* Jump to first incomplete */}
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 text-center">
//           <a href={`/lesson/${COURSE_DATA.modules[0].lessons[completedCount] ? COURSE_DATA.modules[0].lessons[completedCount].id : COURSE_DATA.modules[0].lessons[0].id}`}
//             className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity">
//             Continue Learning <ChevronRight size={16} />
//           </a>
//         </motion.div>
//       </div>
//     </div>
//   )
// }




import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronRight, Play, CheckCircle, Clock, Lock } from 'lucide-react'
import { getCourseById, COURSE_BLOCKCHAIN, getAllLessons } from '../data/courseData'
import AcademyNavbar from '../components/AcademyNavbar'

export default function CoursePage() {
  // Read course id from URL query param e.g. /course?id=tokenomics-fundamentals
  const params = new URLSearchParams(window.location.search)
  const courseId = params.get('id') || 'blockchain-social-impact'
  const course = getCourseById(courseId) || COURSE_BLOCKCHAIN

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set([course.modules[0].id]))
  const [completed] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0)
  const completedCount = completed.size
  const progress = Math.round((completedCount / totalLessons) * 100)
  const allLessons = getAllLessons(course)

  return (
    <div className="min-h-screen bg-[#080A0F]">
      <AcademyNavbar showBack backHref="/" backLabel="Back to Academy" />
      <div className="pt-20 max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{course.title}</h1>
          <p className="text-gray-400">{course.tagline}</p>
        </motion.div>

        {/* Progress bar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-xl p-5 mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-white">Your Progress</span>
            <span className="text-sm text-cyan-400 font-mono">{completedCount}/{totalLessons} lessons</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">{progress}% complete</div>
        </motion.div>

        {/* Module list */}
        <div className="space-y-3">
          {course.modules.map((mod, mi) => {
            const isOpen = expandedModules.has(mod.id)
            const modCompleted = mod.lessons.filter(l => completed.has(l.id)).length
            return (
              <motion.div key={mod.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * mi }} className="glass rounded-xl overflow-hidden">
                <button onClick={() => toggle(mod.id)}
                  className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/3 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-cyan-400 text-xs font-bold font-mono flex items-center justify-center">
                      {String(mi + 1).padStart(2, '0')}
                    </span>
                    <div className="text-left">
                      <div className="font-display font-semibold text-white text-sm">{mod.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {modCompleted}/{mod.lessons.length} completed
                      </div>
                    </div>
                  </div>
                  {isOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                </button>

                {isOpen && (
                  <ul className="border-t border-white/5 divide-y divide-white/5">
                    {mod.lessons.map((lesson) => {
                      const isDone = completed.has(lesson.id)
                      return (
                        <li key={lesson.id}>
                          <a href={`/lesson/${lesson.id}`}
                            className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 group transition-colors cursor-pointer">
                            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${isDone ? 'bg-cyan-500/20' : 'bg-white/5'}`}>
                              {isDone
                                ? <CheckCircle size={14} className="text-cyan-400" />
                                : <Play size={11} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm ${isDone ? 'text-cyan-400' : 'text-gray-300 group-hover:text-white'} transition-colors truncate`}>
                                {lesson.title}
                              </div>
                              <div className="text-xs text-gray-600 mt-0.5">{lesson.description}</div>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-600 text-xs flex-shrink-0">
                              <Clock size={11} /> {lesson.duration}
                            </div>
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Continue button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 text-center">
          <a href={`/lesson/${allLessons[completedCount]?.id || allLessons[0]?.id}`}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity">
            Continue Learning <ChevronRight size={16} />
          </a>
        </motion.div>

      </div>
    </div>
  )
}