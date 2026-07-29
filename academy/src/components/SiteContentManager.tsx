import { useState, useEffect } from 'react'
import { apiRequest } from '../lib/api'
import { Plus, Edit2, Trash2, Loader2, Save, X, Image as ImageIcon } from 'lucide-react'

type Facilitator = {
  id: string
  name: string
  email: string
  title: string | null
  organization: string | null
  bio: string | null
  linkedinUrl: string | null
  photoUrl: string | null
}

type Testimonial = {
  id: string
  name: string
  role: string | null
  quote: string
  photoUrl: string | null
  isActive: boolean
  position: number
}

export default function SiteContentManager() {
  const [activeTab, setActiveTab] = useState<'facilitators' | 'testimonials'>('facilitators')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('facilitators')}
          className={`text-sm font-semibold transition-colors ${
            activeTab === 'facilitators' ? 'text-white border-b-2 border-[#F5C518] pb-4 -mb-[18px]' : 'text-white/50 hover:text-white/80'
          }`}
        >
          Facilitators
        </button>
        <button
          onClick={() => setActiveTab('testimonials')}
          className={`text-sm font-semibold transition-colors ${
            activeTab === 'testimonials' ? 'text-white border-b-2 border-[#F5C518] pb-4 -mb-[18px]' : 'text-white/50 hover:text-white/80'
          }`}
        >
          Testimonials
        </button>
      </div>

      {activeTab === 'facilitators' ? <FacilitatorManager /> : <TestimonialManager />}
    </div>
  )
}

