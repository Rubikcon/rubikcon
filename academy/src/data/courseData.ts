// export interface Lesson {
//   id: string
//   title: string
//   duration: string
//   videoUrl: string
//   description: string
//   content: string
//   completed?: boolean
// }

// export interface Module {
//   id: string
//   title: string
//   lessons: Lesson[]
// }

// export interface Course {
//   id: string
//   title: string
//   tagline: string
//   description: string
//   instructor: string
//   instructorRole: string
//   level: string
//   duration: string
//   students: number
//   rating: number
//   modules: Module[]
// }

// export const COURSE_DATA: Course = {
//   id: 'web3-fundamentals',
//   title: 'Web3 Fundamentals',
//   tagline: 'From zero to blockchain developer',
//   description:
//     'A comprehensive deep-dive into blockchain technology, decentralized protocols, smart contracts, and the DeFi ecosystem. Build your Web3 foundation from the ground up.',
//   instructor: 'Dr. Aisha Okafor',
//   instructorRole: 'Senior Blockchain Engineer, ex-Ethereum Foundation',
//   level: 'Beginner → Advanced',
//   duration: '12 hours',
//   students: 4821,
//   rating: 4.9,
//   modules: [
//     {
//       id: 'mod-1',
//       title: 'Module 1: Blockchain Basics',
//       lessons: [
//         {
//           id: 'l-1-1',
//           title: 'What is Blockchain?',
//           duration: '12 min',
//           videoUrl: 'https://www.youtube.com/embed/SSo_EIwHSd4',
//           description: 'Understand distributed ledger technology from first principles.',
//           content: `## What is Blockchain?\n\nA blockchain is a distributed database or ledger shared among computer network nodes. It stores data in blocks linked together via cryptography.\n\n### Key Properties\n- **Decentralization**: No single point of control\n- **Immutability**: Records cannot be altered retroactively\n- **Transparency**: All participants can verify data\n- **Security**: Cryptographic hashing protects integrity\n\n### How Blocks Work\nEach block contains:\n1. A set of transactions\n2. A timestamp\n3. A cryptographic hash of the previous block\n4. Its own hash\n\nThis chain of hashes creates an unbreakable link between all blocks, making tampering computationally infeasible.`,
//         },
//         {
//           id: 'l-1-2',
//           title: 'Consensus Mechanisms',
//           duration: '18 min',
//           videoUrl: 'https://www.youtube.com/embed/M3EFi_POhps',
//           description: 'Proof of Work vs Proof of Stake — how blockchains agree.',
//           content: `## Consensus Mechanisms\n\nConsensus mechanisms are protocols that ensure all nodes agree on the state of the blockchain.\n\n### Proof of Work (PoW)\nMiners compete to solve complex mathematical puzzles. The first to solve it adds the next block and receives a reward. Used by Bitcoin.\n\n**Pros:** Highly secure, battle-tested\n**Cons:** Energy intensive, slow\n\n### Proof of Stake (PoS)\nValidators are chosen based on the amount of cryptocurrency they stake as collateral. Used by Ethereum post-Merge.\n\n**Pros:** Energy efficient, scalable\n**Cons:** Can favor wealthy validators\n\n### Other Mechanisms\n- **Delegated PoS**: Token holders vote for delegates\n- **Proof of Authority**: Known validators (permissioned chains)\n- **Proof of History**: Solana's time-based ordering`,
//         },
//         {
//           id: 'l-1-3',
//           title: 'Cryptographic Hashing',
//           duration: '15 min',
//           videoUrl: 'https://www.youtube.com/embed/b4b8ktEV4Bg',
//           description: 'SHA-256, Keccak-256 and how hashing secures the chain.',
//           content: `## Cryptographic Hashing\n\nA hash function takes input data of any size and produces a fixed-length output. It is deterministic, one-way, and collision-resistant.\n\n### SHA-256 (Bitcoin)\nProduces a 256-bit (32-byte) hash. Used in Bitcoin's PoW and block linking.\n\n### Keccak-256 (Ethereum)\nEthereum's variant used for address generation and state hashing.\n\n### Properties Critical to Blockchain\n- **Pre-image resistance**: Can't reverse the hash to find input\n- **Collision resistance**: Near impossible to find two inputs with the same hash\n- **Avalanche effect**: Tiny input change = completely different hash`,
//         },
//       ],
//     },
//     {
//       id: 'mod-2',
//       title: 'Module 2: Ethereum & Smart Contracts',
//       lessons: [
//         {
//           id: 'l-2-1',
//           title: 'Introduction to Ethereum',
//           duration: '20 min',
//           videoUrl: 'https://www.youtube.com/embed/jxLkbJozKbY',
//           description: 'The world computer: EVM, gas, and the Ethereum ecosystem.',
//           content: `## Ethereum: The World Computer\n\nEthereum extends blockchain beyond simple value transfer by enabling programmable contracts and decentralized applications.\n\n### The Ethereum Virtual Machine (EVM)\nA sandboxed runtime environment that executes smart contract bytecode on every node. Every operation costs gas.\n\n### Gas\nGas is the unit measuring computational effort. Users pay gas fees to compensate validators.\n\n**Gas Price × Gas Used = Transaction Cost**\n\n### Accounts\n- **Externally Owned Accounts (EOA)**: Controlled by private keys (users)\n- **Contract Accounts**: Controlled by code (smart contracts)`,
//         },
//         {
//           id: 'l-2-2',
//           title: 'Writing Your First Solidity Contract',
//           duration: '35 min',
//           videoUrl: 'https://www.youtube.com/embed/ipwxYa-F1uY',
//           description: 'Hands-on: deploy a simple storage contract on a testnet.',
//           content: `## Your First Solidity Contract\n\nSolidity is a statically typed, contract-oriented language designed for the EVM.\n\n\`\`\`solidity\n// SPDX-License-Identifier: MIT\npragma solidity ^0.8.19;\n\ncontract SimpleStorage {\n    uint256 private storedData;\n\n    function set(uint256 x) public {\n        storedData = x;\n    }\n\n    function get() public view returns (uint256) {\n        return storedData;\n    }\n}\n\`\`\`\n\n### Key Concepts\n- **State variables**: Stored on-chain permanently\n- **Functions**: \`public\`, \`private\`, \`view\`, \`pure\`\n- **Events**: Off-chain notification mechanism\n- **Modifiers**: Reusable condition checks`,
//         },
//         {
//           id: 'l-2-3',
//           title: 'ERC-20 Tokens Deep Dive',
//           duration: '28 min',
//           videoUrl: 'https://www.youtube.com/embed/cqZhNsfL87E',
//           description: 'Build a fully compliant ERC-20 fungible token from scratch.',
//           content: `## ERC-20: The Fungible Token Standard\n\nERC-20 defines a standard interface for fungible tokens on Ethereum.\n\n### Required Functions\n\`\`\`solidity\nfunction totalSupply() external view returns (uint256);\nfunction balanceOf(address account) external view returns (uint256);\nfunction transfer(address to, uint256 amount) external returns (bool);\nfunction allowance(address owner, address spender) external view returns (uint256);\nfunction approve(address spender, uint256 amount) external returns (bool);\nfunction transferFrom(address from, address to, uint256 amount) external returns (bool);\n\`\`\`\n\n### Required Events\n\`\`\`solidity\nevent Transfer(address indexed from, address indexed to, uint256 value);\nevent Approval(address indexed owner, address indexed spender, uint256 value);\n\`\`\`\n\nUsing OpenZeppelin's battle-tested implementation is recommended for production tokens.`,
//         },
//       ],
//     },
//     {
//       id: 'mod-3',
//       title: 'Module 3: DeFi Protocols',
//       lessons: [
//         {
//           id: 'l-3-1',
//           title: 'Decentralized Exchanges (DEX)',
//           duration: '22 min',
//           videoUrl: 'https://www.youtube.com/embed/1PbZMudPP5E',
//           description: 'Uniswap V3, AMMs, liquidity pools, and impermanent loss.',
//           content: `## Decentralized Exchanges\n\nDEXs allow peer-to-peer token trading without a centralized intermediary.\n\n### Automated Market Makers (AMM)\nInstead of order books, AMMs use mathematical formulas to price assets.\n\n**Uniswap's Constant Product Formula:**\n\`x * y = k\`\n\nWhere x and y are the reserves of two tokens, and k remains constant.\n\n### Liquidity Providers\nAnyone can deposit token pairs into a pool and earn a share of trading fees (0.05%, 0.3%, or 1% on Uniswap V3).\n\n### Impermanent Loss\nIf the price ratio of your deposited tokens changes, you may end up with less value than simply holding them. This is impermanent loss.`,
//         },
//         {
//           id: 'l-3-2',
//           title: 'Lending & Borrowing Protocols',
//           duration: '25 min',
//           videoUrl: 'https://www.youtube.com/embed/WwE3lUq51gQ',
//           description: 'Aave, Compound, collateralization, and liquidations.',
//           content: `## DeFi Lending Protocols\n\nProtocols like Aave and Compound allow users to lend assets and earn yield, or borrow against collateral.\n\n### How It Works\n1. **Lenders** deposit assets into a pool and receive interest-bearing tokens (e.g., aTokens on Aave)\n2. **Borrowers** lock collateral worth more than the loan (overcollateralization)\n3. **Interest rates** adjust algorithmically based on pool utilization\n\n### Liquidations\nIf a borrower's collateral value drops below the Liquidation Threshold, liquidators can repay part of the debt and seize collateral at a discount.\n\n### Flash Loans\nUncollateralized loans that must be borrowed and repaid within a single transaction. Used for arbitrage and liquidations.`,
//         },
//       ],
//     },
//     {
//       id: 'mod-4',
//       title: 'Module 4: NFTs & Digital Ownership',
//       lessons: [
//         {
//           id: 'l-4-1',
//           title: 'ERC-721 & ERC-1155 Standards',
//           duration: '20 min',
//           videoUrl: 'https://www.youtube.com/embed/9yuHz6g_P50',
//           description: 'Non-fungible tokens: what makes them unique and how to build them.',
//           content: `## NFT Standards\n\n### ERC-721 (Non-Fungible Token)\nEach token has a unique ID. No two tokens are identical.\n\n\`\`\`solidity\nfunction ownerOf(uint256 tokenId) external view returns (address);\nfunction transferFrom(address from, address to, uint256 tokenId) external;\nfunction safeTransferFrom(address from, address to, uint256 tokenId) external;\n\`\`\`\n\n### ERC-1155 (Multi-Token Standard)\nA single contract can manage both fungible and non-fungible tokens. More gas-efficient for batch operations.\n\n### Metadata\nNFT metadata (name, image, attributes) is stored as a JSON file — usually on IPFS for decentralization.\n\n\`\`\`json\n{\n  "name": "Rubikcon Genesis #001",\n  "description": "First Rubikcon NFT",\n  "image": "ipfs://Qm.../001.png",\n  "attributes": [{"trait_type": "Rarity", "value": "Legendary"}]\n}\n\`\`\``,
//         },
//       ],
//     },
//   ],
// }

