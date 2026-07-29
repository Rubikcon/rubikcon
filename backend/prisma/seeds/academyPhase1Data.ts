export type AcademySeedCourse = {
  slug: string
  title: string
  tagline: string
  description: string
  level: string
  estimatedDuration: string
  phaseLabel: string
  heroImage?: string
  facilitators: Array<{
    email: string
    name: string
    title: string
    organization: string
    linkedinUrl: string
    photoUrl?: string
    bio: string
  }>
  weeks: Array<{
    number: number
    slug: string
    title: string
    durationLabel: string
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
    hook: string
    whatToExpect: string
    summary: string
    estimatedCompletionMinutes: number
    videoTitle?: string
    videoUrl?: string
    facilitators: string[]
    topics: string[]
    objectives: string[]
    slideDeck: {
      title: string
      url: string
      slideCount: number
      lastUpdatedAt: string
      viewerType: 'EXTERNAL' | 'MODAL'
      sections: string[]
    }
    glossary: Array<{
      term: string
      definition: string
      example?: string
    }>
    readings: Array<{
      title: string
      source: string
      url: string
      description: string
      type: 'ARTICLE' | 'COURSE' | 'DOCUMENTATION' | 'WHITEPAPER' | 'VIDEO' | 'INTERACTIVE'
    }>
    quiz: {
      title: string
      passMark: number
      questions: Array<{
        prompt: string
        explanation: string
        options: Array<{
          label: string
          isCorrect: boolean
        }>
      }>
    }
    assignments: Array<{
      title: string
      instructions: string
      deadline: string
      allowTextSubmission: boolean
      allowFileUpload: boolean
      choices?: Array<{
        title: string
        description: string
      }>
    }>
  }>
}

