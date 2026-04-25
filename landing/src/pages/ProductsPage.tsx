// import { motion } from 'framer-motion'
// import { ArrowRight } from 'lucide-react'
// import Img from '../components/Img'

// export default function ProductsPage() {
//   return (
//     <div className="pt-[72px]">

//       {/* ── HERO ───────────────────────────────────────────────────── */}
//       <section className="relative py-24 px-6 overflow-hidden">
//         <div className="absolute inset-0 z-0">
//           {/* REPLACE: <img src="/products-hero-bg.jpg" className="w-full h-full object-cover opacity-25" /> */}
//           <div className="img-placeholder w-full h-full opacity-20" style={{ borderRadius: 0, border: 'none' }}>
//             <span className="text-[10px]">[ Products hero background image ]</span>
//           </div>
//           <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/60 to-[#0A0A0A]" />
//         </div>
//         <div className="relative z-10 max-w-7xl mx-auto text-center">
//           <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
//             className="font-display text-4xl md:text-5xl font-bold text-white mb-3">Products</motion.h1>
//           <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
//             className="text-[#CCCCCC] text-sm max-w-md mx-auto">
//             From conception to execution, explore our innovative solutions built with technical expertise
//           </motion.p>
//         </div>
//       </section>

//       {/* ── PRODUCT ONE: BLOCKGIGS ─────────────────────────────────── */}
//       <section className="bg-[#F5F0DC] py-20 px-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid md:grid-cols-2 gap-16 items-start">
//             <div>
//               <div className="inline-block border border-[#C9A800] text-[#C9A800] text-xs px-3 py-1 rounded-full mb-4">Product One</div>
//               <h2 className="font-display text-3xl font-bold text-[#0A0A0A] mb-4">
//                 Blockgigs — Future of Work on Web3
//               </h2>
//               <p className="text-[#444444] text-sm leading-relaxed mb-6">
//                 This is a job platform that revolutionizes hiring processes by leveraging web3 technology.
//                 It promotes the adoption of stablecoin payments like USDC, USDT, ensuring secure and borderless transactions.
//               </p>
//               <a href="http://localhost:3003" className="btn-gold mb-8 inline-flex">
//                 Visit BlockGigs <ArrowRight size={14} />
//               </a>

//               <div className="grid grid-cols-2 gap-4 mt-8">
//                 <div className="border border-[#C9A800]/50 rounded-xl p-4">
//                   <div className="text-xs font-mono text-[#C9A800] mb-2 uppercase tracking-wide">Main Feature #One</div>
//                   <p className="text-xs text-[#555555] leading-relaxed">
//                     By focusing on skills-based pseudonym profiles, this platform eliminates hiring biases,
//                     allowing employers to assess candidates purely on merit.
//                   </p>
//                 </div>
//                 <div className="border border-[#C9A800]/50 rounded-xl p-4">
//                   <div className="text-xs font-mono text-[#C9A800] mb-2 uppercase tracking-wide">Main Feature #Two</div>
//                   <p className="text-xs text-[#555555] leading-relaxed">
//                     Payment challenges (either with-held pays or scam talents) are well tackled
//                     with its milestone-based automated payment system.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-4">
//               {/* REPLACE with actual BlockGigs screenshots */}
//               <Img label="BlockGigs app screenshot — main marketplace view" aspect="aspect-video" />
//               <div className="grid grid-cols-2 gap-3">
//                 <Img label="BlockGigs — gig detail view" aspect="aspect-video" />
//                 <Img label="BlockGigs — profile/logo image" aspect="aspect-video" />
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── PRODUCT TWO: GAMES ─────────────────────────────────────── */}
//       <section className="bg-[#111111] py-20 px-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid md:grid-cols-2 gap-16 items-center">
//             <div>
//               <div className="inline-block border border-[#F5C518]/40 text-[#F5C518] text-xs px-3 py-1 rounded-full mb-4">Product Two</div>
//               <h2 className="font-display text-3xl font-bold text-white mb-4">
//                 Rubikcon's Games — The Fun of Web3
//               </h2>
//               <p className="text-[#888888] text-sm leading-relaxed mb-6">
//                 Our games introduce players to the web3 ecosystem in a fun and engaging way, simplifying complex
//                 blockchain concepts. The games are designed for both solo and multi-players experience.
//                 We have a variety of both physical (cards) and online games.
//               </p>
//               <a href="http://localhost:3002" className="btn-outline">
//                 Visit Game Shop <ArrowRight size={14} />
//               </a>
//             </div>

