import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Trophy, Zap, Search, Crown } from 'lucide-react'
import { GAMES, LEADERBOARD, getOrCreateSession } from '../data/gamesData'
import GamesNavbar from '../components/GamesNavbar'

const CATEGORIES = ['All', 'Strategy', 'Puzzle', 'Arcade', 'Finance', 'Trading']
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard']

const diffColor: Record<string, string> = {
  Easy: 'text-green-400 bg-green-500/10',
  Medium: 'text-amber-400 bg-amber-500/10',
  Hard: 'text-red-400 bg-red-500/10',
}

export default function GameListPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const session = getOrCreateSession()

  const filtered = GAMES.filter(g => {
    const matchesSearch = g.title.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase())
    const matchesCat = category === 'All' || g.category === category
    const matchesDiff = difficulty === 'All' || g.difficulty === difficulty
    return matchesSearch && matchesCat && matchesDiff
  })

  const totalPlayers = GAMES.reduce((a, g) => a + g.players, 0)
  const liveGames = GAMES.filter(g => g.live).length

  return (
    <div className="min-h-screen bg-[#080A0F]">
      <GamesNavbar />
      <div className="pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden py-16 px-6">
          <div className="absolute inset-0 bg-grid-pattern" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-48 bg-violet-500/8 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-mono text-green-400 tracking-widest uppercase">{liveGames} Games Live</span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
                Play.<br /><span className="text-gradient-violet">Compete. Win.</span>
              </h1>
              <p className="text-gray-400 max-w-xl mx-auto">
                No wallet required. Jump in anonymously, climb the leaderboard, and convert your session to a full account to lock in your scores on-chain.
              </p>
            </motion.div>

            {/* Stats row */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-6 mb-12">
              {[
                { icon: Users, label: 'Active Players', value: totalPlayers.toLocaleString(), color: 'text-violet-400' },
                { icon: Zap, label: 'Live Games', value: liveGames.toString(), color: 'text-green-400' },
                { icon: Trophy, label: 'Top Prize', value: '#1 NFT Badge', color: 'text-amber-400' },
              ].map(s => (
                <div key={s.label} className="glass px-6 py-4 rounded-xl flex items-center gap-3">
                  <s.icon size={18} className={s.color} />
                  <div>
                    <div className="font-display font-bold text-white text-lg">{s.value}</div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Session pill */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="flex justify-center mb-8">
              <div className="glass px-4 py-2 rounded-full flex items-center gap-2 text-xs text-gray-400">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                Anonymous session: <span className="font-mono text-cyan-400">{session.id.slice(0, 8)}…</span>
                <a href="http://localhost:3000/signup" className="text-violet-400 hover:underline ml-1">Save progress →</a>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main game grid */}
            <div className="lg:col-span-3">
              {/* Filters */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search games..."
                    className="w-full glass pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setCategory(c)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${category === c ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'glass text-gray-400 hover:text-white'}`}>
                      {c}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {DIFFICULTIES.map(d => (
                    <button key={d} onClick={() => setDifficulty(d)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${difficulty === d ? 'bg-white/10 text-white border border-white/20' : 'glass text-gray-500 hover:text-white'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Games Grid */}
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((game, i) => (
                  <motion.div key={game.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
                    className={`relative group glass rounded-2xl overflow-hidden border ${game.border} hover:glow-violet transition-all duration-400`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-100 transition-opacity duration-400`} />

                    <div className="relative p-6">
                      {/* Live badge */}
                      {game.live && (
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-2.5 py-1">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-[10px] font-medium text-green-400">LIVE</span>
                        </div>
                      )}

                      <div className="text-4xl mb-4">{game.emoji}</div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-display font-bold text-white text-lg">{game.title}</h3>
                      </div>
                      <div className="flex gap-2 mb-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${game.badge}`}>{game.category}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${diffColor[game.difficulty]}`}>{game.difficulty}</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed mb-5">{game.description}</p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Users size={11} /> <span>{game.players.toLocaleString()} played</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-amber-400">
                          <Trophy size={11} /> <span className="font-mono">{game.topScore.toLocaleString()}</span>
                        </div>
                      </div>

                      <a href={`/play/${game.id}`}
                        className={`block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all
                          bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:opacity-90 hover:scale-105`}>
                        Play Now
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                  <div className="text-4xl mb-3">🎮</div>
                  <p className="text-sm">No games match your filters.</p>
                  <button onClick={() => { setSearch(''); setCategory('All'); setDifficulty('All') }}
                    className="mt-3 text-violet-400 text-sm hover:underline">Clear filters</button>
                </div>
              )}
            </div>

            {/* Sidebar: Leaderboard */}
            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                className="glass-strong rounded-2xl overflow-hidden sticky top-24">
                <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
                  <Crown size={16} className="text-amber-400" />
                  <h3 className="font-display font-bold text-white">Leaderboard</h3>
                </div>
                <ul className="divide-y divide-white/5">
                  {LEADERBOARD.map((entry) => (
                    <li key={entry.rank} className="px-5 py-4 flex items-center gap-3">
                      <span className={`font-display font-bold text-sm w-5 ${entry.rank === 1 ? 'text-amber-400' : entry.rank === 2 ? 'text-gray-300' : entry.rank === 3 ? 'text-amber-700' : 'text-gray-600'}`}>
                        {entry.rank}
                      </span>
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${entry.color} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                        {entry.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{entry.name}</div>
                        <div className="text-[10px] text-gray-500">{entry.game}</div>
                      </div>
                      <div className="text-xs font-mono text-amber-400">{(entry.score / 1000).toFixed(0)}K</div>
                    </li>
                  ))}
                </ul>
                <div className="px-5 py-4 border-t border-white/5">
                  <p className="text-xs text-gray-500 text-center">Updated every 60 seconds</p>
                </div>
              </motion.div>

              {/* Session scores */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                className="glass rounded-2xl p-5 mt-4">
                <h4 className="font-display font-semibold text-white text-sm mb-3">Your Session</h4>
                {Object.keys(session.scores).length === 0 ? (
                  <p className="text-xs text-gray-500">Play a game to see your scores here.</p>
                ) : (
                  <ul className="space-y-2">
                    {Object.entries(session.scores).map(([gid, score]) => {
                      const game = GAMES.find(g => g.id === gid)
                      return (
                        <li key={gid} className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">{game?.emoji} {game?.title || gid}</span>
                          <span className="font-mono text-violet-400">{score.toLocaleString()}</span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