export const academyPhase1Course: AcademySeedCourse = {
  slug: 'blockchain-social-impact',
  title: 'Blockchain Technology for Social Impact Businesses',
  tagline: 'Structured blockchain education for African founders, operators, and impact teams',
  description:
    'A five-week learning experience covering blockchain history, consensus, wallets, smart contracts, DeFi, and capstone reflection through a social-impact lens. The programme combines guided weekly lessons, curated resources, quizzes, and assignments designed for non-technical and semi-technical professionals.',
  level: 'Beginner',
  estimatedDuration: '5 weeks',
  phaseLabel: 'Phase 1 — Theory & Fundamentals',
  facilitators: [
    {
      email: 'joyegbu@gmail.com',
      name: 'Joy Egbu',
      title: 'Software Engineer & CPO',
      organization: 'Rubikcon Nexus',
      linkedinUrl: 'https://www.linkedin.com/in/joyegbu',
      bio: 'Joy leads the programme with a practical lens on product thinking, systems design, and blockchain adoption for social impact organisations.',
    },
    {
      email: 'ozioma@rubikcon.com',
      name: 'Ozioma Onukogu',
      title: 'Programme Lead & Ecosystem Builder',
      organization: 'Rubikcon Nexus',
      linkedinUrl: 'https://www.linkedin.com/in/ozioma-onukogu',
      bio: 'Ozioma supports facilitation, cohort delivery, and capstone framing with a focus on ecosystem strategy and participant growth.',
    },
  ],
  weeks: [
    {
      number: 1,
      slug: 'week-1-blockchain-fundamentals-history',
      title: 'Blockchain Fundamentals & History',
      durationLabel: '2h 06m',
      difficulty: 'BEGINNER',
      hook: 'This opening week grounds learners in where blockchain came from, why it emerged, and why it matters for impact-driven organisations that need trust, transparency, and traceability.',
      whatToExpect: 'Expect a conceptual but beginner-friendly week with a strong emphasis on historical context and plain-language explanation. No coding knowledge is required, but learners should be prepared to connect abstract ideas like decentralisation and immutability to practical business problems.',
      summary: 'Week 1 introduces the origin story of blockchain, starting from digital trust challenges and the design choices that made Bitcoin possible. Learners will unpack the core building blocks of distributed ledgers, blocks, transactions, and consensus at a high level. The week also frames how blockchain applies to social impact businesses, especially where transparency, accountability, and shared recordkeeping matter. By the end of the week, learners should be able to describe blockchain in simple terms and distinguish it from a standard database or digital payment app.',
      estimatedCompletionMinutes: 126,
      videoTitle: 'Week 1 Introduction',
      videoUrl: 'https://www.youtube.com/embed/SSo_EIwHSd4',
      facilitators: ['joyegbu@gmail.com'],
      topics: [
        'Origins of blockchain and the trust problem',
        'From Bitcoin to broader blockchain ecosystems',
        'Distributed ledgers, blocks, and transactions',
        'Decentralisation, immutability, and transparency',
        'Genesis block and why blockchain history matters',
      ],
      objectives: [
        'Explain what blockchain is in plain language.',
        'Describe the historical problem blockchain was designed to solve.',
        'Identify the core properties that make blockchains different from traditional databases.',
        'Connect blockchain fundamentals to social impact use cases.',
      ],
      slideDeck: {
        title: 'Week 1 Slide Deck',
        url: 'https://ethereum.org/en/whitepaper/',
        slideCount: 24,
        lastUpdatedAt: '2026-05-01T09:00:00.000Z',
        viewerType: 'EXTERNAL',
        sections: ['Introduction', 'History', 'Core Concepts', 'Real-World Examples', 'Discussion Questions', 'Key Takeaways'],
      },
      glossary: [
        {
          term: 'Blockchain',
          definition: 'A distributed ledger system that records transactions in blocks linked cryptographically over time.',
          example: 'A donation trail recorded on a blockchain can be verified by donors without relying on a single database owner.',
        },
        {
          term: 'Genesis Block',
          definition: 'The very first block in a blockchain network, which starts the chain and has no previous block before it.',
        },
        {
          term: 'Distributed Ledger',
          definition: 'A shared record of data that is maintained across multiple computers instead of one central server.',
        },
        {
          term: 'Decentralisation',
          definition: 'A system design where control and verification are spread across multiple participants rather than one central authority.',
        },
        {
          term: 'Immutability',
          definition: 'The practical difficulty of altering historical records once they have been written to the blockchain.',
        },
        {
          term: 'Node',
          definition: 'A computer that participates in a blockchain network by storing, validating, or relaying data.',
        },
        {
          term: 'Consensus',
          definition: 'The method a blockchain network uses to agree on the valid state of the ledger.',
        },
      ],
      readings: [
        {
          title: 'Bitcoin: A Peer-to-Peer Electronic Cash System',
          source: 'Bitcoin.org',
          url: 'https://bitcoin.org/bitcoin.pdf',
          description: 'The original whitepaper that introduced Bitcoin and the core idea of a chain of proof-backed records.',
          type: 'WHITEPAPER',
        },
        {
          title: 'What is Ethereum?',
          source: 'Ethereum.org',
          url: 'https://ethereum.org/en/what-is-ethereum/',
          description: 'A beginner-friendly explanation of Ethereum as a programmable blockchain ecosystem.',
          type: 'DOCUMENTATION',
        },
        {
          title: 'Blockchain Explained',
          source: 'IBM',
          url: 'https://www.ibm.com/think/topics/blockchain',
          description: 'An accessible overview that helps learners connect blockchain terminology to business use cases.',
          type: 'ARTICLE',
        },
      ],
      quiz: {
        title: 'Week 1 Knowledge Check',
        passMark: 70,
        questions: [
          {
            prompt: 'What problem was blockchain originally designed to address?',
            explanation: 'Blockchain emerged to help people exchange and verify value online without depending on a single central intermediary.',
            options: [
              { label: 'Reducing the size of internet files', isCorrect: false },
              { label: 'Creating trust in digital transactions without a central authority', isCorrect: true },
              { label: 'Replacing all forms of cash with loyalty points', isCorrect: false },
              { label: 'Making spreadsheets easier to use', isCorrect: false },
            ],
          },
          {
            prompt: 'What is the Genesis Block?',
            explanation: 'The Genesis Block is the first block in a blockchain and serves as the starting point of the chain.',
            options: [
              { label: 'The latest block added to a chain', isCorrect: false },
              { label: 'The backup copy of a blockchain', isCorrect: false },
              { label: 'The first block in the blockchain', isCorrect: true },
              { label: 'A block that contains only smart contracts', isCorrect: false },
            ],
          },
          {
            prompt: 'Which property makes historical blockchain records difficult to alter?',
            explanation: 'Immutability describes the practical resistance to changing prior records after they are confirmed on-chain.',
            options: [
              { label: 'Volatility', isCorrect: false },
              { label: 'Immutability', isCorrect: true },
              { label: 'Liquidity', isCorrect: false },
              { label: 'Custodianship', isCorrect: false },
            ],
          },
          {
            prompt: 'A distributed ledger is best described as:',
            explanation: 'A distributed ledger is shared across multiple computers rather than maintained by one central administrator.',
            options: [
              { label: 'A spreadsheet kept by one bank manager', isCorrect: false },
              { label: 'A shared record replicated across multiple network participants', isCorrect: true },
              { label: 'A private email archive', isCorrect: false },
              { label: 'A social media feed', isCorrect: false },
            ],
          },
          {
            prompt: 'Why is blockchain relevant for social impact organisations?',
            explanation: 'It can improve transparency, traceability, and trust in how resources move and how outcomes are recorded.',
            options: [
              { label: 'It guarantees every project will raise funds', isCorrect: false },
              { label: 'It removes the need for governance entirely', isCorrect: false },
              { label: 'It can strengthen transparency and accountability', isCorrect: true },
              { label: 'It only works for gaming companies', isCorrect: false },
            ],
          },
        ],
      },
      assignments: [
        {
          title: 'Impact Use-Case Reflection',
          instructions: 'Write a short reflection describing one trust problem in a social impact business or NGO and explain how blockchain could improve transparency or coordination.',
          deadline: '2026-06-13T23:59:00.000Z',
          allowTextSubmission: true,
          allowFileUpload: false,
          choices: [
            {
              title: 'Choice 1: Video Comment Analysis',
              description: 'Summarise the key argument from a recommended introductory video and connect it to one impact sector.',
            },
            {
              title: 'Choice 2: Whitepaper Summary',
              description: 'Summarise the original Bitcoin whitepaper in beginner-friendly language for a non-technical founder.',
            },
          ],
        },
      ],
    },
    {
      number: 2,
      slug: 'week-2-blockchain-types-consensus-cryptography',
      title: 'Blockchain Types, Consensus & Cryptography',
      durationLabel: '5h 45m',
      difficulty: 'BEGINNER',
      hook: 'Week 2 moves from broad concepts into the design choices that make blockchains work: public versus private networks, consensus rules, and the cryptographic tools that protect integrity.',
      whatToExpect: 'This week introduces more technical language, but the teaching remains product- and business-friendly. Learners should expect to compare different blockchain architectures and understand why tradeoffs around openness, speed, and trust matter.',
      summary: 'Week 2 expands the learner’s mental model by showing that not all blockchains are built the same way. Participants will compare public, private, and consortium chains and assess where each model fits in social impact delivery. The week also introduces consensus mechanisms such as Proof of Work and Proof of Stake, along with the basics of cryptography and hashing. By the end of the week, learners should be able to reason about blockchain design tradeoffs and explain how network trust is maintained.',
      estimatedCompletionMinutes: 345,
      videoTitle: 'Consensus, Cryptography & Network Design',
      videoUrl: 'https://www.youtube.com/embed/M3EFi_POhps',
      facilitators: ['joyegbu@gmail.com'],
      topics: [
        'Public, private, and consortium blockchains',
        'Proof of Work versus Proof of Stake',
        'How consensus creates shared trust',
        'Cryptographic hashing and digital signatures',
        'Tradeoffs between openness, speed, privacy, and cost',
      ],
      objectives: [
        'Differentiate public, private, and consortium blockchain models.',
        'Explain how consensus mechanisms help a network agree on valid transactions.',
        'Describe the role of hashing and digital signatures in blockchain security.',
        'Assess which blockchain type best fits different social impact scenarios.',
      ],
      slideDeck: {
        title: 'Week 2 Slide Deck',
        url: 'https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/',
        slideCount: 31,
        lastUpdatedAt: '2026-05-01T09:30:00.000Z',
        viewerType: 'EXTERNAL',
        sections: ['Introduction', 'Blockchain Types', 'Consensus Models', 'Cryptography Basics', 'Case Studies', 'Key Takeaways'],
      },
      glossary: [
        { term: 'Public Blockchain', definition: 'A blockchain network that anyone can join, verify, and read from without central permission.' },
        { term: 'Private Blockchain', definition: 'A restricted blockchain network where participation and access are controlled by an organisation or operator.' },
        { term: 'Consortium Blockchain', definition: 'A permissioned blockchain shared across multiple organisations that govern the network together.' },
        { term: 'Proof of Work', definition: 'A consensus mechanism where miners expend computational effort to validate blocks.' },
        { term: 'Proof of Stake', definition: 'A consensus mechanism where validators participate based on assets they stake to secure the network.' },
        { term: 'Hash Function', definition: 'A one-way function that converts input data into a fixed-size output used for integrity checks.' },
        { term: 'Digital Signature', definition: 'A cryptographic proof that a message or transaction was authorised by the holder of a private key.' },
        { term: 'Validator', definition: 'A participant responsible for proposing or confirming blocks in many blockchain networks.' },
      ],
      readings: [
        {
          title: 'Consensus Mechanisms Explained',
          source: 'Ethereum.org',
          url: 'https://ethereum.org/en/developers/docs/consensus-mechanisms/',
          description: 'A practical reference for understanding how modern consensus systems maintain agreement.',
          type: 'DOCUMENTATION',
        },
        {
          title: 'Blockchain Security and Cryptography',
          source: 'Chainlink Education Hub',
          url: 'https://chain.link/education/blockchain',
          description: 'A readable introduction to blockchain security principles and how cryptography supports them.',
          type: 'ARTICLE',
        },
        {
          title: 'Proof of Work vs Proof of Stake',
          source: 'Binance Academy',
          url: 'https://academy.binance.com/en/articles/proof-of-work-vs-proof-of-stake',
          description: 'A side-by-side comparison useful for class discussion and assignment prep.',
          type: 'ARTICLE',
        },
      ],
      quiz: {
        title: 'Week 2 Knowledge Check',
        passMark: 70,
        questions: [
          {
            prompt: 'Which blockchain type is most open to public participation?',
            explanation: 'Public blockchains allow open access for reading and validation without a central approval step.',
            options: [
              { label: 'Public blockchain', isCorrect: true },
              { label: 'Private blockchain', isCorrect: false },
              { label: 'Consortium blockchain', isCorrect: false },
              { label: 'Archived blockchain', isCorrect: false },
            ],
          },
          {
            prompt: 'What is the main purpose of a consensus mechanism?',
            explanation: 'Consensus helps network participants agree on which transactions are valid and what the latest ledger state should be.',
            options: [
              { label: 'To choose a network logo', isCorrect: false },
              { label: 'To compress transactions into smaller files', isCorrect: false },
              { label: 'To help the network agree on valid state updates', isCorrect: true },
              { label: 'To hide all data from users', isCorrect: false },
            ],
          },
          {
            prompt: 'Which statement best describes a hash function?',
            explanation: 'Hash functions create fixed-length outputs that help verify data integrity and make tampering evident.',
            options: [
              { label: 'It stores passwords in plain text', isCorrect: false },
              { label: 'It converts data into a fixed-length fingerprint', isCorrect: true },
              { label: 'It deletes duplicate blocks', isCorrect: false },
              { label: 'It signs legal agreements', isCorrect: false },
            ],
          },
          {
            prompt: 'Why might a social impact consortium choose a consortium blockchain?',
            explanation: 'A consortium chain can balance shared governance with more privacy and operational control than a fully public chain.',
            options: [
              { label: 'Because it removes the need for participating organisations', isCorrect: false },
              { label: 'Because it allows a few trusted organisations to govern together', isCorrect: true },
              { label: 'Because it is always free to operate', isCorrect: false },
              { label: 'Because it cannot track transactions', isCorrect: false },
            ],
          },
          {
            prompt: 'What do digital signatures prove in a blockchain system?',
            explanation: 'Digital signatures prove that the holder of the correct private key authorised a transaction or message.',
            options: [
              { label: 'That a transaction was approved by the internet provider', isCorrect: false },
              { label: 'That a message was authorised by the correct key holder', isCorrect: true },
              { label: 'That a smart contract is bug free', isCorrect: false },
              { label: 'That a blockchain is private', isCorrect: false },
            ],
          },
        ],
      },
      assignments: [
        {
          title: 'Consensus & Network Design Comparison',
          instructions: 'Compare two blockchain designs for a social impact use case. Explain which type of network and which consensus mechanism you would recommend, and why.',
          deadline: '2026-06-20T23:59:00.000Z',
          allowTextSubmission: true,
          allowFileUpload: false,
          choices: [
            {
              title: 'Choice 1: Research Task',
              description: 'Research one live public blockchain and one consortium example used in social or enterprise settings.',
            },
            {
              title: 'Choice 2: PoW vs PoS Explainer',
              description: 'Create a short explainer for founders on when Proof of Work and Proof of Stake tradeoffs matter.',
            },
          ],
        },
      ],
    },
    {
      number: 3,
      slug: 'week-3-wallets-keys-transactions-explorers',
      title: 'Wallets, Keys, Transactions & Explorers',
      durationLabel: '2h 33m',
      difficulty: 'BEGINNER',
      hook: 'Week 3 makes blockchain interaction tangible by focusing on wallets, private keys, transactions, addresses, and blockchain explorers.',
      whatToExpect: 'This week is more operational and hands-on. Learners should expect to move from theory to direct interaction concepts, including how to read a transaction and why wallet security matters in practice.',
      summary: 'Week 3 helps learners understand what it actually means to participate in a blockchain network. The module introduces wallets, addresses, seed phrases, gas fees, and block explorers as everyday tools for users and teams. It also demystifies transaction flow from initiation to confirmation. By the end of the week, learners should be able to explain wallet security basics and confidently interpret transaction details on an explorer.',
      estimatedCompletionMinutes: 153,
      videoTitle: 'Wallets, Transactions & Explorers',
      videoUrl: 'https://www.youtube.com/embed/b4b8ktEV4Bg',
      facilitators: ['joyegbu@gmail.com'],
      topics: [
        'Wallet types and custody models',
        'Private keys, public keys, and seed phrases',
        'Addresses, gas, and transaction lifecycle',
        'Using blockchain explorers to inspect on-chain activity',
        'Operational security for founders and community teams',
      ],
      objectives: [
        'Explain how wallets and keys enable blockchain access and control.',
        'Describe the difference between custodial and non-custodial wallets.',
        'Read the main fields of a blockchain transaction on an explorer.',
        'Apply baseline operational security practices to wallet use.',
      ],
      slideDeck: {
        title: 'Week 3 Slide Deck',
        url: 'https://ethereum.org/en/wallets/',
        slideCount: 28,
        lastUpdatedAt: '2026-05-02T10:00:00.000Z',
        viewerType: 'EXTERNAL',
        sections: ['Introduction', 'Wallet Models', 'Keys & Addresses', 'Transactions', 'Explorers', 'Security Tips'],
      },
      glossary: [
        { term: 'Wallet', definition: 'A tool that helps users manage blockchain keys and sign transactions.' },
        { term: 'Private Key', definition: 'A secret credential used to authorise blockchain transactions and control assets.' },
        { term: 'Public Key', definition: 'A cryptographic key derived from a private key and used in address and signature systems.' },
        { term: 'Seed Phrase', definition: 'A human-readable recovery phrase that can recreate a wallet and its private keys.' },
        { term: 'Gas Fee', definition: 'The fee paid to process and validate activity on a blockchain network.' },
        { term: 'Transaction Hash', definition: 'A unique identifier used to reference and inspect a specific blockchain transaction.' },
        { term: 'Explorer', definition: 'A web interface for searching and reviewing blockchain data such as transactions, addresses, and blocks.' },
        { term: 'Custodial Wallet', definition: 'A wallet arrangement where a third party helps control or store the user’s keys.' },
      ],
      readings: [
        {
          title: 'Wallets',
          source: 'Ethereum.org',
          url: 'https://ethereum.org/en/wallets/',
          description: 'An overview of how wallets work and what learners should consider when choosing one.',
          type: 'DOCUMENTATION',
        },
        {
          title: 'How to Use Etherscan',
          source: 'Etherscan',
          url: 'https://info.etherscan.com/',
          description: 'A starting point for understanding transaction and address lookup on an explorer.',
          type: 'DOCUMENTATION',
        },
        {
          title: 'Wallet Security Basics',
          source: 'MetaMask Learn',
          url: 'https://learn.metamask.io/',
          description: 'Practical wallet safety guidance appropriate for first-time blockchain users.',
          type: 'COURSE',
        },
      ],
      quiz: {
        title: 'Week 3 Knowledge Check',
        passMark: 70,
        questions: [
          {
            prompt: 'What should remain secret in a wallet setup?',
            explanation: 'Private keys and seed phrases must remain secret because they control access to assets and signing ability.',
            options: [
              { label: 'Wallet logo', isCorrect: false },
              { label: 'Private key', isCorrect: true },
              { label: 'Public address label', isCorrect: false },
              { label: 'Transaction hash', isCorrect: false },
            ],
          },
          {
            prompt: 'What is a blockchain explorer used for?',
            explanation: 'Explorers let users search and inspect transaction, block, and address data recorded on-chain.',
            options: [
              { label: 'Writing smart contracts directly on-chain', isCorrect: false },
              { label: 'Inspecting blockchain records and transactions', isCorrect: true },
              { label: 'Printing wallets', isCorrect: false },
              { label: 'Replacing private keys', isCorrect: false },
            ],
          },
          {
            prompt: 'Which wallet model gives the user direct control of the keys?',
            explanation: 'A non-custodial wallet means the user, not a provider, holds the keys and recovery material.',
            options: [
              { label: 'Non-custodial wallet', isCorrect: true },
              { label: 'Custodial wallet', isCorrect: false },
              { label: 'Read-only wallet', isCorrect: false },
              { label: 'Archived wallet', isCorrect: false },
            ],
          },
          {
            prompt: 'What is a transaction hash?',
            explanation: 'A transaction hash is the unique reference used to locate and verify a transaction on-chain.',
            options: [
              { label: 'The wallet password chosen by the user', isCorrect: false },
              { label: 'The unique identifier of a blockchain transaction', isCorrect: true },
              { label: 'A type of gas token', isCorrect: false },
              { label: 'A consensus vote', isCorrect: false },
            ],
          },
          {
            prompt: 'Why are seed phrases important?',
            explanation: 'Seed phrases allow wallet recovery, which means anyone with access to them can potentially take control of the wallet.',
            options: [
              { label: 'They increase token prices', isCorrect: false },
              { label: 'They help recover wallet access', isCorrect: true },
              { label: 'They remove gas fees', isCorrect: false },
              { label: 'They confirm blocks', isCorrect: false },
            ],
          },
        ],
      },
      assignments: [
        {
          title: 'Wallet & Explorer Practice',
          instructions: 'Describe the lifecycle of a blockchain transaction and document the fields a beginner should read first on a block explorer.',
          deadline: '2026-06-27T23:59:00.000Z',
          allowTextSubmission: true,
          allowFileUpload: false,
          choices: [
            {
              title: 'Choice 1: Explorer Analysis',
              description: 'Analyse a sample transaction and explain sender, receiver, value, gas fee, and status.',
            },
            {
              title: 'Choice 2: Security Guide',
              description: 'Create a founder-friendly checklist for secure wallet setup and safe key handling.',
            },
          ],
        },
      ],
    },
    {
      number: 4,
      slug: 'week-4-smart-contracts-defi-real-world-applications',
      title: 'Smart Contracts, DeFi & Real-World Applications',
      durationLabel: '3h 18m',
      difficulty: 'INTERMEDIATE',
      hook: 'Week 4 connects blockchain infrastructure to application design by introducing smart contracts, DeFi mechanics, and live examples of blockchain solving real-world coordination problems.',
      whatToExpect: 'This week introduces more applied product thinking and more advanced concepts, but it still avoids requiring learners to code. Expect concrete case studies and practical comparisons between different blockchain-based business models.',
      summary: 'Week 4 shifts attention from the network itself to the programs and services built on top of it. Learners will explore smart contracts as automated rules, DeFi as an alternative financial coordination layer, and real-world applications that extend beyond speculation. The week also highlights risks, governance considerations, and design tradeoffs when building for public or semi-public systems. By the end, learners should be able to identify where blockchain automation creates value and where off-chain support remains necessary.',
      estimatedCompletionMinutes: 198,
      videoTitle: 'Smart Contracts, DeFi & Practical Use Cases',
      videoUrl: 'https://www.youtube.com/embed/jxLkbJozKbY',
      facilitators: ['joyegbu@gmail.com'],
      topics: [
        'What smart contracts are and how they automate logic',
        'Basics of DeFi protocols and on-chain financial coordination',
        'DAOs, voting systems, and treasury transparency',
        'Supply chain, identity, and aid distribution use cases',
        'Risks, constraints, and governance realities in production systems',
      ],
      objectives: [
        'Explain what a smart contract is and what it is not.',
        'Describe how DeFi protocols coordinate value without traditional intermediaries.',
        'Evaluate blockchain use cases in supply chains, funding, and community governance.',
        'Recognise the operational and governance risks of blockchain-based applications.',
      ],
      slideDeck: {
        title: 'Week 4 Slide Deck',
        url: 'https://ethereum.org/en/developers/docs/smart-contracts/',
        slideCount: 34,
        lastUpdatedAt: '2026-05-02T11:00:00.000Z',
        viewerType: 'EXTERNAL',
        sections: ['Introduction', 'Smart Contracts', 'DeFi Models', 'Case Studies', 'DAO Discussion', 'Key Takeaways'],
      },
      glossary: [
        { term: 'Smart Contract', definition: 'A program deployed on a blockchain that runs when predefined conditions are met.' },
        { term: 'DeFi', definition: 'Decentralized Finance, a category of blockchain-based financial applications that operate without traditional intermediaries.' },
        { term: 'DAO', definition: 'A decentralized autonomous organization that coordinates rules, decisions, or treasury management through blockchain tools.' },
        { term: 'Token', definition: 'A blockchain-based digital asset used for value transfer, utility, governance, or representation.' },
        { term: 'Treasury', definition: 'A pool of funds held and managed by a protocol, community, or organisation.' },
        { term: 'Liquidity', definition: 'The ease with which assets can be exchanged or accessed within a market or protocol.' },
        { term: 'Oracle', definition: 'A service that provides external data to smart contracts so on-chain logic can respond to off-chain events.' },
        { term: 'Governance', definition: 'The process by which participants make or influence decisions in a blockchain-based system.' },
      ],
      readings: [
        {
          title: 'Smart Contracts',
          source: 'Ethereum.org',
          url: 'https://ethereum.org/en/smart-contracts/',
          description: 'A foundational explainer on how smart contracts work and what they enable.',
          type: 'DOCUMENTATION',
        },
        {
          title: 'What is DeFi?',
          source: 'Coinbase Learn',
          url: 'https://www.coinbase.com/learn/crypto-basics/what-is-defi',
          description: 'A practical overview of decentralized finance and the user problems it aims to solve.',
          type: 'ARTICLE',
        },
        {
          title: 'Gitcoin Grants',
          source: 'Gitcoin',
          url: 'https://www.gitcoin.co/grants',
          description: 'A real-world example of community-driven funding infrastructure relevant to impact builders.',
          type: 'INTERACTIVE',
        },
      ],
      quiz: {
        title: 'Week 4 Knowledge Check',
        passMark: 70,
        questions: [
          {
            prompt: 'What best describes a smart contract?',
            explanation: 'A smart contract is blockchain-deployed code that runs agreed rules automatically when conditions are met.',
            options: [
              { label: 'A PDF version of a legal contract', isCorrect: false },
              { label: 'A blockchain program that automates predefined logic', isCorrect: true },
              { label: 'A private key manager', isCorrect: false },
              { label: 'A marketing campaign', isCorrect: false },
            ],
          },
          {
            prompt: 'What does DeFi stand for?',
            explanation: 'DeFi means Decentralized Finance and refers to blockchain-native financial services and coordination models.',
            options: [
              { label: 'Deferred Finance', isCorrect: false },
              { label: 'Decentralized Finance', isCorrect: true },
              { label: 'Digital Financial Identity', isCorrect: false },
              { label: 'Distributed File Infrastructure', isCorrect: false },
            ],
          },
          {
            prompt: 'Why might a DAO be useful for an impact community?',
            explanation: 'DAOs can improve shared governance, transparent treasury oversight, and community participation in decisions.',
            options: [
              { label: 'They remove all need for governance', isCorrect: false },
              { label: 'They support transparent and shared decision-making', isCorrect: true },
              { label: 'They guarantee legal compliance automatically', isCorrect: false },
              { label: 'They eliminate all operational risk', isCorrect: false },
            ],
          },
          {
            prompt: 'What role does an oracle play?',
            explanation: 'Oracles bring external information to smart contracts so the contract can act on real-world conditions.',
            options: [
              { label: 'It stores all NFTs for a user', isCorrect: false },
              { label: 'It supplies external data to a smart contract', isCorrect: true },
              { label: 'It writes private keys to a database', isCorrect: false },
              { label: 'It is another word for validator', isCorrect: false },
            ],
          },
          {
            prompt: 'Which of the following is a realistic blockchain use case for social impact?',
            explanation: 'Traceability in supply chains is one of the clearer examples where blockchain records can add accountability and auditability.',
            options: [
              { label: 'Transparent agricultural supply-chain records', isCorrect: true },
              { label: 'Removing all local regulations instantly', isCorrect: false },
              { label: 'Replacing every database in an organisation', isCorrect: false },
              { label: 'Guaranteeing perfect governance outcomes', isCorrect: false },
            ],
          },
        ],
      },
      assignments: [
        {
          title: 'Application Design Analysis',
          instructions: 'Choose one blockchain-based application pattern and analyse its value, risks, and fit for a social impact organisation.',
          deadline: '2026-07-04T23:59:00.000Z',
          allowTextSubmission: true,
          allowFileUpload: false,
          choices: [
            {
              title: 'Choice 1: Smart Contract Analysis',
              description: 'Explain how a smart contract could automate a funding or reporting workflow.',
            },
            {
              title: 'Choice 2: DAO Case Study',
              description: 'Review a DAO or community governance example and propose improvements for an impact setting.',
            },
          ],
        },
      ],
    },
    {
      number: 5,
      slug: 'week-5-phase-1-reflection-capstone',
      title: 'Phase 1 Reflection & Capstone',
      durationLabel: '2h 48m',
      difficulty: 'INTERMEDIATE',
      hook: 'The final week consolidates the first phase by moving learners from isolated concepts to integrated thinking, reflection, and presentation of a blockchain-for-impact concept.',
      whatToExpect: 'Expect a synthesis week with more reflection and communication than new theory. Learners will revisit the ideas from Weeks 1-4, connect them to real opportunities, and prepare a concise capstone response or presentation.',
      summary: 'Week 5 is designed to help learners translate learning into structured judgement and communication. Participants will reflect on the strongest ideas from the phase, analyse a blockchain project or whitepaper, and articulate where blockchain meaningfully fits social impact work. The capstone encourages clear reasoning rather than hype, and it rewards learners who can identify both opportunity and limitation. By the end, learners should be able to present a grounded perspective on how blockchain can or cannot improve a chosen use case.',
      estimatedCompletionMinutes: 168,
      videoTitle: 'Phase 1 Reflection & Capstone Brief',
      videoUrl: 'https://www.youtube.com/embed/ipwxYa-F1uY',
      facilitators: ['joyegbu@gmail.com', 'ozioma@rubikcon.com'],
      topics: [
        'Review of blockchain fundamentals and applied concepts',
        'Structured reflection on where blockchain fits and where it does not',
        'Whitepaper and product analysis techniques',
        'Capstone framing and presentation guidance',
        'Preparing for Phase 2 or further self-directed learning',
      ],
      objectives: [
        'Synthesize the main lessons from Phase 1 into a coherent point of view.',
        'Evaluate a blockchain product, protocol, or whitepaper critically.',
        'Present a social-impact use case with clear reasoning, benefits, and constraints.',
        'Identify personal next steps for continued blockchain learning.',
      ],
      slideDeck: {
        title: 'Week 5 Slide Deck',
        url: 'https://ethereum.org/en/community/online/',
        slideCount: 22,
        lastUpdatedAt: '2026-05-02T11:30:00.000Z',
        viewerType: 'EXTERNAL',
        sections: ['Reflection', 'Framework Recap', 'Capstone Brief', 'Presentation Structure', 'Feedback Criteria', 'Next Steps'],
      },
      glossary: [
        { term: 'Capstone', definition: 'A culminating assignment that asks learners to integrate and apply what they have learned.' },
        { term: 'Use Case Fit', definition: 'An assessment of whether blockchain actually matches the problem, users, and constraints of a given scenario.' },
        { term: 'Tradeoff', definition: 'A design choice where gaining one advantage often means accepting one or more limitations.' },
        { term: 'Narrative', definition: 'The way a project or founder frames the purpose, value, and expected outcomes of a blockchain solution.' },
        { term: 'Evaluation Criteria', definition: 'The standards used to judge the quality, rigor, and relevance of a project or submission.' },
        { term: 'Governance Model', definition: 'The structure used to make decisions, allocate control, or manage oversight in a system.' },
        { term: 'Impact Measurement', definition: 'A method for tracking whether a programme or intervention is delivering intended results.' },
      ],
      readings: [
        {
          title: 'Ethereum Whitepaper',
          source: 'Ethereum.org',
          url: 'https://ethereum.org/en/whitepaper/',
          description: 'Useful for learners practicing how to read core blockchain concepts from source material.',
          type: 'WHITEPAPER',
        },
        {
          title: 'Cyfrin Updraft',
          source: 'Cyfrin',
          url: 'https://updraft.cyfrin.io/',
          description: 'A next-step learning resource for participants who want to deepen their technical understanding.',
          type: 'COURSE',
        },
        {
          title: 'Blockchain for Social Impact',
          source: 'World Economic Forum',
          url: 'https://www.weforum.org/',
          description: 'A broader ecosystem lens on how blockchain can be applied beyond token speculation.',
          type: 'ARTICLE',
        },
      ],
      quiz: {
        title: 'Week 5 Knowledge Check',
        passMark: 70,
        questions: [
          {
            prompt: 'What is the main purpose of the capstone in this phase?',
            explanation: 'The capstone is meant to help learners integrate and apply the ideas from the entire phase, not just recall isolated definitions.',
            options: [
              { label: 'To memorise more glossary terms than anyone else', isCorrect: false },
              { label: 'To integrate the phase content into a grounded application or critique', isCorrect: true },
              { label: 'To avoid writing any reflections', isCorrect: false },
              { label: 'To replace all weekly assignments', isCorrect: false },
            ],
          },
          {
            prompt: 'A strong blockchain-for-impact proposal should include:',
            explanation: 'Strong proposals explain the problem, why blockchain helps, where it does not help, and what tradeoffs exist.',
            options: [
              { label: 'Only hype and trend language', isCorrect: false },
              { label: 'Clear problem framing, fit analysis, and tradeoffs', isCorrect: true },
              { label: 'No mention of risks or governance', isCorrect: false },
              { label: 'A promise to tokenize everything', isCorrect: false },
            ],
          },
          {
            prompt: 'Why is critical evaluation important in blockchain learning?',
            explanation: 'Blockchain should be assessed realistically so learners can separate genuine value from poor-fit use cases.',
            options: [
              { label: 'Because every blockchain idea is automatically good', isCorrect: false },
              { label: 'Because not every problem needs a blockchain solution', isCorrect: true },
              { label: 'Because explorers are too hard to use', isCorrect: false },
              { label: 'Because gas fees never matter', isCorrect: false },
            ],
          },
          {
            prompt: 'Which statement best reflects Phase 1 learning?',
            explanation: 'The course encourages grounded understanding, not blind adoption, and expects learners to reason about both opportunity and limitations.',
            options: [
              { label: 'Blockchain is always the best solution', isCorrect: false },
              { label: 'Blockchain should be evaluated against real needs and constraints', isCorrect: true },
              { label: 'Social impact work never needs governance', isCorrect: false },
              { label: 'Whitepapers are not useful for understanding products', isCorrect: false },
            ],
          },
          {
            prompt: 'What is a useful next step after Phase 1?',
            explanation: 'After Phase 1, learners should deepen either technical skills or product strategy based on their goals.',
            options: [
              { label: 'Ignore all future learning paths', isCorrect: false },
              { label: 'Choose a deeper learning path based on role and goals', isCorrect: true },
              { label: 'Stop using explorers and wallets', isCorrect: false },
              { label: 'Only read marketing content', isCorrect: false },
            ],
          },
        ],
      },
      assignments: [
        {
          title: 'Phase 1 Capstone Submission',
          instructions: 'Submit a concise capstone that analyses a blockchain-for-impact use case, project, or whitepaper and argues for or against fit using evidence from the course.',
          deadline: '2026-07-11T23:59:00.000Z',
          allowTextSubmission: true,
          allowFileUpload: false,
          choices: [
            {
              title: 'Choice 1: Whitepaper Analysis',
              description: 'Review a blockchain whitepaper and explain the problem, architecture, tradeoffs, and relevance to social impact work.',
            },
            {
              title: 'Choice 2: Cohort Presentation',
              description: 'Prepare a short presentation proposal for a blockchain-based social impact product or operational workflow.',
            },
          ],
        },
      ],
    },
  ],
}