// export function getLessonById(id: string): { lesson: Lesson; module: Module; course: Course } | null {
//   for (const module of COURSE_DATA.modules) {
//     for (const lesson of module.lessons) {
//       if (lesson.id === id) return { lesson, module, course: COURSE_DATA }
//     }
//   }
//   return null
// }

// export function getAllLessons(): Lesson[] {
//   return COURSE_DATA.modules.flatMap(m => m.lessons)
// }

// export function getNextLesson(currentId: string): Lesson | null {
//   const all = getAllLessons()
//   const idx = all.findIndex(l => l.id === currentId)
//   return idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null
// }

// export function getPrevLesson(currentId: string): Lesson | null {
//   const all = getAllLessons()
//   const idx = all.findIndex(l => l.id === currentId)
//   return idx > 0 ? all[idx - 1] : null
// }



export interface Lesson {
  id: string
  title: string
  duration: string
  videoUrl: string
  description: string
  content: string
  completed?: boolean
}

export interface Module {
  id: string
  title: string
  lessons: Lesson[]
}

export interface Course {
  id: string
  title: string
  tagline: string
  description: string
  instructor: string
  instructorRole: string
  level: string
  duration: string
  students: number
  rating: number
  color: string
  badge: string
  modules: Module[]
}

// ─── COURSE 1: Blockchain Technology for Social Impact Businesses ─────────────
export const COURSE_BLOCKCHAIN: Course = {
  id: 'blockchain-social-impact',
  title: 'Blockchain Technology for Social Impact Businesses',
  tagline: 'Harness blockchain to drive real-world change',
  description:
    'Learn how blockchain technology can transform social enterprises, NGOs, and impact-driven businesses. From transparent supply chains to decentralized fundraising — build solutions that matter.',
  instructor: 'Dr. Aisha Okafor',
  instructorRole: 'Senior Blockchain Engineer, ex-Ethereum Foundation',
  level: 'Beginner → Intermediate',
  duration: '10 hours',
  students: 4821,
  rating: 4.9,
  color: 'from-cyan-500',
  badge: 'bg-cyan-500/10 text-cyan-400',
  modules: [
    {
      id: 'mod-1',
      title: 'Module 1: Blockchain Basics for Impact',
      lessons: [
        {
          id: 'l-1-1',
          title: 'What is Blockchain & Why It Matters for Social Good',
          duration: '12 min',
          videoUrl: 'https://www.youtube.com/embed/SSo_EIwHSd4',
          description: 'Understand distributed ledger technology and how it enables trust without intermediaries.',
          content: `## What is Blockchain?\n\nA blockchain is a distributed database shared among computer network nodes. It stores data in blocks linked together via cryptography.\n\n### Why It Matters for Social Impact\n- **Transparency**: Every transaction is publicly verifiable\n- **No middlemen**: Funds go directly to beneficiaries\n- **Immutability**: Records cannot be tampered with\n- **Global access**: Anyone with internet can participate\n\n### Real World Examples\n- **Aid distribution**: WFP uses blockchain to distribute food vouchers in refugee camps\n- **Land rights**: Governments using blockchain to protect land ownership records\n- **Micro-loans**: DeFi protocols giving loans to the unbanked`,
        },
        {
          id: 'l-1-2',
          title: 'How Blockchain Solves Trust Problems in Business',
          duration: '15 min',
          videoUrl: 'https://www.youtube.com/embed/M3EFi_POhps',
          description: 'Explore how blockchain removes the need for trusted third parties in transactions.',
          content: `## Trust Without Intermediaries\n\nTraditionally, we rely on banks, governments, and corporations to verify transactions. Blockchain eliminates this dependency.\n\n### The Trust Problem\nMost social impact organizations struggle with:\n- Donor funds not reaching beneficiaries\n- Opaque supply chains\n- Corruption in aid distribution\n- Lack of accountability\n\n### How Blockchain Fixes This\n**Smart contracts** automatically execute when conditions are met — no human needed to approve or release funds.\n\n### Example: Transparent Donations\nA donor sends funds to a smart contract. The contract only releases money when verified proof of impact is submitted on-chain.`,
        },
        {
          id: 'l-1-3',
          title: 'Public vs Private Blockchains — Which to Use?',
          duration: '14 min',
          videoUrl: 'https://www.youtube.com/embed/b4b8ktEV4Bg',
          description: 'Compare public blockchains like Ethereum with private/permissioned chains for enterprise use.',
          content: `## Public vs Private Blockchains\n\n### Public Blockchains\n- Open to anyone (Bitcoin, Ethereum)\n- Fully transparent\n- Censorship resistant\n- Best for: fundraising, public accountability, community tokens\n\n### Private Blockchains\n- Controlled by an organization (Hyperledger, Quorum)\n- Faster and cheaper\n- More privacy\n- Best for: supply chain tracking, internal auditing, healthcare records\n\n### Consortium Blockchains\n- Shared between a group of organizations\n- Best for: industry-wide collaboration, cross-border aid networks\n\n### Recommendation for Social Enterprises\nStart with **public blockchains** for donor transparency, use **private/consortium** for internal operations.`,
        },
      ],
    },
    {
      id: 'mod-2',
      title: 'Module 2: Smart Contracts for Social Impact',
      lessons: [
        {
          id: 'l-2-1',
          title: 'Introduction to Smart Contracts',
          duration: '18 min',
          videoUrl: 'https://www.youtube.com/embed/jxLkbJozKbY',
          description: 'What smart contracts are and how they automate business logic on-chain.',
          content: `## Smart Contracts\n\nSelf-executing programs stored on a blockchain that run when predetermined conditions are met.\n\n### Key Properties\n- **Autonomous**: Execute without human intervention\n- **Transparent**: Code is publicly visible\n- **Irreversible**: Once deployed, cannot be changed (unless upgradeable patterns used)\n\n### Use Cases in Social Impact\n1. **Conditional grants**: Release funding when milestones are verified\n2. **Voting**: DAO governance for community decisions\n3. **Supply chain**: Automatically pay farmers when goods are delivered\n4. **Insurance**: Parametric insurance that pays out automatically on verified events`,
        },
        {
          id: 'l-2-2',
          title: 'Building a Transparent Donation Smart Contract',
          duration: '30 min',
          videoUrl: 'https://www.youtube.com/embed/ipwxYa-F1uY',
          description: 'Hands-on: write a simple donation contract that tracks every contribution on-chain.',
          content: `## Donation Smart Contract\n\n\`\`\`solidity\n// SPDX-License-Identifier: MIT\npragma solidity ^0.8.19;\n\ncontract ImpactDonation {\n    address public beneficiary;\n    uint256 public totalRaised;\n    mapping(address => uint256) public donations;\n\n    event DonationReceived(address donor, uint256 amount);\n    event FundsReleased(address beneficiary, uint256 amount);\n\n    constructor(address _beneficiary) {\n        beneficiary = _beneficiary;\n    }\n\n    function donate() public payable {\n        require(msg.value > 0, "Donation must be > 0");\n        donations[msg.sender] += msg.value;\n        totalRaised += msg.value;\n        emit DonationReceived(msg.sender, msg.value);\n    }\n\n    function releaseFunds() public {\n        uint256 balance = address(this).balance;\n        payable(beneficiary).transfer(balance);\n        emit FundsReleased(beneficiary, balance);\n    }\n}\n\`\`\`\n\nEvery donation is permanently recorded. Anyone can verify total raised and individual contributions.`,
        },
      ],
    },
    {
      id: 'mod-3',
      title: 'Module 3: Blockchain in Supply Chains & NGOs',
      lessons: [
        {
          id: 'l-3-1',
          title: 'Transparent Supply Chains with Blockchain',
          duration: '20 min',
          videoUrl: 'https://www.youtube.com/embed/1PbZMudPP5E',
          description: 'How blockchain enables end-to-end product tracking from farm to consumer.',
          content: `## Supply Chain Transparency\n\nConsumers increasingly demand to know where products come from. Blockchain provides an immutable record of every step.\n\n### How It Works\n1. Farmer harvests product → records batch on blockchain\n2. Processor receives goods → scans QR code, updates chain\n3. Distributor ships → GPS coordinates logged on-chain\n4. Retailer receives → final verification recorded\n5. Consumer scans QR code → sees entire journey\n\n### Impact Organizations Using This\n- **Fairtrade**: Verifying ethical sourcing\n- **WWF**: Tracking sustainable fishing\n- **IBM Food Trust**: Food safety tracking\n\n### Building a Simple Tracker\nEach product gets a unique NFT-like token. Every handoff adds a record to the chain.`,
        },
        {
          id: 'l-3-2',
          title: 'Decentralized Fundraising & DAOs for NGOs',
          duration: '22 min',
          videoUrl: 'https://www.youtube.com/embed/WwE3lUq51gQ',
          description: 'How NGOs can use DAOs and DeFi to raise and manage funds transparently.',
          content: `## DAOs for Social Impact\n\nA DAO (Decentralized Autonomous Organization) is a community-governed organization where rules are encoded in smart contracts.\n\n### Why NGOs Should Consider DAOs\n- **Global donors** can vote on fund allocation\n- **Transparent treasury** — every expense is on-chain\n- **No single point of failure** — community-controlled\n\n### Gitcoin Grants Model\nGitcoin uses **Quadratic Funding** — a mechanism where matching funds are distributed based on the number of contributors, not just amounts. This amplifies grassroots support.\n\n### Steps to Launch an Impact DAO\n1. Define your mission and governance rules\n2. Deploy a governance token\n3. Create a multi-sig treasury\n4. Set up Snapshot for off-chain voting\n5. Use Gnosis Safe for fund management`,
        },
      ],
    },
  ],
}

