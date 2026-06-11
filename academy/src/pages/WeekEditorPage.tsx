/**
 * WeekEditorPage — rich editor for a single week (a "lesson" in the wizard).
 *
 * This is the page admins land on when they click "Edit details" on a lesson
 * in the wizard's Step 3. It exposes all the rich content slots a Week has:
 *   - basic info (title, hook, whatToExpect, summary, duration, difficulty)
 *   - topics covered (list)
 *   - what you'll learn / objectives (list)
 *   - videos (multiple, with title/url/description)
 *   - quiz
 *   - assignments
 *
 * It uses the existing /academy/admin/courses/:courseId/weeks/... endpoints.
 */

import { FormEvent, useEffect, useState } from 'react'
import { useParams } from 'wouter'
import { ArrowLeft, GripVertical, Loader2, Plus, Save, Trash2, Video as VideoIcon, ListChecks, Target, FileQuestion, ClipboardList } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import AcademyNavbar from '../components/AcademyNavbar'
import { apiRequest } from '../lib/api'
import { getStoredAuth } from '../lib/auth'
import QuizEditor, { type ExistingQuiz } from './WeekEditor/QuizEditor'
import AssignmentEditor, { type ExistingAssignment } from './WeekEditor/AssignmentEditor'
import ResourcesEditor, { type ExistingReadingResource, type ExistingSlideDeck } from './WeekEditor/ResourcesEditor'
import GlossaryEditor, { type ExistingGlossaryTerm } from './WeekEditor/GlossaryEditor'

type WeekDetail = {
  id: string
  number: number
  title: string
  slug: string
  durationLabel: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  hook: string
  whatToExpect: string
  summary: string
  estimatedCompletionMinutes: number
  videoTitle: string | null
  videoUrl: string | null
  lessonContent: string | null
  moduleId: string | null
  topics: Array<{ id: string; title: string; position: number }>
  objectives: Array<{ id: string; body: string; position: number }>
  videos: Array<{ id: string; title: string; url: string; description: string | null; position: number }>
  quiz: ExistingQuiz
  assignments: ExistingAssignment[]
  readingResources: ExistingReadingResource[]
  slideDecks: ExistingSlideDeck[]
  glossaryTerms: ExistingGlossaryTerm[]
}

