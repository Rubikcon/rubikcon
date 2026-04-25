// import { motion } from 'framer-motion'
// import { ArrowRight } from 'lucide-react'
// import Img from '../components/Img'

// const EVENTS = [
//   { title: 'Starknet Basecamp Africa', img: 'Event: Starknet Basecamp Africa — Cynthia Kanwo presenter' },
//   { title: 'Rubikcon × Web3Compass', img: 'Event: Product Management in Web3 — Rubikcon & Web3Compass collab' },
//   { title: 'The Future of DeFi', img: 'Event: The Future of DeFi presentation slide' },
//   { title: 'A Message from Rubikcon', img: 'Event: A Message from the Spirit of Rubikcon post' },
//   { title: 'The Final Block: Web3 Community Bash', img: 'Event: The Final Block — Web3 Community Bash flyer' },
// ]

// export default function ProjectsPage() {
//   return (
//     <div className="pt-[72px]">

//       {/* ── HERO ───────────────────────────────────────────────────── */}
//       <section className="relative py-24 px-6 overflow-hidden">
//         <div className="absolute inset-0 z-0">
//           {/* REPLACE: <img src="/projects-hero-bg.jpg" className="w-full h-full object-cover opacity-25" /> */}
//           <div className="img-placeholder w-full h-full opacity-20" style={{ borderRadius: 0, border: 'none' }}>
//             <span className="text-[10px]">[ Projects hero background — team group photo ]</span>
//           </div>
//           <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/50 to-[#0A0A0A]" />
//         </div>
//         <div className="relative z-10 max-w-7xl mx-auto">
//           <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
//             className="font-display text-4xl md:text-5xl font-bold text-white mb-3">Projects</motion.h1>
//           <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
//             className="text-[#CCCCCC] text-sm">Explore who we are and what we represent at Rubikcon</motion.p>
//         </div>
//       </section>

//       {/* ── AMA SESSIONS ──────────────────────────────────────────── */}
//       <section className="bg-[#F5F0DC] py-20 px-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid md:grid-cols-2 gap-16 items-start">
//             <div>
//               {/* REPLACE with AMA session collage */}
//               <div className="grid grid-cols-2 gap-3">
//                 <Img label="AMA Session flyer — The Future of DeFi (Web3 Basics for Beginners)" aspect="aspect-square" className="col-span-1" />
//                 <Img label="AMA Session slide — DeFi Future & Legislation, A glimpse of topics" aspect="aspect-square" />
//               </div>
//               <div className="mt-3 flex gap-2 text-xs text-[#888888] font-mono">
//                 <span>← AMA Session</span>
//                 <span className="ml-auto">DeFi Future &amp; Legislation →</span>
//               </div>
//             </div>

//             <div>
//               <h2 className="font-display text-2xl font-bold text-[#0A0A0A] mb-4">Solo Trainings &amp; Community Outreach</h2>
//               <p className="text-[#555555] text-sm leading-relaxed mb-5">
//                 We believe Success in Web3 isn't just about technology, it's about people. That's why the our
//                 community is here to learn, build, and grow together. We bridge the gap between complex
//                 blockchain innovations and real-world adoption.
//               </p>
//               <div className="bg-[#F5C518]/10 border border-[#C9A800]/30 rounded-xl p-4 text-sm text-[#444444] leading-relaxed">
//                 We hosts regular <strong className="text-[#0A0A0A]">AMA Sessions</strong> with both our in-house team and industry experts.
//                 Our Internal AMAs explore Rubikcon's vision, the challenges of web3 adoption and strategies for
//                 a decentralized future. We have also hosted talks with external experts including the{' '}
//                 <strong className="text-[#0A0A0A]">Future of DEFI in Africa</strong> covering how DEFI can empower the unbanked and it's legal barriers.
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── PARTNERSHIP TRAININGS ─────────────────────────────────── */}
//       <section className="bg-[#0A0A0A] py-20 px-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid md:grid-cols-2 gap-16 items-start">
//             <div>
//               <div className="inline-block bg-[#F5C518]/10 border border-[#F5C518]/20 text-[#F5C518] text-xs px-3 py-1 rounded-full mb-4">
//                 Collaborations with Web3 Organisations
//               </div>
//               <h2 className="font-display text-2xl font-bold text-white mb-4">Partnerships Trainings &amp; Events</h2>
//               <p className="text-[#888888] text-sm leading-relaxed">
//                 We deliver targeted blockchain education with partners like HerDAO, Starknet, and Web3Compass.
//                 Our Initiatives include the Women in Web3 empowerment program, the structured #30DaysofSolidity
//                 challenge and the Starknet Basecamp Africa.
//               </p>
//             </div>

