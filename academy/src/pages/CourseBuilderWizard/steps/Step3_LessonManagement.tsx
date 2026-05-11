import { FormEvent, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Pencil, ExternalLink } from 'lucide-react'
import { apiRequest } from '../../../lib/api'
import type { UseWizardState } from '../hooks/useCourseWizardState'
import type { LessonFormData } from '../types/CourseWizardTypes'
import type { AdminCourseDetail } from '../../../types/academy'

interface Step3_LessonManagementProps {
  wizard: UseWizardState
  courseId: string
  onBack: () => void
  onFinish: () => void
}

/**
 * Step 3 — Lesson management (Path B: weeks under modules)
 *
 * Each "lesson" is stored server-side as a Week row with moduleId set to
 * the currently selected module. We only collect the bare minimum here
 * (title, duration in minutes); placeholder defaults are filled by the
 * backend. The admin clicks "Edit details" to open the rich week editor
 * where they fill in what to expect, topics, objectives, videos, slides,
 * resources, assignments, quizzes, and facilitators.
 */
export default function Step3_LessonManagement({
  wizard,
  courseId,
  onBack,
  onFinish,
}: Step3_LessonManagementProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<string>('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({ title: '', duration: 30 })

  const selectedLessons = useMemo(() => {
    if (!selectedModuleId) return []
    return wizard.lessons[selectedModuleId] || []
  }, [selectedModuleId, wizard.lessons])

  function slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  function resetForm() {
    setFormData({ title: '', duration: 30 })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!selectedModuleId) {
      wizard.setError('Please select a module')
      return
    }
    if (formData.title.trim().length < 3) {
      wizard.setError('Lesson title must be at least 3 characters')
      return
    }
    if (formData.duration < 1) {
      wizard.setError('Duration must be at least 1 minute')
      return
    }

    setIsSubmitting(true)
    wizard.setError(null)

    try {
      // Compute next week number from the AUTHORITATIVE list of weeks in the
      // course (refetch it). The wizard's in-memory state only tracks weeks
      // that have a moduleId — orphan weeks would otherwise collide on number.
      const courseDetail = await apiRequest<AdminCourseDetail>(
        `/academy/admin/courses/${courseId}`
      )
      const existingNumbers = (courseDetail.weeks || []).map(w => w.number)
      const nextWeekNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1

      // Slug must be 3-100 chars matching /^[a-z0-9-]+$/. Compose with a short
      // unique suffix and keep the whole thing under 100.
      const uniqueSuffix = `-${nextWeekNumber}-${Date.now().toString(36).slice(-6)}`
      const baseSlug = slugify(formData.title) || 'lesson'
      const maxBaseLen = 100 - uniqueSuffix.length
      const slug = `${baseSlug.slice(0, maxBaseLen)}${uniqueSuffix}`

      const response = await apiRequest<any>(
        `/academy/admin/courses/${courseId}/weeks`,
        {
          method: 'POST',
          body: JSON.stringify({
            number: nextWeekNumber,
            title: formData.title.trim(),
            slug,
            durationLabel: `${formData.duration} min`,
            estimatedCompletionMinutes: formData.duration,
            moduleId: selectedModuleId,
            // Other required fields use their schema defaults
          }),
        }
      )

      // apiRequest unwraps payload.data; the week is what we receive
      const created = response as { id: string; title: string; slug: string }

      wizard.addLesson(selectedModuleId, {
        id: created.id,
        title: created.title,
        slug: created.slug,
        content: '',
        duration: formData.duration,
        moduleId: selectedModuleId,
        videos: [],
        facilitators: [],
        hasDetails: false,
      })

      setShowCreateForm(false)
      resetForm()
    } catch (err) {
      wizard.setError(err instanceof Error ? err.message : 'Failed to create lesson')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(lessonId: string) {
    if (!confirm('Delete this lesson and all its content?')) return
    setIsSubmitting(true)
    wizard.setError(null)

    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${lessonId}`, {
        method: 'DELETE',
      })
      wizard.deleteLesson(selectedModuleId, lessonId)
    } catch (err) {
      wizard.setError(err instanceof Error ? err.message : 'Failed to delete lesson')
    } finally {
      setIsSubmitting(false)
    }
  }

  function openWeekEditor(lesson: LessonFormData) {
    // Persist current wizard state first so we don't lose anything on navigation
    window.location.href = `/admin/courses/${courseId}/weeks/${lesson.id}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Lessons</h1>
        <p className="text-white/60">
          Add lessons under each module. Each lesson can have videos, slides, reading
          resources, assignments, quizzes, and facilitators — set those up after
          creating the lesson skeleton.
        </p>
      </div>

      {/* Module Selector */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-white/80 block mb-2">
            Select Module *
          </span>
          <select
            value={selectedModuleId}
            onChange={e => {
              setSelectedModuleId(e.target.value)
              setShowCreateForm(false)
              resetForm()
            }}
            className="w-full rounded-xl border border-white/12 bg-[#111] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C518]/40 transition-colors [color-scheme:dark]"
          >
            <option value="">-- Select a module --</option>
            {wizard.modules.map(m => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Lessons List */}
      {selectedModuleId && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Lessons ({selectedLessons.length})
            </h2>
            {!showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-1.5 text-sm text-[#F5C518] hover:text-[#E8B800] transition-colors"
              >
                <Plus size={16} /> Add Lesson
              </button>
            )}
          </div>

          <AnimatePresence>
            {selectedLessons.length === 0 && !showCreateForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-dashed border-white/20 px-4 py-8 text-center"
              >
                <p className="text-white/40">No lessons yet. Create your first lesson.</p>
              </motion.div>
            )}

            {selectedLessons.map((lesson, idx) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-xl border border-white/10 bg-black/30 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F5C518] text-black text-xs font-semibold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-white truncate">{lesson.title}</h3>
                      <span className="text-xs text-white/40 flex-shrink-0">({lesson.duration} min)</span>
                    </div>
                    {!lesson.hasDetails && (
                      <p className="text-xs text-amber-300/70 ml-8">
                        Skeleton only — click "Edit details" to add content
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => openWeekEditor(lesson)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#F5C518]/30 bg-[#F5C518]/10 text-[#F5C518] hover:bg-[#F5C518]/20 transition-colors"
                    >
                      <Pencil size={12} /> Edit details <ExternalLink size={10} />
                    </button>
                    <button
                      onClick={() => handleDelete(lesson.id!)}
                      disabled={isSubmitting}
                      title="Delete lesson"
                      className="p-1.5 text-white/40 hover:text-red-400 transition-colors disabled:opacity-40"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Form */}
      <AnimatePresence>
        {showCreateForm && selectedModuleId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-[#F5C518]/20 bg-[#F5C518]/5 p-6 space-y-4"
          >
            <div>
              <h3 className="text-lg font-semibold text-[#F5C518]">New Lesson</h3>
              <p className="text-xs text-white/40 mt-1">
                Just the basics — you'll add videos, slides, resources, assignments, quizzes,
                and facilitators after creating it.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Lesson Title *
                </label>
                <input
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g. Introduction to Blockchain"
                  className="w-full rounded-xl border border-white/12 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Estimated Duration (minutes) *
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={e =>
                    setFormData({ ...formData, duration: Math.max(1, parseInt(e.target.value) || 1) })
                  }
                  required
                  min={1}
                  max={600}
                  className="w-full rounded-xl border border-white/12 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    resetForm()
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.title.trim()}
                  className="px-6 py-2 text-sm font-semibold rounded-full bg-[#F5C518] text-black disabled:opacity-40 hover:bg-[#E8B800] transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-black/20 border-t-black rounded-full" />
                      Creating...
                    </>
                  ) : (
                    'Create Lesson'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 justify-between pt-6 border-t border-white/10">
        <button
          onClick={onBack}
          className="px-6 py-2.5 text-sm font-medium rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-colors"
        >
          ← Back
        </button>

        <button
          onClick={onFinish}
          disabled={!wizard.isStep3Valid()}
          className="px-8 py-2.5 text-sm font-semibold rounded-full bg-[#F5C518] text-black disabled:opacity-40 hover:bg-[#E8B800] transition-colors"
        >
          Finish Course Setup
        </button>
      </div>
    </motion.div>
  )
}