// ─── COURSE 2: Tokenomics Fundamentals ───────────────────────────────────────
export const COURSE_TOKENOMICS: Course = {
  id: 'tokenomics-fundamentals',
  title: 'Tokenomics Fundamentals',
  tagline: 'Design token economies that actually work',
  description:
    'Master the art and science of token design. Learn how to create sustainable token economies, understand incentive mechanisms, and build tokenomics models for real-world projects.',
  instructor: 'Marcus Adeyemi',
  instructorRole: 'DeFi Economist & Token Design Consultant',
  level: 'Intermediate',
  duration: '8 hours',
  students: 2340,
  rating: 4.8,
  color: 'from-amber-500',
  badge: 'bg-amber-500/10 text-amber-400',
  modules: [
    {
      id: 'tok-mod-1',
      title: 'Module 1: What is Tokenomics?',
      lessons: [
        {
          id: 'tok-1-1',
          title: 'Token Economics 101 — Supply, Demand & Value',
          duration: '16 min',
          videoUrl: 'https://www.youtube.com/embed/SSo_EIwHSd4',
          description: 'Understand the fundamental economic principles that drive token value.',
          content: `## Tokenomics 101\n\nTokenomics = Token + Economics. It describes the supply, distribution, and incentive mechanisms of a cryptocurrency or token.\n\n### Why Tokenomics Matters\nPoor tokenomics = project failure. Even great technology fails with bad token design.\n\n### Key Components\n- **Total Supply**: Maximum number of tokens that will ever exist\n- **Circulating Supply**: Tokens currently in the market\n- **Inflation/Deflation**: Rate of new token creation or burning\n- **Distribution**: Who gets how many tokens and when\n\n### Token Value Drivers\n1. **Utility**: What can you do with the token?\n2. **Scarcity**: Is supply limited?\n3. **Demand**: Is there real usage driving demand?\n4. **Velocity**: How fast do tokens circulate?`,
        },
        {
          id: 'tok-1-2',
          title: 'Token Types — Utility, Governance, Security & NFTs',
          duration: '18 min',
          videoUrl: 'https://www.youtube.com/embed/M3EFi_POhps',
          description: 'Explore the different categories of tokens and their distinct economic roles.',
          content: `## Types of Tokens\n\n### Utility Tokens\nGive holders access to a product or service.\n- Example: Filecoin (FIL) — pay for storage\n- Example: Chainlink (LINK) — pay for oracle data\n\n### Governance Tokens\nAllow holders to vote on protocol decisions.\n- Example: UNI (Uniswap) — vote on protocol changes\n- Example: COMP (Compound) — vote on interest rate models\n\n### Security Tokens\nRepresent ownership of real-world assets.\n- Tokenized stocks, real estate, bonds\n- Subject to securities regulations\n\n### NFTs (Non-Fungible Tokens)\n- Each token is unique\n- Represent digital ownership\n- Use cases: art, gaming, credentials, identity\n\n### Stablecoins\n- Pegged to fiat currency (USDC, USDT, DAI)\n- Used for payments and DeFi`,
        },
        {
          id: 'tok-1-3',
          title: 'Supply Mechanics — Minting, Burning & Vesting',
          duration: '20 min',
          videoUrl: 'https://www.youtube.com/embed/b4b8ktEV4Bg',
          description: 'How token supply is managed through minting schedules, burn mechanisms and vesting.',
          content: `## Supply Mechanics\n\n### Token Minting\nNew tokens are created (minted) according to a predefined schedule.\n- **Fixed supply**: Bitcoin — 21M max, no new BTC after\n- **Inflationary**: Ethereum — small annual issuance to validators\n- **Elastic supply**: Algorithmic stablecoins adjust supply to maintain peg\n\n### Token Burning\nTokens are permanently destroyed to reduce supply.\n- **Fee burning**: Ethereum burns a portion of every transaction fee (EIP-1559)\n- **Buyback and burn**: Project uses revenue to buy and burn tokens\n\n### Vesting Schedules\nPrevents early investors and team from dumping tokens.\n- **Cliff**: No tokens released until a certain date\n- **Linear vesting**: Tokens released gradually over time\n- **Example**: Team gets 20% with 1-year cliff, then 3-year linear vest`,
        },
      ],
    },
    {
      id: 'tok-mod-2',
      title: 'Module 2: Incentive Design & Game Theory',
      lessons: [
        {
          id: 'tok-2-1',
          title: 'Game Theory in Token Design',
          duration: '22 min',
          videoUrl: 'https://www.youtube.com/embed/jxLkbJozKbY',
          description: 'Apply game theory principles to design token incentives that align stakeholder interests.',
          content: `## Game Theory & Tokenomics\n\nGood tokenomics aligns incentives so that acting selfishly also benefits the network.\n\n### Nash Equilibrium in Crypto\nWhen every participant's strategy is optimal given the strategies of all others.\n- Bitcoin miners: Honest mining is more profitable than attacking\n- Validators: Staking rewards make honest behavior economically rational\n\n### The Prisoner's Dilemma in DeFi\nLiquidity providers face a coordination problem — everyone benefits from liquidity but individuals are tempted to withdraw during volatility.\n\n### Schelling Points\nFocal points that people converge on without communication.\n- Used in oracle designs (Augur, UMA)\n- Reporters independently arrive at the same "truth"\n\n### Designing Good Incentives\n1. Make honest behavior more profitable than dishonest\n2. Make attacks expensive and unprofitable\n3. Reward long-term participation over short-term extraction`,
        },
        {
          id: 'tok-2-2',
          title: 'Designing a Tokenomics Model from Scratch',
          duration: '35 min',
          videoUrl: 'https://www.youtube.com/embed/ipwxYa-F1uY',
          description: 'Step-by-step walkthrough of building a complete tokenomics model for a real project.',
          content: `## Building a Tokenomics Model\n\n### Step 1: Define Token Purpose\nWhat problem does the token solve? What behavior does it incentivize?\n\n### Step 2: Determine Supply\n- Total supply (fixed or dynamic?)\n- Initial circulating supply\n- Emission schedule\n\n### Step 3: Allocate Distribution\nTypical breakdown:\n- Team & Advisors: 15-20% (vested)\n- Investors: 10-20% (vested)\n- Community/Ecosystem: 40-50%\n- Treasury: 10-20%\n- Public Sale: 5-15%\n\n### Step 4: Design Utility\nTokens need real demand drivers:\n- Governance rights\n- Fee discounts\n- Access to premium features\n- Staking rewards\n\n### Step 5: Model the Economy\nUse spreadsheets to model:\n- Token price at different market caps\n- Inflation rate over time\n- Runway for treasury`,
        },
      ],
    },
  ],
}