//             <div className="grid grid-cols-3 gap-2">
//               {EVENTS.map((e, i) => (
//                 <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
//                   viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
//                   {/* REPLACE with actual event photos/flyers */}
//                   <Img label={e.img} aspect="aspect-square" className="rounded-lg" />
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── DEVCON SPONSORSHIP ────────────────────────────────────── */}
//       <section className="bg-[#111111] py-20 px-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid md:grid-cols-2 gap-16 items-center">
//             <div className="grid grid-cols-2 gap-3">
//               {/* REPLACE with actual Devcon photos */}
//               <Img label="Devcon at Your Doorstep — event banner/collage" aspect="aspect-square" />
//               <Img label="Devcon venue / city photo" aspect="aspect-square" />
//               <Img label="Devcon speaker session photo" aspect="aspect-square" />
//               <Img label="Devcon — Career Opportunities in Ethereum & Web3 flyer" aspect="aspect-square" />
//             </div>

//             <div>
//               <div className="inline-block bg-[#F5C518]/10 border border-[#F5C518]/20 text-[#F5C518] text-sm px-4 py-1.5 rounded-full mb-4 font-medium">
//                 Sponsorships — Devcon Highlights
//               </div>
//               <p className="text-[#CCCCCC] text-sm leading-relaxed mb-4">
//                 Devcon At Your Doorstep brought together leading Ethereum experts to share insights and strategies
//                 for thriving in the Web3 space. Hosted by the Rubikcon Team, the event featured notable speakers,
//                 including our Co-founder, Ozioma who discussed Devcon's Significance in the global web3 ecosystem.
//               </p>
//               <p className="text-[#CCCCCC] text-sm leading-relaxed mb-6">
//                 Additionally, Laisha Wadhwa, creator of Radar.fi, broke down Ethereum's ecosystem, while Moran
//                 Hertzanu guided attendees on making real-world impact alongside other inspiring speakers.
//               </p>
//               <a href="/contact" className="btn-gold">Partner with Us <ArrowRight size={14} /></a>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── CTA ────────────────────────────────────────────────────── */}
//       <section className="relative py-24 px-6 overflow-hidden">
//         <div className="absolute inset-0">
//           <div className="img-placeholder w-full h-full opacity-10" style={{ borderRadius: 0, border: 'none' }} />
//           <div className="absolute inset-0 bg-[#0A0A0A]/85" />
//         </div>
//         <div className="relative max-w-2xl mx-auto text-center">
//           <h2 className="font-display text-3xl font-bold text-white mb-4">Want to Onboard Talents or Launch your Project?</h2>
//           <p className="text-[#888888] text-sm leading-relaxed mb-8">
//             We handle recruitment, training, compliance, and community growth with outreaches &amp; events.
//             Let's turn your vision to reality.
//           </p>
//           <a href="/contact" className="btn-gold px-8 py-3 text-base">Get Started <ArrowRight size={16} /></a>
//         </div>
//       </section>

//     </div>
//   )
// }





// import { useRef, useEffect, useState } from 'react'
// import { motion } from 'framer-motion'
// import { ArrowRight } from 'lucide-react'

// const CAROUSEL_EVENTS = [
//   { img: '/images/event-starknet.jpg', label: 'Starknet Basecamp Africa — Cynthia Kamau' },
//   { img: '/images/event-rubikcon-web3compass.jpg', label: 'Rubikcon × Web3Compass' },
//   { img: '/images/event-product-mgmt.jpg', label: 'Product Management in Web3' },
//   { img: '/images/event-spirit-rubikcon.jpg', label: 'A Message from the Spirit of Rubikcon' },
//   { img: '/images/event-final-block.jpg', label: 'The Final Block: Web3 Community Bash' },
//   { img: '/images/event-extra.jpg', label: 'Web3 Builder Fridays' },
// ]

// const DEVCON_IMAGES = [
//   { img: '/images/devcon-1.jpg', label: 'Devcon at Your Doorstep — event banner' },
//   { img: '/images/devcon-2.jpg', label: 'Devcon venue / city night photo' },
//   { img: '/images/devcon-3.jpg', label: 'Speaker session / community photo' },
//   { img: '/images/devcon-4.jpg', label: 'Career Opportunities in Ethereum & Web3 flyer' },
// ]