//             <div className="space-y-3">
//               {/* REPLACE with actual game screenshots / event photos */}
//               <Img label="Games platform screenshot — game lobby" aspect="aspect-video" />
//               <div className="grid grid-cols-2 gap-3">
//                 <Img label="Physical card game — Devcon event photo" aspect="aspect-video" />
//                 <Img label="Games screenshot 2" aspect="aspect-video" />
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── CTA ────────────────────────────────────────────────────── */}
//       <section className="relative py-24 px-6 overflow-hidden">
//         <div className="absolute inset-0">
//           {/* REPLACE: <img src="/products-cta-bg.jpg" className="w-full h-full object-cover opacity-15" /> */}
//           <div className="img-placeholder w-full h-full opacity-10" style={{ borderRadius: 0, border: 'none' }} />
//           <div className="absolute inset-0 bg-[#0A0A0A]/85" />
//         </div>
//         <div className="relative max-w-2xl mx-auto text-center">
//           <h2 className="font-display text-3xl font-bold text-white mb-4">Ready to Build or Refine your Product?</h2>
//           <p className="text-[#888888] text-sm leading-relaxed mb-8">
//             Rubikcon handles all from paperwork to execution with our experienced technical &amp; management team —
//             all while ensuring business goals are met.
//           </p>
//           <a href="/contact" className="btn-gold px-8 py-3 text-base">Get Started <ArrowRight size={16} /></a>
//         </div>
//       </section>

//     </div>
//   )
// }


