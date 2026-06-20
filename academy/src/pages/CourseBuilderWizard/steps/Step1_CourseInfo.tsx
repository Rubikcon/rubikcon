import { FormEvent, useState } from 'react'
import { motion } from 'framer-motion'
import { Image } from 'lucide-react'
import { apiRequest } from '../../../lib/api'
import { compressImageToBase64 } from '../../../lib/imageCompress'
import type { UseWizardState } from '../hooks/useCourseWizardState'

interface Step1_CourseInfoProps {
  wizard: UseWizardState
  courseId: string
  onNext: () => void
}

export default function Step1_CourseInfo({ wizard, courseId, onNext }: Step1_CourseInfoProps) {
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)

  async function handleThumbnailUpload(file: File | null) {
    if (!file) return
    setUploadingThumbnail(true)
    wizard.setError(null)
    try {
      const dataUrl = await compressImageToBase64(file, { maxBase64KB: 180, maxDimension: 1200 })
      wizard.updateCourseData({ heroImage: dataUrl })
    } catch (err) {
      wizard.setError(err instanceof Error ? err.message : 'Failed to process course thumbnail')
    } finally {
      setUploadingThumbnail(false)
    }
  }

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
      if (wizard.courseData.tagline.trim()) payload.tagline = wizard.courseData.tagline.trim()
      if (wizard.courseData.level.trim()) payload.level = wizard.courseData.level.trim()
      if (wizard.courseData.estimatedDuration.trim()) payload.estimatedDuration = wizard.courseData.estimatedDuration.trim()
      if (wizard.courseData.contentUnit.trim()) payload.contentUnit = wizard.courseData.contentUnit.trim()
      if (wizard.courseData.introVideoUrl.trim()) payload.introVideoUrl = wizard.courseData.introVideoUrl.trim()
      if (wizard.courseData.overviewSlideUrl.trim()) payload.overviewSlideUrl = wizard.courseData.overviewSlideUrl.trim()
      if (wizard.courseData.heroImage.trim()) payload.heroImage = wizard.courseData.heroImage.trim()

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

      <div>
        <label className="block text-sm font-medium text-white mb-2">Course Thumbnail Image</label>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <input
            value={wizard.courseData.heroImage}
            onChange={e => wizard.updateCourseData({ heroImage: e.target.value })}
            placeholder="Paste an image URL or upload a thumbnail"
            className="w-full rounded-lg border border-white/12 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors"
          />
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/12 px-4 py-2.5 text-sm text-white/70 hover:border-[#F5C518]/30 hover:text-white transition-colors">
            <Image size={14} />
            {uploadingThumbnail ? 'Processing...' : 'Upload'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={e => void handleThumbnailUpload(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
        </div>
        {wizard.courseData.heroImage && (
          <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-black/30">
            <img src={wizard.courseData.heroImage} alt="Course thumbnail preview" className="aspect-[16/9] w-full object-cover" />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Course Overview Slides</label>
        <input
          value={wizard.courseData.overviewSlideUrl}
          onChange={e => wizard.updateCourseData({ overviewSlideUrl: e.target.value })}
          type="url"
          placeholder="Canva or Google Slides embed/share URL"
          className="w-full rounded-lg border border-white/12 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors"
        />
        <p className="mt-1 text-xs text-white/40">Use a publicly-viewable course overview deck link.</p>
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
