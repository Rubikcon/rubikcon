import { FormEvent, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Video } from 'lucide-react'
import { apiRequest } from '../../../lib/api'
import VideoEmbed, { getEmbedUrl } from '../../../components/VideoEmbed'
import type { UseWizardState } from '../hooks/useCourseWizardState'
import type { ModuleFormData, CreatedModule } from '../types/CourseWizardTypes'

interface Step2_ModuleManagementProps {
  wizard: UseWizardState
  courseId: string
  onBack: () => void
  onNext: () => void
}

export default function Step2_ModuleManagement({
  wizard,
  courseId,
  onBack,
  onNext,
}: Step2_ModuleManagementProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Omit<ModuleFormData, 'id'>>({
    title: '',
    description: '',
    introVideoUrl: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  function resetForm() {
    setFormData({ title: '', description: '', introVideoUrl: '' })
    setEditingId(null)
  }

  function startEdit(module: ModuleFormData) {
    setEditingId(module.id!)
    setFormData({
      title: module.title,
      description: module.description,
      introVideoUrl: module.introVideoUrl,
    })
    setShowCreateForm(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!formData.title.trim()) {
      wizard.setError('Module title is required')
      return
    }

    setIsSubmitting(true)
    wizard.setError(null)

    try {
      if (editingId) {
        // Update existing module
        await apiRequest(
          `/admin/courses/${courseId}/modules/${editingId}`,
          {
            method: 'PATCH',
            body: JSON.stringify({
              title: formData.title,
              description: formData.description || undefined,
              introVideoUrl: formData.introVideoUrl || undefined,
            }),
          }
        )

        // Update in local state
        wizard.updateModule(editingId, formData)
      } else {
        // Create new module
        const response = await apiRequest<{ data: CreatedModule }>(
          `/admin/courses/${courseId}/modules`,
          {
            method: 'POST',
            body: JSON.stringify({
              title: formData.title,
              description: formData.description || undefined,
              introVideoUrl: formData.introVideoUrl || undefined,
            }),
          }
        )

        const createdModule = (response as any).data as CreatedModule
        wizard.addModule({
          title: createdModule.title,
          description: createdModule.description || '',
          introVideoUrl: createdModule.introVideoUrl || '',
        })
      }

      setIsSubmitting(false)
      setShowCreateForm(false)
      resetForm()
    } catch (err) {
      wizard.setError(err instanceof Error ? err.message : 'Failed to save module')
      setIsSubmitting(false)
    }
  }

  async function handleDelete(moduleId: string) {
    if (!confirm('Delete this module and all lessons within it?')) return

    setIsSubmitting(true)
    wizard.setError(null)

    try {
      await apiRequest(`/admin/courses/${courseId}/modules/${moduleId}`, {
        method: 'DELETE',
      })

      wizard.deleteModule(moduleId)
      setIsSubmitting(false)
    } catch (err) {
      wizard.setError(err instanceof Error ? err.message : 'Failed to delete module')
      setIsSubmitting(false)
    }
  }

  const embedUrl = formData.introVideoUrl ? getEmbedUrl(formData.introVideoUrl) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Modules</h1>
        <p className="text-white/60">
          Organize your course into modules. Each module can have multiple lessons.
        </p>
      </div>

      {/* Modules List */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Modules ({wizard.modules.length})
          </h2>
          {!showCreateForm && (
            <button
              onClick={() => {
                setShowCreateForm(true)
                resetForm()
              }}
              className="flex items-center gap-1.5 text-sm text-[#F5C518] hover:text-[#E8B800] transition-colors"
            >
              <Plus size={16} /> Add Module
            </button>
          )}
        </div>

        {/* Module List */}
        <AnimatePresence>
          {wizard.modules.length === 0 && !showCreateForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-dashed border-white/20 px-4 py-8 text-center"
            >
              <p className="text-white/40">No modules yet. Create your first module to continue.</p>
            </motion.div>
          )}

          {wizard.modules.map((module, idx) => (
            <motion.div
              key={module.id}
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
                    <h3 className="text-sm font-semibold text-white">{module.title}</h3>
                  </div>
                  {module.description && (
                    <p className="text-xs text-white/50 mt-1">{module.description}</p>
                  )}
                  {module.introVideoUrl && (
                    <p className="text-xs text-[#F5C518] mt-1 flex items-center gap-1">
                      <Video size={12} /> Video attached
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => startEdit(module)}
                    className="px-3 py-1 text-xs font-medium rounded-lg border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(module.id!)}
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

      {/* Create/Edit Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-[#F5C518]/20 bg-[#F5C518]/5 p-6 space-y-4"
          >
            <h3 className="text-lg font-semibold text-[#F5C518]">
              {editingId ? 'Edit Module' : 'New Module'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Module Title *
                </label>
                <input
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g. Module 1: Blockchain Fundamentals"
                  className="w-full rounded-xl border border-white/12 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Brief description of what this module covers..."
                  className="w-full rounded-xl border border-white/12 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors resize-none"
                />
              </div>

              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Video size={16} className="text-[#F5C518]" />
                  <label className="block text-sm font-medium text-white/80">
                    Module Intro Video
                  </label>
                </div>
                <input
                  value={formData.introVideoUrl}
                  onChange={e =>
                    setFormData({ ...formData, introVideoUrl: e.target.value })
                  }
                  type="url"
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  className="w-full rounded-xl border border-white/12 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors"
                />
                <p className="text-xs text-white/40">
                  Optional: Add a video that introduces this module
                </p>

                {embedUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl overflow-hidden border border-white/10 bg-black/40 h-64"
                  >
                    <VideoEmbed url={formData.introVideoUrl} />
                  </motion.div>
                )}

                {formData.introVideoUrl && !embedUrl && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                    Unable to embed this video. Check the URL format.
                  </div>
                )}
              </div>

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
                  disabled={isSubmitting || !formData.title.trim()}
                  className="px-6 py-2 text-sm font-semibold rounded-full bg-[#F5C518] text-black disabled:opacity-40 hover:bg-[#E8B800] transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-black/20 border-t-black rounded-full" />
                      Saving...
                    </>
                  ) : editingId ? (
                    'Update Module'
                  ) : (
                    'Create Module'
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
          onClick={onNext}
          disabled={!wizard.isStep2Valid()}
          className="px-8 py-2.5 text-sm font-semibold rounded-full bg-[#F5C518] text-black disabled:opacity-40 hover:bg-[#E8B800] transition-colors flex items-center gap-2"
        >
          Continue to Lessons →
        </button>
      </div>
    </motion.div>
  )
}
