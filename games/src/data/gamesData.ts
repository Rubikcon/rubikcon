export interface Game {
  id: string
  title: string
  description: string
  category: string
  players: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  emoji: string
  color: string
  border: string
  accent: string
  badge: string
  topScore: number
  live: boolean
}

export const GAMES: Game[] = [
  {
    id: 'hash-runner',
    title: 'Hash Runner',
    description: 'Race to find the correct nonce before other players. A simplified Proof-of-Work simulation that tests your speed.',
    category: 'Strategy',
    players: 1284,
    difficulty: 'Easy',
    emoji: '⛏️',
    color: 'from-cyan-500/15 to-cyan-500/3',
    border: 'border-cyan-500/20',
    accent: 'text-cyan-400',
    badge: 'bg-cyan-500/10 text-cyan-400',
    topScore: 98450,
    live: true,
  },
  {
    id: 'defi-duel',
    title: 'DeFi Duel',
    description: 'Build the highest-yield DeFi portfolio in 60 seconds using simulated market conditions and on-chain mechanics.',
    category: 'Finance',
    players: 876,
    difficulty: 'Hard',
    emoji: '💹',
    color: 'from-amber-500/15 to-amber-500/3',
    border: 'border-amber-500/20',
    accent: 'text-amber-400',
    badge: 'bg-amber-500/10 text-amber-400',
    topScore: 2143000,
    live: true,
  },
  {
    id: 'block-blast',
    title: 'Block Blast',
    description: 'Classic block puzzle reimagined with blockchain aesthetics. Chain combos to earn bonus multipliers.',
    category: 'Puzzle',
    players: 3421,
    difficulty: 'Easy',
    emoji: '🧱',
    color: 'from-violet-500/15 to-violet-500/3',
    border: 'border-violet-500/20',
    accent: 'text-violet-400',
    badge: 'bg-violet-500/10 text-violet-400',
    topScore: 54200,
    live: true,
  },
  {
    id: 'nft-flip',
    title: 'NFT Flip',
    description: 'Simulate buying and selling NFTs in a volatile market. Grow your portfolio before the timer runs out.',
    category: 'Trading',
    players: 654,
    difficulty: 'Medium',
    emoji: '🖼️',
    color: 'from-pink-500/15 to-pink-500/3',
    border: 'border-pink-500/20',
    accent: 'text-pink-400',
    badge: 'bg-pink-500/10 text-pink-400',
    topScore: 780000,
    live: false,
  },
  {
    id: 'chain-reaction',
    title: 'Chain Reaction',
    description: 'Trigger atomic reactions that cascade across the board. Higher chains = higher scores. Up to 4 players.',
    category: 'Arcade',
    players: 1901,
    difficulty: 'Medium',
    emoji: '⚡',
    color: 'from-green-500/15 to-green-500/3',
    border: 'border-green-500/20',
    accent: 'text-green-400',
    badge: 'bg-green-500/10 text-green-400',
    topScore: 310000,
    live: true,
  },
  {
    id: 'gas-wars',
    title: 'Gas Wars',
    description: 'Bid the optimal gas price to get your transaction confirmed first. Real-time mempool simulation.',
    category: 'Strategy',
    players: 432,
    difficulty: 'Hard',
    emoji: '⛽',
    color: 'from-orange-500/15 to-orange-500/3',
    border: 'border-orange-500/20',
    accent: 'text-orange-400',
    badge: 'bg-orange-500/10 text-orange-400',
    topScore: 99999,
    live: false,
  },
  {
    id: 'wallet-wars',
    title: 'Wallet Wars',
    description: 'Defend your crypto wallet from hackers using shields and firewalls. Survive 10 waves to win.',
    category: 'Arcade',
    players: 2109,
    difficulty: 'Medium',
    emoji: '🛡️',
    color: 'from-blue-500/15 to-blue-500/3',
    border: 'border-blue-500/20',
    accent: 'text-blue-400',
    badge: 'bg-blue-500/10 text-blue-400',
    topScore: 88800,
    live: true,
  },
  {
    id: 'dao-vote',
    title: 'DAO Vote',
    description: 'Political strategy meets DeFi governance. Build voting coalitions, pass proposals, and control the protocol.',
    category: 'Strategy',
    players: 298,
    difficulty: 'Hard',
    emoji: '🗳️',
    color: 'from-teal-500/15 to-teal-500/3',
    border: 'border-teal-500/20',
    accent: 'text-teal-400',
    badge: 'bg-teal-500/10 text-teal-400',
    topScore: 999,
    live: false,
  },
]

export const LEADERBOARD = [
  { rank: 1, name: 'CryptoKing.eth', score: 2143000, game: 'DeFi Duel', avatar: 'CK', color: 'from-amber-500 to-yellow-500' },
  { rank: 2, name: 'SatoshiJr', score: 780000, game: 'NFT Flip', avatar: 'SJ', color: 'from-cyan-500 to-blue-500' },
  { rank: 3, name: 'Web3Witch', score: 310000, game: 'Chain Reaction', avatar: 'WW', color: 'from-violet-500 to-purple-500' },
  { rank: 4, name: 'BlockBuilder', score: 98450, game: 'Hash Runner', avatar: 'BB', color: 'from-green-500 to-teal-500' },
  { rank: 5, name: 'GasFee_Hero', score: 88800, game: 'Wallet Wars', avatar: 'GH', color: 'from-pink-500 to-rose-500' },
]

// Session management (no login required)
const SESSION_KEY = 'rubikcon_games_session'

export interface GameSession {
  id: string
  userId: string | null
  createdAt: string
  scores: Record<string, number>
}

export function getOrCreateSession(): GameSession {
  const stored = localStorage.getItem(SESSION_KEY)
  if (stored) {
    try { return JSON.parse(stored) } catch {}
  }
  const session: GameSession = {
    id: crypto.randomUUID(),
    userId: null,
    createdAt: new Date().toISOString(),
    scores: {},
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function saveScore(gameId: string, score: number): void {
  const session = getOrCreateSession()
  if (!session.scores[gameId] || score > session.scores[gameId]) {
    session.scores[gameId] = score
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }
}

export function getHighScore(gameId: string): number {
  const session = getOrCreateSession()
  return session.scores[gameId] || 0
}