import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function ProductsPage() {
  return (
    <div className="pt-[72px]">

      {/* ══════════════════════════════════════════════════════════════
          HERO — full bleed background image, centered text
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[380px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* REPLACE:  */}
          <img src="/images/top.jpg" className="w-full h-full object-cover" />
          {/* <div className="w-full h-full" style={{
            background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A0A 40%, #0A0A14 100%)',
          }} /> */}
          {/* <div className="absolute inset-0 bg-black/70" /> //bg-[#0A0A0A]/70 */}
          <div className="absolute inset-0 bg-[#0A0A0A]/70" />
        </div>
        <div className="relative z-10 text-center px-6">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Products
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-[#CCCCCC] text-sm max-w-sm mx-auto leading-relaxed">
            From conception to execution, explore our innovative solutions built with technical expertise
          </motion.p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PRODUCT ONE: BLOCKGIGS
          Light/cream background
          Layout:
            TOP ROW: "PRODUCT ONE" tag + heading LEFT | description + CTA RIGHT
            BOTTOM ROW: 3-image mosaic LEFT | 2 feature pills + text RIGHT
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#F0F4F8] py-16 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Top row: heading left, description right */}
          <div className="grid md:grid-cols-2 gap-12 mb-14 items-start">
            <div>
              <div className="inline-block border border-[#C9A800] text-[#8A7000] text-xs px-4 py-1.5 rounded-full mb-4 font-medium">
                PRODUCT ONE
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0A0A0A] leading-tight">
                Blockgigs — Future of Work<br />on Web3
              </h2>
            </div>
            <div className="flex flex-col justify-center gap-4">
              <p className="text-[#444444] text-sm leading-relaxed">
                This is a job platform that revolutionize hiring processes by leveraging
                web3 technology. It promotes the adoption of stablecoins payments like
                USDC, USDT, ensuring secure and borderless transactions.
              </p>
              <div>
                <a href="http://localhost:3003"
                  className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[#333] transition-colors">
                  Visit BlockGigs <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom row: 3-image mosaic LEFT | features RIGHT */}
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* LEFT: 3-image mosaic
                Image 1 (tall left):  w≈47%, h=full (384px)  radius: 12 0 0 12
                Image 2 (top right):  w≈53%, h=50%           radius: 0 12 0 0
                Image 3 (bot right):  w≈53%, h=50%           radius: 0 0 12 0
            */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="flex overflow-hidden rounded-xl border border-[#D0D8E0]"
              style={{ height: '384px' }}>

              {/* Tall left */}
              <div className="overflow-hidden flex-shrink-0" style={{ width: '47%', borderRadius: '12px 0 0 12px' }}>
                {/* REPLACE:  */}
                <img src="/images/about-1.jpg" alt="BlockGigs" className="w-full h-full object-cover" />
                {/* <div className="w-full h-full flex items-center justify-center text-center p-3"
                  style={{ background: 'linear-gradient(135deg, #2A1A2A 0%, #1A0D1A 100%)' }}>
                  <div>
                    <div className="text-[#F5C518] text-[9px] font-mono mb-1">[ IMAGE ]</div>
                    <div className="text-[#666] text-[8px]">REPLACE:<br/>blockgigs-tall.jpg<br/>Woman holding BlockGigs cards</div>
                  </div>
                </div> */}
              </div>

              {/* Right column: 2 stacked */}
              <div className="flex flex-col flex-1">
                {/* Top right */}
                <div className="flex-1 overflow-hidden border-l border-[#D0D8E0]"
                  style={{ borderRadius: '0 12px 0 0' }}>
                  {/* REPLACE: */}
                   <img src="/images/blog-3.jpg" alt="Devcon at Your Doorstep" className="w-full h-full object-cover" />
                  {/* <div className="w-full h-full flex items-center justify-center text-center p-2"
                    style={{ background: 'linear-gradient(135deg, #1A1A2A 0%, #0D1A2A 100%)' }}>
                    <div>
                      <div className="text-[#F5C518] text-[9px] font-mono mb-0.5">[ IMAGE ]</div>
                      <div className="text-[#666] text-[8px]">REPLACE:<br/>blockgigs-tr.jpg<br/>Devcon at Your Doorstep</div>
                    </div>
                  </div> */}
                </div>
                {/* Bottom right */}
                <div className="flex-1 overflow-hidden border-l border-t border-[#D0D8E0]"
                  style={{ borderRadius: '0 0 12px 0' }}>
                  {/* REPLACE:  */}
                  <img src="/images/prod-1-blockgigs.jpg" alt="BlockGigs logo" className="w-full h-full object-cover" />
                  {/* <div className="w-full h-full flex items-center justify-center text-center p-2"
                    style={{ background: '#111111' }}>
                    <div>
                      <div className="text-[#F5C518] text-[9px] font-mono mb-0.5">[ IMAGE ]</div>
                      <div className="text-[#F5C518] text-[8px] font-bold">BLOCKGIGS</div>
                      <div className="text-[#666] text-[8px] mt-0.5">REPLACE:<br/>blockgigs-br.jpg<br/>BlockGigs logo/banner</div>
                    </div>
                  </div> */}
                </div>
              </div>
            </motion.div>

            {/* RIGHT: Main Feature #One and #Two */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-2 gap-8">

              {/* Feature One */}
              <div>
                <div className="inline-block border border-[#C9A800] text-[#8A7000] text-xs px-3 py-1.5 rounded-full mb-4 font-medium">
                  MAIN FEATURE #ONE
                </div>
                <p className="text-[#444444] text-sm leading-relaxed">
                  By focusing on skills-based pseudonym profiles, This platform eliminates hiring
                  biases, allowing employers to assess candidates purely on merit.
                </p>
              </div>

              {/* Feature Two */}
              <div>
                <div className="inline-block border border-[#C9A800] text-[#8A7000] text-xs px-3 py-1.5 rounded-full mb-4 font-medium">
                  MAIN FEATURE #TWO
                </div>
                <p className="text-[#444444] text-sm leading-relaxed">
                  Payment challenges (either with-held pays or scam talents) are as well tackled
                  with its milestone-based automated payment system.
                </p>
              </div>

            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PRODUCT TWO: GAMES
          Dark background
          Layout: text LEFT | 2-image mosaic RIGHT (1 wide top + 1 wide bottom)
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#0A0A0A] py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* LEFT: text */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <div className="inline-block border border-[#C9A800]/60 text-[#C9A800] text-sm px-5 py-2 rounded-full mb-6 font-medium"
                style={{ background: 'rgba(180,160,0,0.08)' }}>
                Rubikcon's Games — <span className="text-[#F5C518]">The Fun of Web3</span>
              </div>
              <p className="text-[#CCCCCC] text-sm leading-relaxed mb-8">
                Our games introduce players to the web3 ecosystem in a fun and engaging
                way, simplifying complex blockchain concepts. The games are designed for
                both solo and multi-players experience. We have a variety of both physical
                (cards) and online games.
              </p>
              <a href="http://localhost:3002"
                className="inline-flex items-center gap-2 border border-[#C9A800] text-[#C9A800] text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[#F5C518] hover:text-black transition-all">
                Visit Game Shop <ArrowRight size={14} />
              </a>
            </motion.div>

            {/* RIGHT: 2-image mosaic
                Top image:    full width, h≈192px  radius: 12 12 0 0
                Bottom image: full width, h≈192px  radius: 0 0 12 12
                (2 stacked, both full width)
            */}
            {/* <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              className="overflow-hidden rounded-xl" style={{ height: '384px' }}> */}

              {/* <div className="flex flex-col h-full"> */}
                {/* Top image */}
                {/* <div className="flex-1 overflow-hidden" style={{ borderRadius: '12px 12px 0 0' }}> */}
                  {/* REPLACE: <img src="/images/games-top.jpg" alt="Devcon at Your Doorstep" className="w-full h-full object-cover" /> */}
                  {/* <div className="w-full h-full flex items-center justify-center text-center p-3"
                    style={{ background: 'linear-gradient(135deg, #1A2A3A 0%, #0D1A2A 100%)' }}>
                    <div>
                      <div className="text-[#F5C518] text-[9px] font-mono mb-1">[ IMAGE ]</div>
                      <div className="text-[#666] text-[8px]">REPLACE:<br/>games-top.jpg<br/>Devcon at Your Doorstep / community photo</div>
                    </div>
                  </div>
                </div> */}

                {/* Bottom image */}
                {/* <div className="flex-1 overflow-hidden border-t border-[#2A2A2A]" */}
                  {/* style={{ borderRadius: '0 0 12px 12px' }}> */}
                  {/* REPLACE: <img src="/images/games-bottom.jpg" alt="The Final Block Web3 Community Bash" className="w-full h-full object-cover" /> */}
                  {/* <div className="w-full h-full flex items-center justify-center text-center p-3"
                    style={{ background: 'linear-gradient(135deg, #0A1A0A 0%, #1A0A2A 100%)' }}>
                    <div>
                      <div className="text-[#F5C518] text-[9px] font-mono mb-1">[ IMAGE ]</div>
                      <div className="text-[#F5C518] text-[9px] font-bold mb-0.5">The Final Block: Web3 Community Bash</div>
                      <div className="text-[#666] text-[8px]">REPLACE:<br/>games-bottom.jpg<br/>The Final Block / Crypto cards flyer</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div> */}

            {/* RIGHT: 2x2 mosaic grid
                Layout (diagonal offset — A&D narrow, B&C wide):
                [ A narrow ][ B wide  ]
                [ C wide   ][ D narrow]
                A = top-left    ~38% width
                B = top-right   ~62% width
                C = bottom-left ~62% width
                D = bottom-right ~38% width
                Each row = 50% height of 384px = 192px
            */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              className="overflow-hidden rounded-xl"
              style={{ height: '384px' }}>
 
              <div className="flex flex-col h-full">
 
                {/* TOP ROW */}
                <div className="flex flex-1">
                  {/* A — top-left, narrow ~38% */}
                  <div className="overflow-hidden flex-shrink-0"
                    style={{ width: '38%', borderRadius: '12px 0 0 0' }}>
                    {/* REPLACE:  */}
                    <img src="/images/prod-3-bottom-left.jpg" alt="Devcon at Your Doorstep" className="w-full h-full object-cover" />
                    {/* <div className="w-full h-full flex items-center justify-center text-center p-2"
                      style={{ background: 'linear-gradient(135deg, #1A2060 0%, #2A1060 100%)' }}>
                      <div>
                        <div className="text-[#F5C518] text-[8px] font-mono mb-0.5">[ IMAGE ]</div>
                        <div className="text-[#888] text-[7px]">REPLACE: games-a.jpg<br/>Devcon speakers grid</div>
                      </div>
                    </div> */}
                  </div>
                  {/* B — top-right, wide ~62% */}
                  <div className="overflow-hidden flex-1 border-l border-[#2A2A2A]"
                    style={{ borderRadius: '0 12px 0 0' }}>
                    {/* REPLACE:  */}
                    <img src="/images/prod-2-ladies.jpg" alt="Three women with Rubikon cards" className="w-full h-full object-cover" />
                    {/* <div className="w-full h-full flex items-center justify-center text-center p-2"
                      style={{ background: 'linear-gradient(135deg, #2A1A1A 0%, #1A0D0D 100%)' }}>
                      <div>
                        <div className="text-[#F5C518] text-[8px] font-mono mb-0.5">[ IMAGE ]</div>
                        <div className="text-[#888] text-[7px]">REPLACE: games-b.jpg<br/>3 women with Rubikon cards</div>
                      </div>
                    </div> */}
                  </div>
                </div>
 
                {/* BOTTOM ROW */}
                <div className="flex border-t border-[#2A2A2A]" style={{ height: '192px' }}>
                {/* <div className="flex flex-1 border-t border-[#2A2A2A]"> */}
                  {/* C — bottom-left, wide ~62% */}
                  <div className="overflow-hidden flex-1"
                    style={{ borderRadius: '0 0 0 12px' }}>
                    {/* REPLACE: */}
                    <img src="/images/proj-1-br.jpg" alt="The Final Block Web3 Community Bash" className="w-full h-full object-cover" />
                    {/* <div className="w-full h-full flex items-center justify-center text-center p-2"
                      style={{ background: 'linear-gradient(135deg, #0A0A2A 0%, #1A0A3A 100%)' }}>
                      <div>
                        <div className="text-[#F5C518] text-[8px] font-mono mb-0.5">[ IMAGE ]</div>
                        <div className="text-[#F5C518] text-[7px] font-bold mb-0.5">The Final Block</div>
                        <div className="text-[#888] text-[7px]">REPLACE: games-c.jpg<br/>Web3 Community Bash flyer</div>
                      </div>
                    </div> */}
                  </div>
                  {/* D — bottom-right, narrow ~38% */}
                  {/* <div className="overflow-hidden flex-shrink-0 border-l border-[#2A2A2A]"
                    style={{ width: '38%', borderRadius: '0 0 12px 0' }}> */}
                <div className="flex border-t border-[#2A2A2A]" style={{ height: '192px' }}>
                    {/* REPLACE:  */}
                    <img src="/images/prod-4-bottom-right.jpg" alt="Crypto Parades card game" className="w-full h-full object-cover" />
                    {/* <div className="w-full h-full flex items-center justify-center text-center p-2"
                      style={{ background: 'linear-gradient(135deg, #1A1A00 0%, #2A2A00 100%)' }}>
                      <div>
                        <div className="text-[#F5C518] text-[8px] font-mono mb-0.5">[ IMAGE ]</div>
                        <div className="text-[#F5C518] text-[7px] font-bold mb-0.5">Rubikon Games</div>
                        <div className="text-[#888] text-[7px]">REPLACE: games-d.jpg<br/>Crypto Parades card box</div>
                      </div>
                    </div> */}
                  </div>
                </div>
 
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CTA — background image with overlay, gold text
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* REPLACE: */}
           <img src="/images/down.jpg" className="w-full h-full object-cover opacity-20" />
          {/* <div className="w-full h-full" style={{
            background: 'linear-gradient(135deg, #1A1A0A 0%, #0A0A0A 60%)',
          }} /> */}
          <div className="absolute inset-0 bg-[#0A0A0A]/70" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#F5C518] mb-4">
            Ready to Build or Refine your Product?
          </h2>
          <p className="text-[#CCCCCC] text-sm leading-relaxed mb-8 max-w-lg mx-auto">
            Rubikcon handles all from paperwork to execution with our experienced
            technical &amp; management team — all while ensuring business goals are met
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