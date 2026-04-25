import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import Img from '../components/Img'

const PROBLEMS = [
  'Most Projects struggle to engage and onboard African Developers',
  'No time or manpower to train Developers or organize community engagement for your projects?',
  'Have a Project, DAO or startup idea you want to scale in Africa but don\'t know where to start?',
  'Projects get stuck in the Planning phase or build products that don\'t end up aligning with market demands',
]

const SOLUTIONS = [
  'We create custom strategies covering regulatory compliance and streamlined developer onboarding',
  'We help scale developer adoption through recruitment, training and community-building support',
  'Structured management approach to bring your vision to reality — product launch events, community outreach and lots more',
  'We redefine your approach — transitioning from paperwork to execution, using live feedback, iterative debugging and testing — all while ensuring business goals are met',
]

// Vertical "RUBIKCON" letters for hero RHS
const RUBIKCON_LETTERS = ['R', 'U', 'B', 'I', 'K', 'C', 'O', 'N']

export default function AboutPage() {
  return (
    <div className="pt-[72px]">

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
           <img src="/images/event.jpg" className="w-full h-full object-cover opacity-25" />
          {/* <div className="img-placeholder w-full h-full opacity-20" style={{ borderRadius: 0, border: 'none' }}>
            <span className="text-[10px]">[ About Us hero background — team/community photo ]</span>
          </div> */}
          <div className="absolute inset-0 bg-[#0A0A0A]/70" />
        </div>

        {/* RUBIKCON vertical letters — right side */}
        {/* Specs: font-size 64px, weight 900, gap 52px, top 93px, left 1333px */}
        <div className="absolute right-8 top-0 bottom-0 z-10 hidden lg:flex flex-col justify-start pt-8"
          style={{ gap: '0px' }}>
          {RUBIKCON_LETTERS.map((letter, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.4 }}
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 900,
                fontSize: '64px',
                lineHeight: '58.95px',
                letterSpacing: '0%',
                width: '51px',
                height: '59px',
                color: 'transparent',
                WebkitTextStroke: '2.11px',
                WebkitTextStrokeColor: 'transparent',
                backgroundImage: 'linear-gradient(90deg, rgba(136,130,18,0.4) 0%, rgba(238,228,32,0.4) 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '52px',
              }}>
              {letter}
            </motion.div>
          ))}
        </div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">About Us</h1>
            <p className="text-[#CCCCCC] text-sm">Explore who we are and what we represent at Rubikcon</p>
          </motion.div>
        </div>
      </section>

      {/* ── WHO WE ARE ─────────────────────────────────────────────── */}
      <section className="bg-[#F5F0DC] py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#0A0A0A] mb-4">Who We Are (Our Representation)</h2>
              <p className="text-[#444444] text-sm leading-relaxed mb-6">
                Rubikcon Nexus exists to bridge the gap between traditional enterprises and the decentralized future.
                We provide expert consulting, strategic onboarding and execution-driven solutions to help companies
                innovate, adapt and lead in the Web3 ecosystem.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-[#D4C898] rounded-xl p-4">
                  <div className="text-sm font-semibold text-[#0A0A0A] mb-2">The Vision</div>
                  <p className="text-xs text-[#666666] leading-relaxed">
                    To accelerate the global adoption of Web3 by empowering businesses and individuals with
                    scalable solutions and trainings.
                  </p>
                </div>
                <div className="border border-[#D4C898] rounded-xl p-4">
                  <div className="text-sm font-semibold text-[#0A0A0A] mb-2">Our Mission</div>
                  <p className="text-xs text-[#666666] leading-relaxed">
                    By fostering talent, optimizing blockchain adoption, and delivering measurable results,
                    we pave the way for sustainable growth in the new digital economy.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: D-shape image
                The D-shape is achieved by:
                - A container with border-radius: 0 50% 50% 0 (flat left, semicircle right)
                  which creates a D rotated — but looking at the screenshot the curve is on
                  the LEFT side of the image (like a backwards D / C shape)
                - So we use: border-radius: 50% 0 0 50% — curved left, flat right
                  This matches the screenshot where the image has a curved left edge
            */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            //   className="flex justify-center md:justify-end"
            // >
            //   <div
            //     className="overflow-hidden w-full max-w-md"
            //     style={{
            //       aspectRatio: '4/5',
            //       borderRadius: '50% 12px 12px 50%',  /* curved left = D shape facing right */
            //       border: '3px solid rgba(200,180,0,0.3)',
            //     }}
            //   >

            className="flex justify-center md:justify-end -mr-6"
>
  <div
    className="overflow-hidden w-full"
    style={{
      height: '520px',
      borderRadius: '50% 0 0 50%',
      border: '3px solid rgba(200,180,0,0.3)',
      borderRight: 'none',
    }}
  >
                {/* REPLACE:  */}
                <img src="/images/event.jpg" alt="Ozioma Okundu" className="w-full h-full object-cover object-top" />
                <div className="w-full h-full flex items-center justify-center text-center p-6"
                  style={{ background: 'linear-gradient(135deg, #2A2A1A 0%, #1A1A0A 100%)' }}>
                  {/* <div>
                    <div className="text-[#F5C518] text-xs font-mono mb-2">[ IMAGE ]</div>
                    <div className="text-[#888] text-[10px]">REPLACE with:<br />CEO/co-founder photo<br />(e.g. Ozioma at event)</div>
                    <div className="text-[#555] text-[9px] mt-2">src="/images/about-ceo.jpg"</div>
                  </div> */}
                </div>
              </div>
            </motion.div>
            {/* <div> */}
              {/* REPLACE: actual co-founder/team photo */}
              {/* <img src="/images/event.jpg" /> */}
              {/* <Img label="Co-founder / team representative photo (e.g. Ozioma at an event)" aspect="aspect-[4/5]" className="rounded-2xl" /> */}
            {/* </div> */}
          </div>
        </div>
      </section>

      {/* ── BLUEPRINT ──────────────────────────────────────────────── */}
      <section className="bg-[#0A0A0A] py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-white mb-3">Our Blueprint for Delivering Impactful Solutions</h2>
            <p className="text-[#888888] text-sm max-w-xl mx-auto">
              At Rubikcon, our end-to-end services transform abstract ideas into real-world impact.
              Partner with us to shape the future of decentralized innovation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-0 border border-[#2A2A2A] rounded-xl overflow-hidden">
            <div className="border-r border-[#2A2A2A]">
              <div className="bg-[#1A1A1A] px-6 py-4 border-b border-[#2A2A2A]">
                <span className="text-xs font-mono text-[#F5C518] tracking-widest uppercase">Problem Projects Face</span>
              </div>
              <ul className="divide-y divide-[#2A2A2A]">
                {PROBLEMS.map((p, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="px-6 py-4 text-sm text-[#CCCCCC] leading-relaxed">
                    {p}
                  </motion.li>
                ))}
              </ul>
            </div>
            <div>
              <div className="bg-[#1A1A1A] px-6 py-4 border-b border-[#2A2A2A]">
                <span className="text-xs font-mono text-[#F5C518] tracking-widest uppercase">Solution We Bring</span>
              </div>
              <ul className="divide-y divide-[#2A2A2A]">
                {SOLUTIONS.map((s, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="px-6 py-4 text-sm text-[#CCCCCC] leading-relaxed flex gap-3">
                    <span className="text-[#F5C518] flex-shrink-0 mt-0.5">✓</span>
                    {s}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY TEAM ─────────────────────────────────────────── */}
      {/* <section className="bg-[#111111] py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div> */}
              {/* REPLACE: community/event video thumbnail or collage */}
              {/* <div className="grid grid-cols-2 gap-3">
                <Img label="Community event photo 1 (Devcon at Your Doorstep)" aspect="aspect-square" />
                <Img label="Community event photo 2 (Team/event)" aspect="aspect-square" />
                <Img label="Community event photo 3" aspect="aspect-square" />
                <Img label="Community event photo 4" aspect="aspect-square" />
              </div>
            </div> */}
            {/* ══════════════════════════════════════════════════════════════
          COMMUNITY TEAM
          Image mosaic: 1 tall on LEFT + 2 stacked on RIGHT
          The tall left image has a ▶ play button overlay
          Layout matches screenshot:
            Left tall: w≈222px, h=384px  (full height)
            Top-right:  w≈320px, h=192px
            Bottom-right: w≈320px, h=192px
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#111111] py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
 
            {/* LEFT: image mosaic */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {/* Total height = 384px, width fills container */}
              <div className="flex overflow-hidden rounded-xl" style={{ height: '384px' }}>
 
                {/* Tall left image with ▶ play overlay */}
                <div className="relative flex-shrink-0 overflow-hidden"
                  style={{ width: '42%', borderRadius: '12px 0 0 12px' }}>
                  {/* REPLACE:  */}
                  <img src="/images/about-1.jpg" alt="Community event" className="w-full h-full object-cover" />
                  {/* <div className="w-full h-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #2D1B1B 100%)' }}>
                    <div className="text-center p-3">
                      <div className="text-[#F5C518] text-[9px] font-mono mb-1">[ IMAGE ]</div>
                      <div className="text-[#666] text-[8px]">REPLACE:<br/>community-main.jpg<br/>BlockGigs / event photo</div>
                    </div>
                  </div> */}
 
                  {/* ▶ Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                      <Play size={18} className="text-white fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
 
                {/* Right column: 2 stacked images */}
                <div className="flex flex-col flex-1">
                  {/* Top-right image */}
                  <div className="flex-1 overflow-hidden border-l border-[#2A2A2A]"
                    style={{ borderRadius: '0 12px 0 0' }}>
                    {/* REPLACE:  */}
                    <img src="/images/prod-3-bottom-left.jpg" alt="Devcon at Your Doorstep" className="w-full h-full object-cover" />
                    {/* <div className="w-full h-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #1A2A1A 0%, #0D1A2E 100%)' }}>
                      <div className="text-center p-2">
                        <div className="text-[#F5C518] text-[9px] font-mono mb-0.5">[ IMAGE ]</div>
                        <div className="text-[#666] text-[8px]">REPLACE:<br/>community-tr.jpg<br/>Devcon at Your Doorstep</div>
                      </div>
                    </div> */}

                 
                  </div>
 
                  {/* Bottom-right image */}
                  <div className="flex-1 overflow-hidden border-l border-t border-[#2A2A2A]"
                    style={{ borderRadius: '0 0 12px 0' }}>
                    {/* REPLACE:  */}
                    <img src="/images/prod-2-ladies.jpg" alt="Team event photo" className="w-full h-full object-cover" />
                    {/* <div className="w-full h-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #2A1A1A 0%, #1A0D2E 100%)' }}>
                      <div className="text-center p-2">
                        <div className="text-[#F5C518] text-[9px] font-mono mb-0.5">[ IMAGE ]</div>
                        <div className="text-[#666] text-[8px]">REPLACE:<br/>community-br.jpg<br/>Team/event photo</div>
                      </div>
                    </div> */}
                  </div>
                </div>
 
              </div>
            </motion.div>
 
            <div>
              <h2 className="font-display text-2xl font-bold text-white mb-4">Community-driven Team Sections</h2>
              <p className="text-[#888888] text-sm leading-relaxed mb-4">
                Dedicated and diverse teams — specializing in marketing, design, development, and management.
                They provide all-around expertise to deliver the best strategies and implementation for businesses and individuals.
              </p>
              <div className="bg-[#F5C518]/5 border border-[#F5C518]/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-[#CCCCCC] leading-relaxed">
                  From concept to launch, we collaborate closely with you to understand your goals, adapt to challenges,
                  and drive measurable success. Whether{' '}
                  <strong className="text-white">you're scaling a startup, refining a brand, or optimizing workflows</strong>,
                  our cross-functional approach guarantees innovation and efficiency at every step.
                </p>
              </div>
              <a href="/contact" className="btn-gold">Work With Us <ArrowRight size={14} /></a>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ─────────────────────────────────────────────── */}
      <section className="relative py-24 px-6 overflow-hidden bg-[#0A0A0A]">
        <div className="absolute inset-0">
          {/* REPLACE: <img src="/cta-bg-2.jpg" className="w-full h-full object-cover opacity-15" /> */}
          <div className="img-placeholder w-full h-full opacity-10" style={{ borderRadius: 0, border: 'none' }} />
          <div className="absolute inset-0 bg-[#0A0A0A]/80" />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">Ready to Build or Refine your Product?</h2>
          <p className="text-[#888888] text-sm leading-relaxed mb-8">
            Rubikcon handles all from paperwork to execution with our experienced technical &amp; management team —
            all while ensuring business goals are met.
          </p>
          <a href="/contact" className="btn-gold px-8 py-3 text-base">Get in Touch <ArrowRight size={16} /></a>
        </div>
      </section>

    </div>
  )
}
