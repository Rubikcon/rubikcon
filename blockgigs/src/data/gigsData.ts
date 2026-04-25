export interface Freelancer {
  id: string
  name: string
  handle: string
  avatar: string
  avatarColor: string
  role: string
  skills: string[]
  rating: number
  reviews: number
  completedGigs: number
  hourlyRate: number
  bio: string
  location: string
  verified: boolean
  topRated: boolean
}

export interface Gig {
  id: string
  title: string
  description: string
  longDescription: string
  budget: number
  budgetType: 'fixed' | 'hourly'
  currency: 'ETH' | 'USDC' | 'MATIC'
  category: string
  skills: string[]
  poster: Freelancer
  postedAt: string
  deadline: string
  applicants: number
  difficulty: 'Entry' | 'Mid' | 'Senior'
  featured: boolean
  remote: boolean
  requirements: string[]
  deliverables: string[]
}

export const FREELANCERS: Freelancer[] = [
  {
    id: 'fl-1',
    name: 'Aisha Okafor',
    handle: 'aisha.eth',
    avatar: 'AO',
    avatarColor: 'from-cyan-500 to-blue-500',
    role: 'Smart Contract Developer',
    skills: ['Solidity', 'Hardhat', 'OpenZeppelin', 'ERC-20', 'ERC-721', 'DeFi'],
    rating: 4.98,
    reviews: 142,
    completedGigs: 138,
    hourlyRate: 180,
    bio: 'Senior Solidity engineer with 5 years in DeFi. Ex-Ethereum Foundation. I build audited, gas-optimized smart contracts from scratch.',
    location: 'Lagos, Nigeria',
    verified: true,
    topRated: true,
  },
  {
    id: 'fl-2',
    name: 'Marcus Chen',
    handle: 'marcusbuilds.eth',
    avatar: 'MC',
    avatarColor: 'from-violet-500 to-purple-500',
    role: 'Full-Stack Web3 Developer',
    skills: ['React', 'Next.js', 'ethers.js', 'wagmi', 'TypeScript', 'Subgraph'],
    rating: 4.95,
    reviews: 87,
    completedGigs: 84,
    hourlyRate: 140,
    bio: 'Full-stack developer specializing in Web3 frontends. I turn complex blockchain interactions into smooth, delightful user experiences.',
    location: 'Singapore',
    verified: true,
    topRated: true,
  },
  {
    id: 'fl-3',
    name: 'Sofia Reyes',
    handle: 'sofiaweb3.eth',
    avatar: 'SR',
    avatarColor: 'from-amber-500 to-orange-500',
    role: 'NFT Artist & Designer',
    skills: ['Generative Art', 'Midjourney', 'Photoshop', 'IPFS', 'Metadata', '3D Design'],
    rating: 4.92,
    reviews: 203,
    completedGigs: 198,
    hourlyRate: 95,
    bio: '10K+ NFTs created. Generative art specialist with expertise in on-chain metadata, trait rarity engineering, and collection launches.',
    location: 'Barcelona, Spain',
    verified: true,
    topRated: false,
  },
  {
    id: 'fl-4',
    name: 'James Nakamura',
    handle: 'jnaka.eth',
    avatar: 'JN',
    avatarColor: 'from-green-500 to-teal-500',
    role: 'Smart Contract Auditor',
    skills: ['Security Audit', 'Slither', 'Mythril', 'Foundry', 'Fuzzing', 'Formal Verification'],
    rating: 5.0,
    reviews: 56,
    completedGigs: 54,
    hourlyRate: 250,
    bio: 'Former Consensys Diligence security researcher. I find critical vulnerabilities before hackers do. Every line of code is a potential attack vector.',
    location: 'Tokyo, Japan',
    verified: true,
    topRated: true,
  },
]