// ─── COURSE 3: AI for Business ────────────────────────────────────────────────
export const COURSE_AI: Course = {
  id: 'ai-for-business',
  title: 'AI for Business',
  tagline: 'Automate, optimize and scale with artificial intelligence',
  description:
    'A practical guide to applying AI and automation in your business. Learn prompt engineering, AI workflows, no-code automation, and how to integrate AI tools to save time and grow revenue.',
  instructor: 'Sophia Nwosu',
  instructorRole: 'AI Automation Engineer & Business Consultant',
  level: 'Beginner → Intermediate',
  duration: '9 hours',
  students: 3105,
  rating: 4.9,
  color: 'from-violet-500',
  badge: 'bg-violet-500/10 text-violet-400',
  modules: [
    {
      id: 'ai-mod-1',
      title: 'Module 1: AI Fundamentals for Business Leaders',
      lessons: [
        {
          id: 'ai-1-1',
          title: 'What is AI & What Can It Actually Do for Your Business?',
          duration: '14 min',
          videoUrl: 'https://www.youtube.com/embed/SSo_EIwHSd4',
          description: 'Cut through the hype — understand what AI can and cannot do in a business context.',
          content: `## AI for Business — The Real Picture\n\nAI is not magic. It's a set of tools that are exceptionally good at pattern recognition, content generation, and automation.\n\n### What AI Is Good At\n- **Writing & content**: Drafting emails, reports, social posts\n- **Data analysis**: Finding patterns in large datasets\n- **Customer service**: Answering repetitive questions 24/7\n- **Image recognition**: Quality control, document scanning\n- **Code generation**: Writing and debugging software\n- **Predictions**: Forecasting sales, churn, demand\n\n### What AI Is NOT Good At\n- Original creative thinking\n- Complex ethical judgements\n- Understanding context deeply\n- Tasks with no data\n\n### The Business Opportunity\nCompanies using AI effectively are 2-3x more productive. The opportunity is not in replacing humans but in **augmenting** them.`,
        },
        {
          id: 'ai-1-2',
          title: 'Prompt Engineering — Getting the Best from AI',
          duration: '20 min',
          videoUrl: 'https://www.youtube.com/embed/M3EFi_POhps',
          description: 'Master the art of writing prompts that get consistent, high-quality AI outputs.',
          content: `## Prompt Engineering\n\nThe quality of your AI output is directly proportional to the quality of your input.\n\n### The RACE Framework\n- **Role**: Tell the AI who it is\n- **Action**: What you want it to do\n- **Context**: Background information\n- **Examples**: Show it what good looks like\n\n### Example — Bad Prompt\n"Write a marketing email"\n\n### Example — Good Prompt\n"You are a B2B SaaS copywriter. Write a 150-word email to a CFO at a mid-size manufacturing company explaining how our inventory management software reduces carrying costs by 23%. Tone: professional but not stiff. End with a clear CTA to book a 15-minute demo."\n\n### Chain of Thought Prompting\nAsk AI to reason step by step:\n"Think through this problem step by step before giving your answer..."\n\n### Few-Shot Prompting\nProvide 2-3 examples of the output format you want before asking for the real thing.`,
        },
        {
          id: 'ai-1-3',
          title: 'AI Tools Landscape — Which Tool for Which Job?',
          duration: '16 min',
          videoUrl: 'https://www.youtube.com/embed/b4b8ktEV4Bg',
          description: 'Navigate the crowded AI tools market and pick the right tools for your use case.',
          content: `## AI Tools for Business\n\n### Writing & Content\n- **Claude** — Best for long-form, nuanced writing\n- **ChatGPT** — General purpose, great for brainstorming\n- **Jasper** — Marketing copy specialist\n\n### Image Generation\n- **Midjourney** — Highest quality artistic images\n- **DALL-E 3** — Best integrated with ChatGPT\n- **Stable Diffusion** — Open source, customizable\n\n### Automation & Workflows\n- **n8n** — Open source, self-hostable workflow automation\n- **Zapier** — No-code automation, 5000+ integrations\n- **Make (Integromat)** — Visual workflow builder\n\n### Data & Analytics\n- **Julius AI** — Chat with your data\n- **Tableau AI** — BI with AI insights\n\n### Customer Service\n- **Intercom Fin** — AI customer support agent\n- **Voiceflow** — Build conversational AI\n\n### Choosing the Right Tool\nStart with one tool, master it, then expand.`,
        },
      ],
    },
    {
      id: 'ai-mod-2',
      title: 'Module 2: AI Automation for Business Workflows',
      lessons: [
        {
          id: 'ai-2-1',
          title: 'Mapping Your Business for Automation Opportunities',
          duration: '18 min',
          videoUrl: 'https://www.youtube.com/embed/jxLkbJozKbY',
          description: 'How to identify which parts of your business are best candidates for AI automation.',
          content: `## Finding Automation Opportunities\n\n### The Automation Audit\nWalk through every department and ask: "What tasks are repetitive, rule-based, and time-consuming?"\n\n### High-Value Automation Targets\n**Sales & Marketing**\n- Lead qualification and scoring\n- Personalized outreach sequences\n- Content creation and scheduling\n- CRM data entry\n\n**Operations**\n- Invoice processing\n- Inventory management\n- Employee onboarding\n- Report generation\n\n**Customer Service**\n- FAQ answering\n- Ticket routing and triage\n- Follow-up emails\n\n**Finance**\n- Expense categorization\n- Financial report drafting\n- Anomaly detection\n\n### The 3-Filter Test\nBefore automating anything ask:\n1. Is this task repetitive? (done >3x per week)\n2. Is it rule-based? (follows clear logic)\n3. Is there a cost/time saving? (saves >1 hour/week)\n\nIf yes to all 3 — automate it.`,
        },
        {
          id: 'ai-2-2',
          title: 'Building AI Workflows with n8n — No Code Required',
          duration: '40 min',
          videoUrl: 'https://www.youtube.com/embed/ipwxYa-F1uY',
          description: 'Hands-on: build a real AI-powered workflow that saves hours every week.',
          content: `## Building with n8n\n\nn8n is a workflow automation tool that connects apps and APIs visually.\n\n### Workflow 1: AI-Powered Lead Qualifier\n1. **Trigger**: New form submission (Typeform/Google Forms)\n2. **Enrich**: Look up company data (Clearbit)\n3. **Score**: Send to OpenAI/Claude to score lead quality\n4. **Route**: If score > 7, create deal in CRM + notify sales team\n5. **Email**: Send personalized welcome email via Gmail\n\n### Workflow 2: Content Repurposing Machine\n1. **Trigger**: New blog post published (RSS feed)\n2. **Summarize**: AI creates 3 social media versions\n3. **Schedule**: Posts to LinkedIn, Twitter, Instagram\n4. **Report**: Weekly digest of performance sent to Slack\n\n### Workflow 3: Customer Support Triage\n1. **Trigger**: New support email received\n2. **Classify**: AI categorizes urgency and topic\n3. **Route**: Urgent → immediate Slack alert; Normal → ticket created\n4. **Draft**: AI writes suggested reply for agent review`,
        },
      ],
    },
  ],
}

// ─── All courses array ────────────────────────────────────────────────────────
export const ALL_COURSES: Course[] = [
  COURSE_BLOCKCHAIN,
  COURSE_TOKENOMICS,
  COURSE_AI,
]

// ─── Default course (main featured one) ──────────────────────────────────────
export const COURSE_DATA = COURSE_BLOCKCHAIN

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function getCourseById(id: string): Course | null {
  return ALL_COURSES.find(c => c.id === id) || null
}

export function getLessonById(id: string): { lesson: Lesson; module: Module; course: Course } | null {
  for (const course of ALL_COURSES) {
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (lesson.id === id) return { lesson, module, course }
      }
    }
  }
  return null
}

export function getAllLessons(course: Course = COURSE_BLOCKCHAIN): Lesson[] {
  return course.modules.flatMap(m => m.lessons)
}

export function getNextLesson(currentId: string, course?: Course): Lesson | null {
  const all = getAllLessons(course)
  const idx = all.findIndex(l => l.id === currentId)
  return idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null
}

export function getPrevLesson(currentId: string, course?: Course): Lesson | null {
  const all = getAllLessons(course)
  const idx = all.findIndex(l => l.id === currentId)
  return idx > 0 ? all[idx - 1] : null
}