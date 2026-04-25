import { useState, useEffect } from 'react'
import { useParams } from 'wouter'
import { motion } from 'framer-motion'
import { CheckCircle, ChevronLeft, ChevronRight, Play, BookOpen, Clock, Menu, X } from 'lucide-react'
import { getLessonById, getNextLesson, getPrevLesson, COURSE_DATA } from '../data/courseData'
import AcademyNavbar from '../components/AcademyNavbar'

export default function LessonPage() {
  const { id } = useParams<{ id: string }>()
  const result = getLessonById(id || '')
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'overview'>('content')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (!result) {
    return (
      <div className="min-h-screen bg-[#080A0F] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="font-display text-xl font-bold mb-2">Lesson Not Found</h2>
          <a href="/course" className="text-cyan-400 hover:underline text-sm">Back to Course</a>
        </div>
      </div>
    )
  }

  const { lesson, module } = result
  const next = getNextLesson(lesson.id)
  const prev = getPrevLesson(lesson.id)
  const isDone = completed.has(lesson.id)

  const markComplete = () => {
    setCompleted(prev => new Set([...prev, lesson.id]))
  }

  const allLessons = COURSE_DATA.modules.flatMap(m => m.lessons)
  const totalLessons = allLessons.length
  const currentIndex = allLessons.findIndex(l => l.id === lesson.id)
  const progress = Math.round(((currentIndex + 1) / totalLessons) * 100)

  return (
    <div className="min-h-screen bg-[#080A0F] flex flex-col">
      <AcademyNavbar showBack backHref="/course" backLabel="Course Overview" />

      {/* Progress bar */}
      <div className="fixed top-[57px] left-0 right-0 z-40 h-0.5 bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-gradient-to-r from-cyan-500 to-violet-500"
        />
      </div>

      <div className="flex flex-1 pt-[57px]">
        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-[57px] h-[calc(100vh-57px)] w-72 bg-[#0D1017] border-r border-white/5 flex flex-col z-30 transition-transform duration-300 overflow-y-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-4 border-b border-white/5">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Course Content</div>
            <div className="text-xs text-gray-600">{currentIndex + 1} / {totalLessons} lessons</div>
          </div>

          {COURSE_DATA.modules.map((mod, mi) => (
            <div key={mod.id}>
              <div className="px-4 py-3 bg-white/2 border-y border-white/5">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{mod.title}</div>
              </div>
              {mod.lessons.map(l => {
                const isActive = l.id === lesson.id
                const isDoneSidebar = completed.has(l.id)
                return (
                  <a
                    key={l.id}
                    href={`/lesson/${l.id}`}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-white/3 transition-colors ${isActive ? 'bg-cyan-500/10 border-l-2 border-l-cyan-500' : 'hover:bg-white/3'}`}
                  >
                    <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${isDoneSidebar ? 'bg-cyan-500/20' : isActive ? 'bg-cyan-500/10' : 'bg-white/5'}`}>
                      {isDoneSidebar ? <CheckCircle size={11} className="text-cyan-400" /> : <Play size={9} className={isActive ? 'text-cyan-400' : 'text-gray-600'} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs leading-snug ${isActive ? 'text-white font-medium' : 'text-gray-400'}`}>{l.title}</div>
                      <div className="flex items-center gap-1 mt-1 text-gray-600 text-[10px]">
                        <Clock size={9} />{l.duration}
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          ))}
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Video Player */}
          <div className="w-full bg-black aspect-video">
            <iframe
              src={lesson.videoUrl}
              title={lesson.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="max-w-3xl mx-auto px-6 py-8">
            {/* Lesson header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="text-xs font-mono text-cyan-400 mb-2 uppercase tracking-widest">{module.title}</div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-white">{lesson.title}</h1>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock size={11} />{lesson.duration}</span>
                  <span>·</span>
                  <span>Lesson {currentIndex + 1} of {totalLessons}</span>
                </div>
              </div>

              {/* Mobile sidebar toggle */}
              <button onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden glass p-2 rounded-lg text-gray-400 hover:text-white transition-colors flex-shrink-0">
                {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 glass p-1 rounded-xl mb-8 w-fit">
              {(['content', 'overview'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>
                  {tab === 'content' ? <><BookOpen size={13} className="inline mr-1.5" />Content</> : 'Overview'}
                </button>
              ))}
            </div>

            {/* Lesson Content */}
            {activeTab === 'content' ? (
              <motion.div key="content" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="prose prose-invert prose-sm max-w-none
                  prose-h2:font-display prose-h2:text-xl prose-h2:font-bold prose-h2:text-white prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:font-display prose-h3:text-base prose-h3:font-semibold prose-h3:text-gray-200 prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-gray-300 prose-p:leading-relaxed
                  prose-li:text-gray-300 prose-li:leading-relaxed
                  prose-strong:text-white
                  prose-code:text-cyan-400 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                  prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl">
                {lesson.content.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>
                  if (line.startsWith('### ')) return <h3 key={i}>{line.slice(4)}</h3>
                  if (line.startsWith('- ')) return <li key={i}>{line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1')}</li>
                  if (line.match(/^\d\. /)) return <li key={i}>{line.slice(3)}</li>
                  if (line.startsWith('```')) return line === '```' ? <div key={i} className="h-2" /> : <div key={i} className="font-mono text-xs text-cyan-300 mt-1">{line.slice(3)}</div>
                  if (line.trim() === '') return <div key={i} className="h-3" />
                  return <p key={i}>{line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/`(.*?)`/g, '$1')}</p>
                })}
              </motion.div>
            ) : (
              <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-6">
                <p className="text-gray-300 leading-relaxed">{lesson.description}</p>
              </motion.div>
            )}

            {/* Mark complete + navigation */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
              <div className="flex gap-3">
                {prev && (
                  <a href={`/lesson/${prev.id}`}
                    className="inline-flex items-center gap-2 glass px-5 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white transition-colors">
                    <ChevronLeft size={14} /> Previous
                  </a>
                )}
                {next && (
                  <a href={`/lesson/${next.id}`}
                    className="inline-flex items-center gap-2 glass px-5 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white transition-colors">
                    Next <ChevronRight size={14} />
                  </a>
                )}
              </div>

              <button
                onClick={markComplete}
                disabled={isDone}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isDone
                    ? 'bg-cyan-500/20 text-cyan-400 cursor-default'
                    : 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:opacity-90 hover:scale-105'
                }`}
              >
                <CheckCircle size={15} />
                {isDone ? 'Completed!' : 'Mark as Complete'}
              </button>
            </div>

            {/* Next lesson card */}
            {next && (
              <div className="mt-8 glass rounded-xl p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Up Next</div>
                  <div className="text-sm font-medium text-white">{next.title}</div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Clock size={10} />{next.duration}</div>
                </div>
                <a href={`/lesson/${next.id}`}
                  className="flex-shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
                  Next Lesson <ChevronRight size={14} />
                </a>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
