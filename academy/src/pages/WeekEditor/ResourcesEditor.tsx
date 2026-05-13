import { useState } from 'react'
import { Plus, Trash2, Loader2, Save, X, ExternalLink, BookOpen, FileText, Video as VideoIcon, GraduationCap } from 'lucide-react'
import { apiRequest } from '../../lib/api'

type ResourceType = 'ARTICLE' | 'COURSE' | 'DOCUMENTATION' | 'WHITEPAPER' | 'VIDEO' | 'INTERACTIVE'

export type ExistingReadingResource = {
  id: string
  title: string
  source: string
  url: string
  description: string
  type: ResourceType
  position: number
}

export type ExistingSlideDeck = {
  id: string
  title: string
  url: string
  slideCount: number
  viewerType: 'MODAL' | 'EXTERNAL'
  position?: number
}

interface ResourcesEditorProps {
  courseId: string
  weekId: string
  resources: ExistingReadingResource[]
  /** Now an array — lessons can have multiple slide decks */
  slideDecks: ExistingSlideDeck[]
  onChange: () => void
}

const RESOURCE_TYPES: Array<{ value: ResourceType; label: string; icon: any }> = [
  { value: 'ARTICLE', label: 'Article', icon: FileText },
  { value: 'DOCUMENTATION', label: 'Documentation', icon: BookOpen },
  { value: 'COURSE', label: 'Course', icon: GraduationCap },
  { value: 'WHITEPAPER', label: 'Whitepaper', icon: FileText },
  { value: 'VIDEO', label: 'Video', icon: VideoIcon },
  { value: 'INTERACTIVE', label: 'Interactive', icon: ExternalLink },
]

const emptySlideForm = () => ({ title: '', url: '', slideCount: 1 })

