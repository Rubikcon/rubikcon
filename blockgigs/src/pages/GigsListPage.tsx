import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, MapPin, Clock, Users, Star, Zap, TrendingUp, Shield } from 'lucide-react'
import { GIGS, FREELANCERS, CATEGORIES, CURRENCIES, DIFFICULTIES } from '../data/gigsData'
import BlockGigsNavbar from '../components/BlockGigsNavbar'

const diffColor: Record<string, string> = {
  Entry: 'text-green-400 bg-green-500/10',
  Mid: 'text-amber-400 bg-amber-500/10',
  Senior: 'text-red-400 bg-red-500/10',
}

const currencyColor: Record<string, string> = {
  ETH: 'text-blue-400',
  USDC: 'text-green-400',
  MATIC: 'text-violet-400',
}

export default function GigsListPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [currency, setCurrency] = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [view, setView] = useState<'gigs' | 'freelancers'>('gigs')

  const filteredGigs = GIGS.filter(g => {
    const q = search.toLowerCase()
    const matchSearch = g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q) || g.skills.some(s => s.toLowerCase().includes(q))
    const matchCat = category === 'All' || g.category === category
    const matchCurr = currency === 'All' || g.currency === currency
    const matchDiff = difficulty === 'All' || g.difficulty === difficulty
    return matchSearch && matchCat && matchCurr && matchDiff
  })

  const featuredGigs = filteredGigs.filter(g => g.featured)
  const regularGigs = filteredGigs.filter(g => !g.featured)

  return (
    <div className="min-h-screen bg-[#080A0F]">
      <BlockGigsNavbar />
      <div className="pt-20">
        {/* Hero */}
        <section className="relative py-16 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-48 bg-amber-500/8 rounded-full blur-3xl" />
          <div className="max-w-7xl mx-auto relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
              <div className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full mb-4">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                <span className="text-xs font-mono text-amber-400 tracking-widest uppercase">Decentralized Marketplace</span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
                Work in <span className="text-gradient-amber">Web3.</span><br />Get Paid in Crypto.
              </h1>
              <p className="text-gray-400 max-w-xl mx-auto">
                Trustless escrow. Instant payments. No middlemen. Connect with the best Web3 talent on-chain.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-6 mb-10">
              {[
                { icon: TrendingUp, label: 'Active Gigs', value: '500+', color: 'text-amber-400' },
                { icon: Users, label: 'Verified Freelancers', value: '1,200+', color: 'text-cyan-400' },
                { icon: Shield, label: 'Total Paid Out', value: '$2.4M', color: 'text-green-400' },
                { icon: Zap, label: 'Avg Response Time', value: '< 2h', color: 'text-violet-400' },
              ].map(s => (
                <div key={s.label} className="glass px-5 py-3 rounded-xl flex items-center gap-3">
                  <s.icon size={16} className={s.color} />
                  <div>
                    <div className="font-display font-bold text-white">{s.value}</div>
                    <div className="text-[10px] text-gray-500">{s.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Search bar */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="relative max-w-2xl mx-auto">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search gigs, skills, or keywords..."
                className="w-full glass-strong pl-11 pr-4 py-4 rounded-2xl text-sm text-white placeholder:text-gray-600 focus:outline-none border-white/10"
              />
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 pb-20">
          {/* View toggle + filters */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center justify-between">
            {/* Tab toggle */}
            <div className="glass p-1 rounded-xl flex">
              <button onClick={() => setView('gigs')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${view === 'gigs' ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:text-white'}`}>
                Gigs ({GIGS.length})
              </button>
              <button onClick={() => setView('freelancers')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${view === 'freelancers' ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:text-white'}`}>
                Freelancers ({FREELANCERS.length})
              </button>
            </div>

            {/* Filters */}
            {view === 'gigs' && (
              <div className="flex flex-wrap gap-2 items-center">
                <Filter size={13} className="text-gray-500" />
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${category === c ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'glass text-gray-400 hover:text-white'}`}>
                    {c}
                  </button>
                ))}
                <div className="w-px h-4 bg-white/10" />
                {CURRENCIES.map(c => (
                  <button key={c} onClick={() => setCurrency(c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${currency === c ? 'bg-white/10 text-white border border-white/20' : 'glass text-gray-500 hover:text-white'}`}>
                    {c}
                  </button>
                ))}
                <div className="w-px h-4 bg-white/10" />
                {DIFFICULTIES.map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${difficulty === d ? 'bg-white/10 text-white border border-white/20' : 'glass text-gray-500 hover:text-white'}`}>
                    {d}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* GIGS VIEW */}
          {view === 'gigs' && (
            <div>
              {/* Featured gigs */}
              {featuredGigs.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap size={14} className="text-amber-400" />
                    <h2 className="font-display font-semibold text-white text-sm">Featured Gigs</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    {featuredGigs.map((gig, i) => (
                      <GigCard key={gig.id} gig={gig} i={i} featured />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular gigs */}
              {regularGigs.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="font-display font-semibold text-white text-sm">All Gigs</h2>
                    <span className="text-xs text-gray-500">({regularGigs.length} results)</span>
                  </div>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {regularGigs.map((gig, i) => (
                      <GigCard key={gig.id} gig={gig} i={i} featured={false} />
                    ))}
                  </div>
                </div>
              )}

              {filteredGigs.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-4xl mb-3">💼</div>
                  <p className="text-gray-500 text-sm">No gigs match your filters.</p>
                  <button onClick={() => { setSearch(''); setCategory('All'); setCurrency('All'); setDifficulty('All') }}
                    className="mt-3 text-amber-400 text-sm hover:underline">Clear filters</button>
                </div>
              )}
            </div>
          )}

          {/* FREELANCERS VIEW */}
          {view === 'freelancers' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FREELANCERS.map((fl, i) => (
                <motion.div key={fl.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="glass rounded-2xl p-6 hover:bg-white/5 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${fl.avatarColor} flex items-center justify-center text-lg font-bold text-white`}>
                      {fl.avatar}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {fl.topRated && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">Top Rated</span>}
                      {fl.verified && <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20">✓ Verified</span>}
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-white">{fl.name}</h3>
                  <p className="text-xs text-amber-400 font-mono mb-1">{fl.handle}</p>
                  <p className="text-xs text-gray-400 mb-3">{fl.role}</p>
                  <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Star size={10} className="text-amber-400 fill-amber-400" />{fl.rating}</span>
                    <span>·</span>
                    <span>{fl.reviews} reviews</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><MapPin size={9} />{fl.location}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {fl.skills.slice(0, 4).map(s => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{s}</span>
                    ))}
                    {fl.skills.length > 4 && <span className="text-[10px] text-gray-600">+{fl.skills.length - 4}</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-white">${fl.hourlyRate}</span>
                      <span className="text-xs text-gray-500">/hr</span>
                    </div>
                    <a href={`/freelancer/${fl.id}`}
                      className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium">
                      View Profile →
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function GigCard({ gig, i, featured }: { gig: ReturnType<typeof import('../data/gigsData')['GIGS'][0]['skills']['map']> extends never ? never : import('../data/gigsData').Gig; i: number; featured: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
      className={`glass rounded-2xl p-6 hover:bg-white/4 transition-all group ${featured ? 'border border-amber-500/20' : ''}`}>
      {featured && (
        <div className="flex items-center gap-1.5 mb-3">
          <Zap size={11} className="text-amber-400" />
          <span className="text-[10px] font-medium text-amber-400 uppercase tracking-widest">Featured</span>
        </div>
      )}
      <div className="flex items-start justify-between gap-3 mb-3">
        <a href={`/gig/${gig.id}`} className="font-display font-bold text-white text-base leading-snug hover:text-amber-400 transition-colors group-hover:text-amber-400">
          {gig.title}
        </a>
        <div className="flex-shrink-0 text-right">
          <div className={`font-display font-bold text-lg ${currencyColor[gig.currency]}`}>
            {gig.budgetType === 'hourly' ? `$${gig.budget}/hr` : `${gig.budget} ${gig.currency}`}
          </div>
          <div className="text-[10px] text-gray-600 capitalize">{gig.budgetType}</div>
        </div>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">{gig.description}</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {gig.skills.slice(0, 5).map(s => (
          <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{s}</span>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 rounded-full font-medium ${diffColor[gig.difficulty]}`}>{gig.difficulty}</span>
          <span className="flex items-center gap-1"><Clock size={10} />{gig.deadline}</span>
          <span className="flex items-center gap-1"><Users size={10} />{gig.applicants} applied</span>
        </div>
        <span className="text-gray-600">{gig.postedAt}</span>
      </div>
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${gig.poster.avatarColor} flex items-center justify-center text-[10px] font-bold text-white`}>
            {gig.poster.avatar}
          </div>
          <span className="text-xs text-gray-400">{gig.poster.name}</span>
        </div>
        <a href={`/gig/${gig.id}`}
          className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors">
          View Details →
        </a>
      </div>
    </motion.div>
  )
}
