import { useState } from 'react'
import { useParams } from 'wouter'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Clock, Users, MapPin, Star, CheckCircle, Shield, Zap, Send, ChevronDown } from 'lucide-react'
import { GIGS } from '../data/gigsData'
import BlockGigsNavbar from '../components/BlockGigsNavbar'

const currencyColor: Record<string, string> = {
  ETH: 'text-blue-400 bg-blue-500/10',
  USDC: 'text-green-400 bg-green-500/10',
  MATIC: 'text-violet-400 bg-violet-500/10',
}

const diffColor: Record<string, string> = {
  Entry: 'text-green-400 bg-green-500/10',
  Mid: 'text-amber-400 bg-amber-500/10',
  Senior: 'text-red-400 bg-red-500/10',
}

export default function GigDetailPage() {
  const { id } = useParams<{ id: string }>()
  const gig = GIGS.find(g => g.id === id)
  const [applying, setApplying] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [proposal, setProposal] = useState('')
  const [rate, setRate] = useState('')

  if (!gig) return (
    <div className="min-h-screen bg-[#080A0F] flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">💼</div>
        <h2 className="font-display text-xl font-bold mb-2">Gig Not Found</h2>
        <a href="/" className="text-amber-400 hover:underline text-sm">Browse Gigs</a>
      </div>
    </div>
  )

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setApplying(false)
  }

  return (
    <div className="min-h-screen bg-[#080A0F]">
      <BlockGigsNavbar />
      <div className="pt-20 max-w-6xl mx-auto px-6 py-10">
        {/* Back */}
        <a href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to Gigs
        </a>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {gig.featured && (
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full">
                    <Zap size={10} /> Featured
                  </span>
                )}
                <span className={`text-xs px-2.5 py-1 rounded-full ${diffColor[gig.difficulty]}`}>{gig.difficulty}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full ${currencyColor[gig.currency]}`}>{gig.currency}</span>
                {gig.remote && <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-gray-400">Remote</span>}
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">{gig.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Clock size={11} /> Deadline: {gig.deadline}</span>
                <span className="flex items-center gap-1"><Users size={11} /> {gig.applicants} applicants</span>
                <span>Posted {gig.postedAt}</span>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-8">
              <h2 className="font-display font-bold text-white mb-5">About this Gig</h2>
              <div className="space-y-3">
                {gig.longDescription.split('\n').map((line, i) => {
                  if (line.trim() === '') return <div key={i} className="h-2" />
                  if (line.startsWith('-')) return (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-amber-400 mt-1 flex-shrink-0">•</span>
                      <span>{line.slice(1).trim()}</span>
                    </div>
                  )
                  return <p key={i} className="text-sm text-gray-300 leading-relaxed">{line}</p>
                })}
              </div>
            </motion.div>

            {/* Requirements & Deliverables */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="grid md:grid-cols-2 gap-6">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                  <Shield size={15} className="text-cyan-400" /> Requirements
                </h3>
                <ul className="space-y-3">
                  {gig.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle size={13} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle size={15} className="text-amber-400" /> Deliverables
                </h3>
                <ul className="space-y-3">
                  {gig.deliverables.map((del, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-amber-400 font-mono text-xs mt-0.5 flex-shrink-0">{String(i + 1).padStart(2, '0')}.</span>
                      {del}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Skills */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6">
              <h3 className="font-display font-bold text-white mb-4">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {gig.skills.map(s => (
                  <span key={s} className="px-3 py-1.5 rounded-xl text-sm bg-amber-500/10 text-amber-400 border border-amber-500/20">{s}</span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Budget card */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="glass-strong rounded-2xl p-6">
              <div className="text-center mb-6">
                <div className={`font-display text-4xl font-bold mb-1 ${currencyColor[gig.currency].split(' ')[0]}`}>
                  {gig.budgetType === 'hourly' ? `$${gig.budget}/hr` : `${gig.budget} ${gig.currency}`}
                </div>
                <div className="text-xs text-gray-500 capitalize">{gig.budgetType} rate · Escrow protected</div>
              </div>

              {submitted ? (
                <div className="text-center py-4">
                  <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
                  <div className="font-display font-bold text-white mb-1">Application Sent!</div>
                  <div className="text-xs text-gray-400">The client will review and respond within 48 hours.</div>
                </div>
              ) : (
                <>
                  <button onClick={() => setApplying(!applying)}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                    Apply for this Gig
                    <ChevronDown size={15} className={`transition-transform ${applying ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {applying && (
                      <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }} onSubmit={handleApply} className="mt-4 space-y-3 overflow-hidden">
                        {gig.budgetType === 'hourly' && (
                          <div>
                            <label className="text-xs text-gray-400 block mb-1.5">Your Hourly Rate (USD)</label>
                            <input type="number" value={rate} onChange={e => setRate(e.target.value)} required
                              placeholder="e.g. 120" className="w-full glass px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none" />
                          </div>
                        )}
                        <div>
                          <label className="text-xs text-gray-400 block mb-1.5">Cover Letter / Proposal</label>
                          <textarea value={proposal} onChange={e => setProposal(e.target.value)} required rows={5}
                            placeholder="Describe your relevant experience and approach to this gig..."
                            className="w-full glass px-4 py-3 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none resize-none" />
                        </div>
                        <button type="submit"
                          className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl text-sm font-medium transition-colors">
                          <Send size={13} /> Submit Application
                        </button>
                        <p className="text-[10px] text-gray-600 text-center">
                          You need a <a href="http://localhost:3000/signup" className="text-amber-400 hover:underline">Rubikcon account</a> to apply.
                        </p>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </>
              )}

              <div className="mt-5 space-y-2 pt-4 border-t border-white/5">
                {[
                  { label: 'Escrow', value: 'Smart Contract Protected' },
                  { label: 'Payment', value: `On delivery in ${gig.currency}` },
                  { label: 'Dispute', value: 'DAO arbitration available' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-xs">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="text-gray-300">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Poster profile */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-white text-sm mb-4">Posted by</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gig.poster.avatarColor} flex items-center justify-center text-base font-bold text-white`}>
                  {gig.poster.avatar}
                </div>
                <div>
                  <div className="font-medium text-white text-sm">{gig.poster.name}</div>
                  <div className="text-xs text-amber-400 font-mono">{gig.poster.handle}</div>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">{gig.poster.bio}</p>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1"><Star size={10} className="text-amber-400 fill-amber-400" />{gig.poster.rating} ({gig.poster.reviews})</span>
                <span className="flex items-center gap-1"><MapPin size={10} />{gig.poster.location}</span>
              </div>
              <a href={`/freelancer/${gig.poster.id}`}
                className="block w-full text-center text-sm text-amber-400 hover:text-amber-300 transition-colors py-2 glass rounded-xl">
                View Full Profile
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
