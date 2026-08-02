import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Compass,
  Globe2,
  GraduationCap,
  Handshake,
  Hammer,
  Rocket,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import AcademyNavbar from "../components/AcademyNavbar";
import AcademyFooter from "../components/AcademyFooter";
import { useRef } from "react";

const PILLARS = [
  {
    icon: Globe2,
    title: "Africa-First Learning",
    body: "Our programmes are designed around African opportunities and challenges, using practical examples and real-world case studies that learners can immediately relate to.",
  },
  {
    icon: Hammer,
    title: "Learn by Building",
    body: "Every programme combines expert instruction with hands-on projects, practical assignments, and real-world applications, not just theory.",
  },
  {
    icon: Sparkles,
    title: "Emerging Technology Focus",
    body: "From Artificial Intelligence and Blockchain to Product Management and future digital technologies, we prepare learners for the skills shaping tomorrow's workforce.",
  },
  {
    icon: GraduationCap,
    title: "Industry-Led Facilitation",
    body: "Learn directly from experienced professionals who have built, managed, and implemented technology solutions across startups, businesses, and innovation ecosystems.",
  },
  {
    icon: Rocket,
    title: "Career and Impact Driven",
    body: "We don't just teach tools, we help learners develop the confidence and practical experience to build careers, grow businesses, and create lasting impact.",
  },
];

const WHO_WE_SERVE = [
  "Students and recent graduates",
  "Working professionals transitioning into tech",
  "Entrepreneurs and startup founders",
  "NGOs and social impact organisations",
  "MSMEs embracing digital transformation",
  "Corporate teams seeking upskilling opportunities",
  "Developers and technology enthusiasts",
];