// // Placeholder box component
// function ImgBox({ src, label, className = '', style = {} }: { src: string; label: string; className?: string; style?: React.CSSProperties }) {
//   const [errored, setErrored] = useState(false)
//   return (
//     <div className={`overflow-hidden relative ${className}`} style={style}>
//       {!errored ? (
//         <img src={src} alt={label} className="w-full h-full object-cover"
//           onError={() => setErrored(true)} />
//       ) : (
//         <div className="w-full h-full flex flex-col items-center justify-center text-center p-3"
//           style={{ background: 'linear-gradient(135deg, #1A1A2A 0%, #0A0A1A 100%)', minHeight: '100%' }}>
//           <div className="text-[#F5C518] text-[8px] font-mono mb-1">[ IMAGE ]</div>
//           <div className="text-[#555] text-[7px] leading-tight">{label}</div>
//         </div>
//       )}
//     </div>
//   )
// }

// // Auto-scrolling carousel
// function AutoCarousel() {
//   const trackRef = useRef<HTMLDivElement>(null)
//   const isDragging = useRef(false)
//   const startX = useRef(0)
//   const scrollLeft = useRef(0)

//   // Duplicate items for seamless loop
//   const items = [...CAROUSEL_EVENTS, ...CAROUSEL_EVENTS]

//   useEffect(() => {
//     const track = trackRef.current
//     if (!track) return
//     let animId: number
//     let pos = 0
//     const speed = 0.5
//     const totalWidth = track.scrollWidth / 2

//     const animate = () => {
//       if (!isDragging.current) {
//         pos += speed
//         if (pos >= totalWidth) pos = 0
//         track.style.transform = `translateX(-${pos}px)`
//       }
//       animId = requestAnimationFrame(animate)
//     }
//     animId = requestAnimationFrame(animate)
//     return () => cancelAnimationFrame(animId)
//   }, [])

//   const onMouseDown = (e: React.MouseEvent) => {
//     isDragging.current = true
//     startX.current = e.clientX
//     scrollLeft.current = parseFloat(trackRef.current?.style.transform.replace('translateX(', '').replace('px)', '') || '0')
//   }
//   const onMouseMove = (e: React.MouseEvent) => {
//     if (!isDragging.current) return
//     const dx = e.clientX - startX.current
//     if (trackRef.current) {
//       trackRef.current.style.transform = `translateX(${-(scrollLeft.current - dx)}px)`
//     }
//   }
//   const onMouseUp = () => { isDragging.current = false }

//   return (
//     <div className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
//       onMouseDown={onMouseDown} onMouseMove={onMouseMove}
//       onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
//       <div ref={trackRef} className="flex gap-4 will-change-transform" style={{ width: 'max-content' }}>
//         {items.map((item, i) => (
//           <div key={i} className="flex-shrink-0 rounded-xl overflow-hidden" style={{ width: '280px', height: '180px' }}>
//             <ImgBox src={item.img} label={item.label} className="w-full h-full" />
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// export default function ProjectsPage() {
//   return (
//     <div className="pt-[72px]">

//       {/* ══════════════════════════════════════════════════════════════
//           HERO — full bleed dark with group photo background
//       ══════════════════════════════════════════════════════════════ */}
//       <section className="relative min-h-[320px] flex items-end overflow-hidden">
//         <div className="absolute inset-0 z-0">
//           {/* REPLACE:  */}
//           <img src="/images/team.jpg" className="w-full h-full object-cover object-top opacity-60" />
//           {/* <div className="w-full h-full" style={{
//             background: 'linear-gradient(135deg, #0A0A0A 0%, #0D1A1A 50%, #0A0A0A 100%)',
//           }} />
//           <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" /> */}
//         </div>
//         <div className="relative z-10 max-w-7xl mx-auto px-6 pb-12 w-full">
//           <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
//             className="font-display text-5xl font-bold text-white mb-2">Projects</motion.h1>
//           <p className="text-[#CCCCCC] text-sm">Explore who we are and what we represent at Rubikcon</p>
//         </div>
//       </section>

//       {/* ══════════════════════════════════════════════════════════════
//           AMA SESSIONS — cream bg
//           Left: 2 images with labels (AMA flyer + Future of DeFi)
//           Right: heading + text + highlighted quote
//       ══════════════════════════════════════════════════════════════ */}
//       <section className="bg-[#F5F0DC] py-20 px-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid md:grid-cols-2 gap-16 items-start">

//             {/* LEFT: 2 images with connector labels */}
//             <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
//               viewport={{ once: true }} className="relative">

//               {/* Top label */}
//               <div className="flex items-center gap-2 mb-2 ml-2">
//                 <div className="w-16 h-px bg-[#C9A800]" />
//                 <span className="text-xs text-[#C9A800] font-mono">AMA Session</span>
//               </div>

