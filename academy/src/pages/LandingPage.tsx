import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Award, BookOpen, CheckCircle, Clock, Play } from "lucide-react";
import { CURRICULUM_TOPICS } from "../data/courseData";
import AcademyNavbar from "../components/AcademyNavbar";
import AcademyFooter from "../components/AcademyFooter";
import VideoEmbed from "../components/VideoEmbed";
import TestimonialsMarquee from "../components/TestimonialsMarquee";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { apiRequest } from "../lib/api";

// Set this to the real course-preview video URL (YouTube / Vimeo / Loom / Drive)
// when supplied - the placeholder frame renders until then.
const COURSE_PREVIEW_VIDEO_URL = "https://youtu.be/zfpYDYKAckw";

// Audience photos: drop real images at /public/images/audience/<slug>.jpg and
// they replace the generated SVG placeholders automatically (same for learner
// photos at /public/images/learners/<slug>.jpg).

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

/** Prefers a real photo (.jpg) and falls back to the bundled SVG placeholder. */
function SwappableImage({
  base,
  alt,
  className,
}: {
  base: string;
  alt: string;
  className?: string;
}) {
  const [src, setSrc] = useState(`${base}.jpg`);
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (!src.endsWith(".svg")) setSrc(`${base}.svg`);
      }}
      className={className}
    />
  );
}

const FEATURED_PROFESSIONS = [
  {
    id: "students",
    label: "Student",
    emoji: "🎓",
    blurb:
      "Build practical, in-demand tech skills alongside your studies and graduate with a portfolio - not just a certificate. Beginner-friendly, no prior experience needed.",
  },
  {
    id: "professionals",
    label: "Professional",
    emoji: "💼",
    blurb:
      "Add emerging-technology skills to your existing expertise. Learn how blockchain, AI, and digital tools apply directly to your industry and role.",
  },
  {
    id: "entrepreneurs",
    label: "Entrepreneur",
    emoji: "🚀",
    blurb:
      "Understand the technologies that will power your next venture - so you can validate ideas, lead technical decisions, and build with confidence.",
  },
  {
    id: "blockchain-enthusiasts",
    label: "Blockchain Enthusiast",
    emoji: "⛓️",
    blurb:
      "Go beyond the hype. Get a structured, practical understanding of how blockchain actually works and where it creates real value.",
  },
  {
    id: "blockchain-professionals",
    label: "Blockchain Professional",
    emoji: "🧠",
    blurb:
      "Deepen your expertise with real-world product development, social-impact use cases, and the strategic side of building in Web3 and beyond.",
  },
  {
    id: "career-changers",
    label: "Career Changer",
    emoji: "🧭",
    blurb:
      "A structured path from complete beginner to job-ready. Learn step by step, build real projects, and transition into tech at your own pace.",
  },
] as const;

