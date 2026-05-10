import { motion } from 'framer-motion'
import { CheckCircle, Book, Layers, BookOpen } from 'lucide-react'
import type { CourseFormData, ModuleFormData } from '../types/CourseWizardTypes'

interface CompletionModalProps {
  course: CourseFormData
  modules: ModuleFormData[]
  lessons: Record<string, any[]>
  onClose: () => void
  onViewCourse: () => void
  onCreateAnother: () => void
}

export default function CompletionModal({
  course,
  modules,
  lessons,
  onClose,
  onViewCourse,
  onCreateAnother,
}: CompletionModalProps) {
  const totalLessons = Object.values(lessons).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl rounded-[24px] border border-white/10 bg-gradient-to-br from-black via-[#0a0e27] to-black p-8 space-y-8"
      >
        {/* Success Icon */}
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-[#F5C518]/20 blur-2xl rounded-full" />
            <CheckCircle size={64} className="relative text-[#F5C518]" />
          </motion.div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">
            Course Created Successfully!
          </h2>
          <p className="text-white/60">
            Your course structure is ready. Start teaching now or make final adjustments.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center space-y-1"
          >
            <div className="flex justify-center">
              <Book size={24} className="text-[#F5C518]" />
            </div>
            <p className="text-2xl font-bold text-white">1</p>
            <p className="text-xs text-white/40">Course Created</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center space-y-1"
          >
            <div className="flex justify-center">
              <Layers size={24} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{modules.length}</p>
            <p className="text-xs text-white/40">Modules</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center space-y-1"
          >
            <div className="flex justify-center">
              <BookOpen size={24} className="text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">{totalLessons}</p>
            <p className="text-xs text-white/40">Lessons</p>
          </motion.div>
        </div>

        {/* Course Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-6 space-y-3"
        >
          <h3 className="font-semibold text-white">Course Details</h3>
          <dl className="space-y-2">
            <div className="flex justify-between items-start gap-4">
              <dt className="text-sm text-white/40">Title</dt>
              <dd className="text-sm font-medium text-white text-right">{course.title}</dd>
            </div>
            <div className="flex justify-between items-start gap-4">
              <dt className="text-sm text-white/40">URL</dt>
              <dd className="text-sm font-medium text-[#F5C518] text-right">
                /courses/{course.slug}
              </dd>
            </div>
            {course.level && (
              <div className="flex justify-between items-start gap-4">
                <dt className="text-sm text-white/40">Level</dt>
                <dd className="text-sm font-medium text-white text-right">
                  {course.level}
                </dd>
              </div>
            )}
            {course.estimatedDuration && (
              <div className="flex justify-between items-start gap-4">
                <dt className="text-sm text-white/40">Duration</dt>
                <dd className="text-sm font-medium text-white text-right">
                  {course.estimatedDuration}
                </dd>
              </div>
            )}
          </dl>
        </motion.div>

        {/* Module Summary */}
        {modules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-6 space-y-3"
          >
            <h3 className="font-semibold text-white">Modules Overview</h3>
            <div className="space-y-2">
              {modules.map((module, idx) => (
                <div key={module.id} className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#F5C518] text-black text-xs font-semibold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{module.title}</p>
                    <p className="text-xs text-white/40">
                      {(lessons[module.id!] || []).length} lesson
                      {(lessons[module.id!] || []).length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-6 space-y-3"
        >
          <p className="text-sm font-medium text-amber-200">
            ✨ What's Next?
          </p>
          <ul className="space-y-2 text-sm text-amber-100/80 ml-5 list-disc">
            <li>Add facilitators to the course</li>
            <li>Review and publish your course</li>
            <li>Share the course with students</li>
          </ul>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex gap-3 justify-end"
        >
          <button
            onClick={onCreateAnother}
            className="px-6 py-2.5 text-sm font-medium rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-colors"
          >
            Create Another
          </button>
          <button
            onClick={onViewCourse}
            className="px-6 py-2.5 text-sm font-semibold rounded-full bg-[#F5C518] text-black hover:bg-[#E8B800] transition-colors"
          >
            View Course
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