export default function WeekEditorPage() {
  const { courseId, weekId } = useParams<{ courseId: string; weekId: string }>()
  const auth = getStoredAuth()

  const [week, setWeek] = useState<WeekDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingSection, setSavingSection] = useState<string | null>(null)

  // Sensors for the video drag-and-drop reorder.
  // PointerSensor with a small distance threshold prevents accidental drags
  // when the admin really wanted to click the delete button.
  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Form drafts for each section
  const [basicForm, setBasicForm] = useState({
    title: '', hook: '', whatToExpect: '', summary: '',
    durationLabel: '', estimatedCompletionMinutes: 30,
    difficulty: 'BEGINNER' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
  })
  const [topicsDraft, setTopicsDraft] = useState('')
  const [objectivesDraft, setObjectivesDraft] = useState('')
  const [videoDraft, setVideoDraft] = useState({ title: '', url: '', description: '' })
  const [contentDraft, setContentDraft] = useState('')

  useEffect(() => {
    if (!getStoredAuth()) {
      window.location.href = '/login'
      return
    }
    void loadWeek()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekId])

  async function loadWeek() {
    setLoading(true)
    setError(null)
    try {
      // Fetch the course detail to get this week (no dedicated GET admin week endpoint)
      const course = await apiRequest<any>(`/academy/admin/courses/${courseId}`)
      const w: WeekDetail | undefined = (course.weeks || []).find((x: any) => x.id === weekId)
      if (!w) throw new Error('Lesson not found in this course')
      setWeek(w)
      setBasicForm({
        title: w.title,
        hook: w.hook === 'Hook coming soon.' ? '' : w.hook,
        whatToExpect: w.whatToExpect === 'Details coming soon.' ? '' : w.whatToExpect,
        summary: w.summary === 'Summary coming soon.' ? '' : w.summary,
        durationLabel: w.durationLabel,
        estimatedCompletionMinutes: w.estimatedCompletionMinutes,
        difficulty: w.difficulty,
      })
      setTopicsDraft(w.topics.map(t => t.title).join('\n'))
      setObjectivesDraft(w.objectives.map(o => o.body).join('\n'))
      setContentDraft(w.lessonContent || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lesson')
    } finally {
      setLoading(false)
    }
  }

  async function saveBasic(e: FormEvent) {
    e.preventDefault()
    if (!week) return
    setSavingSection('basic')
    setError(null)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: basicForm.title.trim() || undefined,
          hook: basicForm.hook.trim() || undefined,
          whatToExpect: basicForm.whatToExpect.trim() || undefined,
          summary: basicForm.summary.trim() || undefined,
          durationLabel: basicForm.durationLabel.trim() || undefined,
          estimatedCompletionMinutes: basicForm.estimatedCompletionMinutes,
          difficulty: basicForm.difficulty,
        }),
      })
      await loadWeek()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save basics')
    } finally {
      setSavingSection(null)
    }
  }

  async function saveTopicsAndObjectives() {
    if (!week) return
    setSavingSection('topics-objectives')
    setError(null)
    try {
      const topics = topicsDraft.split('\n').map(s => s.trim()).filter(Boolean)
      const objectives = objectivesDraft.split('\n').map(s => s.trim()).filter(Boolean)
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}`, {
        method: 'PATCH',
        body: JSON.stringify({ topics, objectives }),
      })
      await loadWeek()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save topics/objectives')
    } finally {
      setSavingSection(null)
    }
  }

  async function saveContent() {
    if (!week) return
    setSavingSection('content')
    setError(null)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/content`, {
        method: 'PATCH',
        body: JSON.stringify({ lessonContent: contentDraft }),
      })
      await loadWeek()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content')
    } finally {
      setSavingSection(null)
    }
  }

  async function addVideo() {
    if (!videoDraft.title.trim() || !videoDraft.url.trim()) {
      setError('Video title and URL are required')
      return
    }
    if (!week) return
    setSavingSection('add-video')
    setError(null)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/videos`, {
        method: 'POST',
        body: JSON.stringify({
          title: videoDraft.title.trim(),
          url: videoDraft.url.trim(),
          description: videoDraft.description.trim() || undefined,
        }),
      })
      setVideoDraft({ title: '', url: '', description: '' })
      await loadWeek()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add video')
    } finally {
      setSavingSection(null)
    }
  }

  async function deleteVideo(videoId: string) {
    if (!confirm('Delete this video?')) return
    if (!week) return
    setSavingSection(`del-video-${videoId}`)
    setError(null)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/videos/${videoId}`, {
        method: 'DELETE',
      })
      await loadWeek()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete video')
    } finally {
      setSavingSection(null)
    }
  }

  /**
   * Persist a new video order. We optimistically reorder the local `week` state
   * so the UI feels instant, then call the backend. On failure we roll back by
   * reloading from the source of truth.
   */
  async function reorderVideos(newOrder: WeekDetail['videos']) {
    if (!week) return
    const previous = week.videos
    setWeek({ ...week, videos: newOrder })
    setSavingSection('reorder-videos')
    setError(null)
    try {
      await apiRequest(`/academy/admin/courses/${courseId}/weeks/${weekId}/videos/order`, {
        method: 'PATCH',
        body: JSON.stringify({ videoIds: newOrder.map(v => v.id) }),
      })
    } catch (err) {
      // Roll back on failure so the UI matches the server.
      setWeek({ ...week, videos: previous })
      setError(err instanceof Error ? err.message : 'Failed to reorder videos')
    } finally {
      setSavingSection(null)
    }
  }

  const isPrivileged = auth?.user.role === 'ADMIN' || auth?.user.role === 'SUPER_ADMIN'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <AcademyNavbar showBack backHref={`/admin/courses/${courseId}`} backLabel="Back to Course" solid />
        <div className="pt-32 flex flex-col items-center justify-center text-center px-6">
          <Loader2 className="animate-spin text-[#F5C518] mb-4" size={28} />
          <p className="text-white/60">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (!week) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <AcademyNavbar showBack backHref={`/admin/courses/${courseId}`} backLabel="Back to Course" solid />
        <div className="pt-32 text-center px-6">
          <p className="text-red-400">{error ?? 'Lesson not found.'}</p>
        </div>
      </div>
    )
  }

  if (!isPrivileged) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <AcademyNavbar solid />
        <div className="pt-32 text-center px-6">
          <p className="text-red-400">You don't have permission to edit this lesson.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AcademyNavbar showBack backHref={`/admin/courses/${courseId}`} backLabel="Back to Wizard" solid />

      <main className="pt-28 pb-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Header */}
          <div>
            <a
              href={`/admin/courses/${courseId}`}
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-3"
            >
              <ArrowLeft size={14} /> Back to wizard
            </a>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white">
              {week.title}
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Lesson #{week.number} · /{week.slug}
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-200/50 hover:text-red-100 ml-4">✕</button>
            </div>
          )}

          {/* Basics */}
          <Section title="Lesson Basics" icon={ClipboardList}>
            <form onSubmit={saveBasic} className="space-y-4">
              <Field label="Title *">
                <input
                  required minLength={3} value={basicForm.title}
                  onChange={e => setBasicForm(p => ({ ...p, title: e.target.value }))}
                  className={inputCls}
                />
              </Field>

              <Field label="Hook — short engaging description shown to learners" hint="Max 500 chars">
                <textarea
                  rows={2} value={basicForm.hook} maxLength={500}
                  onChange={e => setBasicForm(p => ({ ...p, hook: e.target.value }))}
                  placeholder="A one-sentence pitch for the lesson..."
                  className={inputCls}
                />
              </Field>

              <Field label="What to expect" hint="What learners will encounter in this lesson">
                <textarea
                  rows={3} value={basicForm.whatToExpect} maxLength={2000}
                  onChange={e => setBasicForm(p => ({ ...p, whatToExpect: e.target.value }))}
                  placeholder="In this lesson, you'll work through..."
                  className={inputCls}
                />
              </Field>

              <Field label="Lesson Description" hint="Longer written description of this lesson's content — what learners will read or watch">
                <textarea
                  rows={5} value={basicForm.summary} maxLength={5000}
                  onChange={e => setBasicForm(p => ({ ...p, summary: e.target.value }))}
                  placeholder="This lesson covers..."
                  className={inputCls}
                />
              </Field>

              <div className="grid md:grid-cols-3 gap-4">
                <Field label="Duration label">
                  <input
                    value={basicForm.durationLabel}
                    onChange={e => setBasicForm(p => ({ ...p, durationLabel: e.target.value }))}
                    placeholder="e.g. 30 min"
                    className={inputCls}
                  />
                </Field>
                <Field label="Estimated minutes">
                  <input
                    type="number" min={1} max={600}
                    value={basicForm.estimatedCompletionMinutes}
                    onChange={e => setBasicForm(p => ({ ...p, estimatedCompletionMinutes: parseInt(e.target.value) || 1 }))}
                    className={inputCls}
                  />
                </Field>
                <Field label="Difficulty">
                  <select
                    value={basicForm.difficulty}
                    onChange={e => setBasicForm(p => ({ ...p, difficulty: e.target.value as any }))}
                    className={`${inputCls} bg-[#111] [color-scheme:dark]`}
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </Field>
              </div>

              <SaveButton saving={savingSection === 'basic'} label="Save basics" />
            </form>
          </Section>

          {/* Topics Covered + What You'll Learn */}
          <Section title="Topics Covered & What You'll Learn" icon={ListChecks}>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Topics covered" hint="One topic per line. Shown as a bulleted list.">
                <textarea
                  rows={6} value={topicsDraft}
                  onChange={e => setTopicsDraft(e.target.value)}
                  placeholder={`Blockchain basics\nWallets\nDeFi overview`}
                  className={inputCls}
                />
              </Field>
              <Field label="What you'll learn" hint="One objective per line.">
                <textarea
                  rows={6} value={objectivesDraft}
                  onChange={e => setObjectivesDraft(e.target.value)}
                  placeholder={`Understand what a blockchain is\nExplain consensus mechanisms`}
                  className={inputCls}
                />
              </Field>
            </div>
            <SaveButton saving={savingSection === 'topics-objectives'} onClick={saveTopicsAndObjectives} label="Save topics & objectives" />
          </Section>

          {/* Videos */}
          <Section title="Lesson Videos" icon={VideoIcon}>
            {week.videos.length > 0 && (
              <>
                {week.videos.length > 1 && (
                  <p className="text-xs text-white/40 mb-2 flex items-center gap-1.5">
                    <GripVertical size={11} className="text-white/30" />
                    Drag the handle to reorder — learners watch videos in this exact sequence.
                    {savingSection === 'reorder-videos' && (
                      <span className="ml-auto inline-flex items-center gap-1 text-[#F5C518]">
                        <Loader2 size={11} className="animate-spin" /> Saving…
                      </span>
                    )}
                  </p>
                )}
                <DndContext
                  sensors={dndSensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event: DragEndEvent) => {
                    const { active, over } = event
                    if (!over || active.id === over.id) return
                    const oldIndex = week.videos.findIndex(v => v.id === active.id)
                    const newIndex = week.videos.findIndex(v => v.id === over.id)
                    if (oldIndex < 0 || newIndex < 0) return
                    void reorderVideos(arrayMove(week.videos, oldIndex, newIndex))
                  }}
                >
                  <SortableContext
                    items={week.videos.map(v => v.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 mb-4">
                      {week.videos.map((v, i) => (
                        <SortableVideoItem
                          key={v.id}
                          id={v.id}
                          position={i + 1}
                          title={v.title}
                          url={v.url}
                          description={v.description}
                          onDelete={() => deleteVideo(v.id)}
                          deleting={savingSection === `del-video-${v.id}`}
                          reorderInFlight={savingSection === 'reorder-videos'}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </>
            )}

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
              <p className="text-xs text-white/40">Add a new video</p>
              <input
                value={videoDraft.title}
                onChange={e => setVideoDraft(p => ({ ...p, title: e.target.value }))}
                placeholder="Video title"
                className={inputCls}
              />
              <input
                value={videoDraft.url}
                onChange={e => setVideoDraft(p => ({ ...p, url: e.target.value }))}
                placeholder="YouTube / Vimeo / Loom / Drive URL"
                type="url"
                className={inputCls}
              />
              <textarea
                value={videoDraft.description}
                onChange={e => setVideoDraft(p => ({ ...p, description: e.target.value }))}
                placeholder="Description (optional)"
                rows={2}
                className={inputCls}
              />
              <button
                onClick={addVideo}
                disabled={savingSection === 'add-video' || !videoDraft.title.trim() || !videoDraft.url.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-[#F5C518] px-4 py-2 text-sm font-semibold text-black disabled:opacity-40"
              >
                {savingSection === 'add-video' ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Add video
              </button>
            </div>
          </Section>

          {/* Lesson Content (Markdown / Rich text) */}
          <Section title="Lesson Content (Notes, slides, links, etc.)" icon={ListChecks}>
            <Field label="Content body" hint="Use markdown. Embed links, slide URLs, or any reading material here.">
              <textarea
                rows={12} value={contentDraft}
                onChange={e => setContentDraft(e.target.value)}
                placeholder={`## Slides\n[View slides](https://docs.google.com/presentation/...)\n\n## Required reading\n- [Article 1](https://...)\n- [Article 2](https://...)\n\n## Notes\n- Key point 1\n- Key point 2`}
                className={`${inputCls} font-mono text-xs`}
              />
            </Field>
            <SaveButton saving={savingSection === 'content'} onClick={saveContent} label="Save content" />
          </Section>

          {/* Resources (Slides + Reading) */}
          <Section title="Resources (Slides, Articles, Docs)" icon={ListChecks}>
            <ResourcesEditor
              courseId={courseId!}
              weekId={weekId!}
              resources={week.readingResources || []}
              slideDecks={week.slideDecks || []}
              onChange={loadWeek}
            />
          </Section>

          {/* Glossary */}
          <Section title="Glossary" icon={ListChecks}>
            <GlossaryEditor
              courseId={courseId!}
              weekId={weekId!}
              terms={week.glossaryTerms || []}
              onChange={loadWeek}
            />
          </Section>

          {/* Quiz */}
          <Section title="Quiz" icon={FileQuestion}>
            <QuizEditor
              courseId={courseId!}
              weekId={weekId!}
              quiz={week.quiz}
              onChange={loadWeek}
            />
          </Section>

          {/* Assignments */}
          <Section title="Assignments" icon={Target}>
            <AssignmentEditor
              courseId={courseId!}
              weekId={weekId!}
              assignments={week.assignments}
              onChange={loadWeek}
            />
          </Section>

        </div>
      </main>
    </div>
  )
}

// ─── Small reusable bits ──────────────────────────────────────────────────

const inputCls =
  'w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C518]/40 transition-colors resize-y'

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <Icon size={16} className="text-[#F5C518]" /> {title}
      </h2>
      {children}
    </section>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/60 mb-1">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-white/30 mt-1">{hint}</p>}
    </div>
  )
}

function SaveButton({ saving, label, onClick }: { saving: boolean; label: string; onClick?: () => void }) {
  return (
    <button
      type={onClick ? 'button' : 'submit'}
      onClick={onClick}
      disabled={saving}
      className="inline-flex items-center gap-2 rounded-full bg-[#F5C518] px-5 py-2 text-sm font-semibold text-black disabled:opacity-40 hover:bg-[#E8B800] transition-colors"
    >
      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
      {label}
    </button>
  )
}

/**
 * Sortable row representing one video in the lesson's video list.
 *
 * The handle (the GripVertical icon on the far left) is the only element that
 * triggers a drag — the rest of the row stays click-friendly so the delete
 * button doesn't accidentally drag when you mean to click.
 */
function SortableVideoItem({
  id, position, title, url, description, onDelete, deleting, reorderInFlight,
}: {
  id: string
  position: number
  title: string
  url: string
  description: string | null
  onDelete: () => void
  deleting: boolean
  reorderInFlight: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
    zIndex: isDragging ? 10 : 'auto',
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-3 rounded-xl border bg-black/30 px-3 py-2.5 ${
        isDragging ? 'border-[#F5C518]/60 shadow-lg shadow-black/40' : 'border-white/10'
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        title="Drag to reorder"
        aria-label={`Drag video ${position} (${title}) to reorder`}
        className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-white/40 hover:text-white/70 transition-colors touch-none"
        disabled={reorderInFlight}
      >
        <GripVertical size={16} />
      </button>
      <div className="flex items-center gap-2 text-[10px] font-mono text-white/35 mt-1 shrink-0 w-6 text-center select-none">
        #{position}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{title}</p>
        <p className="text-xs text-white/40 truncate">{url}</p>
        {description && <p className="text-xs text-white/50 mt-1">{description}</p>}
      </div>
      <button
        onClick={onDelete}
        disabled={deleting}
        className="p-1.5 text-white/40 hover:text-red-400 transition-colors disabled:opacity-40 flex-shrink-0"
        title="Delete video"
      >
        {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      </button>
    </div>
  )
}
