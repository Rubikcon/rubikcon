import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, ArrowRight, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate send — wire to your backend or EmailJS/Resend later
    await new Promise(r => setTimeout(r, 1200))
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="pt-[72px]">

      {/* ── CONTACT FORM SECTION ───────────────────────────────────── */}
      <section className="bg-[#111111] py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Left: info */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="font-display text-4xl font-bold text-white mb-3">Contact Us</h1>
              <p className="text-[#888888] text-sm mb-10">Reach out to us via our contact details or fill the short form</p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full border border-[#2A2A2A] flex items-center justify-center flex-shrink-0">
                    <Phone size={15} className="text-[#F5C518]" />
                  </div>
                  <div>
                    <div className="text-xs text-[#888888] mb-0.5">Hot-line</div>
                    <a href="tel:+2338231338932" className="text-sm text-white hover:text-[#F5C518] transition-colors">
                      +233-823-133-8932
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full border border-[#2A2A2A] flex items-center justify-center flex-shrink-0">
                    <Mail size={15} className="text-[#F5C518]" />
                  </div>
                  <div>
                    <div className="text-xs text-[#888888] mb-0.5">Email</div>
                    <a href="mailto:info.rubiconconsulting@gmail.com" className="text-sm text-white hover:text-[#F5C518] transition-colors break-all">
                      info.rubiconconsulting@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: form */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8">
              <h2 className="font-display text-lg font-bold text-white mb-6">Let's Get in Touch with You</h2>

              {sent ? (
                <div className="text-center py-8">
                  <CheckCircle size={40} className="text-[#F5C518] mx-auto mb-3" />
                  <div className="font-semibold text-white mb-1">Message Sent!</div>
                  <div className="text-sm text-[#888888]">We'll get back to you within 24 hours.</div>
                  <button onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }) }}
                    className="mt-4 text-sm text-[#F5C518] hover:underline">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Name" required
                      className="w-full bg-transparent border-b border-[#3A3A3A] text-sm text-white placeholder:text-[#555555] py-3 focus:outline-none focus:border-[#F5C518] transition-colors" />
                  </div>
                  <div>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="Email Address" required
                      className="w-full bg-transparent border-b border-[#3A3A3A] text-sm text-white placeholder:text-[#555555] py-3 focus:outline-none focus:border-[#F5C518] transition-colors" />
                  </div>
                  <div>
                    <input type="text" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="Message (Optional)"
                      className="w-full bg-transparent border-b border-[#3A3A3A] text-sm text-white placeholder:text-[#555555] py-3 focus:outline-none focus:border-[#F5C518] transition-colors" />
                  </div>
                  <div className="pt-2">
                    <button type="submit" disabled={loading}
                      className="btn-gold disabled:opacity-60 disabled:cursor-not-allowed">
                      {loading ? 'Sending...' : <><span>Send</span> <ArrowRight size={14} /></>}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SCHEDULE CONSULTATION ─────────────────────────────────── */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0">
          {/* REPLACE:  */}
          <img src="/images/down.jpg" className="w-full h-full object-cover opacity-20" />
          {/* <div className="img-placeholder w-full h-full opacity-10" style={{ borderRadius: 0, border: 'none' }}>
            <span className="text-[10px]">[ Schedule consultation section background image ]</span>
          </div> */}
          <div className="absolute inset-0 bg-[#0A0A0A]/80" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Schedule a Consultation with Us
          </h2>
          <p className="text-[#CCCCCC] text-sm leading-relaxed mb-8">
            Ask Questions, Discuss Your Project's Needs &amp; Learn How We've Helped Other Businesses Scale Successfully
          </p>
          {/* REPLACE href with your actual Calendly/Cal.com booking link */}
          <a href="https://calendly.com" target="_blank" rel="noopener noreferrer"
            className="btn-gold px-8 py-3 text-base">
            Book a Meeting <ArrowRight size={16} />
          </a>
          <p className="text-xs text-[#555555] mt-3">[ Replace booking link with your actual Calendly URL ]</p>
        </motion.div>
      </section>

    </div>
  )
}