function FacilitatorManager() {
  const [facilitators, setFacilitators] = useState<Facilitator[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Facilitator>>({})
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    apiRequest<Facilitator[]>('/academy/admin/facilitators')
      .then(setFacilitators)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSave = async (id?: string) => {
    setSaving(true)
    try {
      if (id) {
        await apiRequest(`/academy/admin/facilitators/${id}`, { method: 'PUT', body: JSON.stringify(editForm) })
      } else {
        await apiRequest('/academy/admin/facilitators', { method: 'POST', body: JSON.stringify(editForm) })
      }
      setEditingId(null)
      setEditForm({})
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error saving facilitator')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this facilitator?')) return
    try {
      await apiRequest(`/academy/admin/facilitators/${id}`, { method: 'DELETE' })
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting facilitator')
    }
  }

  if (loading) return <div className="p-8 text-center text-white/50"><Loader2 className="animate-spin inline mr-2" /> Loading facilitators...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Manage Facilitators</h3>
        <button
          onClick={() => {
            setEditingId('new')
            setEditForm({ name: '', email: '', title: '', organization: '', bio: '', linkedinUrl: '', photoUrl: '' })
          }}
          disabled={editingId !== null}
          className="inline-flex items-center gap-2 rounded-full bg-[#F5C518] px-4 py-2 text-sm font-semibold text-[#0A0A0A] hover:bg-[#E8B800] disabled:opacity-50"
        >
          <Plus size={16} /> Add Facilitator
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {editingId === 'new' && (
          <FacilitatorForm form={editForm} setForm={setEditForm} onSave={() => handleSave()} onCancel={() => setEditingId(null)} saving={saving} />
        )}
        
        {facilitators.map(f => (
          editingId === f.id ? (
            <FacilitatorForm key={f.id} form={editForm} setForm={setEditForm} onSave={() => handleSave(f.id)} onCancel={() => setEditingId(null)} saving={saving} />
          ) : (
            <div key={f.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <img src={f.photoUrl || '/placeholders/testimonial-fallback.jpg'} alt="" className="w-12 h-12 rounded-full object-cover shrink-0 bg-white/10" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white truncate">{f.name}</h4>
                  <p className="text-xs text-white/50 truncate">{f.title || 'No Title'}</p>
                </div>
              </div>
              <p className="text-sm text-white/70 flex-1">{f.organization || 'No Organization'}</p>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/10">
                <button onClick={() => { setEditingId(f.id); setEditForm(f) }} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(f.id)} className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  )
}

function FacilitatorForm({ form, setForm, onSave, onCancel, saving }: { form: Partial<Facilitator>, setForm: (f: Partial<Facilitator>) => void, onSave: () => void, onCancel: () => void, saving: boolean }) {
  return (
    <div className="rounded-2xl border border-[#F5C518]/30 bg-white/5 p-5 flex flex-col gap-3">
      <input type="text" placeholder="Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]" />
      <input type="email" placeholder="Email (Required)" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]" />
      <input type="text" placeholder="Title" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]" />
      <input type="text" placeholder="Organization" value={form.organization || ''} onChange={e => setForm({ ...form, organization: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]" />
      <input type="text" placeholder="Photo URL" value={form.photoUrl || ''} onChange={e => setForm({ ...form, photoUrl: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]" />
      <input type="text" placeholder="LinkedIn URL" value={form.linkedinUrl || ''} onChange={e => setForm({ ...form, linkedinUrl: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]" />
      <textarea placeholder="Bio" value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518] resize-none" />
      <div className="flex justify-end gap-2 mt-2">
        <button onClick={onCancel} disabled={saving} className="px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
        <button onClick={onSave} disabled={saving || !form.name || !form.email} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#F5C518] text-[#0A0A0A] hover:bg-[#E8B800] rounded-lg disabled:opacity-50 transition-colors">{saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save</button>
      </div>
    </div>
  )
}

function TestimonialManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Testimonial>>({})
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    apiRequest<Testimonial[]>('/academy/admin/testimonials')
      .then(setTestimonials)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSave = async (id?: string) => {
    setSaving(true)
    try {
      if (id) {
        await apiRequest(`/academy/admin/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(editForm) })
      } else {
        await apiRequest('/academy/admin/testimonials', { method: 'POST', body: JSON.stringify(editForm) })
      }
      setEditingId(null)
      setEditForm({})
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error saving testimonial')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return
    try {
      await apiRequest(`/academy/admin/testimonials/${id}`, { method: 'DELETE' })
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting testimonial')
    }
  }

  if (loading) return <div className="p-8 text-center text-white/50"><Loader2 className="animate-spin inline mr-2" /> Loading testimonials...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Manage Testimonials</h3>
        <button
          onClick={() => {
            setEditingId('new')
            setEditForm({ name: '', role: '', quote: '', photoUrl: '', isActive: true, position: testimonials.length })
          }}
          disabled={editingId !== null}
          className="inline-flex items-center gap-2 rounded-full bg-[#F5C518] px-4 py-2 text-sm font-semibold text-[#0A0A0A] hover:bg-[#E8B800] disabled:opacity-50"
        >
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {editingId === 'new' && (
          <TestimonialForm form={editForm} setForm={setEditForm} onSave={() => handleSave()} onCancel={() => setEditingId(null)} saving={saving} />
        )}
        
        {testimonials.map(t => (
          editingId === t.id ? (
            <TestimonialForm key={t.id} form={editForm} setForm={setEditForm} onSave={() => handleSave(t.id)} onCancel={() => setEditingId(null)} saving={saving} />
          ) : (
            <div key={t.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <img src={t.photoUrl || '/placeholders/testimonial-fallback.jpg'} alt="" className="w-12 h-12 rounded-full object-cover shrink-0 bg-white/10" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white truncate">{t.name}</h4>
                  <p className="text-xs text-white/50 truncate">{t.role || 'No Role'}</p>
                </div>
              </div>
              <blockquote className="text-sm text-white/80 italic border-l-2 border-[#F5C518] pl-3">
                "{t.quote}"
              </blockquote>
              <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-white/10">
                <button onClick={() => { setEditingId(t.id); setEditForm(t) }} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(t.id)} className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  )
}

function TestimonialForm({ form, setForm, onSave, onCancel, saving }: { form: Partial<Testimonial>, setForm: (t: Partial<Testimonial>) => void, onSave: () => void, onCancel: () => void, saving: boolean }) {
  return (
    <div className="rounded-2xl border border-[#F5C518]/30 bg-white/5 p-5 flex flex-col gap-3">
      <input type="text" placeholder="Name (Required)" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]" />
      <input type="text" placeholder="Role" value={form.role || ''} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]" />
      <textarea placeholder="Quote (Required)" value={form.quote || ''} onChange={e => setForm({ ...form, quote: e.target.value })} rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518] resize-none" />
      <input type="text" placeholder="Photo URL" value={form.photoUrl || ''} onChange={e => setForm({ ...form, photoUrl: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C518]" />
      <div className="flex justify-end gap-2 mt-2">
        <button onClick={onCancel} disabled={saving} className="px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
        <button onClick={onSave} disabled={saving || !form.name || !form.quote} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#F5C518] text-[#0A0A0A] hover:bg-[#E8B800] rounded-lg disabled:opacity-50 transition-colors">{saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save</button>
      </div>
    </div>
  )
}
