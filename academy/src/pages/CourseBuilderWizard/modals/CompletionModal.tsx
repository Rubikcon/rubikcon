import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Book, Layers, BookOpen, Users, Plus, X, Send, Loader2, ExternalLink } from 'lucide-react'
import { apiRequest } from '../../../lib/api'
import { getStoredAuth } from '../../../lib/auth'
import type { CourseFormData, ModuleFormData } from '../types/CourseWizardTypes'

type SystemFacilitator = {
  id: string
  name: string
  title: string | null
  organization: string | null
  email: string
  photoUrl: string | null
}

interface CompletionModalProps {
  courseId: string
  course: CourseFormData
  modules: ModuleFormData[]
  lessons: Record<string, any[]>
  onClose: () => void
  onViewCourse: () => void
  onCreateAnother: () => void
}

export default function CompletionModal({
  courseId,
  course,
  modules,
  lessons,
  onClose,
  onViewCourse,
  onCreateAnother,
}: CompletionModalProps) {
  const totalLessons = Object.values(lessons).reduce((sum, arr) => sum + arr.length, 0)
  const auth = getStoredAuth()
  const isSuperAdmin = auth?.user.role === 'SUPER_ADMIN'

  const [allFacilitators, setAllFacilitators] = useState<SystemFacilitator[]>([])
  const [assignedFacilitators, setAssignedFacilitators] = useState<SystemFacilitator[]>([])
  const [facilitatorSearch, setFacilitatorSearch] = useState('')
  const [loadingFacilitators, setLoadingFacilitators] = useState(true)
  const [addingFacilitatorId, setAddingFacilitatorId] = useState<string | null>(null)
  const [removingFacilitatorId, setRemovingFacilitatorId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load all system facilitators + the course's current facilitators
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [all, courseDetail] = await Promise.all([
          apiRequest<SystemFacilitator[]>('/academy/admin/facilitators'),
          apiRequest<any>(`/academy/admin/courses/${courseId}`),
        ])
        if (cancelled) return
        setAllFacilitators(all)
        setAssignedFacilitators(
          (courseDetail.courseFacilitators || []).map((cf: any) => cf.facilitator)
        )
        // If the course is already submitted, reflect that
        if (courseDetail.status === 'PENDING_REVIEW' || courseDetail.status === 'APPROVED') {
          setSubmitted(true)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load facilitators')
        }
      } finally {
        if (!cancelled) setLoadingFacilitators(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [courseId])

  async function addFacilitator(facilitatorId: string) {
    setAddingFacilitatorId(facilitatorId)
    setError(null)
    try {
      const added = await apiRequest<SystemFacilitator>(
        `/academy/admin/courses/${courseId}/facilitators`,
        {
          method: 'POST',
          body: JSON.stringify({ facilitatorId }),
        }
      )
      setAssignedFacilitators(prev => [...prev, added])
      setFacilitatorSearch('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add facilitator')
    } finally {
      setAddingFacilitatorId(null)
    }
  }

  async function removeFacilitator(facilitatorId: string) {
    setRemovingFacilitatorId(facilitatorId)
    setError(null)
    try {
      await apiRequest(
        `/academy/admin/courses/${courseId}/facilitators/${facilitatorId}`,
        { method: 'DELETE' }
      )
      setAssignedFacilitators(prev => prev.filter(f => f.id !== facilitatorId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove facilitator')
    } finally {
      setRemovingFacilitatorId(null)
    }
  }

  async function submitForReview() {
    if (!confirm('Submit this course for super admin review? You won\'t be able to edit it while it\'s pending.')) return
    setSubmitting(true)
    setError(null)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/submit`, { method: 'POST' })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit course')
    } finally {
      setSubmitting(false)
    }
  }

  // Search filter for facilitators
  const filteredFacilitators = allFacilitators.filter(f => {
    if (assignedFacilitators.some(a => a.id === f.id)) return false
    if (!facilitatorSearch.trim()) return true
    const q = facilitatorSearch.toLowerCase()
    return (
      f.name.toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q) ||
      (f.title?.toLowerCase().includes(q) ?? false)
    )
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl my-8 rounded-[24px] border border-white/10 bg-gradient-to-br from-black via-[#0a0e27] to-black p-8 space-y-6 max-h-[90vh] overflow-y-auto"
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
          <h2 className="text-3xl font-bold text-white">Course Created Successfully!</h2>
          <p className="text-white/60">
            {submitted
              ? 'Your course is awaiting super admin review.'
              : 'Your course structure is ready. Add facilitators and submit for review.'}
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-100 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-200/50 hover:text-red-100 ml-2">✕</button>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Book} value={1} label="Course" color="text-[#F5C518]" />
          <StatCard icon={Layers} value={modules.length} label="Modules" color="text-blue-400" />
          <StatCard icon={BookOpen} value={totalLessons} label="Lessons" color="text-green-400" />
        </div>

        {/* Course Details */}
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Book size={14} className="text-[#F5C518]" /> Course Details
          </h3>
          <dl className="space-y-1.5 text-sm">
            <Row label="Title" value={course.title} />
            <Row label="URL" value={`/course/${course.slug}`} highlight />
            {course.level && <Row label="Level" value={course.level} />}
            {course.estimatedDuration && <Row label="Duration" value={course.estimatedDuration} />}
          </dl>
        </section>

        {/* Facilitators — NEW */}
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Users size={14} className="text-blue-400" /> Course Facilitators
          </h3>

          {loadingFacilitators ? (
            <div className="flex items-center gap-2 text-sm text-white/40">
              <Loader2 size={14} className="animate-spin" /> Loading facilitators…
            </div>
          ) : (
            <>
              {/* Assigned facilitators */}
              {assignedFacilitators.length > 0 ? (
                <div className="space-y-2">
                  {assignedFacilitators.map(f => (
                    <div key={f.id} className="flex items-center justify-between gap-2 rounded-lg border border-blue-400/20 bg-blue-400/5 px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{f.name}</p>
                        <p className="text-xs text-white/40 truncate">
                          {f.title || f.email}
                        </p>
                      </div>
                      {(!submitted || isSuperAdmin) && (
                        <button
                          onClick={() => removeFacilitator(f.id)}
                          disabled={removingFacilitatorId === f.id}
                          className="p-1.5 text-white/40 hover:text-red-400 transition-colors disabled:opacity-40 flex-shrink-0"
                          title="Remove facilitator"
                        >
                          {removingFacilitatorId === f.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/40">No facilitators assigned yet.</p>
              )}

              {/* Add facilitator search */}
              {(!submitted || isSuperAdmin) && (
                <div className="space-y-2">
                  <input
                    value={facilitatorSearch}
                    onChange={e => setFacilitatorSearch(e.target.value)}
                    placeholder="Search facilitators by name, email, or title…"
                    className="w-full rounded-lg border border-white/12 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40"
                  />
                  {facilitatorSearch.trim() && (
                    <div className="max-h-48 overflow-y-auto space-y-1 border border-white/10 rounded-lg bg-black/40 p-2">
                      {filteredFacilitators.length === 0 ? (
                        <p className="text-xs text-white/40 p-2">No matches</p>
                      ) : (
                        filteredFacilitators.map(f => (
                          <button
                            key={f.id}
                            onClick={() => addFacilitator(f.id)}
                            disabled={addingFacilitatorId === f.id}
                            className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-white/10 disabled:opacity-40 transition-colors flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-white truncate">{f.name}</div>
                              <div className="text-xs text-white/40 truncate">{f.title || f.email}</div>
                            </div>
                            {addingFacilitatorId === f.id ? <Loader2 size={12} className="animate-spin flex-shrink-0" /> : <Plus size={12} className="flex-shrink-0 text-[#F5C518]" />}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                  {!facilitatorSearch.trim() && allFacilitators.length === 0 && (
                    <p className="text-[11px] text-white/30">
                      No facilitators in the system yet. A super admin can create them under Admin → Facilitators.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        {/* Module Summary */}
        {modules.length > 0 && (
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Layers size={14} className="text-blue-400" /> Modules Overview
            </h3>
            <div className="space-y-1">
              {modules.map((module, idx) => (
                <div key={module.id} className="flex items-start gap-2.5 text-sm">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#F5C518] text-black text-[10px] font-semibold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white truncate">{module.title}</p>
                    <p className="text-xs text-white/40">
                      {(lessons[module.id!] || []).length} lesson
                      {(lessons[module.id!] || []).length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Submit for Review */}
        <section className={`rounded-xl border p-4 space-y-3 ${
          submitted
            ? 'border-emerald-500/20 bg-emerald-500/5'
            : 'border-amber-500/20 bg-amber-500/10'
        }`}>
          {submitted ? (
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-200">Submitted for review</p>
                <p className="text-xs text-emerald-100/60">
                  A super admin will review your course shortly.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium text-amber-200">Ready to publish?</p>
                <p className="text-xs text-amber-100/70 mt-0.5">
                  Submit your course for super admin review. Once approved, it'll be visible to learners.
                </p>
              </div>
              <button
                onClick={submitForReview}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-amber-400/90 px-5 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-40 transition-colors"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {submitting ? 'Submitting…' : 'Submit for Review'}
              </button>
            </>
          )}
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-colors"
          >
            Keep editing
          </button>
          <button
            onClick={onCreateAnother}
            className="px-5 py-2.5 text-sm font-medium rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-colors"
          >
            Create another
          </button>
          <button
            onClick={onViewCourse}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full bg-[#F5C518] text-black hover:bg-[#E8B800] transition-colors"
          >
            View course <ExternalLink size={14} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function StatCard({ icon: Icon, value, label, color }: { icon: any; value: number; label: string; color: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
      <div className="flex justify-center mb-1">
        <Icon size={20} className={color} />
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-[10px] text-white/40 uppercase tracking-wider">{label}</p>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-3">
      <dt className="text-xs text-white/40 flex-shrink-0">{label}</dt>
      <dd className={`text-xs text-right break-all ${highlight ? 'text-[#F5C518] font-medium' : 'text-white'}`}>
        {value}
      </dd>
    </div>
  )
}