//               {/* 2 images side by side */}
//               <div className="flex gap-2" style={{ height: '280px' }}>
//                 {/* AMA flyer - left, slightly wider */}
//                 <div className="flex-shrink-0 rounded-xl overflow-hidden" style={{ width: '48%' }}>
//                   {/* REPLACE:  */}
//                   <img src="/images/ask.jpg" alt="Ask Me Anything — Web3 Basics for Beginners" className="w-full h-full object-cover" />
//                   {/* <div className="w-full h-full flex flex-col items-center justify-center text-center p-4"
//                     style={{ background: 'linear-gradient(135deg, #1A1A00 0%, #0A0A1A 100%)' }}>
//                     <div className="text-[#F5C518] text-xs font-bold mb-1">ASK ME</div>
//                     <div className="text-[#F5C518] text-xs font-bold mb-2">ANYTHING</div>
//                     <div className="text-[8px] text-[#888] font-mono">[ IMAGE ]<br/>REPLACE:<br/>ama-flyer.jpg<br/>AMA event flyer</div>
//                   </div> */}
//                 </div>
//                 {/* Future of DeFi - right */}
//                 <div className="flex-1 rounded-xl overflow-hidden">
//                   {/* REPLACE:  */}
//                   <img src="/images/proj-1-tall.jpg" alt="The Future of DeFi" className="w-full h-full object-cover" />
//                   {/* <div className="w-full h-full flex flex-col items-center justify-center text-center p-3"
//                     style={{ background: 'linear-gradient(135deg, #001A2A 0%, #0A001A 100%)' }}>
//                     <div className="text-[#F5C518] text-[9px] font-bold mb-1">THE FUTURE OF DEFI</div>
//                     <div className="text-[8px] text-[#888] font-mono">[ IMAGE ]<br/>REPLACE:<br/>future-of-defi.jpg<br/>The Future of DeFi slide</div>
//                   </div> */}
//                 </div>
//               </div>

//               {/* Bottom label */}
//               <div className="flex items-center gap-2 mt-2 ml-2">
//                 <div className="w-16 h-px bg-[#C9A800]" />
//                 <span className="text-xs text-[#C9A800] font-mono">DEFI Future &amp; Legislation</span>
//               </div>
//             </motion.div>

//             {/* RIGHT: text */}
//             <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
//               viewport={{ once: true }} transition={{ delay: 0.1 }}>
//               <h2 className="font-display text-2xl font-bold text-[#0A0A0A] mb-4">
//                 Solo Trainings &amp; Community Outreach
//               </h2>
//               <p className="text-[#555555] text-sm leading-relaxed mb-5">
//                 We believe Success in Web3 isn't just about technology, it's about people. That's
//                 why the our community is here to: learn, build, and grow together. We bridge the
//                 gap between complex blockchain innovations and real-world adoption.
//               </p>
//               <div className="bg-[#E8E0C0] border border-[#D4C898] rounded-xl p-5 text-sm text-[#444444] leading-relaxed">
//                 We hosts regular <strong className="text-[#0A0A0A]">AMA Sessions</strong> with both our in-house team and industry
//                 experts. Our Internal AMAs explore Rubikcon's vision, the challenges of web3 adoption and strategies for
//                 a decentralized future. We have also hosted talks with external experts including the{' '}
//                 <strong className="text-[#0A0A0A]">Future of DEFI in Africa</strong> covering how DEFI can empower the
//                 unbanked and it's legal barriers.
//               </div>
//             </motion.div>

//           </div>
//         </div>
//       </section>

//       {/* ══════════════════════════════════════════════════════════════
//           PARTNERSHIPS — white/light bg
//           Top: pill + heading LEFT | text RIGHT
//           Below: auto-scrolling horizontal carousel of 6 event images
//       ══════════════════════════════════════════════════════════════ */}
//       <section className="bg-white py-20 px-6">
//         <div className="max-w-7xl mx-auto mb-10">
//           <div className="grid md:grid-cols-2 gap-16 items-start">

//             {/* LEFT */}
//             <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
//               viewport={{ once: true }}>
//               <div className="inline-block border border-[#C9A800]/60 text-[#8A7000] text-xs px-4 py-1.5 rounded-full mb-5">
//                 Collaborations with Web3 Organisations
//               </div>
//               <h2 className="font-display text-3xl font-bold text-[#0A0A0A] leading-tight">
//                 Partnerships Trainings<br />&amp; Events
//               </h2>
//             </motion.div>

//             {/* RIGHT */}
//             <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
//               viewport={{ once: true }} transition={{ delay: 0.1 }}>
//               <p className="text-[#555555] text-sm leading-relaxed">
//                 We deliver targeted blockchain education with partners like HerDAO, Starknet, and Web3Compass.
//                 Our Initiatives include the Women in Web3 empowerment program, the structured #30DaysofSolidity
//                 challenge and the Starknet Basecamp Africa.
//               </p>
//             </motion.div>

//           </div>
//         </div>

