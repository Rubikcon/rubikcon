import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BookOpen, CheckCircle, Clock, Play } from "lucide-react";
import { CURRICULUM_TOPICS } from "../data/courseData";

import AcademyNavbar from "../components/AcademyNavbar";
import AcademyFooter from "../components/AcademyFooter";
import TestimonialsMarquee from "../components/TestimonialsMarquee";
import { apiRequest } from "../lib/api";
import { AnimatedCounter } from "../components/AnimatedCounter";

type PublicCourse = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  level: string | null;
  estimatedDuration: string | null;
  heroImage: string | null;
  weekCount: number;
  facilitators: Array<{
    id: string;
    name: string;
    title: string;
    organization: string;
    photoUrl: string | null;
  }>;
};

const floating = (delay: number) => ({
  y: [0, -6, 0],
  transition: {
    duration: 3 + delay,
    repeat: Infinity,
    repeatType: "mirror" as const,
    ease: "easeInOut",
    delay,
  },
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const LEVEL_COLORS: Record<string, string> = {
  "Beginner → Intermediate": "bg-[#F5C518] text-[#0A0A0A]",
  Intermediate: "bg-[#1C1C1C] text-white border border-white/20",
  "Beginner → Advanced": "bg-[#1C1C1C] text-white border border-white/20",
  Advanced: "bg-[#1C1C1C] text-white border border-white/20",
  Beginner: "bg-[#F5C518] text-[#0A0A0A]",
  BEGINNER: "bg-[#F5C518] text-[#0A0A0A]",
  INTERMEDIATE: "bg-[#E8E0D0] text-[#1C1C1C]",
  ADVANCED: "bg-[#1C1C1C] text-white",
};

function facilitatorPhotoUrl(facilitator: {
  name: string;
  photoUrl: string | null;
}) {
  if (facilitator.photoUrl) return facilitator.photoUrl;
  if (facilitator.name.toLowerCase().includes("joy egbu"))
    return "/icons/joy-egbu.jpeg";
  return null;
}

// ── Featured programme: profession → recommendation mapping ──────────────────
// "We want to help people know which course they should be taking", pick your
// profession and the featured card explains why the flagship programme fits.
const FEATURED_PROFESSIONS = [
  {
    id: "ngo",
    label: "NGO Professional",
    blurb:
      "Bring transparency and donor trust to your programmes. Learn how blockchain strengthens reporting, fundraising, and accountability, no technical background needed.",
  },
  {
    id: "msme",
    label: "MSME Owner",
    blurb:
      "Discover practical ways blockchain improves transparency, payments, and operational efficiency for growing businesses across Africa.",
  },
  {
    id: "social-entrepreneur",
    label: "Social Entrepreneur",
    blurb:
      "Build technology-enabled solutions with real impact. Learn to evaluate when blockchain is the right tool, and when it is not.",
  },
  {
    id: "founder",
    label: "Startup Founder",
    blurb:
      "Understand how blockchain products are designed, validated, and brought to market so you can lead technology decisions with confidence.",
  },
  {
    id: "business-leader",
    label: "Business Leader",
    blurb:
      "Evaluate emerging technologies for your organisation and collaborate effectively with developers, product teams, and technology partners.",
  },
  {
    id: "new-to-tech",
    label: "New to Tech",
    blurb:
      "A beginner-friendly path into emerging technology. Understand blockchain beyond the hype and build knowledge you can apply anywhere.",
  },
] as const;

type Facilitator = {
  id: string;
  name: string;
  title: string;
  organization: string;
  bio: string;
  photoUrl: string | null;
  linkedinUrl: string;
};

// ── Home facilitators content (June 2026 brief §1.6) ─────────────────────────
// We now fetch this dynamically from the backend instead of hardcoding.

const AUDIENCE_ITEMS = [
  {
    icon: "🎓",
    label: "Students & Recent Graduates",
    desc: "Build tech skills that make you employable from day one.",
  },
  {
    icon: "💼",
    label: "Professionals Transitioning into Tech",
    desc: "Leverage your existing expertise and add in-demand digital skills.",
  },
  {
    icon: "🚀",
    label: "Entrepreneurs & Startup Founders",
    desc: "Understand the technologies that will power your next venture.",
  },
  {
    icon: "🌍",
    label: "NGOs & Social Impact Organisations",
    desc: "Use blockchain, AI, and digital tools to amplify your mission.",
  },
  {
    icon: "🏢",
    label: "MSMEs Seeking Digital Transformation",
    desc: "Equip your team to compete in an increasingly digital economy.",
  },
  {
    icon: "⚙️",
    label: "Developers & Innovators",
    desc: "Go deeper into emerging technologies and build what's next.",
  },
];

function CourseThumbnail({
  course,
  index,
}: {
  course: PublicCourse;
  index: number;
}) {
  const accents = ["#F5C518", "#24C6A9", "#F97B72", "#A78BFA"];
  const accent = accents[index % accents.length];

  return (
    <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-xl bg-[#1C1C1C]">
      {course.heroImage ? (
        <img
          src={course.heroImage}
          alt={`${course.title} thumbnail`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, #111 0%, ${accent}33 100%)`,
            }}
          />
          <div className="absolute left-5 top-5 h-14 w-14 rounded-full border border-white/15" />
          <div className="absolute bottom-5 left-5 right-5">
            <div className="mb-2 h-2 w-24 rounded-full bg-white/25" />
            <div className="h-2 w-36 rounded-full bg-white/10" />
          </div>
        </>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
    </div>
  );
}

export default function LandingPage() {
  const [dynamicCourses, setDynamicCourses] = useState<PublicCourse[]>([]);
  const [facilitators, setFacilitators] = useState<Facilitator[]>([]);
  const [publicStats, setPublicStats] = useState<{
    totalCourses: number;
    totalLearners: number;
    totalFacilitators: number;
    completionRate: number;
  } | null>(null);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedProfession, setSelectedProfession] =
    useState<(typeof FEATURED_PROFESSIONS)[number]["id"]>("ngo");

  // Add ref and useInView for stats
  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.4 });

  useEffect(() => {
    apiRequest<PublicCourse[]>("/academy/courses")
      .then((data) => setDynamicCourses(data))
      .catch(() => {
        // Fallback or error state
      })
      .finally(() => setCoursesLoading(false));

    apiRequest<Facilitator[]>("/academy/facilitators")
      .then((data) => setFacilitators(data))
      .catch(() => {
        // Fallback
      });

    apiRequest<any>("/academy/public/stats")
      .then((data) => setPublicStats(data))
      .catch(console.error);
  }, []);

  const activeProfession =
    FEATURED_PROFESSIONS.find((p) => p.id === selectedProfession) ??
    FEATURED_PROFESSIONS[0];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AcademyNavbar dark />

      {/* ─── 1. HERO ─── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#0A0A0A]">
        {/* Atmospheric glows, yellow lower-left, teal upper-right */}
        <div className="absolute -bottom-32 -left-32 w-[700px] h-[700px] rounded-full bg-amber-500/25 blur-[180px] pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-[750px] h-[750px] rounded-full bg-teal-400/20 blur-[180px] pointer-events-none" />

        {/* Dashed orbit ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[680px] h-[680px] rounded-full border border-dashed border-white/[0.12]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center pt-28 pb-20">
          {/* Badge pill */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.14] px-4 py-1.5 rounded-full mb-10"
          >
            <span className="w-1.5 h-1.5 bg-[#F5C518] rounded-full" />
            <span className="text-[11px] font-mono text-white/60 tracking-[0.2em] uppercase">
              Rubikcon Nexus
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="font-display font-extrabold text-white leading-[1.06] tracking-[-0.025em] mb-7"
            style={{ fontSize: "clamp(36px, 5vw, 68px)" }}
          >
            Build{" "}
            <span className="inline-block bg-[#F5C518] text-[#0A0A0A] px-5 py-1 rounded-full align-middle leading-snug">
              In-Demand
            </span>{" "}
            Tech Skills. Create Real-World Impact.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-white/50 text-[17px] max-w-[620px] mx-auto mb-11 leading-relaxed"
          >
            Rubikcon Nexus Academy equips individuals, startups, businesses, and
            organisations across Africa with practical, industry-focused
            training in Artificial Intelligence, Blockchain, Product Management,
            Software Development, and other emerging technologies, helping
            learners build careers, solve meaningful problems, and drive
            innovation.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex items-center justify-center gap-4 mb-20 flex-wrap"
          >
            <a
              href="/courses"
              className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-bold px-8 py-3.5 rounded-full hover:bg-[#E8B800] transition-colors text-[15px]"
            >
              Start Learning →
            </a>
            <a
              href="/courses"
              className="inline-flex items-center gap-2 bg-white/[0.07] border border-white/[0.15] text-white px-7 py-3.5 rounded-full hover:bg-white/[0.12] transition-colors text-[15px]"
            >
              <Play size={12} className="fill-white" /> Preview a course
            </a>
          </motion.div>

          {/* Circular Topics */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mt-16 pt-10"
          >
            <p className="text-white/40 text-[11px] font-mono tracking-[0.2em] uppercase mb-8">
              Explore Core Topics
            </p>
            <div className="flex flex-wrap justify-center gap-6 md:gap-12">
              {[
                { id: "PD", label: "Product Development" },
                { id: "BC", label: "Blockchain" },
                { id: "ETH", label: "Ethereum" },
                { id: "BTC", label: "Bitcoin" },
              ].map((topic, index) => (
                <motion.a
                  key={topic.id}
                  href={`/courses?search=${topic.id.toLowerCase()}`}
                  animate={floating(index * 0.4)}
                  whileHover={{
                    y: -8,
                    scale: 1.08,
                    rotateY: 180,
                    transition: {
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                    },
                  }}
                  style={{ perspective: 1000 }}
                  className="group flex flex-col items-center gap-4"
                >
                  <motion.div
                    whileHover={{
                      boxShadow: "0 0 35px rgba(245,197,24,.35)",
                    }}
                    style={{ transformStyle: "preserve-3d" }}
                    className="
                      relative
                      w-20
                      h-20
                      rounded-full
                      overflow-hidden
                      border
                      border-white/15
                      bg-white/[0.03]
                      backdrop-blur-xl
                      flex
                      items-center
                      justify-center
                      transition-all
                      duration-500
                      group-hover:border-[#F5C518]
                    "
                  >
                    {/* animated glow */}
                    <motion.div
                      animate={{
                        scale: [1, 1.18, 1],
                        opacity: [0.15, 0.35, 0.15],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.5,
                      }}
                      className="
                        absolute
                        inset-0
                        rounded-full
                        bg-[#F5C518]/20
                        blur-xl
                      "
                    />

                    {/* moving highlight */}
                    <motion.div
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 14,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0"
                    >
                      <div
                        className="
                          absolute
                          left-1/2
                          top-0
                          h-6
                          w-[2px]
                          -translate-x-1/2
                          rounded-full
                          bg-[#F5C518]/80
                        "
                      />
                    </motion.div>

                    <motion.span
                      style={{ backfaceVisibility: "hidden" }}
                      className="
                        relative
                        z-10
                        font-display
                        text-xl
                        font-bold
                        text-white
                        transition-colors
                        duration-300
                        group-hover:text-[#F5C518]
                      "
                    >
                      {topic.id}
                    </motion.span>

                    {/* Back face of the 3D circle */}
                    <motion.span
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                      className="
                        absolute
                        inset-0
                        z-10
                        font-display
                        text-sm
                        font-bold
                        text-[#F5C518]
                        flex
                        items-center
                        justify-center
                        bg-[#0A0A0A]
                        rounded-full
                      "
                    >
                      {topic.id}
                    </motion.span>
                  </motion.div>

                  <span
                    className="
                      text-sm
                      font-medium
                      text-white/60
                      transition-all
                      duration-300
                      group-hover:text-white
                    "
                  >
                    {topic.label}
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 2. COURSE PREVIEW ─── */}
      <section className="bg-[#0A0A0A] py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Video placeholder */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="w-full lg:w-1/2 shrink-0"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#141414] border border-white/10">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Course Preview"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>

            {/* Copy */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1"
            >
              <p className="text-xs font-mono text-white/30 tracking-widest uppercase mb-4">
                Free preview
              </p>
              <h2 className="font-display font-extrabold text-white text-4xl md:text-5xl leading-tight mb-5">
                Experience Learning Before You Commit
              </h2>
              <p className="text-white/50 text-base leading-relaxed mb-8">
                Explore a free course preview to see how our programmes are
                taught. Watch an introduction from our facilitators, explore the
                learning approach, and discover what you'll build throughout the
                programme, no registration required.
              </p>
              <a
                href="/course/blockchain-social-impact/week/week-1-blockchain-fundamentals-history"
                className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-bold px-7 py-3.5 rounded-full hover:bg-[#E8B800] transition-colors text-[15px]"
              >
                <Play size={13} className="fill-[#0A0A0A]" /> Preview Course
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 3. COURSES CATALOG (moved up per admin feedback) ─── */}
      <section id="courses" className="bg-[#F2EDE2] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="text-xs font-mono text-[#1C1C1C]/50 tracking-widest uppercase mb-3">
              Catalog
            </p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h2 className="font-display text-4xl md:text-6xl font-extrabold text-[#1C1C1C] leading-none">
                All courses
              </h2>
              <p className="text-[#1C1C1C]/60 text-sm max-w-sm leading-relaxed md:text-right">
                From fundamentals to mainnet launches. Mix and match, learn at
                your pace.
              </p>
            </div>
          </div>

          {/* Course preview cards — skeleton while loading, real cards once resolved */}
          {coursesLoading ? (
            /* Loading skeleton — 3 placeholder cards matching the real card dimensions */
            <div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
              aria-hidden="true"
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 flex flex-col animate-pulse"
                >
                  {/* Thumbnail skeleton */}
                  <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-xl bg-[#E8E0D0]" />
                  {/* Level badge skeleton */}
                  <div className="h-5 w-20 rounded-full bg-[#E8E0D0] mb-4" />
                  {/* Title skeleton */}
                  <div className="h-5 w-3/4 rounded bg-[#E8E0D0] mb-2" />
                  <div className="h-5 w-1/2 rounded bg-[#E8E0D0] mb-4" />
                  {/* Tagline skeleton */}
                  <div className="space-y-1.5 mb-4 flex-1">
                    <div className="h-3 w-full rounded bg-[#E8E0D0]" />
                    <div className="h-3 w-5/6 rounded bg-[#E8E0D0]" />
                  </div>
                  {/* Footer skeleton */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#F2EDE2]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#E8E0D0]" />
                      <div className="h-3 w-20 rounded bg-[#E8E0D0]" />
                    </div>
                    <div className="h-3 w-12 rounded bg-[#E8E0D0]" />
                  </div>
                </div>
              ))}
            </div>
          ) : dynamicCourses.length > 0 ? (
            /* Real course cards */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {dynamicCourses.slice(0, 3).map((course, i) => {
                const level = (course.level ?? "").split(" ")[0].toUpperCase();
                const levelClass =
                  LEVEL_COLORS[level] || "bg-[#E8E0D0] text-[#1C1C1C]";
                const primaryFacilitator = course.facilitators[0];
                const initials = primaryFacilitator
                  ? primaryFacilitator.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "?";
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col"
                  >
                    <CourseThumbnail course={course} index={i} />
                    <div className="mb-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${levelClass || "bg-[#E8E0D0] text-[#1C1C1C]"}`}
                      >
                        {level || "COURSE"}
                      </span>
                    </div>
                    <h3 className="font-display font-extrabold text-[#1C1C1C] text-lg leading-snug mb-2">
                      {course.title}
                    </h3>
                    <p className="text-[#1C1C1C]/55 text-xs leading-relaxed mb-4 flex-1">
                      {course.tagline}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#1C1C1C]/40 mb-4">
                      <span className="flex items-center gap-1">
                        <BookOpen size={11} />
                        {course.weekCount} week
                        {course.weekCount !== 1 ? "s" : ""}
                      </span>
                      {course.estimatedDuration && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {course.estimatedDuration}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-[#F2EDE2]">
                      {primaryFacilitator ? (
                        <div className="flex items-center gap-2">
                          {facilitatorPhotoUrl(primaryFacilitator) ? (
                            <img
                              src={facilitatorPhotoUrl(primaryFacilitator)!}
                              alt={primaryFacilitator.name}
                              loading="lazy"
                              decoding="async"
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[#0A0A0A] flex items-center justify-center text-[#F5C518] font-display font-extrabold text-[10px]">
                              {initials}
                            </div>
                          )}
                          <span className="text-xs text-[#1C1C1C]/60 truncate max-w-[100px]">
                            {primaryFacilitator.name}
                          </span>
                        </div>
                      ) : (
                        <div />
                      )}
                      <a
                        href="/courses"
                        className="text-xs font-semibold text-[#1C1C1C] underline underline-offset-2 hover:text-[#C49A00]"
                      >
                        View →
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Empty state — API returned no courses yet */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center min-h-[280px] border-2 border-dashed border-[#E8E0D0]"
                >
                  <div className="w-10 h-10 rounded-full bg-[#F2EDE2] flex items-center justify-center mb-3">
                    <BookOpen size={18} className="text-[#1C1C1C]/30" />
                  </div>
                  <p className="text-[#1C1C1C]/35 text-xs font-mono tracking-widest uppercase">
                    Coming soon
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Browse all CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-[#1C1C1C] px-7 py-5">
            <div>
              <p className="text-white font-display font-extrabold text-lg">
                {dynamicCourses.length > 0
                  ? `${dynamicCourses.length} course${dynamicCourses.length !== 1 ? "s" : ""} available now`
                  : "Courses launching soon"}
              </p>
              <p className="text-white/40 text-sm">
                Browse the full catalog, filter by level, and enrol in minutes.
              </p>
            </div>
            <a
              href="/courses"
              className="shrink-0 inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-bold px-6 py-3 rounded-full hover:bg-[#E8B800] transition-colors text-sm whitespace-nowrap"
            >
              <BookOpen size={14} /> Browse all courses →
            </a>
          </div>
        </div>
      </section>

      {/* ─── 4. CURRICULUM OVERVIEW ─── */}
      <section className="bg-[#F2EDE2] py-24 px-6 border-t border-black/5">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-mono text-[#1C1C1C]/50 tracking-widest uppercase mb-3">
              What you'll learn
            </p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h2 className="font-display text-4xl md:text-5xl font-extrabold text-[#1C1C1C] leading-tight">
                Skills that ship.
              </h2>
              <p className="text-[#1C1C1C]/60 text-sm max-w-sm leading-relaxed md:text-right">
                Practical, industry-focused training that builds careers and
                turns ideas into real products, across AI, blockchain, product
                management, and emerging tech.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CURRICULUM_TOPICS.map((topic, i) => (
              <motion.div
                key={topic.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl p-7 hover:shadow-md transition-shadow"
              >
                <span className="inline-block bg-[#F2EDE2] text-[#1C1C1C] text-xs font-mono font-bold px-2.5 py-1 rounded-lg mb-4">
                  {topic.num}
                </span>
                <h3 className="font-display font-extrabold text-[#1C1C1C] text-lg mb-2 leading-snug">
                  {topic.title}
                </h3>
                <p className="text-[#1C1C1C]/55 text-sm leading-relaxed">
                  {topic.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. WHO OUR PROGRAMMES ARE FOR ─── */}
      <section className="bg-[#F2EDE2] py-24 px-6 border-t border-black/5">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-mono text-[#1C1C1C]/50 tracking-widest uppercase mb-3">
              Our learners
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-[#1C1C1C] leading-tight mb-4">
              Who Our Programmes Are For
            </h2>
            <p className="text-[#1C1C1C]/60 text-base max-w-xl leading-relaxed">
              Whether you're starting your tech journey or looking to expand
              your expertise, Rubikcon Nexus Academy is designed for:
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 items-center">
            {/* Audience cards */}
            <div className="grid sm:grid-cols-2 gap-4 flex-1">
              {AUDIENCE_ITEMS.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col gap-2.5"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <h3 className="font-display font-extrabold text-[#1C1C1C] text-base leading-snug">
                    {item.label}
                  </h3>
                  <p className="text-[#1C1C1C]/55 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Community visual */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="w-full lg:w-[42%] shrink-0"
            >
              <img
                src="/images/who-programmes-are-for.svg"
                alt="A diverse community of learners, students, professionals, founders, NGOs, MSMEs, and developers"
                loading="lazy"
                decoding="async"
                className="w-full rounded-3xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 6. FEATURED PROGRAMME ─── */}
      <section className="bg-[#0A0A0A] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-mono text-white/30 tracking-widest uppercase mb-3">
            Featured programme
          </p>
          <p className="text-white/45 text-sm mb-5 max-w-xl">
            Not sure which course fits? Pick what best describes you and we'll
            show you why this programme is the right starting point.
          </p>

          {/* Profession buttons */}
          <div className="flex flex-wrap gap-2.5 mb-8">
            {FEATURED_PROFESSIONS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProfession(p.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  selectedProfession === p.id
                    ? "bg-[#F5C518] border-[#F5C518] text-[#0A0A0A] font-semibold shadow-[0_0_24px_rgba(245,197,24,0.25)]"
                    : "border-white/15 text-white/55 hover:border-white/30 hover:text-white/80"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-12 flex flex-col md:flex-row gap-10 items-start"
          >
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-[#F5C518]/10 border border-[#F5C518]/30 px-3 py-1 rounded-full mb-6">
                <span className="w-1.5 h-1.5 bg-[#F5C518] rounded-full" />
                <span className="text-[#F5C518] text-xs font-mono tracking-widest uppercase">
                  Blockchain for Social Impact
                </span>
              </div>
              <h2 className="font-display font-extrabold text-white text-3xl md:text-4xl leading-tight mb-5">
                Harness blockchain to build transparent, accountable, and
                future-ready organisations.
              </h2>
              <p className="text-white/50 text-base leading-relaxed mb-4">
                Learn how blockchain can improve transparency, accountability,
                fundraising, digital identity, and operational efficiency for
                businesses and organisations creating social impact.
              </p>
              {/* Personalised recommendation */}
              <div className="rounded-2xl border border-[#F5C518]/20 bg-[#F5C518]/[0.06] px-5 py-4 mb-8">
                <p className="text-[11px] font-mono uppercase tracking-widest text-[#F5C518] mb-1.5">
                  Recommended for: {activeProfession.label}
                </p>
                <p className="text-white/60 text-sm leading-relaxed">
                  {activeProfession.blurb}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="inline-flex items-center gap-1.5 bg-white/[0.07] border border-white/10 text-white/70 text-sm px-4 py-2 rounded-full">
                  <CheckCircle size={13} className="text-[#F5C518]" /> 15 Weeks
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/[0.07] border border-white/10 text-white/70 text-sm px-4 py-2 rounded-full">
                  <CheckCircle size={13} className="text-[#F5C518]" /> 3
                  Comprehensive Modules
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/[0.07] border border-white/10 text-white/70 text-sm px-4 py-2 rounded-full">
                  <CheckCircle size={13} className="text-[#F5C518]" />{" "}
                  Beginner-Friendly
                </span>
              </div>
              <a
                href="/course/blockchain-social-impact"
                className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-bold px-7 py-3.5 rounded-full hover:bg-[#E8B800] transition-colors text-[15px]"
              >
                Start Learning →
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 7. MEET YOUR FACILITATORS ─── */}
      <section
        id="instructors"
        className="bg-[#0A0A0A] py-24 px-6 border-t border-white/5"
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-mono text-white/30 tracking-widest uppercase mb-3">
              Meet Your Facilitators
            </p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Builders, not theorists
              </h2>
              <p className="text-white/40 text-sm max-w-sm leading-relaxed md:text-right">
                Learn from experienced technology leaders passionate about
                building Africa's next generation of innovators.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {facilitators.length === 0 ? (
              <p className="text-white/50 col-span-2 text-center">
                Loading facilitators...
              </p>
            ) : (
              facilitators.map((facilitator, i) => {
                const photoUrl = facilitatorPhotoUrl({
                  name: facilitator.name,
                  photoUrl: facilitator.photoUrl,
                });
                const initials = facilitator.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2);

                return (
                  <motion.div
                    key={facilitator.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col sm:flex-row gap-6 p-6 rounded-3xl bg-[#1C1C1C] border border-white/10"
                  >
                    {photoUrl ? (
                      <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                        <img
                          src={photoUrl}
                          alt={facilitator.name}
                          className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#3D2F00] to-[#1A1400] flex items-center justify-center shrink-0">
                        <span className="font-display font-extrabold text-[#F5C518] text-3xl">
                          {initials}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <a
                        href="/academy/facilitators"
                        className="hover:underline"
                      >
                        <h3 className="font-display font-extrabold text-white text-xl mb-1">
                          {facilitator.name}
                        </h3>
                      </a>
                      <p className="text-[#F5C518] text-sm font-medium mb-3">
                        {facilitator.title}
                      </p>
                      <p className="text-white/50 text-sm leading-relaxed">
                        {facilitator.bio}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          <div className="mt-10 text-center">
            <a
              href="/facilitators"
              className="inline-flex items-center gap-2 border border-white/20 text-white px-6 py-3 rounded-full hover:border-white/40 transition-colors text-sm"
            >
              Meet All Facilitators →
            </a>
          </div>
        </div>
      </section>

      {/* ─── 8. OUR MISSION ─── */}
      <section className="bg-[#F2EDE2] py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-mono text-[#1C1C1C]/50 tracking-widest uppercase mb-6">
              Our mission
            </p>
            <h2 className="font-display font-extrabold text-[#1C1C1C] text-3xl md:text-5xl leading-tight mb-6">
              Technology should create opportunities,{" "}
              <span className="text-[#1C1C1C]/40">not barriers.</span>
            </h2>
            <p className="text-[#1C1C1C]/60 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              At Rubikcon Nexus Academy, our mission is to equip Africans with
              practical, future-ready technology skills that enable them to
              build meaningful careers, strengthen businesses, and solve
              pressing challenges across communities. Through accessible,
              hands-on education, we're helping bridge the gap between learning
              and real-world impact.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── 9. TESTIMONIALS MARQUEE ─── */}
      <TestimonialsMarquee />

      {/* ─── 10. COHORT CTA ─── */}
      <section
        ref={statsRef}
        className="bg-[#0A0A0A] py-24 px-6 border-t border-white/5"
      >
        {/* Stats Row */}
        {publicStats && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={
              isStatsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }
            }
            transition={{
              duration: 0.6,
              ease: "easeOut",
              staggerChildren: 0.2,
            }}
            className="flex flex-wrap justify-center gap-8 md:gap-16 border-white/10 py-8 mb-16"
          >
            {[
              {
                val: publicStats.totalLearners,
                label: "Active learners across 34 countries",
                prefix: "",
                suffix: "",
              },
              {
                val: publicStats.totalCourses,
                label: "Production-track courses",
                prefix: "",
                suffix: "",
              },
              {
                val: publicStats.totalFacilitators,
                label: "Instructors shipping today",
                prefix: "",
                suffix: "",
              },
              {
                val: publicStats.completionRate || 94,
                label: "Cohort completion rate",
                prefix: "",
                suffix: "%",
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={
                  isStatsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }
                }
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex flex-col gap-1 max-w-[200px] text-center"
              >
                <div className="text-3xl md:text-5xl font-bold text-white font-display mb-1 flex items-center justify-center">
                  {stat.prefix}
                  <AnimatedCounter value={stat.val} start={isStatsInView} />
                  {stat.suffix}
                </div>
                <div className="text-sm text-white/50 leading-snug">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="max-w-6xl mx-auto mt-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
              Be part of something{" "}
              <span className="text-[#F5C518]">from the start.</span>
            </h2>
            <p className="text-white/50 text-lg leading-relaxed mb-10">
              We're building an honest, hands-on learning community for
              professionals across Africa. Join early and help shape the
              experience.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <a
                href="/courses"
                className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-bold px-8 py-3.5 rounded-full hover:bg-[#E8B800] transition-colors text-[15px]"
              >
                View courses &rarr;
              </a>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 border border-white/20 text-white px-7 py-3.5 rounded-full hover:border-white/40 transition-colors text-[15px]"
              >
                Get in touch
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 11. VALUE PILLARS ─── */}
      <section className="bg-[#0A0A0A] py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "🎯",
              title: "Practical from day one",
              desc: "Every lesson is built around real problems, real tools, and real outcomes, not slides and theory.",
            },
            {
              icon: "👥",
              title: "Cohort-based learning",
              desc: "Progress through structured weeks with peers, guided by facilitators who work in the industry.",
            },
            {
              icon: "🌍",
              title: "Built for Africa",
              desc: "Curriculum, case studies, and examples grounded in African markets, challenges, and opportunities.",
            },
          ].map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col gap-4 p-6 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-white/15 transition-colors"
            >
              <div className="text-3xl">{pillar.icon}</div>
              <h3 className="font-display font-bold text-white text-xl">
                {pillar.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                {pillar.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── 11. CTA ─── */}
      <section className="relative bg-[#0A0A0A] py-28 px-6 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-yellow-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 border border-white/15 px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 bg-[#F5C518] rounded-full animate-pulse" />
              <span className="text-xs font-mono text-white/50 tracking-widest uppercase">
                Start today
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl font-extrabold text-white leading-tight mb-5">
              Ready to start your{" "}
              <span className="text-[#F5C518]">journey?</span>
            </h2>
            <p className="text-white/50 text-base max-w-lg mx-auto mb-10 leading-relaxed">
              Whether you're building your first tech skill, advancing your
              career, or preparing your organisation for the future, your
              learning journey starts here.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <a
                href="/courses"
                className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-semibold px-8 py-3.5 rounded-full hover:bg-[#E8B800] transition-colors text-sm"
              >
                Start Learning →
              </a>
              <a
                href="/login"
                className="inline-flex items-center gap-2 border border-white/20 text-white px-7 py-3.5 rounded-full hover:border-white/40 transition-colors text-sm"
              >
                Sign in
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <AcademyFooter />
    </div>
  );
}
