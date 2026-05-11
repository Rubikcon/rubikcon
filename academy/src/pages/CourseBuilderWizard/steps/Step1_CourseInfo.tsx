import { FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Video } from 'lucide-react'
import { apiRequest } from '../../../lib/api'
import VideoEmbed, { getEmbedUrl } from '../../../components/VideoEmbed'
import type { UseWizardState } from '../hooks/useCourseWizardState'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const DURATIONS = ['2 weeks', '4 weeks', '6 weeks', '8 weeks', '10 weeks', '12 weeks', 'Self-paced']
const CONTENT_UNITS = ['Lesson', 'Week', 'Module', 'Session', 'Chapter', 'Unit']

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
      // Strip empty strings — backend uses .url() validators that reject "".
      // Only send fields that have actual values; let the schema's .optional() handle the rest.
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
  const embedUrl = wizard.courseData.introVideoUrl
    ? getEmbedUrl(wizard.courseData.introVideoUrl)
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Your Course</h1>
        <p className="text-white/60">Start by setting up your course basic information and intro video.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Basic Information</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Course Title *
              </label>
              <input
                value={wizard.courseData.title}
                onChange={e => wizard.updateCourseData({ title: e.target.value })}
                required
                placeholder="e.g. Introduction to Blockchain"
                className="w-full rounded-xl border border-white/12 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors"
              />
              <p className="mt-1 text-xs text-white/40">
                Minimum 3 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Course Slug *
              </label>
              <input
                value={wizard.courseData.slug}
                onChange={e =>
                  wizard.updateCourseData({
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                  })
                }
                required
                placeholder="e.g. intro-blockchain"
                className="w-full rounded-xl border border-white/12 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors"
              />
              <p className="mt-1 text-xs text-white/40">
                Used in course URL: /courses/{wizard.courseData.slug}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Tagline
              </label>
              <input
                value={wizard.courseData.tagline}
                onChange={e => wizard.updateCourseData({ tagline: e.target.value })}
                placeholder="Short hook for your course (e.g. Learn Web3 from scratch)"
                className="w-full rounded-xl border border-white/12 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Level
              </label>
              <select
                value={wizard.courseData.level}
                onChange={e => wizard.updateCourseData({ level: e.target.value })}
                className="w-full rounded-xl border border-white/12 bg-[#111] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C518]/40 transition-colors [color-scheme:dark]"
              >
                <option value="">-- Select level --</option>
                {LEVELS.map(l => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Estimated Duration
              </label>
              <select
                value={wizard.courseData.estimatedDuration}
                onChange={e => wizard.updateCourseData({ estimatedDuration: e.target.value })}
                className="w-full rounded-xl border border-white/12 bg-[#111] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C518]/40 transition-colors [color-scheme:dark]"
              >
                <option value="">-- Select duration --</option>
                {DURATIONS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Content Unit
              </label>
              <select
                value={wizard.courseData.contentUnit}
                onChange={e => wizard.updateCourseData({ contentUnit: e.target.value })}
                className="w-full rounded-xl border border-white/12 bg-[#111] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C518]/40 transition-colors [color-scheme:dark]"
              >
                {CONTENT_UNITS.map(u => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-3 text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wizard.courseData.isPaid}
                  onChange={e => wizard.updateCourseData({ isPaid: e.target.checked })}
                  className="w-4 h-4 accent-[#F5C518] rounded"
                />
                <span className="text-sm font-medium">This is a paid course</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Description *
            </label>
            <textarea
              value={wizard.courseData.description}
              onChange={e => wizard.updateCourseData({ description: e.target.value })}
              required
              rows={4}
              placeholder="Write a compelling course description visible to learners..."
              className="w-full rounded-xl border border-white/12 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors resize-none"
            />
            <p className="mt-1 text-xs text-white/40">
              Minimum 20 characters
            </p>
          </div>
        </div>

        {/* Course Intro Video */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Video size={18} className="text-[#F5C518]" />
            <h2 className="text-lg font-semibold text-white">Course Preview Video</h2>
          </div>
          <p className="text-sm text-white/60">
            Add a video to introduce your course to students. Supports YouTube, Vimeo, Loom, and Google Drive.
          </p>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Video URL
            </label>
            <input
              value={wizard.courseData.introVideoUrl}
              onChange={e => wizard.updateCourseData({ introVideoUrl: e.target.value })}
              type="url"
              placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
              className="w-full rounded-xl border border-white/12 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors"
            />
            <p className="mt-1 text-xs text-white/40">
              Leave empty if you don't want a video
            </p>
          </div>

          {/* Video Preview */}
          {embedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl overflow-hidden border border-white/10 bg-black/40"
            >
              <VideoEmbed url={wizard.courseData.introVideoUrl} />
            </motion.div>
          )}

          {wizard.courseData.introVideoUrl && !embedUrl && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Unable to embed this video. Make sure you've pasted a valid YouTube, Vimeo, Loom, or Google Drive link.
            </div>
          )}
        </div>

        {/* Course Overview Slides */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#F5C518]">
              <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M3 9h18" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <h2 className="text-lg font-semibold text-white">Course Overview Slides</h2>
          </div>
          <p className="text-sm text-white/60">
            Add a link to your course overview slide deck (Canva, Google Slides, etc.). Students will see this on the course page.
          </p>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Slide deck URL
            </label>
            <input
              value={wizard.courseData.overviewSlideUrl}
              onChange={e => wizard.updateCourseData({ overviewSlideUrl: e.target.value })}
              type="url"
              placeholder="https://www.canva.com/design/... or https://docs.google.com/presentation/..."
              className="w-full rounded-xl border border-white/12 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors"
            />
            <p className="mt-1 text-xs text-white/40">
              Leave empty if you don't have one. Use a publicly-viewable link.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving || !wizard.isStep1Valid()}
            className="rounded-full bg-[#F5C518] px-8 py-2.5 text-sm font-semibold text-black disabled:opacity-40 hover:bg-[#E8B800] transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-black/20 border-t-black rounded-full" />
                Saving...
              </>
            ) : (
              'Save & Continue'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
