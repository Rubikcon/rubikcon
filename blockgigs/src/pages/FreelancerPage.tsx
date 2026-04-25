import { useParams } from 'wouter'
import { motion } from 'framer-motion'
import { ArrowLeft, Star, MapPin, CheckCircle, Clock, Briefcase, MessageCircle } from 'lucide-react'
import { FREELANCERS, GIGS } from '../data/gigsData'
import BlockGigsNavbar from '../components/BlockGigsNavbar'

export default function FreelancerPage() {
  const { id } = useParams<{ id: string }>()
  const fl = FREELANCERS.find(f => f.id === id)
  if (!fl) return (
    <div className="min-h-screen bg-[#080A0F] flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">👤</div>
        <h2 className="font-display text-xl font-bold mb-2">Freelancer Not Found</h2>
        <a href="/" className="text-amber-400 hover:underline text-sm">Browse Gigs</a>
      </div>
    </div>
  )

  const postedGigs = GIGS.filter(g => g.poster.id === fl.id)

  return (
    <div className="min-h-screen bg-[#080A0F]">
      <BlockGigsNavbar />
      <div className="pt-20 max-w-5xl mx-auto px-6 py-10">
        <a href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to Marketplace
        </a>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile sidebar */}
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-2xl p-6 text-center">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${fl.avatarColor} flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4`}>
                {fl.avatar}
              </div>
              <h1 className="font-display text-xl font-bold text-white mb-0.5">{fl.name}</h1>
              <div className="text-sm text-amber-400 font-mono mb-2">{fl.handle}</div>
              <div className="text-sm text-gray-400 mb-4">{fl.role}</div>
              <div className="flex justify-center gap-2 mb-4">
                {fl.topRated && <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full">⭐ Top Rated</span>}
                {fl.verified && <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-full">✓ Verified</span>}
              </div>
              <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity mb-3">
                <MessageCircle size={15} /> Contact
              </button>
              <a href="http://localhost:3000/signup" className="block w-full text-center text-sm text-gray-400 hover:text-white glass py-2.5 rounded-xl transition-colors">
                Hire for a Gig
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-white text-sm mb-4">Stats</h3>
              <div className="space-y-3">
                {[
                  { label: 'Rating', value: `${fl.rating} / 5.0`, icon: Star, color: 'text-amber-400' },
                  { label: 'Reviews', value: fl.reviews.toString(), icon: MessageCircle, color: 'text-cyan-400' },
                  { label: 'Completed Gigs', value: fl.completedGigs.toString(), icon: Briefcase, color: 'text-violet-400' },
                  { label: 'Hourly Rate', value: `$${fl.hourlyRate}/hr`, icon: Clock, color: 'text-green-400' },
                  { label: 'Location', value: fl.location, icon: MapPin, color: 'text-gray-400' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <s.icon size={12} className={s.color} />{s.label}
                    </span>
                    <span className="text-white font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-2xl p-6">
              <h2 className="font-display font-bold text-white mb-4">About</h2>
              <p className="text-sm text-gray-300 leading-relaxed">{fl.bio}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
              <h2 className="font-display font-bold text-white mb-4">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {fl.skills.map(s => (
                  <span key={s} className="px-3 py-1.5 rounded-xl text-sm bg-amber-500/10 text-amber-400 border border-amber-500/20">{s}</span>
                ))}
              </div>
            </motion.div>

            {postedGigs.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-6">
                <h2 className="font-display font-bold text-white mb-4">Active Gigs Posted</h2>
                <div className="space-y-3">
                  {postedGigs.map(gig => (
                    <a key={gig.id} href={`/gig/${gig.id}`}
                      className="flex items-start justify-between p-4 glass rounded-xl hover:bg-white/5 transition-colors group">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors mb-1">{gig.title}</div>
                        <div className="text-xs text-gray-500">{gig.category} · {gig.applicants} applicants · {gig.postedAt}</div>
                      </div>
                      <div className="text-sm font-bold text-amber-400 ml-4">
                        {gig.budgetType === 'hourly' ? `$${gig.budget}/hr` : `${gig.budget} ${gig.currency}`}
                      </div>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Mock reviews */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6">
              <h2 className="font-display font-bold text-white mb-4">Recent Reviews</h2>
              <div className="space-y-4">
                {[
                  { name: 'Protocol Labs', text: 'Exceptional work. Delivered on time and the code quality was impeccable. Would hire again.', rating: 5, ago: '2 weeks ago' },
                  { name: 'DeFi Collective', text: 'Very professional and communicative throughout. The smart contract passed our internal audit with zero critical findings.', rating: 5, ago: '1 month ago' },
                  { name: 'NFTworld DAO', text: 'Solid Web3 expertise. Fixed a complex reentrancy edge case we missed. Great to work with.', rating: 5, ago: '2 months ago' },
                ].map((r, i) => (
                  <div key={i} className="pb-4 border-b border-white/5 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: r.rating }).map((_, j) => (
                          <Star key={j} size={11} className="text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-medium text-gray-300">{r.name}</span>
                        <span>·</span>
                        <span>{r.ago}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