export const GIGS: Gig[] = [
  {
    id: 'gig-1',
    title: 'Build a DeFi Yield Aggregator Smart Contract',
    description: 'We need a production-ready yield aggregator that routes funds to the highest-yielding Aave/Compound pool automatically.',
    longDescription: `We're building a protocol that automatically moves user funds between Aave V3, Compound V3, and Euler Finance to maximize yield. 

The smart contract must:
- Accept ERC-20 deposits (USDC, USDT, DAI)
- Query current APY from each protocol
- Rebalance funds when a better rate is found (triggered by keeper or user)
- Implement proper access control and emergency withdraw
- Be fully tested with Foundry with 95%+ coverage
- Pass a basic security review (we'll use Slither output as checklist)

This is a live production contract that will go on mainnet. Quality and security are non-negotiable.`,
    budget: 4.5,
    budgetType: 'fixed',
    currency: 'ETH',
    category: 'Smart Contracts',
    skills: ['Solidity', 'DeFi', 'Aave', 'Foundry', 'Security'],
    poster: FREELANCERS[0],
    postedAt: '2 days ago',
    deadline: '3 weeks',
    applicants: 12,
    difficulty: 'Senior',
    featured: true,
    remote: true,
    requirements: [
      '3+ years Solidity experience',
      'DeFi protocol integrations (Aave, Compound)',
      'Foundry testing proficiency',
      'Previous audited contracts (links required)',
    ],
    deliverables: [
      'Complete smart contract with natspec documentation',
      'Full Foundry test suite (95%+ coverage)',
      'Deployment scripts for mainnet & testnet',
      'Slither security report',
      'Integration guide for frontend team',
    ],
  },
  {
    id: 'gig-2',
    title: 'Web3 dApp Frontend — NFT Marketplace UI',
    description: 'Build a polished React frontend for our NFT marketplace with wallet connection, listing, bidding, and auction features.',
    longDescription: `We've deployed our NFT marketplace smart contracts on Polygon. Now we need a best-in-class frontend.

The UI must support:
- Wallet connect (MetaMask, WalletConnect, Coinbase Wallet) via wagmi
- Browse and search NFT listings
- Create listings (fixed price + auction)
- Real-time bid updates via WebSocket
- User profile pages with owned/listed NFTs
- Transaction history
- Mobile-first responsive design

Design system will be provided (Figma file shared on start). Tech stack: React 18, TypeScript, wagmi v2, viem, TailwindCSS.`,
    budget: 2.8,
    budgetType: 'fixed',
    currency: 'ETH',
    category: 'Frontend',
    skills: ['React', 'TypeScript', 'wagmi', 'ethers.js', 'TailwindCSS'],
    poster: FREELANCERS[1],
    postedAt: '5 hours ago',
    deadline: '2 weeks',
    applicants: 7,
    difficulty: 'Mid',
    featured: true,
    remote: true,
    requirements: [
      'React 18 with TypeScript',
      'Web3 wallet integration experience (wagmi preferred)',
      'Strong UI/UX sensibility',
      'Previous dApp portfolio (links required)',
    ],
    deliverables: [
      'Full Next.js 14 application (App Router)',
      'Wallet connection module',
      'All marketplace screens',
      'Unit + integration tests (Vitest)',
      'Deployment to Vercel',
    ],
  },
  {
    id: 'gig-3',
    title: 'Generative NFT Collection — 10,000 PFPs',
    description: 'Create a 10K generative PFP collection with 8 trait categories, rarity tiers, and fully on-chain metadata for IPFS.',
    longDescription: `We're launching a 10,000 piece generative PFP collection with a cyberpunk theme. 

Project scope:
- 8 trait categories (Background, Body, Eyes, Mouth, Headwear, Clothing, Accessories, Special)
- 150+ individual traits across all categories
- Rarity engineering (Common, Rare, Epic, Legendary, 1/1)
- No duplicate combinations — algorithm verification required
- IPFS upload via NFT.Storage or Pinata
- JSON metadata for each token following OpenSea standard
- 10 sample reveals for marketing

All artwork must be original and delivered in layered PNG format at 2000x2000px.`,
    budget: 85,
    budgetType: 'hourly',
    currency: 'USDC',
    category: 'NFT Art',
    skills: ['Generative Art', 'Photoshop', 'IPFS', 'Python', 'Metadata'],
    poster: FREELANCERS[2],
    postedAt: '1 day ago',
    deadline: '6 weeks',
    applicants: 23,
    difficulty: 'Mid',
    featured: false,
    remote: true,
    requirements: [
      'Generative NFT collection experience (1000+ pieces)',
      'Proficiency in Photoshop / Procreate',
      'Familiarity with NFT metadata standards',
      'Portfolio of previous collections (links required)',
    ],
    deliverables: [
      'All layered PNG trait files (2000x2000px)',
      'Python generation script',
      'Rarity distribution document',
      '10,000 generated images uploaded to IPFS',
      'JSON metadata for all 10,000 tokens',
    ],
  },
  {
    id: 'gig-4',
    title: 'Smart Contract Security Audit — ERC-4626 Vault',
    description: 'Full security audit of a tokenized vault (ERC-4626) including manual review, automated tools, and formal verification.',
    longDescription: `Our ERC-4626 tokenized vault is going live on Arbitrum. Before mainnet, we need a thorough security audit.

Scope:
- ~800 lines of Solidity (3 contracts)
- Vault logic, fee mechanism, emergency pause
- Reentrancy, integer overflow, access control
- Economic attack vectors (flashloan, sandwich)
- Integration points with Aave and Uniswap V3

Deliverables must include a detailed report with severity classification (Critical/High/Medium/Low/Informational) and recommended fixes. We'll also need you to verify the fixes in a follow-up review.`,
    budget: 5.0,
    budgetType: 'fixed',
    currency: 'ETH',
    category: 'Security',
    skills: ['Security Audit', 'Solidity', 'Slither', 'Foundry', 'Formal Verification'],
    poster: FREELANCERS[3],
    postedAt: '3 days ago',
    deadline: '10 days',
    applicants: 4,
    difficulty: 'Senior',
    featured: true,
    remote: true,
    requirements: [
      '5+ smart contract audits completed',
      'Proficiency in Slither, Mythril, Foundry',
      'Previous audit reports (public or NDA-ok)',
      'Knowledge of ERC-4626 standard',
    ],
    deliverables: [
      'Full audit report (PDF)',
      'Severity-classified finding list',
      'Automated tool outputs (Slither, Mythril)',
      'Recommended fix for each finding',
      'Post-fix verification review',
    ],
  },
  {
    id: 'gig-5',
    title: 'Build Telegram Bot for DeFi Portfolio Tracking',
    description: 'Create a Telegram bot that tracks on-chain DeFi positions (Aave, Uniswap V3) and sends real-time alerts.',
    longDescription: `We need a Telegram bot that monitors DeFi positions and sends smart alerts.

Features:
- Add/remove wallet addresses to track
- Query Aave health factor and send liquidation warnings
- Track Uniswap V3 LP positions (in-range / out-of-range)
- Daily portfolio summary (PnL, yields earned)
- Price alerts (set custom thresholds)
- Multi-chain: Ethereum, Arbitrum, Polygon

Stack: Node.js or Python, The Graph / Alchemy SDK, Telegram Bot API. Must be deployed and running (Railway or Render).`,
    budget: 1800,
    budgetType: 'fixed',
    currency: 'USDC',
    category: 'Backend',
    skills: ['Node.js', 'The Graph', 'Alchemy SDK', 'Telegram API', 'DeFi'],
    poster: FREELANCERS[1],
    postedAt: '6 hours ago',
    deadline: '2 weeks',
    applicants: 9,
    difficulty: 'Mid',
    featured: false,
    remote: true,
    requirements: [
      'Node.js or Python backend experience',
      'Telegram Bot API familiarity',
      'Web3 data querying (The Graph, Alchemy, Moralis)',
      'Prior DeFi bot or tracker projects',
    ],
    deliverables: [
      'Full source code (GitHub repo)',
      'Deployed bot on Railway/Render',
      'User documentation',
      'Admin dashboard (optional bonus)',
    ],
  },
  {
    id: 'gig-6',
    title: 'DAO Governance Dashboard — Snapshot + On-chain',
    description: 'Build a governance dashboard aggregating Snapshot off-chain votes and on-chain Governor Bravo proposals into one clean UI.',
    longDescription: `Our DAO uses both Snapshot for signalling and Governor Bravo for on-chain execution. Currently users have to check both platforms separately.

We need a unified dashboard:
- Active proposals (Snapshot + on-chain) in one feed
- Voting history per wallet
- Quorum progress bars
- Delegate leaderboard
- Treasury overview (multi-sig balances)
- Email notifications via wallet address (optional, bonus)

Tech: React + Next.js, Snapshot.js SDK, ethers.js, The Graph.`,
    budget: 2200,
    budgetType: 'fixed',
    currency: 'USDC',
    category: 'Frontend',
    skills: ['React', 'Next.js', 'Snapshot.js', 'ethers.js', 'The Graph'],
    poster: FREELANCERS[0],
    postedAt: '4 days ago',
    deadline: '3 weeks',
    applicants: 6,
    difficulty: 'Mid',
    featured: false,
    remote: true,
    requirements: [
      'Snapshot SDK or API experience',
      'Governor Bravo or similar on-chain governance',
      'Strong React skills',
      'Portfolio of data-heavy frontends',
    ],
    deliverables: [
      'Next.js 14 app (App Router)',
      'Snapshot + on-chain proposal integration',
      'Wallet-based voting history',
      'Deployed to Vercel',
    ],
  },
]

export const CATEGORIES = ['All', 'Smart Contracts', 'Frontend', 'NFT Art', 'Security', 'Backend']
export const CURRENCIES = ['All', 'ETH', 'USDC', 'MATIC']
export const DIFFICULTIES = ['All', 'Entry', 'Mid', 'Senior']
