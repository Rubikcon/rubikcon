import { FormEvent, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Image, Loader2, Plus, X } from 'lucide-react'
import { apiRequest } from '../../../lib/api'
import { compressImageToBase64 } from '../../../lib/imageCompress'
import type { UseWizardState } from '../hooks/useCourseWizardState'
import type { FacilitatorSummary } from '../../../types/academy'

interface Step1_CourseInfoProps {
  wizard: UseWizardState
  courseId: string
  initialFacilitators: FacilitatorSummary[]
  onNext: () => void
}

// ─── Facilitator panel ────────────────────────────────────────────────────────

type AdminUser = { id: string; name: string | null; email: string; role: string }

// A selectable option that is either an existing Facilitator record or an admin user.
type FacilitatorOption =
  | { kind: 'facilitator'; facilitatorId: string; label: string }
  | { kind: 'user'; userId: string; label: string }

function CourseFacilitatorsPanel({
  courseId,
  initialFacilitators,
}: {
  courseId: string
  initialFacilitators: FacilitatorSummary[]
}) {
  const [assigned, setAssigned] = useState<FacilitatorSummary[]>(initialFacilitators)
  const [allFacilitators, setAllFacilitators] = useState<FacilitatorSummary[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [selectedValue, setSelectedValue] = useState('')
  const [adding, setAdding] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setAssigned(initialFacilitators)
  }, [initialFacilitators])

  useEffect(() => {
    Promise.all([
      apiRequest<FacilitatorSummary[]>('/academy/admin/facilitators'),
      apiRequest<AdminUser[]>('/academy/admin/admin-users').catch(() => [] as AdminUser[]),
    ])
      .then(([facilitators, users]) => {
        setAllFacilitators(facilitators)
        setAdminUsers(users)
      })
      .catch(() => setError('Failed to load facilitator list.'))
      .finally(() => setLoadingList(false))
  }, [])

  // Build combined options: existing Facilitator records + admin users who don't
  // already have a Facilitator record (matched by email, case-insensitive).
  const facilitatorEmails = new Set(allFacilitators.map(f => f.email?.toLowerCase()).filter(Boolean))
  const assignedFacilitatorIds = new Set(assigned.map(f => f.id))

  const options: FacilitatorOption[] = [
    // Existing facilitator records not yet assigned to this course
    ...allFacilitators
      .filter(f => !assignedFacilitatorIds.has(f.id))
      .map(f => ({
        kind: 'facilitator' as const,
        facilitatorId: f.id,
        label: `${f.name} — ${f.title}`,
      })),
    // Admin users who don't have a Facilitator record yet
    ...adminUsers
      .filter(u => !facilitatorEmails.has(u.email.toLowerCase()))
      .map(u => ({
        kind: 'user' as const,
        userId: u.id,
        label: `${u.name || u.email} (admin)`,
      })),
  ]

  async function handleAdd() {
    if (!selectedValue) return
    setAdding(true)
    setError(null)
    try {
      const [kind, id] = selectedValue.split(':')
      const body = kind === 'facilitator' ? { facilitatorId: id } : { userId: id }
      const added = await apiRequest<FacilitatorSummary>(
        `/academy/admin/courses/${courseId}/facilitators`,
        { method: 'POST', body: JSON.stringify(body) }
      )
      setAssigned(prev => [...prev, added])
      setSelectedValue('')
      // Refresh facilitator list so the newly created record appears next time
      const updated = await apiRequest<FacilitatorSummary[]>('/academy/admin/facilitators').catch(() => allFacilitators)
      setAllFacilitators(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add facilitator.')
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove(facilitatorId: string) {
    setRemovingId(facilitatorId)
    setError(null)
    try {
      await apiRequest(
        `/academy/admin/courses/${courseId}/facilitators/${facilitatorId}`,
        { method: 'DELETE' }
      )
      setAssigned(prev => prev.filter(f => f.id !== facilitatorId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove facilitator.')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
      <p className="text-sm font-medium text-white">Course Facilitators</p>

      {/* Assigned list */}
      {assigned.length > 0 ? (
        <div className="space-y-2">
          {assigned.map(f => (
            <div
              key={f.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.04] border border-white/8 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white font-medium truncate">{f.name}</p>
                <p className="text-xs text-white/45 truncate">{f.title} · {f.organization}</p>
              </div>
              <button
                onClick={() => handleRemove(f.id)}
                disabled={removingId === f.id}
                className="shrink-0 rounded-md p-1 text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40"
                title="Remove from course"
              >
                {removingId === f.id
                  ? <Loader2 size={14} className="animate-spin" />
                  : <X size={14} />
                }
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-white/30 italic">No facilitators assigned yet.</p>
      )}

      {/* Add row */}
      {loadingList ? (
        <div className="flex items-center gap-2 text-xs text-white/30">
          <Loader2 size={12} className="animate-spin" /> Loading facilitators…
        </div>
      ) : options.length > 0 ? (
        <div className="flex gap-2">
          <select
            value={selectedValue}
            onChange={e => setSelectedValue(e.target.value)}
            className="flex-1 min-w-0 rounded-lg border border-white/12 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]/40 transition-colors"
          >
            <option value="">Select a facilitator…</option>
            {options.some(o => o.kind === 'facilitator') && (
              <optgroup label="Facilitator records">
                {options
                  .filter((o): o is Extract<FacilitatorOption, { kind: 'facilitator' }> => o.kind === 'facilitator')
                  .map(o => (
                    <option key={o.facilitatorId} value={`facilitator:${o.facilitatorId}`}>
                      {o.label}
                    </option>
                  ))}
              </optgroup>
            )}
            {options.some(o => o.kind === 'user') && (
              <optgroup label="Admin users">
                {options
                  .filter((o): o is Extract<FacilitatorOption, { kind: 'user' }> => o.kind === 'user')
                  .map(o => (
                    <option key={o.userId} value={`user:${o.userId}`}>
                      {o.label}
                    </option>
                  ))}
              </optgroup>
            )}
          </select>
          <button
            onClick={handleAdd}
            disabled={!selectedValue || adding}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#F5C518] px-3 py-2 text-sm font-semibold text-black hover:bg-[#E8B800] disabled:opacity-40 transition-colors"
          >
            {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add
          </button>
        </div>
      ) : assigned.length > 0 ? (
        <p className="text-xs text-white/30 italic">All available facilitators are already assigned.</p>
      ) : (
        <p className="text-xs text-white/30 italic">No facilitators available.</p>
      )}

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}

// ─── Step 1 main form ─────────────────────────────────────────────────────────

export default function Step1_CourseInfo({ wizard, courseId, initialFacilitators, onNext }: Step1_CourseInfoProps) {
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

      {/* Facilitator management — independent of the form save flow */}
      <CourseFacilitatorsPanel
        courseId={courseId}
        initialFacilitators={initialFacilitators}
      />
    </motion.div>
  )
}
