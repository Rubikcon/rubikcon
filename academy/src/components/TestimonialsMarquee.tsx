import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { apiRequest } from "../lib/api";

export type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  photoUrl: string | null;
};

const AUTO_INTERVAL = 5000; // ms between auto-advances



function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}



function Stars() {
  return (
    <div className="flex gap-1 mb-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="w-4 h-4 text-[#F5C518] fill-current"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}



interface SlideProps {
  t: Testimonial;
  active: boolean;
}

function Slide({ t, active }: SlideProps) {
  return (
    <div
      className={`
        relative flex flex-col md:flex-row gap-0 rounded-3xl overflow-hidden
        border transition-all duration-700
        ${
          active
            ? "border-white/15 shadow-[0_0_60px_rgba(245,197,24,0.06)]"
            : "border-white/6 opacity-50 scale-[0.97]"
        }
      `}
      style={{
        background: "linear-gradient(135deg, #161616 0%, #111111 100%)",
      }}
    >
      {/* ── Left: photo panel ────────────────────────────────────────────── */}
      <div className="relative md:w-[42%] shrink-0 min-h-[260px] md:min-h-[380px] overflow-hidden">
        <img
          src={t.photoUrl || "/placeholders/testimonial-fallback.jpg"}
          alt={t.name}
          draggable={false}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Gradient overlay so quote bleeds nicely on mobile */}
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#111111] via-[#111111]/30 to-transparent md:from-transparent md:via-transparent md:to-[#111111]/80" />

        {/* Location pill — omitted or map to role if no location in db */}
      </div>

      {/* ── Right: content panel ─────────────────────────────────────────── */}
      <div className="flex flex-col justify-center p-8 md:p-12 flex-1">
        <Stars />

        {/* Big decorative quote mark */}
        <div
          className="font-display font-extrabold text-[80px] md:text-[100px] leading-none text-[#F5C518]/10 select-none -mt-4 -mb-4"
          aria-hidden="true"
        >
          &ldquo;
        </div>

        <blockquote className="text-white/80 text-lg md:text-xl leading-relaxed font-medium mb-8">
          {t.quote}
        </blockquote>

        <div className="flex items-center gap-4">
          {/* Avatar (mobile only — desktop shows the photo panel) */}
          <img
            src={t.photoUrl || "/placeholders/testimonial-fallback.jpg"}
            alt={t.name}
            draggable={false}
            loading="lazy"
            decoding="async"
            className="md:hidden w-11 h-11 rounded-full object-cover ring-2 ring-[#F5C518]/30 shrink-0"
          />
          <div>
            <p className="font-display font-bold text-white text-base">
              {t.name}
            </p>
            <p className="text-white/40 text-sm">{t.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}



export default function TestimonialsMarquee() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    apiRequest<Testimonial[]>("/academy/testimonials")
      .then((data) => setTestimonials(data))
      .catch((err) => console.error("Failed to load testimonials:", err));
  }, []);

  const COUNT = testimonials.length;


  const drag = useRef({ active: false, startX: 0, deltaX: 0 });


  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent(mod(index, COUNT));
      setTimeout(() => setIsTransitioning(false), 700);
    },
    [isTransitioning, COUNT],
  );

  const prev = useCallback(() => goTo(current - 1), [goTo, current]);
  const next = useCallback(() => goTo(current + 1), [goTo, current]);


  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (COUNT === 0) return; // safety check
    timerRef.current = setInterval(() => {
      setCurrent((c) => mod(c + 1, COUNT));
    }, AUTO_INTERVAL);
  }, [COUNT]);

  useEffect(() => {
    if (!isHovered) startTimer();
    else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, startTimer]);


  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { active: true, startX: e.clientX, deltaX: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    drag.current.deltaX = e.clientX - drag.current.startX;
  };
  const onPointerUp = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const { deltaX } = drag.current;
    if (Math.abs(deltaX) > 60) deltaX < 0 ? next() : prev();
    startTimer();
  };

  // Precompute which indices are visible (current, prev, next for peek)
  const prevIdx = COUNT > 0 ? mod(current - 1, COUNT) : 0;
  const nextIdx = COUNT > 0 ? mod(current + 1, COUNT) : 0;

  if (COUNT === 0) return null;

  return (
    <section
      className="bg-[#0D0D0D] py-20 md:py-28 border-t border-white/5 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Section header ─────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-mono text-white/30 tracking-widest uppercase mb-3">
            Learner stories
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white leading-tight">
            What our learners say
          </h2>
        </div>

        {/* Desktop arrow controls */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              prev();
              startTimer();
            }}
            aria-label="Previous testimonial"
            className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all duration-200 active:scale-95"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => {
              next();
              startTimer();
            }}
            aria-label="Next testimonial"
            className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all duration-200 active:scale-95"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* ── Carousel track ─────────────────────────────────────────────── */}
      {/*
        Strategy: render prev / current / next slides in a 3-column flex.
        translateX(-33.333%) always centres the middle slot.
        On navigate: shift indices → React re-renders → CSS transition fires.
        Edge-fade masks hide the half-visible side cards cleanly.
      */}
      <div className="relative">
        {/* Left / right edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 z-10 pointer-events-none bg-gradient-to-r from-[#0D0D0D] to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 z-10 pointer-events-none bg-gradient-to-l from-[#0D0D0D] to-transparent" />

        {/* Drag capture layer */}
        <div
          className="cursor-grab active:cursor-grabbing"
          style={{ touchAction: "pan-y" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/*
            3-up layout: each slot = 86vw clamped to 900px max.
            The outer div is 300% wide (3 slots). We slide it left by 100%
            (one slot width) so the middle slot is centred.
            Using padding offsets to control peek distance.
          */}
          <div
            className="flex transition-none"
            style={{
              width: "300%",
              transform: "translateX(-33.3333%)",
            }}
          >
            {[prevIdx, current, nextIdx].map((idx, pos) => (
              <div
                key={`${idx}-${pos}`}
                className="px-3 md:px-5"
                style={{ width: "33.3333%" }}
              >
                <Slide t={testimonials[idx]} active={pos === 1} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Dot indicators + mobile arrows ─────────────────────────────── */}
      <div className="flex items-center justify-center gap-4 mt-10 px-6">
        {/* Mobile prev */}
        <button
          onClick={() => {
            prev();
            startTimer();
          }}
          aria-label="Previous testimonial"
          className="sm:hidden w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Dots */}
        <div
          className="flex items-center gap-2"
          role="tablist"
          aria-label="Testimonial slides"
        >
          {testimonials.map((t, i) => (
            <button
              key={t.id || t.name}
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to testimonial by ${t.name}`}
              onClick={() => {
                goTo(i);
                startTimer();
              }}
              className={`rounded-full transition-all duration-400 ${
                i === current
                  ? "bg-[#F5C518] w-6 h-2"
                  : "bg-white/20 hover:bg-white/35 w-2 h-2"
              }`}
            />
          ))}
        </div>

        {/* Mobile next */}
        <button
          onClick={() => {
            next();
            startTimer();
          }}
          aria-label="Next testimonial"
          className="sm:hidden w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ── Progress bar ───────────────────────────────────────────────── */}
      {!isHovered && (
        <div className="max-w-6xl mx-auto px-6 mt-6">
          <div className="h-px bg-white/5 rounded-full overflow-hidden">
            <div
              key={current}
              className="h-full bg-[#F5C518]/40 rounded-full"
              style={{
                animation: `progressBar ${AUTO_INTERVAL}ms linear forwards`,
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
