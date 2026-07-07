import { motion } from 'framer-motion'
import { ArrowRight, Building2, Compass, Globe2, GraduationCap, Handshake, Hammer, Rocket, Sparkles, Target, Users } from 'lucide-react'
import AcademyNavbar from '../components/AcademyNavbar'
import AcademyFooter from '../components/AcademyFooter'

// Content source: June 2026 website content brief, §2 "About Rubikcon Nexus Academy".

const PILLARS = [
  {
    icon: Globe2,
    title: 'Africa-First Learning',
    body: 'Our programmes are designed around African opportunities and challenges, using practical examples and real-world case studies that learners can immediately relate to.',
  },
  {
    icon: Hammer,
    title: 'Learn by Building',
    body: 'Every programme combines expert instruction with hands-on projects, practical assignments, and real-world applications — not just theory.',
  },
  {
    icon: Sparkles,
    title: 'Emerging Technology Focus',
    body: "From Artificial Intelligence and Blockchain to Product Management and future digital technologies, we prepare learners for the skills shaping tomorrow's workforce.",
  },
  {
    icon: GraduationCap,
    title: 'Industry-Led Facilitation',
    body: 'Learn directly from experienced professionals who have built, managed, and implemented technology solutions across startups, businesses, and innovation ecosystems.',
  },
  {
    icon: Rocket,
    title: 'Career and Impact Driven',
    body: "We don't just teach tools — we help learners develop the confidence and practical experience to build careers, grow businesses, and create lasting impact.",
  },
]

const WHO_WE_SERVE = [
  'Students and recent graduates',
  'Working professionals transitioning into tech',
  'Entrepreneurs and startup founders',
  'NGOs and social impact organisations',
  'MSMEs embracing digital transformation',
  'Corporate teams seeking upskilling opportunities',
  'Developers and technology enthusiasts',
]