const ORG_INFO = [
  { label: "Organisation Name", value: "Rubikcon Nexus Academy" },
  { label: "Parent Organisation", value: "Rubikcon Nexus" },
  { label: "Country of Operation", value: "Nigeria" },
  { label: "Founded", value: "2025" },
];

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2000&auto=format&fit=crop";
const AUDIENCE_IMAGE = "/images/prod-2-ladies.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans selection:bg-[#F5C518] selection:text-black">
      <AcademyNavbar dark solid />

      <main className="pt-16">
        {/* Editorial Hero */}
        <section
          ref={heroRef}
          className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#0A0A0A] px-6 py-20"
        >
          <motion.div
            style={{ y }}
            className="absolute inset-0 w-full h-full opacity-40 md:opacity-50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/30 z-10" />
            <img
              src={HERO_IMAGE}
              alt="Rubikcon Academy cohort collaboration"
              className="w-full h-full object-cover object-center"
            />
          </motion.div>

          <div className="relative z-20 max-w-7xl mx-auto w-full grid md:grid-cols-12 gap-8 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="md:col-span-8 lg:col-span-7"
            >
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
              >
                <span className="w-2 h-2 rounded-full bg-[#F5C518]" />
                <span className="text-xs font-mono text-white/80 tracking-widest uppercase">
                  About the Academy
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-display font-extrabold text-white leading-[1.1] mb-8"
                style={{ fontSize: "clamp(40px, 6vw, 72px)" }}
              >
                Building Africa's Next Generation of{" "}
                <span className="text-[#F5C518]">Technology Leaders</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-white/70 text-lg md:text-xl leading-relaxed max-w-2xl font-light"
              >
                Rubikcon Nexus Academy was created with a simple belief:
                world-class technology education should be accessible,
                practical, and relevant to Africa's realities.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision - Editorial Split */}
        <section className="py-24 px-6 bg-[#F2EDE2] relative z-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUp}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#1C1C1C] flex items-center justify-center">
                    <Target size={20} className="text-[#F5C518]" />
                  </div>
                  <h2 className="font-display text-3xl font-extrabold text-[#1C1C1C]">
                    Our Mission
                  </h2>
                </div>
                <p className="text-[#1C1C1C]/80 text-xl md:text-2xl leading-relaxed font-light">
                  To equip individuals, businesses, and organisations across
                  Africa with practical, industry-relevant technology skills
                  that empower them to innovate, create sustainable solutions,
                  and compete globally.
                </p>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUp}
                className="lg:pt-24"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#F5C518] flex items-center justify-center">
                    <Compass size={20} className="text-[#1C1C1C]" />
                  </div>
                  <h2 className="font-display text-3xl font-extrabold text-[#1C1C1C]">
                    Our Vision
                  </h2>
                </div>
                <p className="text-[#1C1C1C]/80 text-xl md:text-2xl leading-relaxed font-light">
                  To become Africa's leading academy for emerging technology
                  education, developing innovators who transform industries and
                  communities through technology.
                </p>
              </motion.div>
            </div>

            {/* Extended narrative paragraph */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="mt-20 max-w-3xl pt-16 border-t border-[#1C1C1C]/10"
            >
              <p className="text-[#1C1C1C]/70 text-lg leading-relaxed">
                Founded by technology professionals passionate about innovation
                and capacity building, the Academy was established to bridge the
                gap between theory and real-world application. Rather than
                teaching technology for its own sake, we equip learners with the
                skills to solve business challenges, drive social impact, and
                build meaningful careers in a rapidly evolving digital economy.
              </p>
            </motion.div>
          </div>
        </section>

        {/* What Makes Us Different (Bento / Staggered) */}
        <section className="py-32 px-6 bg-[#0A0A0A] relative">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#F5C518]/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="mb-16 md:mb-24"
            >
              <p className="text-xs font-mono text-[#F5C518] tracking-widest uppercase mb-4">
                Why Rubikcon Nexus
              </p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight max-w-2xl">
                The DNA of our Learning Experience
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PILLARS.map(({ icon: Icon, title, body }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`group relative rounded-3xl border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-all duration-300 ${i === 3 || i === 4 ? "lg:col-span-1.5" : ""}`}
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={20} className="text-[#F5C518]" />
                  </div>
                  <h3 className="font-display font-extrabold text-white text-xl mb-3 leading-snug">
                    {title}
                  </h3>
                  <p className="text-white/60 text-base leading-relaxed">
                    {body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Who We Serve + Learning Approach (Image + Text split) */}
        <section className="py-32 px-6 bg-[#0A0A0A] border-t border-white/5">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="order-2 lg:order-1 relative rounded-[2rem] overflow-hidden aspect-[4/5] md:aspect-[16/9] lg:aspect-[4/5] border border-white/10"
            >
              <div className="absolute inset-0 bg-[#0A0A0A]/20 z-10" />
              <img
                src={AUDIENCE_IMAGE}
                alt="Diverse group of tech learners collaborating"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent z-20">
                <div className="rounded-2xl border border-[#F5C518]/20 bg-[#F5C518]/10 backdrop-blur-md px-6 py-5">
                  <p className="text-[11px] font-mono uppercase tracking-widest text-[#F5C518] mb-2 flex items-center gap-2">
                    <Sparkles size={12} /> AI-supported learning
                  </p>
                  <p className="text-white/80 text-sm leading-relaxed font-light">
                    To enhance learning, we incorporate Large Language Model
                    (LLM)-supported tools that help learners explore concepts,
                    practise independently, and receive additional guidance.
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="order-1 lg:order-2 space-y-16">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
              >
                <motion.div
                  variants={fadeUp}
                  className="flex items-center gap-3 mb-6"
                >
                  <Users size={24} className="text-[#F5C518]" />
                  <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white">
                    Who We Serve
                  </h2>
                </motion.div>
                <motion.ul variants={stagger} className="space-y-4">
                  {WHO_WE_SERVE.map((item) => (
                    <motion.li
                      key={item}
                      variants={fadeUp}
                      className="flex items-start gap-4 text-white/70 text-lg leading-relaxed font-light"
                    >
                      <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#F5C518] shrink-0 shadow-[0_0_8px_rgba(245,197,24,0.5)]" />
                      {item}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="pt-12 border-t border-white/10"
              >
                <div className="flex items-center gap-3 mb-6">
                  <GraduationCap size={24} className="text-[#F5C518]" />
                  <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white">
                    Our Learning Approach
                  </h2>
                </div>
                <p className="text-white/70 text-lg leading-relaxed font-light">
                  Our programmes fit the realities of modern learners. You'll
                  learn through structured online cohorts, guided by experienced
                  facilitators and supported by collaborative discussions,
                  practical assignments, and project-based learning.
                </p>
                <p className="text-white/70 text-lg leading-relaxed font-light mt-4">
                  Our flagship Blockchain for Social Impact programme runs for
                  15 weeks across three comprehensive modules, while other
                  programmes follow structured learning paths tailored to their
                  subject areas.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Organisation Info */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Building2 size={24} className="text-[#1C1C1C]" />
                  <h2 className="font-display text-3xl md:text-4xl font-extrabold text-[#1C1C1C]">
                    Organisation Footprint
                  </h2>
                </div>
                <p className="text-[#1C1C1C]/60 text-lg">
                  The foundational details of our academy.
                </p>
              </div>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#1C1C1C]/10 border border-[#1C1C1C]/10 rounded-3xl overflow-hidden">
              {ORG_INFO.map(({ label, value }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 lg:p-10"
                >
                  <p className="text-xs font-mono text-[#1C1C1C]/50 tracking-widest uppercase mb-3">
                    {label}
                  </p>
                  <p className="font-display font-extrabold text-[#1C1C1C] text-2xl leading-snug">
                    {value}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Partners & Community & CTA */}
        <section className="py-32 px-6 bg-[#0A0A0A] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8">
                <Handshake size={28} className="text-[#F5C518]" />
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white mb-6">
                Partners &amp; Community
              </h2>
              <p className="text-white/60 text-xl leading-relaxed mb-16 font-light">
                Rubikcon Nexus Academy collaborates with organisations,
                technology communities, educational institutions, and ecosystem
                partners that share our commitment to innovation, digital skills
                development, and sustainable impact across Africa.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="p-10 md:p-16 rounded-[2.5rem] bg-gradient-to-br from-[#1C1C1C] to-[#0A0A0A] border border-white/10 shadow-2xl"
            >
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-6">
                Meet the People Behind the Academy
              </h2>
              <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-2xl mx-auto font-light">
                Behind every programme is a team of experienced facilitators
                committed to helping learners succeed. Learn more about our
                facilitators, their experience, and the expertise they bring to
                every cohort.
              </p>
              <a
                href="/facilitators"
                className="inline-flex items-center justify-center gap-3 bg-[#F5C518] text-[#0A0A0A] font-bold px-8 py-4 rounded-full hover:bg-[#E8B800] hover:scale-105 transition-all duration-300 text-[15px] md:text-base group shadow-[0_0_20px_rgba(245,197,24,0.3)]"
              >
                Meet Our Facilitators
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
            </motion.div>
          </div>
        </section>
      </main>

      <AcademyFooter />
    </div>
  );
}