export default function ResourcesEditor({ courseId, weekId, resources, slideDecks, onChange }: ResourcesEditorProps) {
  // ─── Slide Decks state ──────────────────────────────────────────────────
  const [showSlideForm, setShowSlideForm] = useState(false)
  const [slideForm, setSlideForm] = useState(emptySlideForm())
  const [savingSlide, setSavingSlide] = useState(false)
  const [deletingSlideId, setDeletingSlideId] = useState<string | null>(null)
  const [slideError, setSlideError] = useState<string | null>(null)

  // ─── Reading Resources state ────────────────────────────────────────────
  const [showResourceForm, setShowResourceForm] = useState(false)
  const [resourceForm, setResourceForm] = useState({
    title: '',
    source: '',
    url: '',
    description: '',
    type: 'ARTICLE' as ResourceType,
  })
  const [savingResource, setSavingResource] = useState(false)
  const [deletingResourceId, setDeletingResourceId] = useState<string | null>(null)
  const [resourceError, setResourceError] = useState<string | null>(null)

  // ─── Slide Deck actions ─────────────────────────────────────────────────
  async function addSlide() {
    if (slideForm.title.trim().length < 1) {
      setSlideError('Title is required')
      return
    }
    if (!slideForm.url.trim()) {
      setSlideError('URL is required')
      return
    }
    setSavingSlide(true)
    setSlideError(null)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/slides`, {
        method: 'POST',
        body: JSON.stringify({
          title: slideForm.title.trim(),
          url: slideForm.url.trim(),
          slideCount: slideForm.slideCount,
        }),
      })
      setShowSlideForm(false)
      setSlideForm(emptySlideForm())
      onChange()
    } catch (err) {
      setSlideError(err instanceof Error ? err.message : 'Failed to save slides')
    } finally {
      setSavingSlide(false)
    }
  }

  async function deleteSlide(slideId: string) {
    if (!confirm('Delete this slide deck?')) return
    setDeletingSlideId(slideId)
    setSlideError(null)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/slides/${slideId}`, {
        method: 'DELETE',
      })
      onChange()
    } catch (err) {
      setSlideError(err instanceof Error ? err.message : 'Failed to delete slides')
    } finally {
      setDeletingSlideId(null)
    }
  }

  // ─── Reading Resource actions ───────────────────────────────────────────
  function resetResourceForm() {
    setResourceForm({ title: '', source: '', url: '', description: '', type: 'ARTICLE' })
    setResourceError(null)
  }

  async function addResource() {
    if (resourceForm.title.trim().length < 1) {
      setResourceError('Title is required')
      return
    }
    if (resourceForm.source.trim().length < 1) {
      setResourceError('Source is required (e.g. "Vitalik Buterin" or "MDN")')
      return
    }
    if (!resourceForm.url.trim()) {
      setResourceError('URL is required')
      return
    }
    setSavingResource(true)
    setResourceError(null)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/resources`, {
        method: 'POST',
        body: JSON.stringify({
          title: resourceForm.title.trim(),
          source: resourceForm.source.trim(),
          url: resourceForm.url.trim(),
          description: resourceForm.description.trim(),
          type: resourceForm.type,
        }),
      })
      setShowResourceForm(false)
      resetResourceForm()
      onChange()
    } catch (err) {
      setResourceError(err instanceof Error ? err.message : 'Failed to add resource')
    } finally {
      setSavingResource(false)
    }
  }

  async function deleteResource(resourceId: string) {
    if (!confirm('Delete this resource?')) return
    setDeletingResourceId(resourceId)
    setResourceError(null)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/resources/${resourceId}`, {
        method: 'DELETE',
      })
      onChange()
    } catch (err) {
      setResourceError(err instanceof Error ? err.message : 'Failed to delete resource')
    } finally {
      setDeletingResourceId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* ─── Slide Decks section ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#F5C518]">
              <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M3 9h18" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Lesson Slide Decks ({slideDecks.length})
          </h4>
          {!showSlideForm && (
            <button
              onClick={() => setShowSlideForm(true)}
              className="inline-flex items-center gap-1 text-xs text-[#F5C518] hover:text-[#E8B800]"
            >
              <Plus size={12} /> Add slide deck
            </button>
          )}
        </div>
        <p className="text-xs text-white/40 mb-3">
          Add one or more slide decks for this lesson (Canva, Google Slides, etc.). For Canva, use the <strong>Embed</strong> share link.
        </p>

        {slideError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-100 mb-2">
            {slideError}
          </div>
        )}

        {/* Existing slide decks */}
        {slideDecks.length > 0 && (
          <div className="space-y-2 mb-3">
            {slideDecks.map(deck => (
              <div key={deck.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{deck.title}</p>
                    <p className="text-xs text-white/40 mt-0.5">{deck.slideCount} slide{deck.slideCount !== 1 ? 's' : ''}</p>
                    <a
                      href={deck.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1 text-xs text-[#F5C518] hover:text-[#E8B800] break-all"
                    >
                      <span className="truncate max-w-[40ch]">{deck.url}</span>
                      <ExternalLink size={10} className="flex-shrink-0" />
                    </a>
                  </div>
                  <button
                    onClick={() => deleteSlide(deck.id)}
                    disabled={deletingSlideId === deck.id}
                    className="p-1.5 text-white/40 hover:text-red-400 transition-colors disabled:opacity-40 flex-shrink-0"
                    title="Remove slide deck"
                  >
                    {deletingSlideId === deck.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New slide form */}
        {showSlideForm ? (
          <div className="rounded-xl border border-[#F5C518]/30 bg-[#F5C518]/5 p-3 space-y-2">
            <input
              value={slideForm.title}
              onChange={e => setSlideForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Slide deck title (e.g. 'Intro to Blockchain Slides')"
              className={inputCls}
            />
            <input
              value={slideForm.url}
              onChange={e => setSlideForm(p => ({ ...p, url: e.target.value }))}
              placeholder="Embed URL (Canva → Share → Embed, or Google Slides /embed link)"
              type="url"
              className={inputCls}
            />
            <input
              type="number"
              min={1} max={500}
              value={slideForm.slideCount}
              onChange={e => setSlideForm(p => ({ ...p, slideCount: parseInt(e.target.value) || 1 }))}
              placeholder="Number of slides"
              className={inputCls}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowSlideForm(false); setSlideForm(emptySlideForm()); setSlideError(null) }}
                disabled={savingSlide}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors"
              >
                <X size={12} className="inline" /> Cancel
              </button>
              <button
                onClick={addSlide}
                disabled={savingSlide}
                className="inline-flex items-center gap-2 rounded-full bg-[#F5C518] px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-40"
              >
                {savingSlide ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Add slide deck
              </button>
            </div>
          </div>
        ) : slideDecks.length === 0 ? (
          <p className="text-xs text-white/40">No slide decks yet</p>
        ) : null}
      </div>

      {/* ─── Reading Resources section ────────────────────────────────── */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <BookOpen size={14} className="text-blue-400" />
            Reading & Reference Resources
          </h4>
          {!showResourceForm && (
            <button
              onClick={() => setShowResourceForm(true)}
              className="inline-flex items-center gap-1 text-xs text-[#F5C518] hover:text-[#E8B800]"
            >
              <Plus size={12} /> Add resource
            </button>
          )}
        </div>
        <p className="text-xs text-white/40 mb-3">
          Articles, docs, videos, whitepapers, or other materials learners can reference.
        </p>

        {resourceError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-100 mb-2">
            {resourceError}
          </div>
        )}

        {/* Existing resources list */}
        {resources.length > 0 && (
          <div className="space-y-2 mb-3">
            {resources.map(r => {
              const typeInfo = RESOURCE_TYPES.find(t => t.value === r.type)
              const Icon = typeInfo?.icon ?? FileText
              return (
                <div key={r.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Icon size={12} className="text-blue-400 flex-shrink-0" />
                        <p className="text-sm font-medium text-white truncate">{r.title}</p>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white/30 flex-shrink-0">
                          {typeInfo?.label}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 mb-1">by {r.source}</p>
                      {r.description && <p className="text-xs text-white/55 line-clamp-2">{r.description}</p>}
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-xs text-[#F5C518] hover:text-[#E8B800]"
                      >
                        Open <ExternalLink size={10} />
                      </a>
                    </div>
                    <button
                      onClick={() => deleteResource(r.id)}
                      disabled={deletingResourceId === r.id}
                      className="p-1.5 text-white/40 hover:text-red-400 transition-colors disabled:opacity-40 flex-shrink-0"
                    >
                      {deletingResourceId === r.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* New resource form */}
        {showResourceForm ? (
          <div className="rounded-xl border border-[#F5C518]/30 bg-[#F5C518]/5 p-3 space-y-2">
            <input
              value={resourceForm.title}
              onChange={e => setResourceForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Resource title"
              className={inputCls}
            />
            <input
              value={resourceForm.source}
              onChange={e => setResourceForm(p => ({ ...p, source: e.target.value }))}
              placeholder="Source / author (e.g. 'Ethereum.org' or 'Andreas Antonopoulos')"
              className={inputCls}
            />
            <input
              value={resourceForm.url}
              onChange={e => setResourceForm(p => ({ ...p, url: e.target.value }))}
              placeholder="URL"
              type="url"
              className={inputCls}
            />
            <select
              value={resourceForm.type}
              onChange={e => setResourceForm(p => ({ ...p, type: e.target.value as ResourceType }))}
              className={`${inputCls} bg-[#111] [color-scheme:dark]`}
            >
              {RESOURCE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <textarea
              value={resourceForm.description}
              onChange={e => setResourceForm(p => ({ ...p, description: e.target.value }))}
              rows={2}
              placeholder="Description (optional) — what learners will find here"
              className={inputCls}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowResourceForm(false); resetResourceForm() }}
                disabled={savingResource}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors"
              >
                <X size={12} className="inline" /> Cancel
              </button>
              <button
                onClick={addResource}
                disabled={savingResource}
                className="inline-flex items-center gap-2 rounded-full bg-[#F5C518] px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-40"
              >
                {savingResource ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Add resource
              </button>
            </div>
          </div>
        ) : resources.length === 0 ? (
          <p className="text-xs text-white/40">No resources yet</p>
        ) : null}
      </div>
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors resize-y'
