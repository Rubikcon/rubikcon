import { useState } from 'react'
import { Plus, Trash2, CheckCircle, Circle, Loader2, Save, X, Pencil } from 'lucide-react'
import { apiRequest } from '../../lib/api'

type QuizOption = { id?: string; label: string; isCorrect: boolean }
type QuizQuestionDraft = { prompt: string; explanation: string; options: QuizOption[] }

export type ExistingQuiz = {
  id: string
  title: string
  passMark: number
  attemptLimit: number
  questions: Array<{
    id: string
    prompt: string
    explanation: string
    position: number
    options: Array<{ id: string; label: string; isCorrect: boolean; position: number }>
  }>
} | null

interface QuizEditorProps {
  courseId: string
  weekId: string
  quiz: ExistingQuiz
  onChange: () => void
}

const emptyOption = (): QuizOption => ({ label: '', isCorrect: false })
const emptyQuestion = (): QuizQuestionDraft => ({ prompt: '', explanation: '', options: [emptyOption(), emptyOption()] })

export default function QuizEditor({ courseId, weekId, quiz, onChange }: QuizEditorProps) {
  const [error, setError] = useState<string | null>(null)

  // ─── Initial create flow (no quiz yet) ──────────────────────────────────
  const [creatingTitle, setCreatingTitle] = useState('')
  const [creating, setCreating] = useState(false)

  async function createQuizShell() {
    if (creatingTitle.trim().length < 3) {
      setError('Title must be at least 3 characters')
      return
    }
    setCreating(true)
    setError(null)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/quiz`, {
        method: 'POST',
        body: JSON.stringify({
          title: creatingTitle.trim(),
          passMark: 70,
          attemptLimit: 1,
          questions: [],
        }),
      })
      setCreatingTitle('')
      onChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quiz')
    } finally {
      setCreating(false)
    }
  }

  // ─── Settings panel (exists once quiz is created) ───────────────────────
  const [settingsForm, setSettingsForm] = useState({
    title: quiz?.title ?? '',
    passMark: quiz?.passMark ?? 70,
    attemptLimit: quiz?.attemptLimit ?? 1,
  })
  const [savingSettings, setSavingSettings] = useState(false)

  // Sync settings form when quiz prop changes (after a reload)
  if (quiz && (settingsForm.title === '' && quiz.title !== '')) {
    setSettingsForm({ title: quiz.title, passMark: quiz.passMark, attemptLimit: quiz.attemptLimit })
  }

  async function saveSettings() {
    setSavingSettings(true)
    setError(null)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/quiz/settings`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: settingsForm.title.trim(),
          passMark: settingsForm.passMark,
          attemptLimit: settingsForm.attemptLimit,
        }),
      })
      onChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSavingSettings(false)
    }
  }

  // ─── Per-question state ─────────────────────────────────────────────────
  const [editingQuestionId, setEditingQuestionId] = useState<string | 'new' | null>(null)
  const [questionDraft, setQuestionDraft] = useState<QuizQuestionDraft>(emptyQuestion())
  const [savingQuestion, setSavingQuestion] = useState(false)
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null)

  function startNewQuestion() {
    setEditingQuestionId('new')
    setQuestionDraft(emptyQuestion())
    setError(null)
  }

  function startEditQuestion(q: NonNullable<ExistingQuiz>['questions'][number]) {
    setEditingQuestionId(q.id)
    setQuestionDraft({
      prompt: q.prompt,
      explanation: q.explanation,
      options: q.options.map(o => ({ id: o.id, label: o.label, isCorrect: o.isCorrect })),
    })
    setError(null)
  }

  function cancelQuestion() {
    setEditingQuestionId(null)
    setQuestionDraft(emptyQuestion())
    setError(null)
  }

  function addOption() {
    if (questionDraft.options.length >= 8) return
    setQuestionDraft(p => ({ ...p, options: [...p.options, emptyOption()] }))
  }
  function removeOption(idx: number) {
    if (questionDraft.options.length <= 2) return
    setQuestionDraft(p => ({ ...p, options: p.options.filter((_, i) => i !== idx) }))
  }
  function updateOption(idx: number, patch: Partial<QuizOption>) {
    setQuestionDraft(p => ({
      ...p,
      options: p.options.map((o, i) => (i === idx ? { ...o, ...patch } : o)),
    }))
  }
  function setSingleCorrect(idx: number) {
    setQuestionDraft(p => ({
      ...p,
      options: p.options.map((o, i) => ({ ...o, isCorrect: i === idx })),
    }))
  }

  function validateQuestion(): string | null {
    if (questionDraft.prompt.trim().length < 5) return 'Question prompt must be at least 5 characters'
    if (questionDraft.options.length < 2) return 'Need at least 2 options'
    if (!questionDraft.options.some(o => o.isCorrect)) return 'Mark at least one option as correct'
    for (let i = 0; i < questionDraft.options.length; i++) {
      if (questionDraft.options[i].label.trim().length === 0) return `Option ${i + 1}: label required`
    }
    return null
  }

  async function saveQuestion() {
    const v = validateQuestion()
    if (v) { setError(v); return }
    setSavingQuestion(true)
    setError(null)
    try {
      const body = {
        prompt: questionDraft.prompt.trim(),
        explanation: questionDraft.explanation.trim(),
        options: questionDraft.options.map(o => ({
          label: o.label.trim(),
          isCorrect: o.isCorrect,
        })),
      }
      if (editingQuestionId === 'new') {
        await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/quiz/questions`, {
          method: 'POST',
          body: JSON.stringify(body),
        })
      } else if (editingQuestionId) {
        await apiRequest(
          `/academy/admin/courses/${courseId}/weeks/${weekId}/quiz/questions/${editingQuestionId}`,
          {
            method: 'PATCH',
            body: JSON.stringify(body),
          }
        )
      }
      cancelQuestion()
      onChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save question')
    } finally {
      setSavingQuestion(false)
    }
  }

  async function deleteQuestion(questionId: string) {
    if (!confirm('Delete this question?')) return
    setDeletingQuestionId(questionId)
    setError(null)
    try {
      await apiRequest(
        `/academy/admin/courses/${courseId}/weeks/${weekId}/quiz/questions/${questionId}`,
        { method: 'DELETE' }
      )
      onChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question')
    } finally {
      setDeletingQuestionId(null)
    }
  }

  // ─── Delete whole quiz ──────────────────────────────────────────────────
  const [deletingQuiz, setDeletingQuiz] = useState(false)
  async function deleteWholeQuiz() {
    if (!confirm('Delete the entire quiz and all its questions? This cannot be undone.')) return
    setDeletingQuiz(true)
    setError(null)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/quiz`, {
        method: 'DELETE',
      })
      onChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete quiz')
    } finally {
      setDeletingQuiz(false)
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // No quiz yet — show create button
  if (!quiz) {
    return (
      <div className="space-y-3">
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-100">{error}</div>
        )}
        <p className="text-xs text-white/40">No quiz yet</p>
        <div className="rounded-xl border border-[#F5C518]/20 bg-[#F5C518]/5 p-3 space-y-2">
          <input
            value={creatingTitle}
            onChange={e => setCreatingTitle(e.target.value)}
            placeholder="Quiz title (e.g. 'Blockchain Fundamentals Quiz')"
            className={inputCls}
          />
          <button
            onClick={createQuizShell}
            disabled={creating || creatingTitle.trim().length < 3}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#F5C518] px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-40 hover:bg-[#E8B800] transition-colors"
          >
            {creating ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
            Create quiz
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-100">
          {error}
        </div>
      )}

      {/* Quiz settings */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3">
        <p className="text-xs font-semibold text-white/70">Quiz settings</p>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-3">
            <label className="block text-xs text-white/50 mb-1">Title</label>
            <input
              value={settingsForm.title}
              onChange={e => setSettingsForm(p => ({ ...p, title: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Pass mark (%)</label>
            <input
              type="number" min={1} max={100}
              value={settingsForm.passMark}
              onChange={e => setSettingsForm(p => ({ ...p, passMark: parseInt(e.target.value) || 70 }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Attempt limit</label>
            <input
              type="number" min={1} max={10}
              value={settingsForm.attemptLimit}
              onChange={e => setSettingsForm(p => ({ ...p, attemptLimit: parseInt(e.target.value) || 1 }))}
              className={inputCls}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={deleteWholeQuiz}
            disabled={deletingQuiz}
            className="px-3 py-1.5 text-xs font-medium rounded-full border border-red-400/30 text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            {deletingQuiz ? 'Deleting…' : 'Delete entire quiz'}
          </button>
          <button
            onClick={saveSettings}
            disabled={savingSettings}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#F5C518] px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-40"
          >
            {savingSettings ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            Save settings
          </button>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-white/70">
            Questions ({quiz.questions.length})
          </p>
          {editingQuestionId === null && (
            <button
              onClick={startNewQuestion}
              className="inline-flex items-center gap-1 text-xs text-[#F5C518] hover:text-[#E8B800]"
            >
              <Plus size={12} /> Add question
            </button>
          )}
        </div>

        {quiz.questions.map((q, idx) => {
          const isEditing = editingQuestionId === q.id
          if (isEditing) {
            return (
              <QuestionEditForm
                key={q.id}
                idx={idx + 1}
                draft={questionDraft}
                onPromptChange={prompt => setQuestionDraft(p => ({ ...p, prompt }))}
                onExplanationChange={explanation => setQuestionDraft(p => ({ ...p, explanation }))}
                onOptionUpdate={updateOption}
                onSingleCorrect={setSingleCorrect}
                onAddOption={addOption}
                onRemoveOption={removeOption}
                onCancel={cancelQuestion}
                onSave={saveQuestion}
                saving={savingQuestion}
              />
            )
          }
          return (
            <div key={q.id} className="rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-mono text-white/40 flex-shrink-0">Q{idx + 1}</span>
                  <p className="text-sm font-medium text-white">{q.prompt}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => startEditQuestion(q)}
                    disabled={editingQuestionId !== null}
                    title="Edit question"
                    className="p-1.5 text-white/40 hover:text-[#F5C518] transition-colors disabled:opacity-40"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => deleteQuestion(q.id)}
                    disabled={deletingQuestionId === q.id || editingQuestionId !== null}
                    title="Delete question"
                    className="p-1.5 text-white/40 hover:text-red-400 transition-colors disabled:opacity-40"
                  >
                    {deletingQuestionId === q.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  </button>
                </div>
              </div>
              <ul className="space-y-1 ml-6">
                {q.options.map(o => (
                  <li key={o.id} className="flex items-center gap-2 text-xs">
                    {o.isCorrect ? (
                      <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Circle size={12} className="text-white/20 flex-shrink-0" />
                    )}
                    <span className={o.isCorrect ? 'text-white/80' : 'text-white/40'}>{o.label}</span>
                  </li>
                ))}
              </ul>
              {q.explanation && (
                <p className="mt-2 text-[11px] italic text-white/40 ml-6">Explanation: {q.explanation}</p>
              )}
            </div>
          )
        })}

        {editingQuestionId === 'new' && (
          <QuestionEditForm
            idx={quiz.questions.length + 1}
            draft={questionDraft}
            onPromptChange={prompt => setQuestionDraft(p => ({ ...p, prompt }))}
            onExplanationChange={explanation => setQuestionDraft(p => ({ ...p, explanation }))}
            onOptionUpdate={updateOption}
            onSingleCorrect={setSingleCorrect}
            onAddOption={addOption}
            onRemoveOption={removeOption}
            onCancel={cancelQuestion}
            onSave={saveQuestion}
            saving={savingQuestion}
          />
        )}

        {quiz.questions.length === 0 && editingQuestionId !== 'new' && (
          <p className="text-xs text-white/40">No questions yet. Click "Add question" above to start.</p>
        )}
      </div>
    </div>
  )
}

// ─── Question edit form (used for both new + edit) ────────────────────────
function QuestionEditForm({
  idx,
  draft,
  onPromptChange,
  onExplanationChange,
  onOptionUpdate,
  onSingleCorrect,
  onAddOption,
  onRemoveOption,
  onCancel,
  onSave,
  saving,
}: {
  idx: number
  draft: QuizQuestionDraft
  onPromptChange: (v: string) => void
  onExplanationChange: (v: string) => void
  onOptionUpdate: (idx: number, patch: Partial<QuizOption>) => void
  onSingleCorrect: (idx: number) => void
  onAddOption: () => void
  onRemoveOption: (idx: number) => void
  onCancel: () => void
  onSave: () => void
  saving: boolean
}) {
  return (
    <div className="rounded-xl border border-[#F5C518]/30 bg-[#F5C518]/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-[#F5C518]">Q{idx}</span>
      </div>
      <textarea
        value={draft.prompt}
        onChange={e => onPromptChange(e.target.value)}
        placeholder="Question prompt..."
        rows={2}
        className={inputCls}
      />
      <div className="space-y-2">
        {draft.options.map((o, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSingleCorrect(i)}
              title={o.isCorrect ? 'Correct answer' : 'Mark as correct'}
              className={`flex-shrink-0 transition-colors ${o.isCorrect ? 'text-emerald-400' : 'text-white/30 hover:text-white/60'}`}
            >
              {o.isCorrect ? <CheckCircle size={18} /> : <Circle size={18} />}
            </button>
            <input
              value={o.label}
              onChange={e => onOptionUpdate(i, { label: e.target.value })}
              placeholder={`Option ${i + 1}`}
              className={inputCls}
            />
            <label className="flex items-center gap-1 text-[10px] text-white/40 cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={o.isCorrect}
                onChange={e => onOptionUpdate(i, { isCorrect: e.target.checked })}
                className="accent-emerald-400"
              />
              multi
            </label>
            {draft.options.length > 2 && (
              <button
                onClick={() => onRemoveOption(i)}
                className="text-white/30 hover:text-red-400 transition-colors flex-shrink-0"
                title="Remove option"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        {draft.options.length < 8 && (
          <button
            onClick={onAddOption}
            className="text-xs text-[#F5C518] hover:text-[#E8B800] inline-flex items-center gap-1"
          >
            <Plus size={12} /> Add option
          </button>
        )}
      </div>
      <textarea
        value={draft.explanation}
        onChange={e => onExplanationChange(e.target.value)}
        placeholder="Explanation shown after answering (optional)..."
        rows={2}
        className={inputCls}
      />
      <div className="flex gap-2 justify-end pt-2 border-t border-white/10">
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-3 py-1.5 text-xs font-medium rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors"
        >
          <X size={12} className="inline" /> Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-[#F5C518] px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-40 hover:bg-[#E8B800] transition-colors"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          Save question
        </button>
      </div>
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors resize-y'
