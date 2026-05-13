import { useState } from 'react'
import { Plus, Trash2, Loader2, Save, X, Pencil, BookOpen } from 'lucide-react'
import { apiRequest } from '../../lib/api'

export type ExistingGlossaryTerm = {
  id: string
  term: string
  definition: string
  example: string | null
  position: number
}

interface GlossaryEditorProps {
  courseId: string
  weekId: string
  terms: ExistingGlossaryTerm[]
  onChange: () => void
}

type TermDraft = { term: string; definition: string; example: string }

const emptyDraft = (): TermDraft => ({ term: '', definition: '', example: '' })

export default function GlossaryEditor({ courseId, weekId, terms, onChange }: GlossaryEditorProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<TermDraft>(emptyDraft())
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function startNew() {
    setEditingId(null)
    setDraft(emptyDraft())
    setShowForm(true)
    setError(null)
  }

  function startEdit(term: ExistingGlossaryTerm) {
    setEditingId(term.id)
    setDraft({ term: term.term, definition: term.definition, example: term.example || '' })
    setShowForm(true)
    setError(null)
  }

  function cancel() {
    setShowForm(false)
    setEditingId(null)
    setDraft(emptyDraft())
    setError(null)
  }

  async function save() {
    if (draft.term.trim().length < 1) {
      setError('Term is required')
      return
    }
    if (draft.definition.trim().length < 1) {
      setError('Definition is required')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const body = {
        term: draft.term.trim(),
        definition: draft.definition.trim(),
        example: draft.example.trim() || null,
      }
      if (editingId) {
        await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/glossary/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        })
      } else {
        await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/glossary`, {
          method: 'POST',
          body: JSON.stringify(body),
        })
      }
      cancel()
      onChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save term')
    } finally {
      setSaving(false)
    }
  }

  async function deleteTerm(termId: string) {
    if (!confirm('Delete this glossary term?')) return
    setDeletingId(termId)
    setError(null)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/glossary/${termId}`, {
        method: 'DELETE',
      })
      onChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete term')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <BookOpen size={14} className="text-purple-400" />
          Glossary Terms ({terms.length})
        </h4>
        {!showForm && (
          <button
            onClick={startNew}
            className="inline-flex items-center gap-1 text-xs text-[#F5C518] hover:text-[#E8B800]"
          >
            <Plus size={12} /> Add term
          </button>
        )}
      </div>
      <p className="text-xs text-white/40">
        Key vocabulary learners can save and reference. Shown in the lesson's Resources tab.
      </p>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-100">
          {error}
        </div>
      )}

      {terms.length > 0 && (
        <div className="space-y-2">
          {terms.map(t => (
            <div key={t.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{t.term}</p>
                  <p className="text-xs text-white/60 mt-0.5">{t.definition}</p>
                  {t.example && (
                    <p className="text-[11px] italic text-white/40 mt-1">e.g. {t.example}</p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => startEdit(t)}
                    disabled={editingId === t.id}
                    title="Edit term"
                    className="p-1.5 text-white/40 hover:text-[#F5C518] transition-colors disabled:opacity-40"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => deleteTerm(t.id)}
                    disabled={deletingId === t.id}
                    title="Delete term"
                    className="p-1.5 text-white/40 hover:text-red-400 transition-colors disabled:opacity-40"
                  >
                    {deletingId === t.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="rounded-xl border border-[#F5C518]/30 bg-[#F5C518]/5 p-3 space-y-2">
          <p className="text-xs font-semibold text-[#F5C518]">
            {editingId ? 'Edit term' : 'New term'}
          </p>
          <input
            value={draft.term}
            onChange={e => setDraft(p => ({ ...p, term: e.target.value }))}
            placeholder="Term (e.g. 'Smart Contract')"
            className={inputCls}
          />
          <textarea
            value={draft.definition}
            onChange={e => setDraft(p => ({ ...p, definition: e.target.value }))}
            placeholder="Definition"
            rows={2}
            className={inputCls}
          />
          <textarea
            value={draft.example}
            onChange={e => setDraft(p => ({ ...p, example: e.target.value }))}
            placeholder="Example (optional)"
            rows={2}
            className={inputCls}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={cancel}
              disabled={saving}
              className="px-3 py-1.5 text-xs font-medium rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors"
            >
              <X size={12} className="inline" /> Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[#F5C518] px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-40"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {editingId ? 'Update term' : 'Add term'}
            </button>
          </div>
        </div>
      )}

      {terms.length === 0 && !showForm && (
        <p className="text-xs text-white/40">No glossary terms yet</p>
      )}
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors resize-y'
