import { useState, useEffect } from 'react'
import { apiRequest } from '../lib/api'
import { Plus, Edit2, Trash2, Loader2, Save, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react'

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
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-white/10 pb-4">
        <h2 className="text-sm font-semibold text-white">Testimonials</h2>
      </div>

      <TestimonialManager />
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
      .then(res => setTestimonials(res || []))
      .catch(err => console.error(err))
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

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await apiRequest(`/academy/admin/testimonials/${id}`, { 
        method: 'PUT', 
        body: JSON.stringify({ isActive: !current }) 
      })
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error updating testimonial')
    }
  }

  if (loading) return <div className="p-8 text-center text-white/50"><Loader2 className="animate-spin inline mr-2" /> Loading testimonials...</div>

  return (
    <div className="space-y-6">
      {/* Create New */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Plus size={16} className="text-[#F5C518]" />
            {editingId === 'new' ? 'Create Testimonial' : 'Add New Testimonial'}
          </h3>
          {editingId === 'new' ? (
            <button onClick={() => setEditingId(null)} className="text-white/50 hover:text-white/80"><X size={16}/></button>
          ) : (
            <button onClick={() => { setEditingId('new'); setEditForm({ isActive: true, position: 0 }) }} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
              Add New
            </button>
          )}
        </div>
        
        {editingId === 'new' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Name" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#F5C518]/50" />
              <input type="text" placeholder="Role/Company" value={editForm.role || ''} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#F5C518]/50" />
              <input type="url" placeholder="Photo URL" value={editForm.photoUrl || ''} onChange={e => setEditForm({ ...editForm, photoUrl: e.target.value })} className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#F5C518]/50" />
              <input type="number" placeholder="Position (order)" value={editForm.position || 0} onChange={e => setEditForm({ ...editForm, position: parseInt(e.target.value) || 0 })} className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#F5C518]/50" />
            </div>
            <textarea placeholder="Quote" rows={3} value={editForm.quote || ''} onChange={e => setEditForm({ ...editForm, quote: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#F5C518]/50" />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={editForm.isActive || false} onChange={e => setEditForm({ ...editForm, isActive: e.target.checked })} />
              <label htmlFor="isActive" className="text-sm text-white/70">Active (Visible on site)</label>
            </div>
            <button onClick={() => handleSave()} disabled={saving || !editForm.name || !editForm.quote} className="bg-[#F5C518] text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#E8B800] disabled:opacity-50">
              {saving ? 'Saving...' : 'Create Testimonial'}
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="space-y-4">
        {testimonials.sort((a,b) => a.position - b.position).map(t => (
          <div key={t.id} className={`bg-white/[0.02] border border-white/5 rounded-xl p-4 flex gap-4 ${!t.isActive ? 'opacity-50' : ''}`}>
            <div className="w-16 h-16 rounded-full bg-white/10 flex-shrink-0 overflow-hidden">
              {t.photoUrl ? <img src={t.photoUrl} alt={t.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="text-white/30" /></div>}
            </div>
            <div className="flex-grow">
              {editingId === t.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Name" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#F5C518]/50" />
                    <input type="text" placeholder="Role/Company" value={editForm.role || ''} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#F5C518]/50" />
                    <input type="url" placeholder="Photo URL" value={editForm.photoUrl || ''} onChange={e => setEditForm({ ...editForm, photoUrl: e.target.value })} className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#F5C518]/50" />
                    <input type="number" placeholder="Position" value={editForm.position || 0} onChange={e => setEditForm({ ...editForm, position: parseInt(e.target.value) || 0 })} className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#F5C518]/50" />
                  </div>
                  <textarea placeholder="Quote" rows={3} value={editForm.quote || ''} onChange={e => setEditForm({ ...editForm, quote: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#F5C518]/50" />
                  <div className="flex gap-2">
                    <button onClick={() => handleSave(t.id)} disabled={saving} className="bg-[#F5C518] text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#E8B800] disabled:opacity-50">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button onClick={() => { setEditingId(null); setEditForm({}) }} className="px-4 py-2 rounded-lg text-sm font-semibold text-white/70 hover:bg-white/10 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">{t.name}</h4>
                      <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-white/50">Pos: {t.position}</span>
                      {!t.isActive && <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded">Hidden</span>}
                    </div>
                    <p className="text-sm text-white/60">{t.role}</p>
                    <p className="text-sm text-white/80 mt-2 italic">"{t.quote}"</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleActive(t.id, t.isActive)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-white/70 transition-colors" title={t.isActive ? "Hide" : "Show"}>
                      {t.isActive ? <X size={16} /> : <CheckCircle2 size={16} />}
                    </button>
                    <button onClick={() => { setEditingId(t.id); setEditForm(t) }} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-white/70 transition-colors" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {testimonials.length === 0 && (
          <div className="text-center py-8 text-white/40 text-sm">No testimonials found. Add one above.</div>
        )}
      </div>
    </div>
  )
}
