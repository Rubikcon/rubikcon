import React, { useState } from 'react'
import { Link } from 'wouter'
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import AcademyNavbar from '../components/AcademyNavbar'
import AcademyFooter from '../components/AcademyFooter'
import { apiRequest } from '../lib/api'

export default function FacilitatorApplyPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    linkedinUrl: '',
    bio: '',
    whyJoin: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    
    try {
      await apiRequest('/academy/facilitator-applications', {
        method: 'POST',
        body: JSON.stringify(form)
      })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FBFAF6] text-[#0B0B0B] font-['Public_Sans',sans-serif]">
      {/* Mini Nav */}
      <div className="border-b border-[#0B0B0B]/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-['Bricolage_Grotesque'] font-bold text-xl tracking-tight hover:text-[#0B0B0B]/70 transition-colors">
            Rubikcon Nexus Academy
          </Link>
          <Link to="/facilitators" className="text-sm font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity">
            <ArrowLeft size={16} /> Back to Facilitators
          </Link>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-20 md:py-32">
        <div className="mb-12">
          <h1 className="font-['Bricolage_Grotesque'] font-extrabold text-5xl md:text-7xl leading-[1.1] tracking-tight mb-6">
            Become a <br /> Facilitator
          </h1>
          <p className="text-lg md:text-xl text-[#6B6B6B] max-w-2xl leading-relaxed">
            You have spent years mastering your craft. Now, get paid to pass it on. Fill out the application below to join our next cohort of instructors.
          </p>
        </div>

        {success ? (
          <div className="bg-[#E6BD00]/10 border-2 border-[#E6BD00] rounded-xl p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-[#E6BD00] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-[#0B0B0B]" />
            </div>
            <h2 className="font-['Bricolage_Grotesque'] font-bold text-3xl mb-4">Application Received</h2>
            <p className="text-[#0B0B0B]/70 max-w-md mx-auto">
              Thank you for applying to teach at Rubikcon Nexus Academy. Our team reviews applications weekly and will be in touch within a few days if your expertise is a fit.
            </p>
            <button 
              onClick={() => {
                setSuccess(false);
                setForm({name: '', email: '', linkedinUrl: '', bio: '', whyJoin: ''});
              }}
              className="mt-8 text-sm font-bold border-b-2 border-[#0B0B0B] pb-1 hover:text-[#0B0B0B]/60 hover:border-[#0B0B0B]/60 transition-colors"
            >
              Submit another application
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-sm font-bold uppercase tracking-wider text-[#0B0B0B]/60">Your Name *</label>
                <input 
                  type="text" 
                  required
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full bg-white border-2 border-[#0B0B0B]/20 rounded-none px-4 py-3 font-semibold focus:outline-none focus:border-[#E6BD00] transition-colors"
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold uppercase tracking-wider text-[#0B0B0B]/60">Email Address *</label>
                <input 
                  type="email" 
                  required
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full bg-white border-2 border-[#0B0B0B]/20 rounded-none px-4 py-3 font-semibold focus:outline-none focus:border-[#E6BD00] transition-colors"
                  placeholder="jane@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold uppercase tracking-wider text-[#0B0B0B]/60">LinkedIn Profile URL *</label>
              <input 
                type="url" 
                required
                value={form.linkedinUrl}
                onChange={(e) => setForm({...form, linkedinUrl: e.target.value})}
                className="w-full bg-white border-2 border-[#0B0B0B]/20 rounded-none px-4 py-3 font-semibold focus:outline-none focus:border-[#E6BD00] transition-colors"
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold uppercase tracking-wider text-[#0B0B0B]/60">Short Bio</label>
              <textarea 
                rows={4}
                value={form.bio}
                onChange={(e) => setForm({...form, bio: e.target.value})}
                className="w-full bg-white border-2 border-[#0B0B0B]/20 rounded-none px-4 py-3 font-semibold focus:outline-none focus:border-[#E6BD00] transition-colors resize-none"
                placeholder="Who are you and what is your expertise? (2-3 sentences)"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold uppercase tracking-wider text-[#0B0B0B]/60">What would you like to teach?</label>
              <textarea 
                rows={4}
                value={form.whyJoin}
                onChange={(e) => setForm({...form, whyJoin: e.target.value})}
                className="w-full bg-white border-2 border-[#0B0B0B]/20 rounded-none px-4 py-3 font-semibold focus:outline-none focus:border-[#E6BD00] transition-colors resize-none"
                placeholder="Share your proposed course title, target audience, and why you want to teach at Rubikcon."
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full md:w-auto bg-[#FFD200] hover:bg-[#E6BD00] text-[#0B0B0B] font-bold text-lg px-8 py-4 border-2 border-[#0B0B0B] shadow-[4px_4px_0px_0px_#0B0B0B] hover:shadow-[2px_2px_0px_0px_#0B0B0B] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={20} className="animate-spin" />}
                Submit Application
              </button>
            </div>
          </form>
        )}
      </main>
      
      {/* Light footer for this static page */}
      <footer className="border-t border-[#0B0B0B]/10 py-12 text-center text-[#6B6B6B] text-sm">
        <p>&copy; {new Date().getFullYear()} Rubikcon Nexus Academy. All rights reserved.</p>
      </footer>
    </div>
  )
}
