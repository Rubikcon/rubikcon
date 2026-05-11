import { useState } from 'react'
import { Plus, Trash2, CheckCircle, Circle, Loader2, Save, X } from 'lucide-react'
import { apiRequest } from '../../lib/api'

type QuizOption = { id?: string; label: string; isCorrect: boolean }
type QuizQuestion = { id?: string; prompt: string; explanation: string; options: QuizOption[] }

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
  onChange: () => void // called after save/delete so parent can reload
}

const emptyOption = (): QuizOption => ({ label: '', isCorrect: false })
const emptyQuestion = (): QuizQuestion => ({ prompt: '', explanation: '', options: [emptyOption(), emptyOption()] })

export default function QuizEditor({ courseId, weekId, quiz, onChange }: QuizEditorProps) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state — initialized from existing quiz when opened, or blank
  const [title, setTitle] = useState(quiz?.title || '')
  const [passMark, setPassMark] = useState(quiz?.passMark || 70)
  const [attemptLimit, setAttemptLimit] = useState(quiz?.attemptLimit || 1)
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    quiz?.questions
      ? quiz.questions.map(q => ({
          id: q.id,
          prompt: q.prompt,
          explanation: q.explanation,
          options: q.options.map(o => ({ id: o.id, label: o.label, isCorrect: o.isCorrect })),
        }))
      : [emptyQuestion()]
  )

  function startEdit() {
    // Re-sync form state with current quiz when opening
    setTitle(quiz?.title || '')
    setPassMark(quiz?.passMark || 70)
    setAttemptLimit(quiz?.attemptLimit || 1)
    setQuestions(
      quiz?.questions
        ? quiz.questions.map(q => ({
            id: q.id,
            prompt: q.prompt,
            explanation: q.explanation,
            options: q.options.map(o => ({ id: o.id, label: o.label, isCorrect: o.isCorrect })),
          }))
        : [emptyQuestion()]
    )
    setError(null)
    setOpen(true)
  }

  function addQuestion() {
    setQuestions(prev => [...prev, emptyQuestion()])
  }
  function removeQuestion(idx: number) {
    setQuestions(prev => prev.filter((_, i) => i !== idx))
  }
  function updateQuestion(idx: number, patch: Partial<QuizQuestion>) {
    setQuestions(prev => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)))
  }
  function addOption(qIdx: number) {
    setQuestions(prev =>
      prev.map((q, i) => (i === qIdx ? { ...q, options: [...q.options, emptyOption()] } : q))
    )
  }
  function removeOption(qIdx: number, oIdx: number) {
    setQuestions(prev =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, options: q.options.filter((_, oi) => oi !== oIdx) } : q
      )
    )
  }
  function updateOption(qIdx: number, oIdx: number, patch: Partial<QuizOption>) {
    setQuestions(prev =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.map((o, oi) => (oi === oIdx ? { ...o, ...patch } : o)) }
          : q
      )
    )
  }
  function setCorrectOnly(qIdx: number, oIdx: number) {
    // Convenience: clicking the radio sets that single option as correct, unsets others
    setQuestions(prev =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.map((o, oi) => ({ ...o, isCorrect: oi === oIdx })) }
          : q
      )
    )
  }

  function validate(): string | null {
    if (title.trim().length < 3) return 'Quiz title must be at least 3 characters'
    if (questions.length === 0) return 'Add at least one question'
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (q.prompt.trim().length < 5) return `Question ${i + 1}: prompt must be at least 5 characters`
      if (q.options.length < 2) return `Question ${i + 1}: needs at least 2 options`
      if (q.options.length > 8) return `Question ${i + 1}: max 8 options`
      if (!q.options.some(o => o.isCorrect)) return `Question ${i + 1}: mark at least one option as correct`
      for (let j = 0; j < q.options.length; j++) {
        if (q.options[j].label.trim().length === 0) return `Question ${i + 1}, option ${j + 1}: label required`
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
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/quiz`, {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          passMark,
          attemptLimit,
          questions: questions.map((q, qi) => ({
            prompt: q.prompt.trim(),
            explanation: q.explanation.trim(),
            position: qi + 1,
            options: q.options.map((o, oi) => ({
              label: o.label.trim(),
              isCorrect: o.isCorrect,
              position: oi + 1,
            })),
          })),
        }),
      })
      setOpen(false)
      onChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save quiz')
    } finally {
      setSaving(false)
    }
  }

  async function deleteQuiz() {
    if (!quiz) return
    if (!confirm('Delete the entire quiz and all its questions? This cannot be undone.')) return
    setDeleting(true)
    setError(null)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/quiz`, {
        method: 'DELETE',
      })
      onChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete quiz')
    } finally {
      setDeleting(false)
    }
  }

  // ─── Collapsed summary view ─────────────────────────────────────────────
  if (!open) {
    return (
      <div>
        {quiz ? (
          <div className="space-y-2">
            <div className="text-sm text-emerald-300/80">
              ✓ <span className="font-medium">{quiz.title}</span> — {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''} · pass mark {quiz.passMark}%
            </div>
            <div className="flex gap-2">
              <button
                onClick={startEdit}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors"
              >
                Edit quiz
              </button>
              <button
                onClick={deleteQuiz}
                disabled={deleting}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-400/30 text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-white/40">No quiz yet</p>
            <button
              onClick={startEdit}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#F5C518]/20 text-[#F5C518] hover:bg-[#F5C518]/30 transition-colors"
            >
              <Plus size={12} /> Create quiz
            </button>
          </div>
        )}
      </div>
    )
  }

  // ─── Editor view ────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-100">
          {error}
        </div>
      )}

      {/* Quiz meta */}
      <div className="grid md:grid-cols-3 gap-3">
        <div className="md:col-span-3">
          <label className="block text-xs text-white/50 mb-1">Quiz title *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Blockchain Fundamentals Quiz"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Pass mark (%)</label>
          <input
            type="number" min={1} max={100}
            value={passMark}
            onChange={e => setPassMark(parseInt(e.target.value) || 70)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Attempt limit</label>
          <input
            type="number" min={1} max={10}
            value={attemptLimit}
            onChange={e => setAttemptLimit(parseInt(e.target.value) || 1)}
            className={inputCls}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-white/40">Q{qIdx + 1}</span>
              {questions.length > 1 && (
                <button
                  onClick={() => removeQuestion(qIdx)}
                  className="text-xs text-white/40 hover:text-red-400 transition-colors"
                  title="Remove question"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <textarea
              value={q.prompt}
              onChange={e => updateQuestion(qIdx, { prompt: e.target.value })}
              placeholder="Question prompt..."
              rows={2}
              className={inputCls}
            />

            <div className="space-y-2">
              {q.options.map((o, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCorrectOnly(qIdx, oIdx)}
                    title={o.isCorrect ? 'Correct answer' : 'Mark as correct (single-answer)'}
                    className={`flex-shrink-0 transition-colors ${o.isCorrect ? 'text-emerald-400' : 'text-white/30 hover:text-white/60'}`}
                  >
                    {o.isCorrect ? <CheckCircle size={18} /> : <Circle size={18} />}
                  </button>
                  <input
                    value={o.label}
                    onChange={e => updateOption(qIdx, oIdx, { label: e.target.value })}
                    placeholder={`Option ${oIdx + 1}`}
                    className={inputCls}
                  />
                  <label className="flex items-center gap-1 text-[11px] text-white/40 cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={o.isCorrect}
                      onChange={e => updateOption(qIdx, oIdx, { isCorrect: e.target.checked })}
                      className="accent-emerald-400"
                    />
                    multi-correct
                  </label>
                  {q.options.length > 2 && (
                    <button
                      onClick={() => removeOption(qIdx, oIdx)}
                      className="text-white/30 hover:text-red-400 transition-colors flex-shrink-0"
                      title="Remove option"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              {q.options.length < 8 && (
                <button
                  onClick={() => addOption(qIdx)}
                  className="text-xs text-[#F5C518] hover:text-[#E8B800] inline-flex items-center gap-1"
                >
                  <Plus size={12} /> Add option
                </button>
              )}
            </div>

            <textarea
              value={q.explanation}
              onChange={e => updateQuestion(qIdx, { explanation: e.target.value })}
              placeholder="Explanation shown after answering (optional)..."
              rows={2}
              className={inputCls}
            />
          </div>
        ))}
        {questions.length < 30 && (
          <button
            onClick={addQuestion}
            className="inline-flex items-center gap-1.5 text-sm font-medium rounded-full border border-white/20 px-4 py-2 text-white/70 hover:text-white hover:border-white/40 transition-colors"
          >
            <Plus size={14} /> Add question
          </button>
        )}
      </div>

      {/* Save bar */}
      <div className="flex gap-3 justify-end pt-3 border-t border-white/10">
        <button
          onClick={() => setOpen(false)}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-[#F5C518] px-5 py-2 text-sm font-semibold text-black disabled:opacity-40 hover:bg-[#E8B800] transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save quiz
        </button>
      </div>
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors resize-y'
