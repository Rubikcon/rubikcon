import { FormEvent } from 'react'
import { motion } from 'framer-motion'
import { apiRequest } from '../../../lib/api'
import type { UseWizardState } from '../hooks/useCourseWizardState'

interface Step1_CourseInfoProps {
  wizard: UseWizardState
  courseId: string
  onNext: () => void
}

export default function Step1_CourseInfo({ wizard, courseId, onNext }: Step1_CourseInfoProps) {

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    // Validate required fields
    if (wizard.courseData.title.trim().length < 3) {
      wizard.setError('Course title must be at least 3 characters')
      return
    }
    if (wizard.courseData.slug.trim().length === 0) {
      wizard.setError('Course slug is required')
      return
    }
    if (wizard.courseData.description.trim().length < 20) {
      wizard.setError('Course description must be at least 20 characters')
      return
    }

    wizard.setSavingStep(1)
    wizard.setError(null)

    try {
      const payload: Record<string, unknown> = {
        title: wizard.courseData.title.trim(),
        slug: wizard.courseData.slug.trim(),
        description: wizard.courseData.description.trim(),
        isPaid: wizard.courseData.isPaid,
      }

      await apiRequest(`/academy/admin/courses/${courseId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })

      wizard.setSavingStep(undefined)
      wizard.markStepComplete(1)
      onNext()
    } catch (err) {
      wizard.setError(err instanceof Error ? err.message : 'Failed to save course info')
      wizard.setSavingStep(undefined)
    }
  }

  const isSaving = wizard.savingStep === 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto space-y-4"
    >
      <form onSubmit={handleSubmit} className="space-y-4">

      <div>
        <label className="block text-sm font-medium text-white mb-2">Course Title</label>
        <input
          value={wizard.courseData.title}
          onChange={e => wizard.updateCourseData({ title: e.target.value })}
          required
          placeholder="e.g. Introduction to Blockchain"
          className="w-full rounded-lg border border-white/12 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Course URL Slug</label>
        <input
          value={wizard.courseData.slug}
          onChange={e =>
            wizard.updateCourseData({
              slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
            })
          }
          required
          placeholder="e.g. intro-blockchain"
          className="w-full rounded-lg border border-white/12 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors font-mono"
        />
        <p className="mt-1 text-xs text-white/40">/courses/{wizard.courseData.slug || 'your-slug'}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Description</label>
        <textarea
          value={wizard.courseData.description}
          onChange={e => wizard.updateCourseData({ description: e.target.value })}
          required
          minLength={20}
          rows={3}
          placeholder="What will learners gain from this course?"
          className="w-full rounded-lg border border-white/12 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors resize-none"
        />
        <div className="mt-1 flex items-center justify-between text-xs text-white/40">
          <span>min 20 characters</span>
          <span>{wizard.courseData.description.length} / 1000</span>
        </div>
      </div>

      {/* Error Message */}
      {wizard.error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {wizard.error}
        </motion.div>
      )}

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className="w-full px-6 py-3 text-sm font-semibold rounded-lg bg-[#F5C518] text-black disabled:opacity-40 hover:bg-[#E8B800] transition-colors flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-black/20 border-t-black rounded-full" />
              Saving...
            </>
          ) : (
            'Continue to Modules →'
          )}
        </button>
      </div>
    </form>
    </motion.div>
  )
}