//         {/* ── Auto-scrolling carousel ── */}
//         {/* Images scroll horizontally in a loop. Drag to scroll manually. */}
//         <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }} transition={{ delay: 0.2 }}>
//           <AutoCarousel />
//         </motion.div>

//         {/* Carousel image guide */}
//         <div className="max-w-7xl mx-auto mt-4">
//           <p className="text-xs text-[#AAAAAA] font-mono">
//             Add images to <code>public/images/</code>: event-starknet.jpg · event-rubikcon-web3compass.jpg · event-product-mgmt.jpg · event-spirit-rubikcon.jpg · event-final-block.jpg · event-extra.jpg
//           </p>
//         </div>
//       </section>

//       {/* ══════════════════════════════════════════════════════════════
//           DEVCON SPONSORSHIP — light bg
//           Left: 2x2 image grid (4 photos)
//           Right: pink pill + text + CTA
//       ══════════════════════════════════════════════════════════════ */}
//       <section className="bg-[#F5F0DC] py-20 px-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid md:grid-cols-2 gap-16 items-center">

//             {/* LEFT: 2x2 mosaic */}
//             <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
//               viewport={{ once: true }}>
//               <div className="grid grid-cols-2 gap-2" style={{ height: '384px' }}>
//                 {DEVCON_IMAGES.map((item, i) => (
//                   <div key={i} className="overflow-hidden rounded-xl">
//                     <ImgBox src={item.img} label={item.label} className="w-full h-full" />
//                   </div>
//                 ))}
//               </div>
//             </motion.div>

//             {/* RIGHT: text */}
//             <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
//               viewport={{ once: true }} transition={{ delay: 0.1 }}>

//               {/* Pink pill tag */}
//               <div className="inline-block bg-[#FFB3C6] text-[#8B0028] text-sm font-semibold px-5 py-2 rounded-full mb-6">
//                 Sponsorships — Devcon Highlights
//               </div>

//               <p className="text-[#444444] text-sm leading-relaxed mb-4">
//                 Devcon At Your Doorstep brought together leading Ethereum experts to share insights and strategies
//                 for thriving in the Web3 space. Hosted by the Rubikcon Team, the event featured notable speakers,
//                 including our Co-founder, Ozioma who discussed Devcon's Significance in the global web3 ecosystem.
//               </p>

//               <p className="text-[#444444] text-sm leading-relaxed mb-8">
//                 Additionally, Laisha Wadhwa, creator of RadarFi, broke down Ethereum's ecosystem, while Moran
//                 Hertzanu guided attendees on making real-world impact alongside other inspiring speakers.
//               </p>

//               <a href="/contact"
//                 className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white text-sm font-medium px-7 py-3 rounded-full hover:bg-[#333] transition-colors">
//                 Partner With Us <ArrowRight size={14} />
//               </a>
//             </motion.div>

//           </div>
//         </div>
//       </section>

//       {/* ══════════════════════════════════════════════════════════════
//           CTA — background image, gold heading
//       ══════════════════════════════════════════════════════════════ */}
//       <section className="relative py-28 px-6 overflow-hidden">
//         <div className="absolute inset-0 z-0">
//           {/* REPLACE: <img src="/images/projects-cta-bg.jpg" className="w-full h-full object-cover opacity-20" /> */}
//           <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #0A1A0A 0%, #0A0A0A 70%)' }} />
//           <div className="absolute inset-0 bg-[#0A0A0A]/75" />
//         </div>
//         <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           className="relative z-10 max-w-2xl mx-auto text-center">
//           <h2 className="font-display text-3xl md:text-4xl font-bold text-[#F5C518] mb-4">
//             Want to Onboard Talents or Launch your Project?
//           </h2>
//           <p className="text-[#CCCCCC] text-sm leading-relaxed mb-8">
//             We handle recruitment, training, compliance, and community growth with outreaches &amp; events.
//             Let's turn your vision to reality.
//           </p>
//           <a href="/contact"
//             className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white text-sm font-medium px-8 py-3 rounded-full hover:bg-[#333] transition-colors">
//             Get Started <ArrowRight size={14} />
//           </a>
//         </motion.div>
//       </section>

//     </div>
//   )
// }


import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const CAROUSEL_EVENTS = [
  { img: '/images/event-starknet.jpg', label: 'Starknet Basecamp Africa — Cynthia Kamau' },
  { img: '/images/event-rubikcon-web3compass.jpg', label: 'Rubikcon × Web3Compass' },
  { img: '/images/event-product-mgmt.jpg', label: 'Product Management in Web3' },
  { img: '/images/event-spirit-rubikcon.jpg', label: 'A Message from the Spirit of Rubikcon' },
  { img: '/images/event-final-block.jpg', label: 'The Final Block: Web3 Community Bash' },
  { img: '/images/event-extra.jpg', label: 'Web3 Builder Fridays' },
]

