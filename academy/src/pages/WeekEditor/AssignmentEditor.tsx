import { useState } from 'react'
import { Plus, Trash2, Loader2, Save, X, Calendar, FileText, Upload } from 'lucide-react'
import { apiRequest } from '../../lib/api'

type AssignmentChoice = { title: string; description: string }

export type ExistingAssignment = {
  id: string
  title: string
  instructions: string
  deadline: string
  allowTextSubmission: boolean
  allowFileUpload: boolean
  position: number
  choices: Array<{ id: string; title: string; description: string; position: number }>
}

interface AssignmentEditorProps {
  courseId: string
  weekId: string
  assignments: ExistingAssignment[]
  onChange: () => void
}

const emptyChoice = (): AssignmentChoice => ({ title: '', description: '' })

export default function AssignmentEditor({ courseId, weekId, assignments, onChange }: AssignmentEditorProps) {
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Default the deadline to one week from now (ISO string for datetime-local input)
  const defaultDeadline = (() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().slice(0, 16) // datetime-local format
  })()

  const [form, setForm] = useState({
    title: '',
    instructions: '',
    deadline: defaultDeadline,
    allowTextSubmission: true,
    allowFileUpload: false,
    choices: [] as AssignmentChoice[],
  })

  function reset() {
    setForm({
      title: '',
      instructions: '',
      deadline: defaultDeadline,
      allowTextSubmission: true,
      allowFileUpload: false,
      choices: [],
    })
    setError(null)
  }

  function addChoice() {
    setForm(p => ({ ...p, choices: [...p.choices, emptyChoice()] }))
  }
  function removeChoice(idx: number) {
    setForm(p => ({ ...p, choices: p.choices.filter((_, i) => i !== idx) }))
  }
  function updateChoice(idx: number, patch: Partial<AssignmentChoice>) {
    setForm(p => ({
      ...p,
      choices: p.choices.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    }))
  }

  function validate(): string | null {
    if (form.title.trim().length < 3) return 'Title must be at least 3 characters'
    if (form.instructions.trim().length < 10) return 'Instructions must be at least 10 characters'
    if (!form.deadline) return 'Deadline is required'
    if (!form.allowTextSubmission && !form.allowFileUpload) {
      return 'At least one submission type must be allowed (text or file)'
    }
    for (let i = 0; i < form.choices.length; i++) {
      if (form.choices[i].title.trim().length === 0) {
        return `Choice ${i + 1}: title required`
      }
    }
    return null
  }

  async function save() {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setSaving(true)
    setError(null)
    try {
      // Convert datetime-local "YYYY-MM-DDTHH:MM" to a full ISO datetime with offset.
      // The backend's z.string().datetime({ offset: true }) requires a timezone.
      const deadlineIso = new Date(form.deadline).toISOString()

      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/assignments`, {
        method: 'POST',
        body: JSON.stringify({
          title: form.title.trim(),
          instructions: form.instructions.trim(),
          deadline: deadlineIso,
          allowTextSubmission: form.allowTextSubmission,
          allowFileUpload: form.allowFileUpload,
          choices: form.choices.map((c, i) => ({
            title: c.title.trim(),
            description: c.description.trim(),
            position: i + 1,
          })),
        }),
      })
      setShowForm(false)
      reset()
      onChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save assignment')
    } finally {
      setSaving(false)
    }
  }

  async function deleteAssignment(assignmentId: string) {
    if (!confirm('Delete this assignment? Any learner submissions will also be removed.')) return
    setDeletingId(assignmentId)
    setError(null)
    try {
      await apiRequest(
        `/academy/admin/courses/${courseId}/weeks/${weekId}/assignments/${assignmentId}`,
        { method: 'DELETE' }
      )
      onChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete assignment')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Existing assignments */}
      {assignments.length === 0 && !showForm && (
        <p className="text-xs text-white/40">No assignments yet</p>
      )}

      {assignments.map(a => (
        <div key={a.id} className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white">{a.title}</h4>
              <p className="text-xs text-white/40 flex items-center gap-1 mt-1">
                <Calendar size={11} /> Due {new Date(a.deadline).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => deleteAssignment(a.id)}
              disabled={deletingId === a.id}
              className="p-1.5 text-white/40 hover:text-red-400 transition-colors disabled:opacity-40 flex-shrink-0"
              title="Delete assignment"
            >
              {deletingId === a.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          </div>
          <p className="text-xs text-white/60 whitespace-pre-line line-clamp-3">{a.instructions}</p>
          <div className="flex gap-2 flex-wrap text-[11px]">
            {a.allowTextSubmission && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-400/10 border border-blue-400/30 px-2 py-0.5 text-blue-300">
                <FileText size={10} /> Text
              </span>
            )}
            {a.allowFileUpload && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-400/10 border border-purple-400/30 px-2 py-0.5 text-purple-300">
                <Upload size={10} /> File upload
              </span>
            )}
            {a.choices.length > 0 && (
              <span className="rounded-full bg-white/5 border border-white/20 px-2 py-0.5 text-white/60">
                {a.choices.length} choice{a.choices.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {a.choices.length > 0 && (
            <details className="text-xs text-white/50">
              <summary className="cursor-pointer hover:text-white/70 mt-1">Choices</summary>
              <ul className="mt-2 ml-4 space-y-1 list-disc">
                {a.choices.map(c => (
                  <li key={c.id}>
                    <strong className="text-white/70">{c.title}</strong>
                    {c.description && <span className="ml-1 text-white/40">— {c.description}</span>}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      ))}

      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-100">
          {error}
        </div>
      )}

      {/* New assignment form */}
      {showForm ? (
        <div className="rounded-xl border border-[#F5C518]/30 bg-[#F5C518]/5 p-4 space-y-3">
          <h4 className="text-sm font-semibold text-[#F5C518]">New assignment</h4>

          <div>
            <label className="block text-xs text-white/50 mb-1">Title *</label>
            <input
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Build your first smart contract"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1">Instructions * (min 10 chars)</label>
            <textarea
              value={form.instructions}
              onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))}
              rows={5}
              placeholder="Describe what learners need to do, deliverables, grading criteria..."
              className={inputCls}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/50 mb-1">Deadline *</label>
              <input
                type="datetime-local"
                value={form.deadline}
                onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
                className={`${inputCls} [color-scheme:dark]`}
              />
            </div>
            <div className="space-y-2 pt-5">
              <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.allowTextSubmission}
                  onChange={e => setForm(p => ({ ...p, allowTextSubmission: e.target.checked }))}
                  className="accent-[#F5C518]"
                />
                <FileText size={12} /> Allow text submission
              </label>
              <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.allowFileUpload}
                  onChange={e => setForm(p => ({ ...p, allowFileUpload: e.target.checked }))}
                  className="accent-[#F5C518]"
                />
                <Upload size={12} /> Allow file upload
              </label>
            </div>
          </div>

          {/* Choices (optional sub-tasks) */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="block text-xs text-white/50">
                Choices <span className="text-white/30">(optional — let learners pick from multiple paths)</span>
              </label>
              {form.choices.length < 10 && (
                <button
                  onClick={addChoice}
                  className="text-xs text-[#F5C518] hover:text-[#E8B800] inline-flex items-center gap-1"
                >
                  <Plus size={12} /> Add choice
                </button>
              )}
            </div>
            {form.choices.map((c, idx) => (
              <div key={idx} className="rounded-lg border border-white/10 bg-black/40 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-white/40">Choice {idx + 1}</span>
                  <button
                    onClick={() => removeChoice(idx)}
                    className="text-white/30 hover:text-red-400"
                  >
                    <X size={12} />
                  </button>
                </div>
                <input
                  value={c.title}
                  onChange={e => updateChoice(idx, { title: e.target.value })}
                  placeholder="Choice title"
                  className={inputCls}
                />
                <textarea
                  value={c.description}
                  onChange={e => updateChoice(idx, { description: e.target.value })}
                  rows={2}
                  placeholder="Choice description (optional)"
                  className={inputCls}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-white/10">
            <button
              onClick={() => { setShowForm(false); reset() }}
              disabled={saving}
              className="px-3 py-1.5 text-xs font-medium rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[#F5C518] px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-40 hover:bg-[#E8B800] transition-colors"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Save assignment
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#F5C518]/20 text-[#F5C518] hover:bg-[#F5C518]/30 transition-colors"
        >
          <Plus size={12} /> Add assignment
        </button>
      )}
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors resize-y'
