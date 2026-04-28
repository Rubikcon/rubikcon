import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Img from '../components/Img'
import { useTheme } from '../context/ThemeContext'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
}

const SERVICES = [
  { title: 'Product Development', desc: 'Full cycle product development services, from ideation and design, to building and launch.' },
  { title: 'Talent Acquisition', desc: 'Assisting companies in finding and hiring top web3 developers, designers, and specialists.' },
  { title: 'Marketing & Branding', desc: 'Crafting effective marketing strategies to reach target audiences and establish a strong brand identity.' },
  { title: 'Web3 Consulting', desc: 'Guiding clients in defining their web3 business model, competitive advantage, and long-term steps. Comprehensive security assessments and audits of blockchain protocols to ensure asset protection and minimize vulnerabilities.' },
  { title: 'Education & Training', desc: 'We offer a comprehensive and robust curriculum of educational programs designed to foster blockchain literacy, drive innovation, and empower individuals, businesses, and communities to actively participate in the web3 ecosystem.' },
]

// const BLOG_POSTS = [
//   { tag: 'A Comprehensive Guide', title: 'How to Avoid Scams in the Web3 Space & its role in NFTs — Beginner Guide to Access the Web3 Ecosystem', 'img:/images/block.jpg': 'Blog: How to avoid scams in Web3 — article thumbnail' },
//   { tag: 'Blockchain', title: 'How to Send Tokens from One Chain to Another Using Chainlink CCIP', img: 'Blog: Chainlink CCIP — article thumbnail' },
//   { tag: 'Community', title: 'Devcon at Your Doorstep — Community Event Recap', img: 'Blog: Devcon at Your Doorstep — event recap thumbnail' },
// ]

const BLOG_POSTS = [
  {
    tag: 'A Comprehensive Guide',
    title: "From Static Pages to Social Spaces: A Beginner's Guide to the Web's Evolution",
    img: '/images/blog-1.jpg',
    href: '#',
    tall: false,
  },
  {
    tag: 'Blockchain',
    title: 'How to Send Tokens from One Chain to Another Using Chainlink CCIP',
    img: '/images/blog-2.jpg',
    href: '#',
    tall: true,   // center card is taller — matches screenshot
  },
  {
    tag: 'Community',
    title: "Devcon at Your Doorstep — Empowering African Youths with Skills for the Future",
    img: '/images/blog-3.jpg',
    href: '#',
    tall: false,
  },
]


const TEAM = [
  { name: 'OZIOMA OKUNDU', role: 'CEO – Chief Executive Officer', img: '/images/ozi.jpg' },
  { name: 'JOY EGBU', role: 'CPO – Chief Product Officer', img: '/images/both.jpg' },
  { name: 'SONIA UDIMO', role: 'COO – Chief Operating Officer', img: '/images/prod-2-ladies.jpg' },
]

