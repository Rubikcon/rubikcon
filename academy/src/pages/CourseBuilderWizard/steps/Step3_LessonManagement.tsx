import { FormEvent, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Video, Users, X } from 'lucide-react'
import { apiRequest } from '../../../lib/api'
import VideoEmbed, { getEmbedUrl } from '../../../components/VideoEmbed'
import type { UseWizardState } from '../hooks/useCourseWizardState'
import type { LessonFormData, LessonVideoData, LessonFacilitatorData } from '../types/CourseWizardTypes'

interface Step3_LessonManagementProps {
  wizard: UseWizardState
  courseId: string
  onBack: () => void
  onFinish: () => void
}

export default function Step3_LessonManagement({
  wizard,
  courseId,
  onBack,
  onFinish,
}: Step3_LessonManagementProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<string>('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<Omit<LessonFormData, 'id' | 'moduleId'>>({
    title: '',
    content: '',
    duration: 30,
    videos: [],
    facilitators: [],
  })

  const [videoForm, setVideoForm] = useState({ title: '', url: '', description: '' })
  const [facilitatorSearch, setFacilitatorSearch] = useState('')
  const [availableFacilitators] = useState<LessonFacilitatorData[]>([
    // In real implementation, fetch from API
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ])

  // Get lessons for selected module
  const selectedLessons = useMemo(() => {
    if (!selectedModuleId) return []
    return wizard.lessons[selectedModuleId] || []
  }, [selectedModuleId, wizard.lessons])

  function resetForm() {
    setFormData({
      title: '',
      content: '',
      duration: 30,
      videos: [],
      facilitators: [],
    })
    setVideoForm({ title: '', url: '', description: '' })
    setEditingId(null)
  }

  function startEdit(lesson: LessonFormData) {
    setEditingId(lesson.id!)
    setFormData({
      title: lesson.title,
      content: lesson.content,
      duration: lesson.duration,
      videos: lesson.videos,
      facilitators: lesson.facilitators,
    })
    setShowCreateForm(true)
  }

  function addVideo() {
    if (!videoForm.title.trim() || !videoForm.url.trim()) {
      wizard.setError('Video title and URL are required')
      return
    }

    setFormData({
      ...formData,
      videos: [...formData.videos, { id: `temp-${Date.now()}`, ...videoForm }],
    })
    setVideoForm({ title: '', url: '', description: '' })
    wizard.setError(null)
  }

  function removeVideo(videoId: string) {
    setFormData({
      ...formData,
      videos: formData.videos.filter(v => v.id !== videoId),
    })
  }

  function addFacilitator(facilitator: LessonFacilitatorData) {
    if (
      formData.facilitators.some(f => f.id === facilitator.id)
    ) {
      return
    }

    setFormData({
      ...formData,
      facilitators: [...formData.facilitators, facilitator],
    })
  }

  function removeFacilitator(facilitatorId: string) {
    setFormData({
      ...formData,
      facilitators: formData.facilitators.filter(f => f.id !== facilitatorId),
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!selectedModuleId) {
      wizard.setError('Please select a module')
      return
    }

    if (!formData.title.trim()) {
      wizard.setError('Lesson title is required')
      return
    }

    if (!formData.content.trim()) {
      wizard.setError('Lesson content is required')
      return
    }

    if (formData.duration < 1) {
      wizard.setError('Duration must be at least 1 minute')
      return
    }

    setIsSubmitting(true)
    wizard.setError(null)

    try {
      if (editingId) {
        // Update existing lesson
        await apiRequest(`/lesson/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            title: formData.title,
            content: formData.content,
            duration: formData.duration,
          }),
        })

        wizard.updateLesson(selectedModuleId, editingId, formData)
      } else {
        // Create new lesson
        const response = await apiRequest<any>(
          `/admin/courses/${courseId}/modules/${selectedModuleId}/lessons`,
          {
            method: 'POST',
            body: JSON.stringify({
              title: formData.title,
              content: formData.content,
              duration: formData.duration,
            }),
          }
        )

        const createdId = (response as any).data?.id || (response as any).id

        wizard.addLesson(selectedModuleId, {
          ...formData,
          title: formData.title,
          content: formData.content,
          duration: formData.duration,
          videos: formData.videos,
          facilitators: formData.facilitators,
        })
      }

      setIsSubmitting(false)
      setShowCreateForm(false)
      resetForm()
    } catch (err) {
      wizard.setError(err instanceof Error ? err.message : 'Failed to save lesson')
      setIsSubmitting(false)
    }
  }

  async function handleDelete(lessonId: string) {
    if (!confirm('Delete this lesson and all its videos?')) return

    setIsSubmitting(true)
    wizard.setError(null)

    try {
      await apiRequest(`/lesson/${lessonId}`, { method: 'DELETE' })

      wizard.deleteLesson(selectedModuleId, lessonId)
      setIsSubmitting(false)
    } catch (err) {
      wizard.setError(err instanceof Error ? err.message : 'Failed to delete lesson')
      setIsSubmitting(false)
    }
  }

  const filteredFacilitators = availableFacilitators.filter(
    f =>
      f.name.toLowerCase().includes(facilitatorSearch.toLowerCase()) ||
      f.email.toLowerCase().includes(facilitatorSearch.toLowerCase())
  )

  const lessonVideoEmbedUrl = videoForm.url ? getEmbedUrl(videoForm.url) : null

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
          Add lessons to your modules. Each lesson can have multiple videos and facilitators.
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
                onClick={() => {
                  setShowCreateForm(true)
                  resetForm()
                }}
                className="flex items-center gap-1.5 text-sm text-[#F5C518] hover:text-[#E8B800] transition-colors"
              >
                <Plus size={16} /> Add Lesson
              </button>
            )}
          </div>

          {/* Lessons List Display */}
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
                className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F5C518] text-black text-xs font-semibold">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-white">{lesson.title}</h3>
                      <span className="text-xs text-white/40">({lesson.duration} min)</span>
                    </div>
                    {lesson.videos.length > 0 && (
                      <p className="text-xs text-[#F5C518] mt-1 flex items-center gap-1">
                        <Video size={12} /> {lesson.videos.length} video(s)
                      </p>
                    )}
                    {lesson.facilitators.length > 0 && (
                      <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                        <Users size={12} /> {lesson.facilitators.length} facilitator(s)
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => startEdit(lesson)}
                      className="px-3 py-1 text-xs font-medium rounded-lg border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(lesson.id!)}
                      disabled={isSubmitting}
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

      {/* Create/Edit Form */}
      <AnimatePresence>
        {showCreateForm && selectedModuleId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-[#F5C518]/20 bg-[#F5C518]/5 p-6 space-y-4"
          >
            <h3 className="text-lg font-semibold text-[#F5C518]">
              {editingId ? 'Edit Lesson' : 'New Lesson'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
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
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={e =>
                    setFormData({ ...formData, duration: Math.max(1, parseInt(e.target.value)) })
                  }
                  required
                  min={1}
                  placeholder="30"
                  className="w-full rounded-xl border border-white/12 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={4}
                  placeholder="Lesson content and learning materials..."
                  className="w-full rounded-xl border border-white/12 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors resize-none"
                />
              </div>

              {/* Videos Section */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Video size={16} className="text-[#F5C518]" />
                  <h4 className="text-sm font-medium text-white">Lesson Videos</h4>
                </div>

                {/* Video List */}
                {formData.videos.length > 0 && (
                  <div className="space-y-2">
                    {formData.videos.map(video => (
                      <div
                        key={video.id}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 px-3 py-2"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{video.title}</p>
                          <p className="text-xs text-white/40 truncate">{video.url}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVideo(video.id!)}
                          className="p-1 text-white/40 hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Video Form */}
                <div className="space-y-2 rounded-lg border border-white/10 bg-black/20 p-3">
                  <input
                    value={videoForm.title}
                    onChange={e => setVideoForm({ ...videoForm, title: e.target.value })}
                    placeholder="Video title"
                    className="w-full rounded-lg border border-white/12 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40"
                  />
                  <input
                    value={videoForm.url}
                    onChange={e => setVideoForm({ ...videoForm, url: e.target.value })}
                    type="url"
                    placeholder="Video URL (YouTube, Vimeo, Loom, etc.)"
                    className="w-full rounded-lg border border-white/12 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40"
                  />
                  <textarea
                    value={videoForm.description}
                    onChange={e => setVideoForm({ ...videoForm, description: e.target.value })}
                    placeholder="Video description (optional)"
                    rows={2}
                    className="w-full rounded-lg border border-white/12 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 resize-none"
                  />

                  {lessonVideoEmbedUrl && (
                    <div className="rounded-lg overflow-hidden border border-white/10 bg-black h-48">
                      <VideoEmbed url={videoForm.url} />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={addVideo}
                    disabled={!videoForm.title.trim() || !videoForm.url.trim()}
                    className="w-full py-2 text-sm font-medium rounded-lg bg-white/10 text-white hover:bg-white/15 disabled:opacity-40 transition-colors"
                  >
                    + Add Video
                  </button>
                </div>
              </div>

              {/* Facilitators Section */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-400" />
                  <h4 className="text-sm font-medium text-white">Facilitators</h4>
                </div>

                {/* Assigned Facilitators */}
                {formData.facilitators.length > 0 && (
                  <div className="space-y-2">
                    {formData.facilitators.map(fac => (
                      <div
                        key={fac.id}
                        className="flex items-center justify-between rounded-lg border border-blue-400/20 bg-blue-400/5 px-3 py-2"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{fac.name}</p>
                          <p className="text-xs text-white/40">{fac.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFacilitator(fac.id)}
                          className="p-1 text-white/40 hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Facilitator Selector */}
                <div className="space-y-2">
                  <input
                    value={facilitatorSearch}
                    onChange={e => setFacilitatorSearch(e.target.value)}
                    placeholder="Search facilitators by name or email..."
                    className="w-full rounded-lg border border-white/12 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40"
                  />

                  {facilitatorSearch && filteredFacilitators.length > 0 && (
                    <div className="max-h-40 overflow-y-auto space-y-1 border border-white/10 rounded-lg bg-black/40 p-2">
                      {filteredFacilitators.map(fac => (
                        <button
                          key={fac.id}
                          type="button"
                          onClick={() => addFacilitator(fac)}
                          disabled={formData.facilitators.some(f => f.id === fac.id)}
                          className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-white/10 disabled:opacity-40 transition-colors"
                        >
                          <div className="font-medium text-white">{fac.name}</div>
                          <div className="text-xs text-white/40">{fac.email}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
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
                  disabled={
                    isSubmitting ||
                    !formData.title.trim() ||
                    !formData.content.trim()
                  }
                  className="px-6 py-2 text-sm font-semibold rounded-full bg-[#F5C518] text-black disabled:opacity-40 hover:bg-[#E8B800] transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-black/20 border-t-black rounded-full" />
                      Saving...
                    </>
                  ) : editingId ? (
                    'Update Lesson'
                  ) : (
                    'Create Lesson'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
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