const LEARNING_PATHS = [
  { id: "pd", label: "Product Development", abbr: "PD", href: "/courses" },
  { id: "bc", label: "Blockchain Fundamentals", abbr: "BC", href: "/courses" },
  { id: "eth", label: "Ethereum Development", abbr: "ETH", href: "/courses" },
  { id: "ai", label: "Artificial Intelligence", abbr: "AI", href: "/courses" },
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

const HOME_FACILITATORS = [
  {
    name: "Ozioma Onukogu",
    role: "Co-Founder, Rubikcon Nexus Academy",
    bio: "Blockchain strategist and ecosystem builder helping organisations adopt emerging technologies for sustainable impact. Ozioma leads programme design and brings years of hands-on experience across Web3 ecosystems.",
    expertise: [
      "Blockchain Education",
      "Product Strategy",
      "Web3 Ecosystems",
      "Social Innovation",
    ],
    photoUrl: null as string | null,
  },
  {
    name: "Joy Egbu",
    role: "Co-Founder, Rubikcon Nexus Academy",
    bio: "Project and operations leader focused on delivering practical learning experiences that prepare professionals for today’s technology landscape. Joy ensures every cohort runs smoothly from first lesson to final project.",
    expertise: [
      "Product Management",
      "Operations",
      "AI",
      "Technology Education",
    ],
    photoUrl: "/icons/joy-egbu.jpeg" as string | null,
  },
];

const AUDIENCE_ITEMS = [
  {
    slug: "students",
    label: "Students",
    desc: "Build tech skills that make you employable from day one - while you study.",
  },
  {
    slug: "professionals",
    label: "Professionals",
    desc: "Leverage your existing expertise and add in-demand digital skills.",
  },
  {
    slug: "entrepreneurs",
    label: "Entrepreneurs",
    desc: "Understand the technologies that will power your next venture.",
  },
  {
    slug: "blockchain-enthusiasts",
    label: "Blockchain Enthusiasts",
    desc: "Turn curiosity into real, structured understanding of how blockchain works.",
  },
  {
    slug: "blockchain-experts",
    label: "Blockchain Professionals & Experts",
    desc: "Go deeper - product development, real-world use cases, and ecosystem strategy.",
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
          className="absolute inset-0 h-full w-full object-cover object-[center_25%]"
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
    </div>
  );
}

export default function LandingPage() {
  const [dynamicCourses, setDynamicCourses] = useState<PublicCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [facilitators, setFacilitators] = useState<Facilitator[]>([]);
  const [publicStats, setPublicStats] = useState<any>(null);
  const [selectedProfession, setSelectedProfession] =
    useState<(typeof FEATURED_PROFESSIONS)[number]["id"]>("students");

  const statsRef = useRef<HTMLElement>(null);
  const isStatsInView = useInView(statsRef, { once: true, margin: "-100px" });

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

      <section className="relative flex flex-col justify-center overflow-hidden bg-[#0A0A0A] min-h-[92vh]">
        <div className="absolute -bottom-32 -left-32 w-[700px] h-[700px] rounded-full bg-amber-500/25 blur-[180px] pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-[750px] h-[750px] rounded-full bg-teal-400/20 blur-[180px] pointer-events-none" />

        {/* Removed decorative orbit ring */}

        <div className="relative max-w-5xl mx-auto px-5 sm:px-6 text-center pt-28 pb-16 sm:pb-20">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.14] px-4 py-1.5 rounded-full mb-8 sm:mb-10"
          >
            <span className="w-1.5 h-1.5 bg-[#F5C518] rounded-full" />
            <span className="text-[11px] font-mono text-white/60 tracking-[0.2em] uppercase">
              Rubikcon Nexus
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="font-display font-extrabold text-white leading-[1.06] tracking-[-0.025em] mb-6 sm:mb-7"
            style={{ fontSize: "clamp(34px, 5vw, 68px)" }}
          >
            Build{" "}
            <span className="inline-block bg-[#F5C518] text-[#0A0A0A] px-4 sm:px-5 py-1 rounded-full align-middle leading-snug">
              In-Demand
            </span>{" "}
            Tech Skills. Create Real-World Impact.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-white/50 text-[15px] sm:text-[17px] max-w-[620px] mx-auto mb-9 sm:mb-11 leading-relaxed"
          >
            Rubikcon Nexus Academy equips individuals, startups, businesses, and
            organisations across Africa with practical, industry-focused
            training in Artificial Intelligence, Blockchain, Product Management,
            Software Development, and other emerging technologies - helping
            learners build careers, solve meaningful problems, and drive
            innovation.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex items-center justify-center gap-3 sm:gap-4 mb-14 sm:mb-20 flex-wrap"
          >
            <a
              href="/login?mode=signup"
              className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-bold px-8 py-3.5 rounded-full hover:bg-[#E8B800] transition-colors text-[15px]"
            >
              Start Learning →
            </a>
            <a
              href="/courses"
              className="inline-flex items-center gap-2 bg-white/[0.07] border border-white/[0.15] text-white px-7 py-3.5 rounded-full hover:bg-white/[0.12] transition-colors text-[15px]"
            >
              <Play aria-hidden="true" size={12} className="fill-white" />{" "}
              Preview a course
            </a>
          </motion.div>

          {/* Circular Learning Paths */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3.5}
            className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-14 sm:mb-20 max-w-3xl mx-auto"
          >
            {LEARNING_PATHS.map((path, i) => (
              <a
                key={path.id}
                href={path.href}
                className="group flex flex-col items-center gap-3 w-[100px] sm:w-[120px]"
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:bg-[#1C1C1C] group-hover:border-[#F5C518]/30 group-hover:shadow-[0_0_25px_rgba(245,197,24,0.15)] transition-all duration-300 group-hover:-translate-y-1">
                  
                  {/* Rotating Clock Orbit */}
                  <div 
                    className="absolute inset-[-4px] rounded-full border border-transparent border-t-white/10 group-hover:border-t-[#F5C518]/60 motion-safe:animate-[spin_15s_linear_infinite] transition-colors duration-300 pointer-events-none"
                    style={{ animationDelay: `${i * -3.75}s` }}
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-[#F5C518] transition-colors duration-300 shadow-[0_0_8px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_12px_rgba(245,197,24,0.6)]" />
                  </div>

                  <span className="font-display font-extrabold text-white/70 group-hover:text-[#F5C518] text-xl sm:text-2xl transition-colors relative z-10">
                    {path.abbr}
                  </span>
                </div>
                <span className="text-white/60 text-[11px] sm:text-xs font-medium text-center leading-tight group-hover:text-white/90 transition-colors">
                  {path.label}
                </span>
              </a>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-[#0A0A0A] py-16 sm:py-24 px-5 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="w-full lg:w-1/2 shrink-0"
            >
              {COURSE_PREVIEW_VIDEO_URL ? (
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
                  <VideoEmbed
                    url={COURSE_PREVIEW_VIDEO_URL}
                    title="Rubikcon Nexus Academy - course preview"
                  />
                </div>
              ) : (
                <a
                  href="/course/blockchain-social-impact/week/week-1-blockchain-fundamentals-history"
                  className="group block relative aspect-video rounded-2xl overflow-hidden bg-[#141414] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#3D2F00]/60 to-[#0A0A0A]" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#F5C518] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play
                        aria-hidden="true"
                        size={22}
                        className="fill-[#0A0A0A] text-[#0A0A0A] ml-1"
                      />
                    </div>
                    <p className="text-white/40 text-xs font-mono tracking-widest uppercase">
                      Watch the course preview
                    </p>
                  </div>
                </a>
              )}
            </motion.div>

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
              <h2 className="font-display font-extrabold text-white text-3xl sm:text-4xl md:text-5xl leading-tight mb-5">
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
                <Play aria-hidden="true" size={13} className="fill-[#0A0A0A]" />{" "}
                Preview Course
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <section
        id="courses"
        className="bg-[#F2EDE2] py-16 sm:py-24 px-5 sm:px-6"
      >
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

          {dynamicCourses.length > 0 ? (
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
                  <motion.a
                    key={course.id}
                    href={`/course/${course.slug}`}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-white rounded-2xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col"
                  >
                    <CourseThumbnail course={course} index={i} />
                    <div className="mb-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${levelClass}`}
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
                        <BookOpen aria-hidden="true" size={11} />
                        {course.weekCount} week
                        {course.weekCount !== 1 ? "s" : ""}
                      </span>
                      {course.estimatedDuration && (
                        <span className="flex items-center gap-1">
                          <Clock aria-hidden="true" size={11} />
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
                          <span className="text-xs font-semibold text-[#1C1C1C]/70 truncate max-w-[110px]">
                            {primaryFacilitator.name}
                          </span>
                        </div>
                      ) : (
                        <div />
                      )}
                      <span className="text-xs font-semibold text-[#1C1C1C] underline underline-offset-2 hover:text-[#C49A00]">
                        View course →
                      </span>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          ) : (
            /* Empty state - API returned no courses yet */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white p-6 flex flex-col items-center justify-center min-h-[280px] border-2 border-dashed border-[#E8E0D0]"
                  style={{
                    borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-[#F2EDE2] flex items-center justify-center mb-3">
                    <BookOpen
                      aria-hidden="true"
                      size={18}
                      className="text-[#1C1C1C]/30"
                    />
                  </div>
                  <p className="text-[#1C1C1C]/35 text-xs font-mono tracking-widest uppercase">
                    Coming soon
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-[#1C1C1C] px-6 sm:px-7 py-5">
            <div>
              <p className="text-white font-display font-extrabold text-lg">
                {dynamicCourses.length > 0
                  ? `${dynamicCourses.length} course${dynamicCourses.length !== 1 ? "s" : ""} available now`
                  : "Courses launching soon"}
              </p>
              <p className="text-white/40 text-sm">
                Browse the full catalog, filter by level and topic, and sign up
                in minutes.
              </p>
            </div>
            <a
              href="/courses"
              className="shrink-0 inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-bold px-6 py-3 rounded-full hover:bg-[#E8B800] transition-colors text-sm whitespace-nowrap"
            >
              <BookOpen aria-hidden="true" size={14} /> Browse all courses →
            </a>
          </div>
        </div>
      </section>

      <section className="bg-[#F2EDE2] py-16 sm:py-24 px-5 sm:px-6 border-t border-black/5">
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

      <section className="bg-[#F2EDE2] py-16 sm:py-24 px-5 sm:px-6 border-t border-black/5">
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {AUDIENCE_ITEMS.map((item, i) => (
              <motion.div
                key={item.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col"
              >
                <SwappableImage
                  base={`/images/audience/${item.slug}`}
                  alt={item.label}
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="p-5 sm:p-6 flex flex-col gap-2 flex-1">
                  <h3 className="font-display font-extrabold text-[#1C1C1C] text-lg leading-snug">
                    {item.label}
                  </h3>
                  <p className="text-[#1C1C1C]/55 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}

            <motion.a
              href="#featured"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: AUDIENCE_ITEMS.length * 0.07 }}
              className="rounded-2xl bg-[#1C1C1C] p-6 sm:p-7 flex flex-col justify-center gap-3 hover:bg-[#0A0A0A] transition-colors"
            >
              <span className="text-3xl">🤔</span>
              <h3 className="font-display font-extrabold text-white text-lg leading-snug">
                Not sure where you fit?
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Pick what best describes you and we'll recommend a starting
                point.
              </p>
              <span className="text-[#F5C518] text-sm font-semibold">
                Find my course →
              </span>
            </motion.a>
          </div>
        </div>
      </section>

      <section
        id="featured"
        className="bg-[#0A0A0A] py-16 sm:py-24 px-5 sm:px-6 scroll-mt-16"
      >
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-mono text-white/30 tracking-widest uppercase mb-3">
            Featured programme
          </p>
          <h2 className="font-display font-extrabold text-white text-3xl sm:text-4xl leading-tight mb-3">
            Pick what best describes you
          </h2>
          <p className="text-white/45 text-sm mb-7 max-w-xl">
            Not sure which course fits? Choose your profile and we'll show you
            why this programme is the right starting point.
          </p>

          <div
            className="flex flex-wrap gap-2.5 mb-8"
            role="tablist"
            aria-label="Target audience selector"
          >
            {FEATURED_PROFESSIONS.map((p) => (
              <button
                key={p.id}
                role="tab"
                aria-selected={selectedProfession === p.id}
                aria-controls="persona-content"
                id={`tab-${p.id}`}
                onClick={() => setSelectedProfession(p.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
                  selectedProfession === p.id
                    ? "bg-[#F5C518] border-[#F5C518] text-[#0A0A0A] font-semibold shadow-[0_0_24px_rgba(245,197,24,0.25)]"
                    : "border-white/15 text-white/55 hover:border-white/30 hover:text-white/80"
                }`}
              >
                <span aria-hidden="true">{p.emoji}</span> {p.label}
              </button>
            ))}
          </div>

          <motion.div
            id="persona-content"
            role="tabpanel"
            aria-labelledby={`tab-${selectedProfession}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 md:p-12 flex flex-col md:flex-row gap-10 items-start"
          >
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-[#F5C518]/10 border border-[#F5C518]/30 px-3 py-1 rounded-full mb-6">
                <span className="w-1.5 h-1.5 bg-[#F5C518] rounded-full" />
                <span className="text-[#F5C518] text-xs font-mono tracking-widest uppercase">
                  Blockchain for Social Impact
                </span>
              </div>
              <h3 className="font-display font-extrabold text-white text-2xl sm:text-3xl md:text-4xl leading-tight mb-5">
                Harness blockchain to build transparent, accountable, and
                future-ready organisations.
              </h3>
              <p className="text-white/50 text-base leading-relaxed mb-4">
                Learn how blockchain can improve transparency, accountability,
                fundraising, digital identity, and operational efficiency for
                businesses and organisations creating social impact.
              </p>
              <div className="rounded-2xl border border-[#F5C518]/20 bg-[#F5C518]/[0.06] px-5 py-4 mb-8">
                <p className="text-[11px] font-mono uppercase tracking-widest text-[#F5C518] mb-1.5">
                  Recommended for: {activeProfession.label}s
                </p>
                <p className="text-white/60 text-sm leading-relaxed">
                  {activeProfession.blurb}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="inline-flex items-center gap-1.5 bg-white/[0.07] border border-white/10 text-white/70 text-sm px-4 py-2 rounded-full">
                  <CheckCircle
                    aria-hidden="true"
                    size={13}
                    className="text-[#F5C518]"
                  />{" "}
                  15 Weeks
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/[0.07] border border-white/10 text-white/70 text-sm px-4 py-2 rounded-full">
                  <CheckCircle
                    aria-hidden="true"
                    size={13}
                    className="text-[#F5C518]"
                  />{" "}
                  3 Comprehensive Modules
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/[0.07] border border-white/10 text-white/70 text-sm px-4 py-2 rounded-full">
                  <Award
                    aria-hidden="true"
                    size={13}
                    className="text-[#F5C518]"
                  />{" "}
                  Certificate of Completion
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="/login?mode=signup&redirect=/course/blockchain-social-impact"
                  className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-bold px-7 py-3.5 rounded-full hover:bg-[#E8B800] transition-colors text-[15px]"
                >
                  Sign Up →
                </a>
                <a
                  href="/course/blockchain-social-impact"
                  className="inline-flex items-center gap-2 border border-white/20 text-white px-6 py-3.5 rounded-full hover:border-white/40 transition-colors text-sm"
                >
                  View programme
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="instructors"
        className="bg-[#0A0A0A] py-16 sm:py-24 px-5 sm:px-6 border-t border-white/5"
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-mono text-white/30 tracking-widest uppercase mb-3">
              Your guides
            </p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Meet Your Facilitators
              </h2>
              <p className="text-white/40 text-sm max-w-sm leading-relaxed md:text-right">
                Learn from experienced technology leaders passionate about
                building Africa's next generation of innovators.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {HOME_FACILITATORS.map((facilitator, i) => {
              const initials = facilitator.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <motion.div
                  key={facilitator.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden hover:border-white/20 transition-colors flex flex-col"
                >
                  <a href="/facilitators" className="block w-full">
                    {facilitator.photoUrl ? (
                      <img
                        src={facilitator.photoUrl}
                        alt={facilitator.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full aspect-[16/11] object-cover object-[center_20%]"
                      />
                    ) : (
                      <div className="w-full aspect-[16/11] bg-gradient-to-br from-[#3D2F00] to-[#141414] flex items-center justify-center">
                        <div className="w-28 h-28 rounded-full border-2 border-[#F5C518]/40 bg-[#F5C518]/10 flex items-center justify-center">
                          <span className="font-display font-extrabold text-[#F5C518] text-4xl">
                            {initials}
                          </span>
                        </div>
                      </div>
                    )}
                  </a>
                  <div className="p-6 sm:p-8 flex flex-col gap-4 flex-1">
                    <div>
                      <a
                        href="/facilitators"
                        className="hover:text-[#F5C518] transition-colors"
                      >
                        <h3 className="font-display font-extrabold text-white text-2xl mb-1">
                          {facilitator.name}
                        </h3>
                      </a>
                      <p className="text-[#F5C518] text-sm font-semibold">
                        {facilitator.role}
                      </p>
                    </div>
                    <p className="text-white/55 text-[15px] leading-relaxed flex-1">
                      {facilitator.bio}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {facilitator.expertise.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium text-white/60 border border-white/12 bg-white/[0.04] px-3 py-1.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
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

      <section className="bg-[#F2EDE2] py-16 sm:py-24 px-5 sm:px-6">
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

      <TestimonialsMarquee />

      <section
        ref={statsRef}
        className="bg-[#0A0A0A] py-24 px-6 border-t border-white/5"
      >
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

      <AcademyFooter />
    </div>
  );
}