// Circular avatar component
function CircleAvatar({ label, size = 'lg' }: { label: string; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'w-28 h-28 md:w-32 md:h-32' : 'w-20 h-20 md:w-24 md:h-24'
  return (
    <div className={`${dim} rounded-full overflow-hidden border-2 border-[#F5C518]/60 flex-shrink-0`}
      style={{ boxShadow: '0 0 20px rgba(245,197,24,0.15)' }}>
      {/* REPLACE with: <img src="/images/rub.jpg" alt={label} className="w-full h-full object-cover" /> */}
      <div className="img-placeholder w-full h-full rounded-full" style={{ borderRadius: '50%', border: 'none' }}>
        <span className="text-[9px] leading-tight px-2 text-center">{label}</span>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const { isDark } = useTheme()

  return (
    <div className="pt-[72px]">

      {/* ══════════════════════════════════════════════════════════════
          HERO SECTION
          - Background: vertical streaks (gold left, teal right, black center)
          - 4 circular photos in corners connected by dashed lines
          - Center: "Building → [Web3] ← Products" layout
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">

        {/* ── Background: vertical streaks extracted from Figma ── */}
        <div className="absolute inset-0 z-0" style={{
          background: `
            radial-gradient(ellipse 25% 60% at 15% 85%, rgba(180,160,0,0.55) 0%, transparent 70%),
            radial-gradient(ellipse 15% 50% at 8% 80%, rgba(200,180,0,0.4) 0%, transparent 60%),
            radial-gradient(ellipse 30% 55% at 85% 80%, rgba(0,160,180,0.5) 0%, transparent 65%),
            radial-gradient(ellipse 15% 45% at 95% 75%, rgba(0,180,200,0.45) 0%, transparent 55%),
            radial-gradient(ellipse 20% 40% at 75% 85%, rgba(140,160,0,0.3) 0%, transparent 60%),
            #000000
          `,
        }}>
          {/* Vertical streak lines — left side gold */}
          {[4, 8, 12, 17, 22].map((left, i) => (
            <div key={`gl-${i}`} className="absolute bottom-0 w-px"
              style={{
                left: `${left}%`,
                height: '55%',
                background: `linear-gradient(to top, rgba(180,160,0,${0.6 - i * 0.08}), transparent)`,
                filter: 'blur(1.5px)',
              }} />
          ))}
          {/* Vertical streak lines — right side teal */}
          {[78, 83, 87, 91, 96].map((left, i) => (
            <div key={`tr-${i}`} className="absolute bottom-0 w-px"
              style={{
                left: `${left}%`,
                height: '50%',
                background: `linear-gradient(to top, rgba(0,160,180,${0.6 - i * 0.08}), transparent)`,
                filter: 'blur(1.5px)',
              }} />
          ))}
          {/* Middle teal arch */}
          {[45, 50, 55, 60].map((left, i) => (
            <div key={`tm-${i}`} className="absolute bottom-0 w-px"
              style={{
                left: `${left}%`,
                height: `${30 - Math.abs(i - 1.5) * 8}%`,
                background: 'linear-gradient(to top, rgba(0, 139, 160, 0.27), transparent)',
                filter: 'blur(2px)',
              }} />
          ))}
        </div>

        {/* ── Dashed curved connector lines (SVG overlay) ── */}
        <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none hidden md:block"
          preserveAspectRatio="none" viewBox="0 0 1080 620">
          {/* Top-left circle to center */}
          <path d="M 130 160 Q 250 200 440 270" fill="none" stroke="#F5C518" strokeWidth="1"
            strokeDasharray="6 6" opacity="0.5" />
          {/* Bottom-left circle to center */}
          <path d="M 100 480 Q 220 420 440 340" fill="none" stroke="#F5C518" strokeWidth="1"
            strokeDasharray="6 6" opacity="0.5" />
          {/* Top-right circle to center */}
          <path d="M 950 150 Q 820 200 640 270" fill="none" stroke="#F5C518" strokeWidth="1"
            strokeDasharray="6 6" opacity="0.5" />
          {/* Bottom-right circle to center */}
          <path d="M 980 480 Q 860 420 640 340" fill="none" stroke="#F5C518" strokeWidth="1"
            strokeDasharray="6 6" opacity="0.5" />
        </svg>

        {/* ── 4 Corner circular photos ── */}
        {/* Top-left */}
        <div className="absolute top-16 left-4 md:left-10 z-20">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
             <img src="/images/handcard.jpg" className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-2 border-[#F5C518]/60" />
            {/* <CircleAvatar label="Hero photo top-left (e.g. team member holding product)" size="sm" /> */}
          </motion.div>
        </div>

        {/* Top-right */}
        <div className="absolute top-16 right-4 md:right-10 z-20">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
             <img src="/images/card.jpg" className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-2 border-[#F5C518]/60" />
            {/* <CircleAvatar label="Hero photo top-right (e.g. Crypto Trivia card game)" size="sm" /> */}
          </motion.div>
        </div>

        {/* Bottom-left */}
        <div className="absolute bottom-16 left-4 md:left-6 z-20">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
            {/* REPLACE: <img src="/images/hero-bl.jpg" className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover border-2 border-[#F5C518]/60" /> */}
            {/* <CircleAvatar label="Hero photo bottom-left (e.g. two women holding BlockGigs cards)" size="lg" /> */}
            <img
  src="/images/both.jpg"
  alt="description"
  className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-2 border-[#F5C518]/60"
/>
          </motion.div>
        </div>

        {/* Bottom-right */}
        <div className="absolute bottom-16 right-4 md:right-6 z-20">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
            <img src="/images/ozi.jpg" className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover border-2 border-[#F5C518]/60" />
            {/* <CircleAvatar label="Hero photo bottom-right (e.g. woman in green outfit)" size="lg" /> */}
          </motion.div>
        </div>

        {/* ── CENTER CONTENT ── */}
        <div className="relative z-20 text-center px-6 max-w-2xl mx-auto">

          {/* "Building → [Web3] ← Products" layout */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible"
            className="flex items-center justify-center gap-0 mb-1">
            {/* Left side: Building + arrow */}
            <div className="flex flex-col items-end gap-1 mr-3">
              <span className="text-white font-medium text-base md:text-lg">Building</span>
              <div className="flex items-center gap-1 text-white/60">
                <div className="w-16 md:w-24 h-px bg-white/40" />
                <span className="text-xs">→</span>
              </div>
            </div>

            {/* Web3 box */}
            <div className="bg-[#1A1A00] border border-[#F5C518]/30 rounded-xl px-8 py-5 mx-1"
              style={{ boxShadow: '0 0 30px rgba(180,160,0,0.2)' }}>
              <span className="font-display font-bold text-4xl md:text-5xl"
                style={{ color: '#B8B000', letterSpacing: '-0.02em' }}>Web3</span>
            </div>

            {/* Right side: arrow + Products */}
            <div className="flex flex-col items-start gap-1 ml-3">
              <span className="text-white font-medium text-base md:text-lg">Products</span>
              <div className="flex items-center gap-1 text-white/60">
                <span className="text-xs">←</span>
                <div className="w-16 md:w-24 h-px bg-white/40" />
              </div>
            </div>
          </motion.div>

          {/* "Creating   Opportunities" row */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.5}
            className="flex items-center justify-center gap-0 mb-12">
            <div className="flex flex-col items-end gap-1 mr-3">
              <div className="flex items-center gap-1 text-white/60">
                <div className="w-16 md:w-24 h-px bg-white/40" />
                <span className="text-xs">→</span>
              </div>
              <span className="text-white font-medium text-base md:text-lg">Creating</span>
            </div>

            {/* Spacer matching Web3 box width */}
            <div className="px-8 py-5 mx-1 opacity-0 pointer-events-none">
              <span className="font-display font-bold text-4xl md:text-5xl">Web3</span>
            </div>

            <div className="flex flex-col items-start gap-1 ml-3">
              <div className="flex items-center gap-1 text-white/60">
                <span className="text-xs">←</span>
                <div className="w-16 md:w-24 h-px bg-white/40" />
              </div>
              <span className="text-white font-medium text-base md:text-lg">Opportunities</span>
            </div>
          </motion.div>

          {/* Description */}
          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="text-[#CCCCCC] text-sm md:text-base leading-relaxed mb-8 max-w-lg mx-auto">
            Our end-to-end services include ideation, strategy, product development, and education —
            helping businesses seize the decentralized future with our scalable web3 solutions.
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1.5}>
            <a href="/about" className="btn-gold px-8 py-3 text-sm">
              Learn More <ArrowRight size={15} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          WHAT WE DO — cream background
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-[#F5F0DC]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-10 gap-4">
            <div>
              <div className="inline-block border border-[#C9A800]/50 text-[#C9A800] text-xs px-3 py-1 rounded-full mb-3 font-mono">Our Services</div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0A0A0A]">What we do</h2>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm text-[#555555] max-w-xs">Want a 15 minutes demo on how we can elevate your business. Let's talk</p>
              <a href="/contact" className="btn-dark flex-shrink-0">Let's talk</a>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((s, i) => (
              <motion.div key={s.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="bg-white border border-[#E8DFB8] rounded-xl p-6 hover:border-[#C9A800]/60 transition-colors">
                <div className="w-8 h-0.5 bg-[#F5C518] mb-4" />
                <h3 className="font-display font-bold text-[#0A0A0A] mb-2 uppercase text-xs tracking-widest">{s.title}</h3>
                <p className="text-xs text-[#666666] leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          OUR PARTNERS — cream
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-[#F5F0DC]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-[#0A0A0A] mb-3">Our Partners</h2>
            <p className="text-[#666666] text-sm max-w-md mx-auto">
              We pride ourselves building a strong community and working with a strong network of already established web3 names.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {['Blockchain', 'Companies', 'Foundations'].map(cat => (
              <div key={cat} className="border border-[#D4C898] rounded-xl p-6 min-h-[140px]">
                <div className="text-xs font-mono text-[#C9A800] tracking-[0.2em] uppercase mb-4">{cat}</div>
                {/* REPLACE: Add actual partner logo <img> tags here */}
                <p className="text-xs text-[#AAAAAA] italic">[ Partner logos ]</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    {/* ══════════════════════════════════════════════════════════════
          BLOG SECTION
          - cream background
          - 3 cards: side cards shorter (h-60), center card taller (h-80)
          - cards align at their BOTTOM edge (items-end)
          - each card: full bleed image, dark gradient overlay, text at bottom
          - each card uses its own unique img path from BLOG_POSTS array
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-[#F5F0DC]">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-10 gap-6">
            <div>
              <div className="inline-block border border-[#C9A800]/40 text-[#C9A800] text-xs px-3 py-1 rounded-full mb-3 font-mono">
                A Comprehensive Guide
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[#0A0A0A] leading-snug">
                Blog — Understanding<br />Blockchain
              </h2>
            </div>
            <div className="md:max-w-xs flex flex-col items-start gap-3">
              <p className="text-sm text-[#666666] leading-relaxed">
                Read a few write-ups about blockchain and the Web3 ecosystem. Want deeper insights? Don't worry, we've got you covered. Check out others
              </p>
              <a href="/contact" className="bg-[#1A1A1A] text-white text-xs font-medium px-5 py-2.5 rounded-full hover:bg-[#333] transition-colors">
                Check out others
              </a>
            </div>
          </div>

          {/* Cards — flex items-end so side cards sit flush at bottom of center card */}
          <div className="flex items-end gap-4">
            {BLOG_POSTS.map((post, i) => (
              <motion.a
                key={i}
                href={post.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex-1 rounded-2xl overflow-hidden group cursor-pointer block ${post.tall ? 'h-80' : 'h-60'}`}
                style={{ textDecoration: 'none' }}
              >
                {/* The actual image — unique per card via post.img */}
                <img
                  src={post.img}
                  alt={post.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Dark gradient overlay so text is readable */}
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.05) 100%)',
                }} />

                {/* Text at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="text-[#F5C518] text-[9px] font-mono uppercase tracking-widest mb-1.5 opacity-90">
                    {post.tag}
                  </div>
                  <h3 className={`font-semibold text-white leading-snug line-clamp-3 ${post.tall ? 'text-sm' : 'text-xs'}`}>
                    {post.title}
                  </h3>
                </div>
              </motion.a>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PROJECTS & PRODUCTS — adapts to theme
      ══════════════════════════════════════════════════════════════ */}
      {/* <section className={`py-20 px-6 transition-colors ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <h2 className={`font-display text-3xl font-bold text-center mb-14 ${isDark ? 'text-white' : 'text-[#0A0A0A]'}`}>
            Projects &amp; Products
          </h2>
          <div className="space-y-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-[#CCCCCC]' : 'text-[#444444]'}`}>
                  We empower individuals and teams through hands-on learning and collaboration in web3. Our projects include{' '}
                  <strong className={isDark ? 'text-white' : 'text-[#0A0A0A]'}>educational trainings, bootcamps, AMA sessions</strong> with
                  industry leaders and <strong className={isDark ? 'text-white' : 'text-[#0A0A0A]'}>partnerships</strong> aimed at bridging the gap between aspirations and expertise.
                </p>
                <a href="/projects" className={isDark ? 'btn-dark' : 'btn-outline'}>Explore <ArrowRight size={13} /></a>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Img label="The Future of DeFi — AMA event flyer" aspect="aspect-square" />
                <Img label="Devcon at Your Doorstep — event photo" aspect="aspect-square" />
                <Img label="The Final Block: Web3 Community Bash flyer" aspect="aspect-square" />
                <Img label="Event/community gathering photo" aspect="aspect-square" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="grid grid-cols-2 gap-3">
                <Img label="BlockGigs — product screenshot with logo" aspect="aspect-square" />
                <Img label="Games — product/event screenshot" aspect="aspect-square" />
              </div>
              <div>
                <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-[#CCCCCC]' : 'text-[#444444]'}`}>
                  We offer a wide range of products, all centered on solving challenges for users world-wide.
                </p>
                <ul className={`space-y-3 mb-6 text-sm ${isDark ? 'text-[#CCCCCC]' : 'text-[#444444]'}`}>
                  <li className="flex gap-2"><span className="text-[#F5C518] flex-shrink-0">•</span>Our <strong className={isDark ? 'text-white' : 'text-[#0A0A0A]'}>business-oriented products</strong> leverage blockchain technology to provide real-world solutions for individuals.</li>
                  <li className="flex gap-2"><span className="text-[#F5C518] flex-shrink-0">•</span>Our <strong className={isDark ? 'text-white' : 'text-[#0A0A0A]'}>games</strong> introduce players to the web3 ecosystem in a fun and engaging way, simplifying complex blockchain concepts.</li>
                </ul>
                <a href="/products" className={isDark ? 'btn-dark' : 'btn-outline'}>Explore <ArrowRight size={13} /></a>
              </div>
            </div>
          </div>
        </div>
      </section> */}


      {/* ══════════════════════════════════════════════════════════════
          PROJECTS & PRODUCTS
          Row 1 (Projects): text LEFT | mosaic RIGHT
            Mosaic: 1 tall image (254×384) + 2 stacked on right (289×192 each)
          Row 2 (Products): mosaic LEFT | text RIGHT
            Mosaic: 1 wide image (222px wide, full height) + 2 stacked on right
                    (top-right: 320×192, bottom-left: 315×192, bottom-right: 228×192)
          Central vertical gold dashed line between rows with pill labels
      ══════════════════════════════════════════════════════════════ */}
      <section className={`py-20 px-6 overflow-hidden transition-colors ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <h2 className={`font-display text-3xl font-bold text-center mb-16 ${isDark ? 'text-white' : 'text-[#0A0A0A]'}`}>
            Projects &amp; Products
          </h2>

          {/* ── Vertical timeline container ── */}
          <div className="relative">

            {/* Central dashed vertical line */}
            <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px hidden md:block"
              style={{ borderLeft: '1.5px dashed #C9A800', opacity: 0.5 }} />

            {/* ── ROW 1: Projects ── */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-24 relative">

              {/* LEFT: text */}
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-[#CCCCCC]' : 'text-[#444444]'}`}>
                  We empower individuals and teams through hands-on learning and collaboration in web3.
                  Our projects cover{' '}
                  <strong className={isDark ? 'text-white' : 'text-[#0A0A0A]'}>educational trainings, bootcamps, AMA sessions with industry leaders</strong>{' '}
                  and <strong className={isDark ? 'text-white' : 'text-[#0A0A0A]'}>partnerships</strong> aimed at bridging the gap between aspirations and expertise.
                </p>
                <a href="/projects" className="btn-dark">Explore Projects</a>
              </motion.div>

              {/* "Projects" pill on center line */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <span className="bg-[#F5C518] text-[#0A0A0A] text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap shadow-md">
                  Projects
                </span>
              </div>

              {/* RIGHT: mosaic — 1 tall + 2 stacked */}
              {/*
                Layout based on Figma measurements:
                  Image 1 (tall left): w=254 h=384  border-radius: 12px 0 0 12px
                  Image 2 (top right): w=289 h=192  border-radius: 0 12px 0 0
                  Image 3 (bot right): w=289 h=192  border-radius: 0 0 12px 0
                Total mosaic width = 254 + 289 = 543px, height = 384px
              */}
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
                className="flex" style={{ height: '384px', maxWidth: '543px', marginLeft: 'auto' }}>

                {/* Tall left image — w=254, h=384 */}
                <div className="flex-shrink-0 overflow-hidden border-2 border-[#2A2A2A]"
                  style={{ width: '254px', height: '384px', borderRadius: '12px 0 0 12px' }}>
                   <img src="/images/proj-1-tall.jpg" alt="The Future of DeFi" className="w-full h-full object-cover" />
                  
                </div>

                {/* Right column: 2 stacked images, each w=289, h=192 */}
                <div className="flex flex-col flex-shrink-0" style={{ width: '289px' }}>
                  {/* Top-right image */}
                  <div className="overflow-hidden border-2 border-[#2A2A2A] border-l-0"
                    style={{ width: '289px', height: '192px', borderRadius: '0 12px 0 0' }}>
                    <img src="/images/proj-1-tr.jpg" alt="Devcon at Your Doorstep" className="w-full h-full object-cover" />
                  </div>
                  {/* Bottom-right image */}
                  <div className="overflow-hidden border-2 border-[#2A2A2A] border-l-0 border-t-0"
                    style={{ width: '289px', height: '192px', borderRadius: '0 0 12px 0' }}>
                     <img src="/images/proj-1-br.jpg" alt="The Final Block: Web3 Community Bash" className="w-full h-full object-cover" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── ROW 2: Products ── */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center relative">

              {/* "Products" pill on center line */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <span className="bg-[#F5C518] text-[#0A0A0A] text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap shadow-md">
                  Products
                </span>
              </div>

              {/* LEFT: mosaic — wide left + 2 stacked right + 1 small bottom-right */}
              {/*
                Layout based on Figma measurements (total height = 384px):
                  Image 1 (BlockGigs wide): w=222, h=384  no explicit radius (left side)
                  Image 2 (three ladies):   w=320, h=192  border-radius: 0 12px 0 0  left=222
                  Image 3 (bottom-left):    w=315, h=192  border-radius: 0 0 0 0      top=192
                  Image 4 (bottom-right):   w=228, h=192  border-radius: 0 0 12px 0   top=192 left=315
                Total mosaic width ≈ 222+320=542px (top), 222+315+228=765 shrunk to fit
                We scale proportionally to fit container.
              */}
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
                className="overflow-hidden" style={{ height: '384px', maxWidth: '543px' }}>

                {/* Use CSS grid matching the Figma proportions */}
                <div className="w-full h-full" style={{
                  display: 'grid',
                  gridTemplateColumns: '47% 53%',  /* 222/(222+320)≈47%, but we balance with the stacked side */
                  gridTemplateRows: '50% 50%',
                  gap: '0',
                }}>
                  {/* Image 1: BlockGigs — spans full height (2 rows), left column */}
                  <div className="row-span-2 overflow-hidden border border-[#2A2A2A]"
                    style={{ borderRadius: '12px 0 0 12px' }}>
                     <img src="/images/prod-1-blockgigs.jpg" alt="BlockGigs" className="w-full h-full object-cover" />
                  </div>

                  {/* Image 2: Three ladies — top-right */}
                  <div className="overflow-hidden border border-[#2A2A2A] border-l-0"
                    style={{ borderRadius: '0 12px 0 0' }}>
                     <img src="/images/prod-2-ladies.jpg" alt="Devcon community" className="w-full h-full object-cover" />
                    
                  </div>

                  {/* Bottom-right: split into 2 columns (315 and 228 proportional) */}
                  <div className="overflow-hidden border border-[#2A2A2A] border-l-0 border-t-0"
                    style={{ display: 'grid', gridTemplateColumns: '58% 42%' }}>
                    {/* Image 3: bottom-left of that sub-grid */}
                    <div className="overflow-hidden border-r border-[#2A2A2A]"
                      style={{ borderRadius: '0 0 0 0' }}>
                       <img src="/images/prod-3-bottom-left.jpg" alt="Games/product" className="w-full h-full object-cover" />
                      
                    </div>
                    {/* Image 4: bottom-right */}
                    <div className="overflow-hidden" style={{ borderRadius: '0 0 12px 0' }}>
                       <img src="/images/prod-4-bottom-right.jpg" alt="Crypto cards" className="w-full h-full object-cover" />
                      
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* RIGHT: text */}
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <p className={`text-sm leading-relaxed mb-5 ${isDark ? 'text-[#CCCCCC]' : 'text-[#444444]'}`}>
                  We offer a wide range of products, all centered on solving challenges for users world-wide.
                </p>
                <ul className={`space-y-4 mb-8 text-sm ${isDark ? 'text-[#CCCCCC]' : 'text-[#444444]'}`}>
                  <li className="flex gap-2">
                    <span className="text-[#F5C518] flex-shrink-0 mt-0.5">•</span>
                    <span>Our <strong className={isDark ? 'text-white' : 'text-[#0A0A0A]'}>business-oriented products</strong> leverage blockchain technology to provide real-world solutions for individuals.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#F5C518] flex-shrink-0 mt-0.5">•</span>
                    <span>Our <strong className={isDark ? 'text-white' : 'text-[#0A0A0A]'}>games</strong> introduce players to the web3 ecosystem in a fun and engaging way, simplifying complex blockchain concepts.</span>
                  </li>
                </ul>
                <a href="/products" className="btn-dark">Explore Products</a>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TEAM — always dark
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-[#CCCCCC] text-sm leading-relaxed mb-4">
                Here at Rubikcon nexus, it's not just about technology. It's powered by people.
                Our cross-dynamic team pushes our community-driven mission, helping clients shape the future of web3 innovations.
              </p>
              <a href="/about" className="btn-gold">About Rubikcon <ArrowRight size={14} /></a>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-white mb-6">Meet the Team Leads<br />&amp; Officers</h2>
              <div className="grid grid-cols-3 gap-4">
                {TEAM.map(member => (
                  <div key={member.name} className="text-center">
                     <img src={member.img} alt={member.name} className="w-full aspect-[3/4] object-cover rounded-xl mb-2" />
                    {/* <Img label={member.img} aspect="aspect-[3/4]" className="rounded-xl mb-2" /> */}
                    <div className="text-xs font-bold text-white leading-tight">{member.name}</div>
                    <div className="text-[10px] text-[#F5C518] mt-0.5 leading-tight">{member.role}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          BOTTOM CTA — dark with green tint
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #0A2A1A 0%, #0A0A0A 60%)',
        }} />
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Want to Onboard Talents or Launch your Project?
          </h2>
          <p className="text-[#CCCCCC] text-sm leading-relaxed mb-8">
            We handle recruitment, training, compliance, and community growth with outreaches &amp; events.
            Let's turn your vision to reality.
          </p>
          <a href="/contact" className="btn-gold px-8 py-3 text-base">
            Get Started <ArrowRight size={16} />
          </a>
        </div>
      </section>

    </div>
  )
}