const ORG_INFO = [
  { label: 'Organisation Name', value: 'Rubikcon Nexus Academy' },
  { label: 'Parent Organisation', value: 'Rubikcon Nexus' },
  { label: 'Country of Operation', value: 'Nigeria' },
  { label: 'Founded', value: '2025' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AcademyNavbar dark solid />

      <main className="pt-24">
        {/* Hero */}
        <section className="relative py-20 px-6 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-teal-400/10 blur-[160px] pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-[550px] h-[550px] rounded-full bg-amber-500/15 blur-[160px] pointer-events-none" />
          <div className="relative max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="text-xs font-mono text-[#F5C518] tracking-widest uppercase mb-5">About the Academy</p>
              <h1 className="font-display font-extrabold text-white leading-tight mb-6" style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}>
                Building Africa's Next Generation of Technology Leaders
              </h1>
              <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
                Rubikcon Nexus Academy was created with a simple belief: world-class technology education should be
                accessible, practical, and relevant to Africa's realities. Founded by technology professionals passionate
                about innovation and capacity building, the Academy was established to bridge the gap between theory and
                real-world application. Rather than teaching technology for its own sake, we equip learners with the
                skills to solve business challenges, drive social impact, and build meaningful careers in a rapidly
                evolving digital economy.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 px-6 bg-[#F2EDE2]">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Target,
                eyebrow: 'Our Mission',
                body: 'To equip individuals, businesses, and organisations across Africa with practical, industry-relevant technology skills that empower them to innovate, create sustainable solutions, and compete globally.',
              },
              {
                icon: Compass,
                eyebrow: 'Our Vision',
                body: "To become Africa's leading academy for emerging technology education, developing innovators who transform industries and communities through technology.",
              },
            ].map(({ icon: Icon, eyebrow, body }, i) => (
              <motion.div
                key={eyebrow}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-9"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#F5C518] flex items-center justify-center mb-5">
                  <Icon size={20} className="text-[#0A0A0A]" />
                </div>
                <p className="text-xs font-mono text-[#1C1C1C]/50 tracking-widest uppercase mb-3">{eyebrow}</p>
                <p className="text-[#1C1C1C]/70 text-base leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="py-20 px-6 bg-[#0A0A0A]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <p className="text-xs font-mono text-white/30 tracking-widest uppercase mb-3">Why Rubikcon Nexus</p>
              <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white leading-tight">
                What Makes Us Different
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PILLARS.map(({ icon: Icon, title, body }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 hover:border-white/20 transition-colors"
                >
                  <Icon size={20} className="text-[#F5C518] mb-4" />
                  <h3 className="font-display font-extrabold text-white text-lg mb-2 leading-snug">{title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Who We Serve + Learning Approach */}
        <section className="py-20 px-6 bg-[#0A0A0A] border-t border-white/5">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Users size={18} className="text-[#F5C518]" />
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white">Who We Serve</h2>
              </div>
              <ul className="space-y-3">
                {WHO_WE_SERVE.map(item => (
                  <li key={item} className="flex items-start gap-3 text-white/60 text-sm leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F5C518] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap size={18} className="text-[#F5C518]" />
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white">Our Learning Approach</h2>
              </div>
              <p className="text-white/55 text-sm leading-relaxed mb-4">
                Our programmes are designed to fit the realities of modern learners. You'll learn through structured
                online cohorts, guided by experienced facilitators and supported by collaborative discussions, practical
                assignments, and project-based learning. Our flagship Blockchain for Social Impact programme runs for
                15 weeks across three comprehensive modules, while other programmes follow structured learning paths
                tailored to their subject areas.
              </p>
              <div className="rounded-2xl border border-[#F5C518]/20 bg-[#F5C518]/[0.06] px-5 py-4">
                <p className="text-[11px] font-mono uppercase tracking-widest text-[#F5C518] mb-1.5">AI-supported learning</p>
                <p className="text-white/55 text-sm leading-relaxed">
                  To enhance learning, we also incorporate Large Language Model (LLM)-supported learning tools that help
                  learners explore concepts, practise independently, and receive additional guidance throughout their journey.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Organisation Info */}
        <section className="py-20 px-6 bg-[#F2EDE2]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Building2 size={18} className="text-[#1C1C1C]" />
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-[#1C1C1C]">Organisation Information</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ORG_INFO.map(({ label, value }) => (
                <div key={label} className="bg-white rounded-2xl p-6">
                  <p className="text-xs font-mono text-[#1C1C1C]/45 tracking-widest uppercase mb-2">{label}</p>
                  <p className="font-display font-extrabold text-[#1C1C1C] text-lg leading-snug">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partners & Community */}
        <section className="py-20 px-6 bg-[#0A0A0A]">
          <div className="max-w-4xl mx-auto text-center">
            <Handshake size={22} className="text-[#F5C518] mx-auto mb-5" />
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-4">Partners &amp; Community</h2>
            <p className="text-white/50 text-base leading-relaxed max-w-2xl mx-auto">
              Rubikcon Nexus Academy collaborates with organisations, technology communities, educational institutions,
              and ecosystem partners that share our commitment to innovation, digital skills development, and sustainable
              impact across Africa.
            </p>
          </div>
        </section>

        {/* Meet the People CTA */}
        <section className="py-20 px-6 bg-[#0A0A0A] border-t border-white/5">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-4">
              Meet the People Behind the Academy
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-8">
              Behind every programme is a team of experienced facilitators committed to helping learners succeed.
              Learn more about our facilitators, their experience, and the expertise they bring to every cohort.
            </p>
            <a
              href="/facilitators"
              className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-bold px-7 py-3.5 rounded-full hover:bg-[#E8B800] transition-colors text-[15px]"
            >
              Meet Our Facilitators <ArrowRight size={15} />
            </a>
          </div>
        </section>
      </main>

      <AcademyFooter />
    </div>
  )
}