const DEVCON_IMAGES = [
  { img: '/images/prod-3-bottom-left.jpg', label: 'Devcon at Your Doorstep — event banner' },
  { img: '/images/devcon-2.jpg', label: 'Devcon venue / city night photo' },
  { img: '/images/down.jpg', label: 'Speaker session / community photo' },
  { img: '/images/devcon-4.jpg', label: 'Career Opportunities in Ethereum & Web3 flyer' },
]

// Placeholder box component
function ImgBox({ src, label, className = '', style = {} }: { src: string; label: string; className?: string; style?: React.CSSProperties }) {
  const [errored, setErrored] = useState(false)
  return (
    <div className={`overflow-hidden relative ${className}`} style={style}>
      {!errored ? (
        <img src={src} alt={label} className="w-full h-full object-cover"
          onError={() => setErrored(true)} />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-3"
          style={{ background: 'linear-gradient(135deg, #1A1A2A 0%, #0A0A1A 100%)', minHeight: '100%' }}>
          <div className="text-[#F5C518] text-[8px] font-mono mb-1">[ IMAGE ]</div>
          <div className="text-[#555] text-[7px] leading-tight">{label}</div>
        </div>
      )}
    </div>
  )
}

// Auto-scrolling carousel
function AutoCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  // Duplicate items for seamless loop
  const items = [...CAROUSEL_EVENTS, ...CAROUSEL_EVENTS]

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let animId: number
    let pos = 0
    const speed = 0.5
    const totalWidth = track.scrollWidth / 2

    const animate = () => {
      if (!isDragging.current) {
        pos += speed
        if (pos >= totalWidth) pos = 0
        track.style.transform = `translateX(-${pos}px)`
      }
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [])

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    startX.current = e.clientX
    scrollLeft.current = parseFloat(trackRef.current?.style.transform.replace('translateX(', '').replace('px)', '') || '0')
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - startX.current
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${-(scrollLeft.current - dx)}px)`
    }
  }
  const onMouseUp = () => { isDragging.current = false }

  return (
    <div className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseDown={onMouseDown} onMouseMove={onMouseMove}
      onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
      <div ref={trackRef} className="flex gap will-change-transform" style={{ width: 'max-content', gap: '10px' }}>
        {items.map((item, i) => (
          <div key={i} className="flex-shrink-0 rounded-xl overflow-hidden" style={{ width: '261px', height: '263px' }}>
            <ImgBox src={item.img} label={item.label} className="w-full h-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <div className="pt-[72px]">

      {/* ══════════════════════════════════════════════════════════════
          HERO — 1440×623
          Full bleed team photo on right
          Dark rectangular panel fades from left covering ~65%
          "Projects" text (Onest/Syne 600 52px) sits bottom-left on dark panel
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden" style={{ height: '623px' }}>

        {/* Full bleed background — team group photo */}
        REPLACE this div with:
            <img src="/images/team.jpg"
              alt="Rubikcon Team"
              className="absolute inset-0 w-full h-full object-cover object-center" />
       
        {/* <div className="absolute inset-0 bg-[#0A0A0A]">
          <div className="w-full h-full flex items-center justify-center opacity-20">
            <span className="text-[#F5C518] text-xs font-mono text-center">
              [ REPLACE: projects-hero-bg.jpg ]<br/>
              Team group photo — object-cover object-center
            </span>
          </div>
        </div> */}

        {/* Dark left panel — fades right, covers ~65% width */}
        <div className="absolute inset-y-0 left-0 z-10" style={{
          width: '65%',
          background: 'linear-gradient(90deg, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.93) 45%, rgba(10,10,10,0.55) 80%, transparent 100%)',
        }} />

        {/* Bottom gradient — fades up slightly */}
        <div className="absolute bottom-0 left-0 right-0 z-10 h-32"
          style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.6), transparent)' }} />

        {/* Text — bottom left, on top of dark panel */}
        <div className="absolute bottom-14 left-0 z-20 px-14">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-white mb-3"
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 600,
              fontSize: '52px',
              lineHeight: '100%',
              letterSpacing: '0%',
            }}>
            Projects
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="text-[#CCCCCC] text-sm">
            Explore who we are and what we represent at Rubikcon
          </motion.p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          AMA SESSIONS — cream bg
          Left: 2 images OFFSET/LAYERED (Figma exact measurements):
            Image 1 (AMA flyer):      w=250 h=384  top=106  left=56
            Image 2 (Future of DeFi): w=271 h=384  top=177  left=319
            They overlap — img2 sits in front (z=20) offset down+right
          Right: heading + text + highlighted quote
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#F5F0DC] py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">

            {/* LEFT: offset layered images — exact Figma positions */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative hidden md:block"
              style={{ height: '590px' }}>

              {/* "AMA Session" connector label — sits above image 1 */}
              <div className="absolute flex items-center gap-2 z-30"
                style={{ top: '78px', left: '56px' }}>
                <div className="w-10 h-px bg-[#C9A800]" />
                <span className="text-xs text-[#C9A800] font-mono tracking-wide">AMA Session</span>
              </div>

              {/* Image 1: AMA flyer — w=250 h=384 top=106 left=56 */}
              <div className="absolute z-10 overflow-hidden"
                style={{
                  width: '250px',
                  height: '384px',
                  top: '106px',
                  left: '56px',
                  borderRadius: '12px',
                  boxShadow: '4px 8px 24px rgba(0,0,0,0.18)',
                }}>
                {/* REPLACE:  */}
                <img src="/images/ask.jpg" alt="Ask Me Anything" className="w-full h-full object-cover" />
                {/* <div className="w-full h-full flex flex-col items-center justify-center text-center p-4"
                  style={{ background: 'linear-gradient(160deg, #1C1600 0%, #0A0800 60%, #111000 100%)' }}>
                  <div className="text-[#F5C518] font-bold text-sm leading-tight">ASK ME<br />ANYTHING</div>
                  <div className="text-[#888] text-[9px] font-mono mt-3 leading-relaxed">[ IMAGE ]<br/>REPLACE: ama-flyer.jpg</div>
                </div> */}
              </div>

              {/* Image 2: Future of DeFi — w=271 h=384 top=177 left=319 (overlaps img1) */}
              <div className="absolute z-20 overflow-hidden"
                style={{
                  width: '271px',
                  height: '384px',
                  top: '177px',
                  left: '319px',
                  borderRadius: '12px',
                  boxShadow: '4px 8px 24px rgba(0,0,0,0.22)',
                }}>
                {/* REPLACE:  */}
                <img src="/images/proj-1-tall.jpg" alt="The Future of DeFi" className="w-full h-full object-cover" />
                {/* <div className="w-full h-full flex flex-col items-center justify-center text-center p-4"
                  style={{ background: 'linear-gradient(160deg, #001428 0%, #000C1A 60%, #000810 100%)' }}>
                  <div className="text-[#F5C518] font-bold text-xs leading-snug">THE FUTURE OF DEFI</div>
                  <div className="text-[#CCCCCC] text-[9px] mt-1 mb-3">& it's role in Africa's financial inclusion</div>
                  <div className="text-[#888] text-[9px] font-mono leading-relaxed">[ IMAGE ]<br/>REPLACE: future-of-defi.jpg</div>
                </div> */}
              </div>

              {/* "DEFI Future & Legislation" connector label — bottom */}
              <div className="absolute flex items-center gap-2 z-30"
                style={{ bottom: '22px', left: '56px' }}>
                <div className="w-10 h-px bg-[#C9A800]" />
                <span className="text-xs text-[#C9A800] font-mono tracking-wide">DEFI Future &amp; Legislation</span>
              </div>
            </motion.div>

            {/* Mobile fallback: stacked images */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:hidden flex flex-col gap-3">
              <div className="rounded-xl overflow-hidden" style={{ height: '240px' }}>
                {/* REPLACE:  */}
                <img src="/images/ask.jpg" className="w-full h-full object-cover" />
                {/* <div className="w-full h-full flex items-center justify-center"
                  style={{ background: '#1C1600' }}>
                  <span className="text-[#F5C518] text-xs font-mono">ama-flyer.jpg</span>
                </div> */}
              </div>
              <div className="rounded-xl overflow-hidden" style={{ height: '240px' }}>
                {/* REPLACE:  */}
                <img src="/images/proj-1-tall.jpg" className="w-full h-full object-cover" />
                {/* <div className="w-full h-full flex items-center justify-center"
                  style={{ background: '#001428' }}>
                  <span className="text-[#F5C518] text-xs font-mono">future-of-defi.jpg</span>
                </div> */}
              </div>
            </motion.div>

            {/* RIGHT: text */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="pt-4">
              <h2 className="font-display text-2xl font-bold text-[#0A0A0A] mb-4">
                Solo Trainings &amp; Community Outreach
              </h2>
              <p className="text-[#555555] text-sm leading-relaxed mb-5">
                We believe Success in Web3 isn't just about technology, it's about people. That's
                why the our community is here to: learn, build, and grow together. We bridge the
                gap between complex blockchain innovations and real-world adoption.
              </p>
              <div className="bg-[#E8E0C0] border border-[#D4C898] rounded-xl p-5 text-sm text-[#444444] leading-relaxed">
                We hosts regular <strong className="text-[#0A0A0A]">AMA Sessions</strong> with both our in-house team and industry
                experts. Our Internal AMAs explore Rubikcon's vision, the challenges of web3 adoption and strategies for
                a decentralized future. We have also hosted talks with external experts including the{' '}
                <strong className="text-[#0A0A0A]">Future of DEFI in Africa</strong> covering how DEFI can empower the
                unbanked and it's legal barriers.
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PARTNERSHIPS — white/light bg
          Top: pill + heading LEFT | text RIGHT
          Below: auto-scrolling horizontal carousel of 6 event images
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto mb-10">
          <div className="grid md:grid-cols-2 gap-16 items-start">

            {/* LEFT */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}>
              <div className="inline-block border border-[#C9A800]/60 text-[#8A7000] text-xs px-4 py-1.5 rounded-full mb-5">
                Collaborations with Web3 Organisations
              </div>
              <h2 className="font-display text-3xl font-bold text-[#0A0A0A] leading-tight">
                Partnerships Trainings<br />&amp; Events
              </h2>
            </motion.div>

            {/* RIGHT */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <p className="text-[#555555] text-sm leading-relaxed">
                We deliver targeted blockchain education with partners like HerDAO, Starknet, and Web3Compass.
                Our Initiatives include the Women in Web3 empowerment program, the structured #30DaysofSolidity
                challenge and the Starknet Basecamp Africa.
              </p>
            </motion.div>

          </div>
        </div>

        {/* ── Auto-scrolling carousel ── */}
        {/* Images scroll horizontally in a loop. Drag to scroll manually. */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.2 }}>
          <AutoCarousel />
        </motion.div>

        {/* Carousel image guide */}
        {/* <div className="max-w-7xl mx-auto mt-4">
          <p className="text-xs text-[#AAAAAA] font-mono">
            Add images to <code>public/images/</code>: event-starknet.jpg · event-rubikcon-web3compass.jpg · event-product-mgmt.jpg · event-spirit-rubikcon.jpg · event-final-block.jpg · event-extra.jpg
          </p>
        </div> */}
      </section>

      {/* ══════════════════════════════════════════════════════════════
          DEVCON SPONSORSHIP — light bg
          Left: 2x2 image grid (4 photos)
          Right: pink pill + text + CTA
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#F5F0DC] py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* LEFT: 2x2 mosaic */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}>
              <div className="grid grid-cols-2 gap-2" style={{ height: '384px' }}>
                {DEVCON_IMAGES.map((item, i) => (
                  <div key={i} className="overflow-hidden rounded-xl">
                    <ImgBox src={item.img} label={item.label} className="w-full h-full" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT: text */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.1 }}>

              {/* Pink pill tag */}
              <div className="inline-block bg-[#FFB3C6] text-[#8B0028] text-sm font-semibold px-5 py-2 rounded-full mb-6">
                Sponsorships — Devcon Highlights
              </div>

              <p className="text-[#444444] text-sm leading-relaxed mb-4">
                Devcon At Your Doorstep brought together leading Ethereum experts to share insights and strategies
                for thriving in the Web3 space. Hosted by the Rubikcon Team, the event featured notable speakers,
                including our Co-founder, Ozioma who discussed Devcon's Significance in the global web3 ecosystem.
              </p>

              <p className="text-[#444444] text-sm leading-relaxed mb-8">
                Additionally, Laisha Wadhwa, creator of RadarFi, broke down Ethereum's ecosystem, while Moran
                Hertzanu guided attendees on making real-world impact alongside other inspiring speakers.
              </p>

              <a href="/contact"
                className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white text-sm font-medium px-7 py-3 rounded-full hover:bg-[#333] transition-colors">
                Partner With Us <ArrowRight size={14} />
              </a>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CTA — background image, gold heading
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* REPLACE:  */}
          <img src="/images/down.jpg" className="w-full h-full object-cover opacity-20" />
          <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #0A1A0A 0%, #0A0A0A 70%)' }} />
          <div className="absolute inset-0 bg-[#0A0A0A]/75" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#F5C518] mb-4">
            Want to Onboard Talents or Launch your Project?
          </h2>
          <p className="text-[#CCCCCC] text-sm leading-relaxed mb-8">
            We handle recruitment, training, compliance, and community growth with outreaches &amp; events.
            Let's turn your vision to reality.
          </p>
          <a href="/contact"
            className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white text-sm font-medium px-8 py-3 rounded-full hover:bg-[#333] transition-colors">
            Get Started <ArrowRight size={14} />
          </a>
        </motion.div>
      </section>

    </div>
  )
}