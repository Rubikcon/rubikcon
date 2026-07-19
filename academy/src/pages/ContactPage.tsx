import { FormEvent, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Linkedin, Loader2, Mail, Phone, Send } from 'lucide-react'
import AcademyNavbar from '../components/AcademyNavbar'
import AcademyFooter from '../components/AcademyFooter'
import { apiRequest } from '../lib/api'

// Content source: June 2026 website content brief, §4 "Contact Us".

const SUBJECTS = [
  'General Enquiry',
  'Enrolment Question',
  'Partnership or Collaboration',
  'Funded Cohort Request',
  'Media or Press',
] as const

const WHO_SHOULD_CONTACT = [
  'Prospective learners',
  'NGOs and non-profit organisations',
  'MSMEs and growing businesses',
  'Universities and educational institutions',
  'Corporate partners',
  'Development organisations and funders',
  'Media and community partners',
]

interface ContactForm {
  fullName: string
  email: string
  subject: string
  message: string
  bot_catch: string // Honeypot field
}

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>({ fullName: '', email: '', subject: '', message: '', bot_catch: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    
    // Honeypot check: If a bot fills out this hidden field, silently return success
    if (form.bot_catch) {
      setSubmitted(true)
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      await apiRequest('/academy/contact', {
        method: 'POST',
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          subject: form.subject,
          message: form.message
        })
      })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = 'w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#F5C518]/50 transition-colors'

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AcademyNavbar dark solid />

      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="relative py-16 px-6 overflow-hidden">
          <div className="absolute -top-40 left-1/3 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />
          <div className="relative max-w-3xl mx-auto text-center">
            <p className="text-xs font-mono text-[#F5C518] tracking-widest uppercase mb-5">Contact us</p>
            <h1 className="font-display font-extrabold text-white leading-tight mb-5" style={{ fontSize: 'clamp(32px, 4.5vw, 52px)' }}>
              Get in Touch
            </h1>
            <p className="text-white/50 text-base leading-relaxed">
              Whether you're interested in joining a programme, partnering with us, sponsoring a cohort, or simply
              learning more about Rubikcon Nexus Academy, we'd love to hear from you. Complete the form below and a
              member of our team will get back to you as soon as possible.
            </p>
          </div>
        </section>

        <section className="px-6">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.4fr_1fr] gap-8">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[28px] border border-white/10 bg-white/[0.03] p-7 md:p-9"
            >
              {submitted ? (
                <div className="py-16 text-center">
                  <CheckCircle2 size={44} className="text-[#F5C518] mx-auto mb-5" />
                  <h2 className="font-display text-2xl font-extrabold text-white mb-3">Message received</h2>
                  <p className="text-white/55 text-sm leading-relaxed max-w-md mx-auto">
                    Thank you for contacting Rubikcon Nexus Academy. Your message has been received, and a member of
                    our team will respond within 2 business days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="font-display text-xl font-extrabold text-white">Send Us a Message</h2>
                  {error && (
                    <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                      {error}
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-5">
                    {/* Honeypot Field - Hidden from real users */}
                    <div aria-hidden="true" className="hidden opacity-0 absolute pointer-events-none -left-[9999px] -z-50" tabIndex={-1}>
                      <label htmlFor="bot_catch">Don't fill this out if you're human:</label>
                      <input
                        id="bot_catch"
                        name="bot_catch"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={form.bot_catch}
                        onChange={e => setForm(f => ({ ...f, bot_catch: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-1.5">Full Name *</label>
                      <input
                        value={form.fullName}
                        onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                        required
                        minLength={2}
                        placeholder="Your full name"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        required
                        placeholder="you@example.com"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">Subject *</label>
                    <select
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      required
                      className={`${inputClass} bg-[#0A0A0A] [&>option]:bg-[#0A0A0A]`}
                    >
                      <option value="" disabled>Select a subject…</option>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">Message *</label>
                    <textarea
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      required
                      minLength={10}
                      rows={6}
                      placeholder="Tell us a bit about what you need…"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-bold px-7 py-3.5 rounded-full hover:bg-[#E8B800] transition-colors disabled:opacity-50 text-[15px]"
                  >
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    {submitting ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Contact info sidebar */}
            <div className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="rounded-[28px] border border-white/10 bg-white/[0.03] p-7"
              >
                <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-5">Contact information</p>
                <ul className="space-y-4 text-sm">
                  <li>
                    <a href="mailto:rubikconnexus@gmail.com" className="inline-flex items-center gap-2.5 text-white/60 hover:text-[#F5C518] transition-colors">
                      <Mail size={15} className="text-[#F5C518] shrink-0" /> rubikconnexus@gmail.com
                    </a>
                  </li>
                  <li>
                    <a href="tel:+233535832843" className="inline-flex items-center gap-2.5 text-white/60 hover:text-[#F5C518] transition-colors">
                      <Phone size={15} className="text-[#F5C518] shrink-0" /> +233 535 832843 (Ghana) — Call / WhatsApp
                    </a>
                  </li>
                  <li>
                    <a href="tel:+2348107678025" className="inline-flex items-center gap-2.5 text-white/60 hover:text-[#F5C518] transition-colors">
                      <Phone size={15} className="text-[#F5C518] shrink-0" /> +234 810 767 8025 (Nigeria) — Call / WhatsApp
                    </a>
                  </li>
                </ul>
                <a
                  href="https://www.linkedin.com/company/rubicon-consults/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/70 hover:border-[#F5C518]/40 hover:text-[#F5C518] transition-colors"
                >
                  <Linkedin size={14} /> Visit Our LinkedIn Page
                </a>
                <p className="mt-5 text-xs text-white/35 leading-relaxed">
                  We aim to respond to all enquiries within 2 business days. For partnership requests, funded cohorts,
                  or institutional collaborations, additional time may be required depending on the nature of the enquiry.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="rounded-[28px] border border-white/10 bg-white/[0.03] p-7"
              >
                <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-5">Who should contact us?</p>
                <ul className="space-y-2.5">
                  {WHO_SHOULD_CONTACT.map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-white/55 leading-relaxed">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F5C518] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Let's build together */}
        <section className="px-6 mt-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-4">Let's Build Together</h2>
            <p className="text-white/50 text-base leading-relaxed">
              Rubikcon Nexus Academy exists to make practical technology education accessible and impactful across
              Africa. Whether you're looking to learn, partner, sponsor, or collaborate, we'd be happy to explore
              opportunities together.
            </p>
          </div>
        </section>
      </main>

      <AcademyFooter />
    </div>
  )
}
