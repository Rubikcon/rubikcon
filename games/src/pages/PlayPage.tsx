import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'wouter'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Trophy, RotateCcw, Zap, Timer, Star } from 'lucide-react'
import { GAMES, saveScore, getHighScore } from '../data/gamesData'
import GamesNavbar from '../components/GamesNavbar'

// ─── Generic game engine (Hash Runner) ───────────────────────────────────────
function HashRunnerGame({ onScore }: { onScore: (s: number) => void }) {
  const [target, setTarget] = useState(0)
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [started, setStarted] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [combo, setCombo] = useState(0)

  const newTarget = useCallback(() => {
    setTarget(Math.floor(Math.random() * 9000) + 1000)
    setInput('')
    setFeedback(null)
  }, [])

  useEffect(() => { newTarget() }, [])

  useEffect(() => {
    if (!started) return
    if (timeLeft <= 0) {
      onScore(score)
      return
    }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000)
    return () => clearTimeout(t)
  }, [started, timeLeft, score, onScore])

  const handleSubmit = () => {
    if (!started || timeLeft <= 0) return
    const guess = parseInt(input)
    const diff = Math.abs(guess - target)
    if (diff === 0) {
      const points = 1000 + combo * 200
      setScore(p => p + points)
      setCombo(p => p + 1)
      setFeedback('correct')
      setTimeout(newTarget, 500)
    } else if (diff <= 50) {
      const points = 400
      setScore(p => p + points)
      setCombo(0)
      setFeedback('correct')
      setTimeout(newTarget, 500)
    } else {
      setCombo(0)
      setFeedback('wrong')
      setTimeout(() => setFeedback(null), 600)
    }
  }

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="text-6xl">⛏️</div>
        <h2 className="font-display text-2xl font-bold text-white text-center">Hash Runner</h2>
        <p className="text-gray-400 text-sm text-center max-w-xs">
          A target block number appears. Type the exact number (or within 50) as fast as you can!
          Combos multiply your score. You have 30 seconds.
        </p>
        <button onClick={() => { setStarted(true); newTarget() }}
          className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-10 py-4 rounded-xl hover:opacity-90 hover:scale-105 transition-all text-lg">
          Start Game
        </button>
      </div>
    )
  }

  if (timeLeft <= 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="text-5xl">🏁</div>
        <h2 className="font-display text-3xl font-bold text-white">Time's Up!</h2>
        <div className="glass rounded-2xl px-12 py-6 text-center">
          <div className="text-4xl font-display font-bold text-amber-400">{score.toLocaleString()}</div>
          <div className="text-sm text-gray-400 mt-1">Final Score</div>
        </div>
        <button onClick={() => { setScore(0); setTimeLeft(30); setCombo(0); newTarget() }}
          className="flex items-center gap-2 glass px-6 py-3 rounded-xl text-white hover:bg-white/5 transition-colors">
          <RotateCcw size={15} /> Play Again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* HUD */}
      <div className="flex gap-6 w-full max-w-sm justify-between">
        <div className="glass px-5 py-3 rounded-xl text-center">
          <div className="font-mono text-2xl font-bold text-amber-400">{score.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Score</div>
        </div>
        <div className={`glass px-5 py-3 rounded-xl text-center ${timeLeft <= 10 ? 'border-red-500/30' : ''}`}>
          <div className={`font-mono text-2xl font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>{timeLeft}</div>
          <div className="text-xs text-gray-500">Seconds</div>
        </div>
        <div className="glass px-5 py-3 rounded-xl text-center">
          <div className="font-mono text-2xl font-bold text-violet-400">{combo}x</div>
          <div className="text-xs text-gray-500">Combo</div>
        </div>
      </div>

      {/* Target */}
      <div className="text-center">
        <div className="text-xs text-gray-500 mb-2 uppercase tracking-widest font-mono">Target Block</div>
        <div className={`font-display text-6xl font-bold transition-colors ${
          feedback === 'correct' ? 'text-green-400' : feedback === 'wrong' ? 'text-red-400' : 'text-white'
        }`}>
          {target}
        </div>
        <AnimatePresence>
          {combo > 1 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-2 text-xs font-bold text-amber-400">
              {combo}x COMBO! +{200 * combo} bonus
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="flex gap-3 w-full max-w-xs">
        <input
          type="number"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          autoFocus
          placeholder="Type the number..."
          className={`flex-1 glass px-5 py-3 rounded-xl text-center font-mono text-lg text-white placeholder:text-gray-600 focus:outline-none transition-colors ${
            feedback === 'correct' ? 'border-green-500/50 bg-green-500/5' :
            feedback === 'wrong' ? 'border-red-500/50 bg-red-500/5' : ''
          }`}
        />
        <button onClick={handleSubmit}
          className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white px-5 rounded-xl font-bold hover:opacity-90 transition-opacity">
          ↵
        </button>
      </div>
      <div className="text-xs text-gray-600">Exact = 1000 pts · Within ±50 = 400 pts · Miss = combo reset</div>
    </div>
  )
}

// ─── Block Blast (Reaction Speed game) ───────────────────────────────────────
function BlockBlastGame({ onScore }: { onScore: (s: number) => void }) {
  const GRID = 5
  const [cells, setCells] = useState<(string | null)[]>(Array(GRID * GRID).fill(null))
  const [score, setScore] = useState(0)
  const [started, setStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(45)
  const [activeCell, setActiveCell] = useState<number | null>(null)

  const COLORS = ['bg-cyan-500', 'bg-violet-500', 'bg-amber-500', 'bg-pink-500', 'bg-green-500']

  const spawnBlock = useCallback(() => {
    const empty = cells.map((c, i) => c === null ? i : -1).filter(i => i >= 0)
    if (empty.length === 0) return
    const idx = empty[Math.floor(Math.random() * empty.length)]
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    setCells(prev => { const n = [...prev]; n[idx] = color; return n })
    setActiveCell(idx)
    setTimeout(() => {
      setCells(prev => { const n = [...prev]; if (n[idx] === color) n[idx] = null; return n })
      setActiveCell(null)
    }, 1200)
  }, [cells])

  useEffect(() => {
    if (!started || timeLeft <= 0) return
    const t = setInterval(spawnBlock, 600)
    return () => clearInterval(t)
  }, [started, timeLeft, spawnBlock])

  useEffect(() => {
    if (!started) return
    if (timeLeft <= 0) { onScore(score); return }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000)
    return () => clearTimeout(t)
  }, [started, timeLeft, score, onScore])

  const handleClick = (idx: number) => {
    if (!cells[idx] || !started) return
    setScore(p => p + 500)
    setCells(prev => { const n = [...prev]; n[idx] = null; return n })
    if (activeCell === idx) setActiveCell(null)
  }

  if (!started) return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="text-5xl">🧱</div>
      <h2 className="font-display text-2xl font-bold">Block Blast</h2>
      <p className="text-gray-400 text-sm text-center max-w-xs">Tap the colored blocks before they disappear! Each block = 500 points. 45 seconds.</p>
      <button onClick={() => setStarted(true)} className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-10 py-4 rounded-xl hover:opacity-90 transition-all">
        Start Game
      </button>
    </div>
  )

  if (timeLeft <= 0) return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="text-5xl">🏁</div>
      <h2 className="font-display text-3xl font-bold">Time's Up!</h2>
      <div className="glass rounded-2xl px-12 py-6 text-center">
        <div className="text-4xl font-display font-bold text-amber-400">{score.toLocaleString()}</div>
        <div className="text-sm text-gray-400 mt-1">Final Score</div>
      </div>
      <button onClick={() => { setScore(0); setTimeLeft(45); setCells(Array(GRID * GRID).fill(null)) }}
        className="flex items-center gap-2 glass px-6 py-3 rounded-xl text-white hover:bg-white/5">
        <RotateCcw size={15} /> Play Again
      </button>
    </div>
  )

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="flex gap-6">
        <div className="glass px-6 py-3 rounded-xl text-center">
          <div className="font-mono text-2xl font-bold text-amber-400">{score.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Score</div>
        </div>
        <div className={`glass px-6 py-3 rounded-xl text-center ${timeLeft <= 10 ? 'border-red-500/30' : ''}`}>
          <div className={`font-mono text-2xl font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>{timeLeft}</div>
          <div className="text-xs text-gray-500">Seconds</div>
        </div>
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)` }}>
        {cells.map((color, i) => (
          <motion.button key={i} onClick={() => handleClick(i)}
            animate={color ? { scale: [0.8, 1], opacity: [0, 1] } : { scale: 1, opacity: 1 }}
            whileTap={color ? { scale: 0.85 } : {}}
            className={`w-14 h-14 rounded-xl transition-all ${color ? `${color} cursor-pointer shadow-lg` : 'bg-white/3 border border-white/5 cursor-default'}`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600">Tap the colored blocks before they vanish!</p>
    </div>
  )
}

// ─── Main PlayPage ────────────────────────────────────────────────────────────
export default function PlayPage() {
  const { id } = useParams<{ id: string }>()
  const game = GAMES.find(g => g.id === id)
  const [finalScore, setFinalScore] = useState<number | null>(null)
  const [key, setKey] = useState(0)

  if (!game) return (
    <div className="min-h-screen bg-[#080A0F] flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">❓</div>
        <h2 className="font-display text-xl font-bold mb-2">Game Not Found</h2>
        <a href="/" className="text-violet-400 hover:underline text-sm">Back to Games</a>
      </div>
    </div>
  )

  const highScore = getHighScore(game.id)

  const handleScore = (score: number) => {
    setFinalScore(score)
    saveScore(game.id, score)
  }

  const handleRestart = () => {
    setFinalScore(null)
    setKey(k => k + 1)
  }

  const renderGame = () => {
    if (game.id === 'block-blast') return <BlockBlastGame key={key} onScore={handleScore} />
    // Default: Hash Runner for all other games for now
    return <HashRunnerGame key={key} onScore={handleScore} />
  }

  return (
    <div className="min-h-screen bg-[#080A0F]">
      <GamesNavbar />
      <div className="pt-20 max-w-4xl mx-auto px-6 py-10">
        {/* Back + title */}
        <div className="flex items-center justify-between mb-8">
          <a href="/" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
            <ArrowLeft size={14} /> All Games
          </a>
          <div className="flex items-center gap-3">
            {highScore > 0 && (
              <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-xs">
                <Star size={12} className="text-amber-400" />
                <span className="text-gray-400">Best:</span>
                <span className="font-mono text-amber-400">{highScore.toLocaleString()}</span>
              </div>
            )}
            <div className={`glass px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs ${game.live ? 'border-green-500/20' : 'border-white/10'}`}>
              {game.live ? <><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /><span className="text-green-400">LIVE</span></> : <span className="text-gray-500">Coming Soon</span>}
            </div>
          </div>
        </div>

        {/* Game header */}
        <div className={`glass rounded-2xl border ${game.border} p-6 mb-6`}>
          <div className="flex items-start gap-4">
            <div className="text-5xl">{game.emoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-2xl font-bold text-white">{game.title}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full ${game.badge}`}>{game.category}</span>
              </div>
              <p className="text-sm text-gray-400">{game.description}</p>
              <div className="flex gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Trophy size={11} className="text-amber-400" /> Top: {game.topScore.toLocaleString()}</span>
                <span className="flex items-center gap-1"><Timer size={11} /> Session-based</span>
                <span className="flex items-center gap-1"><Zap size={11} /> No login needed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Game area */}
        <div className="glass-strong rounded-2xl min-h-[480px] flex flex-col">
          <AnimatePresence mode="wait">
            {finalScore !== null ? (
              <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center flex-1 gap-6 p-8">
                <div className="text-5xl">🏆</div>
                <h2 className="font-display text-3xl font-bold text-white">Game Over!</h2>
                <div className="glass rounded-2xl px-16 py-8 text-center">
                  <div className="text-5xl font-display font-bold text-amber-400 mb-1">{finalScore.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Your Score</div>
                  {finalScore > highScore && highScore > 0 && (
                    <div className="mt-2 text-xs text-green-400 font-semibold">🎉 New Personal Best!</div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={handleRestart}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold px-7 py-3 rounded-xl hover:opacity-90 transition-opacity">
                    <RotateCcw size={15} /> Play Again
                  </button>
                  <a href="/" className="flex items-center gap-2 glass px-6 py-3 rounded-xl text-gray-300 hover:text-white transition-colors">
                    <ArrowLeft size={15} /> All Games
                  </a>
                </div>
                <a href="http://localhost:3000/signup" className="text-sm text-violet-400 hover:underline">
                  Create account to save score on-chain →
                </a>
              </motion.div>
            ) : (
              <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
                {renderGame()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
