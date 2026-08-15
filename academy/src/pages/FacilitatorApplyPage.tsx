import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AcademyNavbar from '../components/AcademyNavbar';
import AcademyFooter from '../components/AcademyFooter';
import { apiRequest } from '../lib/api';

const fadeUpParams = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
};

export default function FacilitatorApplyPage() {
  const [facilitators, setFacilitators] = useState<any[]>([]);

  // Ensure we start at top of page on load
  useEffect(() => {
    window.scrollTo(0, 0);
    apiRequest<any[]>("/academy/facilitators?limit=2")
      .then((res: any) => setFacilitators(res.data || []))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-body">
      <AcademyNavbar dark={true} solid={false} />

      {/* Hero Section */}
            {/* Hero Section */}
      <section className="relative flex flex-col justify-center overflow-hidden bg-[#0A0A0A] min-h-[92vh]">
        <div className="absolute -bottom-32 -left-32 w-[700px] h-[700px] rounded-full bg-amber-500/25 blur-[180px] pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-[750px] h-[750px] rounded-full bg-teal-400/20 blur-[180px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-5 sm:px-6 text-center pt-28 pb-16 sm:pb-20 mt-16">
          <motion.div
            {...fadeUpParams}
            className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.14] px-4 py-1.5 rounded-full mb-8 sm:mb-10"
          >
            <span className="w-1.5 h-1.5 bg-[#F5C518] rounded-full" />
            <span className="text-[11px] font-mono text-white/60 tracking-[0.2em] uppercase">
              Facilitator applications open
            </span>
          </motion.div>

          <motion.h1
            {...fadeUpParams}
            className="font-display font-extrabold text-white leading-[1.06] tracking-[-0.025em] mb-6 sm:mb-7"
            style={{ fontSize: "clamp(34px, 5vw, 68px)" }}
          >
            Teach your skills.<br />
            Earn.<br />
            <span className="text-white/40">
              Own your community.
            </span>
          </motion.h1>

          <motion.p
            {...fadeUpParams}
            className="text-white/60 text-base sm:text-[19px] max-w-2xl mx-auto leading-relaxed mb-10 sm:mb-12"
          >
            You already know something people across Africa are trying to learn. Bring it to Rubikcon Nexus Academy, turn it into a course, and get paid every time someone takes it.
          </motion.p>

          <motion.div
            {...fadeUpParams}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5"
          >
            <a 
              href="https://forms.gle/goPqzT4ZCVCCgxT8A" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-bold px-8 py-3.5 rounded-full hover:bg-[#E8B800] transition-colors text-[15px]"
            >
              Start your application
            </a>
            <a 
              href="#path"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border border-white/20 font-bold px-8 py-3.5 rounded-full hover:bg-white/5 transition-colors text-[15px]"
            >
              See the journey
            </a>
          </motion.div>

          {/* Value Props */}
          <motion.div
            {...fadeUpParams}
            className="grid sm:grid-cols-3 gap-6 mt-16 sm:mt-24 text-left border-t border-white/10 pt-10"
          >
            <div>
              <dt className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#F5C518] mb-2">Teach</dt>
              <dd className="font-display font-semibold text-[17px] text-white/90 leading-snug">
                Turn what you do at work into a course, with our team building it beside you.
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#F5C518] mb-2">Earn</dt>
              <dd className="font-display font-semibold text-[17px] text-white/90 leading-snug">
                Get paid per enrolment, in local currency or crypto. No hosting fees taken from you.
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#F5C518] mb-2">Manage</dt>
              <dd className="font-display font-semibold text-[17px] text-white/90 leading-snug">
                Keep your own learner community on the platform and grow it cohort after cohort.
              </dd>
            </div>
          </motion.div>
        </div>
        
        {/* Ticker */}
        <div className="border-t border-white/15 bg-[#F5C518] text-[#0A0A0A] overflow-hidden flex whitespace-nowrap mt-auto">
          <div className="flex gap-11 py-3 font-mono text-xs tracking-[0.16em] uppercase animate-[slide_34s_linear_infinite]">
            <span className="flex gap-11 pl-11">
              Blockchain &nbsp;/&nbsp; Artificial intelligence &nbsp;/&nbsp; Product management &nbsp;/&nbsp; Smart contracts &nbsp;/&nbsp; Data &nbsp;/&nbsp; Tokenomics &nbsp;/&nbsp; Cybersecurity &nbsp;/&nbsp; Design &nbsp;/&nbsp;
            </span>
            <span className="flex gap-11">
              Blockchain &nbsp;/&nbsp; Artificial intelligence &nbsp;/&nbsp; Product management &nbsp;/&nbsp; Smart contracts &nbsp;/&nbsp; Data &nbsp;/&nbsp; Tokenomics &nbsp;/&nbsp; Cybersecurity &nbsp;/&nbsp; Design &nbsp;/&nbsp;
            </span>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section id="why" className="py-24">
        <div className="max-w-[1160px] mx-auto px-6">
          <motion.div {...fadeUpParams} className="max-w-[720px] mb-12">
            <p className="font-mono text-xs tracking-[0.16em] uppercase text-white/60 mb-[18px]">
              What you get
            </p>
            <h2 className="font-display font-extrabold text-[clamp(32px,4.6vw,54px)] leading-[0.98] tracking-[-0.03em] m-0">
              Three reasons practitioners teach with us
            </h2>
            <p className="text-white/60 text-[18px] mt-4">
              We are not looking for full time trainers. We are looking for people doing the work who can explain it well.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 border-t border-white/10">
            <motion.div {...fadeUpParams} transition={{ delay: 0 }} className="p-9 px-7 border-b border-white/10 md:border-r md:border-r-white/10">
              <div className="font-mono text-xs text-[#E8B800] tracking-[0.16em]">01</div>
              <h3 className="font-display font-extrabold text-[26px] leading-[0.98] tracking-[-0.03em] my-3.5">
                Teach your skills
              </h3>
              <p className="text-white/60 text-base m-0">
                You bring the expertise. Our team helps you shape the curriculum, structure the lessons, and record the material. You do not need teaching experience to start.
              </p>
            </motion.div>
            
            <motion.div {...fadeUpParams} transition={{ delay: 0.1 }} className="p-9 px-7 border-b border-white/10 md:border-r md:border-r-white/10">
              <div className="font-mono text-xs text-[#E8B800] tracking-[0.16em]">02</div>
              <h3 className="font-display font-extrabold text-[26px] leading-[0.98] tracking-[-0.03em] my-3.5">
                Earn from it
              </h3>
              <p className="text-white/60 text-base m-0">
                You earn a share of every enrolment on your course, paid in local currency or crypto. Your course keeps selling long after the first cohort ends.
              </p>
            </motion.div>

            <motion.div {...fadeUpParams} transition={{ delay: 0.2 }} className="p-9 px-7 border-b border-white/10">
              <div className="font-mono text-xs text-[#E8B800] tracking-[0.16em]">03</div>
              <h3 className="font-display font-extrabold text-[26px] leading-[0.98] tracking-[-0.03em] my-3.5">
                Manage your community
              </h3>
              <p className="text-white/60 text-base m-0">
                Your learners stay connected to you through your own community space. Run sessions, answer questions, and build an audience that follows your next course.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Facilitators Section */}
      <section id="facilitators" className="bg-[#111111] py-24">
        <div className="max-w-[1160px] mx-auto px-6">
          <motion.div {...fadeUpParams} className="max-w-[720px] mb-12">
            <p className="font-mono text-xs tracking-[0.16em] uppercase text-[#F5C518] mb-[18px]">
              Already teaching
            </p>
            <h2 className="font-display font-extrabold text-[clamp(32px,4.6vw,54px)] leading-[0.98] tracking-[-0.03em] m-0 text-white">
              The people who got here first
            </h2>
            <p className="text-white/60 text-[18px] mt-4">
              Behind every learning experience is a practitioner who has built, led, and delivered real technology solutions. Here is what our current facilitators are running.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {facilitators.length > 0 ? (
              facilitators.map((fac, i) => {
                const facName = fac.name || "Unknown Facilitator";
                const initials = facName.split(' ').map((n: string) => n[0] || '').join('').substring(0, 2).toUpperCase();
                
                // Fallback logic for Joy Egbu's local photo if DB is missing it
                let finalPhotoUrl = fac.photoUrl;
                if (!finalPhotoUrl && facName.toLowerCase().includes("joy egbu")) {
                  finalPhotoUrl = "/icons/joy-egbu.jpeg";
                }

                return (
                  <motion.article key={fac.id} {...fadeUpParams} transition={{ delay: i * 0.1 }} className="rounded-3xl border border-white/10 bg-white/[0.03] hover:border-white/20 transition-colors overflow-hidden flex flex-col">
                    <div className="block w-full">
                      {finalPhotoUrl ? (
                        <img
                          src={finalPhotoUrl}
                          alt={facName}
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
                    </div>
                    <div className="p-7 flex flex-col flex-1">
                      <div className="mb-5">
                        <h3 className="font-display font-extrabold text-[24px] leading-[0.98] tracking-[-0.03em] text-white">{facName}</h3>
                        <div className="text-[14px] font-medium text-[#F5C518] mt-1.5">
                          {fac.title || fac.role}, {fac.organization}
                        </div>
                      </div>
                      <p className="text-[15px] text-white/55 leading-relaxed flex-1">
                        {fac.bio}
                      </p>
                      {fac.courses && fac.courses.length > 0 && (
                        <>
                          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-white/40 mt-6 mb-2.5">
                            Teaching
                          </div>
                          {fac.courses.map((courseRel: any) => (
                            <a key={courseRel.course.id} href={`/course/${courseRel.course.slug}`} className="block font-medium text-[14px] py-2 border-t border-white/10 text-white/70 hover:text-[#F5C518] transition-colors after:content-['_\\2197'] after:text-[#F5C518]">
                              {courseRel.course.title}
                            </a>
                          ))}
                        </>
                      )}
                      {fac.linkedinUrl && (
                        <div className="mt-5 pt-4 border-t border-white/10">
                          <a href={fac.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-block font-mono text-[11px] tracking-[0.14em] uppercase text-white/70 hover:text-[#F5C518] transition-colors">
                            LinkedIn ↗
                          </a>
                        </div>
                      )}
                    </div>
                  </motion.article>
                );
              })
            ) : (
              // Fallback skeleton or static while loading
              <>
                <motion.article {...fadeUpParams} transition={{ delay: 0 }} className="rounded-3xl border border-white/10 bg-white/[0.03] hover:border-white/20 transition-colors overflow-hidden flex flex-col">
                  <div className="block w-full">
                    <img
                      src="/icons/joy-egbu.jpeg"
                      alt="Joy Egbu"
                      loading="lazy"
                      decoding="async"
                      className="w-full aspect-[16/11] object-cover object-[center_20%]"
                    />
                  </div>
                  <div className="p-7 flex flex-col flex-1">
                    <div className="mb-5">
                      <h3 className="font-display font-extrabold text-[24px] leading-[0.98] tracking-[-0.03em] text-white">Joy Egbu</h3>
                      <div className="text-[14px] font-medium text-[#F5C518] mt-1.5">
                        Project Manager and Operations Lead, Rubikcon Nexus
                      </div>
                    </div>
                    <p className="text-[15px] text-white/55 leading-relaxed flex-1">
                      Joy leads the Blockchain for Social Impact programme, driving end to end planning, stakeholder coordination, and programme delivery. She manages timelines and keeps cohorts moving from first session to capstone.
                    </p>
                    <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-white/40 mt-6 mb-2.5">
                      Teaching
                    </div>
                    <a href="/course/blockchain-technology-for-social-impact-businesses" className="block font-medium text-[14px] py-2 border-t border-white/10 text-white/70 hover:text-[#F5C518] transition-colors after:content-['_\\2197'] after:text-[#F5C518]">
                      Blockchain Technology for Social Impact Businesses
                    </a>
                    <a href="/course/blockchain-fundamentals-for-everyday-people" className="block font-medium text-[14px] py-2 border-t border-white/10 text-white/70 hover:text-[#F5C518] transition-colors after:content-['_\\2197'] after:text-[#F5C518]">
                      Blockchain Essentials: Understanding Blockchain in Everyday Life
                    </a>
                    <div className="mt-5 pt-4 border-t border-white/10">
                      <a href="https://www.linkedin.com/in/joy-egbu/" target="_blank" rel="noopener noreferrer" className="inline-block font-mono text-[11px] tracking-[0.14em] uppercase text-white/70 hover:text-[#F5C518] transition-colors">
                        LinkedIn ↗
                      </a>
                    </div>
                  </div>
                </motion.article>

                <motion.article {...fadeUpParams} transition={{ delay: 0.1 }} className="rounded-3xl border border-white/10 bg-white/[0.03] hover:border-white/20 transition-colors overflow-hidden flex flex-col">
                  <div className="block w-full">
                    <div className="w-full aspect-[16/11] bg-gradient-to-br from-[#3D2F00] to-[#141414] flex items-center justify-center">
                      <div className="w-28 h-28 rounded-full border-2 border-[#F5C518]/40 bg-[#F5C518]/10 flex items-center justify-center">
                        <span className="font-display font-extrabold text-[#F5C518] text-4xl">
                          OO
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-7 flex flex-col flex-1">
                    <div className="mb-5">
                      <h3 className="font-display font-extrabold text-[24px] leading-[0.98] tracking-[-0.03em] text-white">Ozioma Onukogu</h3>
                      <div className="text-[14px] font-medium text-[#F5C518] mt-1.5">
                        Programme Lead and Ecosystem Builder, Rubikcon Nexus
                      </div>
                    </div>
                    <p className="text-[15px] text-white/55 leading-relaxed flex-1">
                      Ozioma is a blockchain founder and product manager. She supports facilitation, cohort delivery, and capstone framing, with a focus on ecosystem strategy and participant growth.
                    </p>
                    <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-white/40 mt-6 mb-2.5">
                      Teaching
                    </div>
                    <a href="/course/blockchain-technology-for-social-impact-businesses" className="block font-medium text-[14px] py-2 border-t border-white/10 text-white/70 hover:text-[#F5C518] transition-colors after:content-['_\\2197'] after:text-[#F5C518]">
                      Blockchain Technology for Social Impact Businesses
                    </a>
                    <a href="/course/tokenomics-101" className="block font-medium text-[14px] py-2 border-t border-white/10 text-white/70 hover:text-[#F5C518] transition-colors after:content-['_\\2197'] after:text-[#F5C518]">
                      Introduction to Token Economics
                    </a>
                    <div className="mt-5 pt-4 border-t border-white/10">
                      <a href="https://www.linkedin.com/in/oziomaonukogu/" target="_blank" rel="noopener noreferrer" className="inline-block font-mono text-[11px] tracking-[0.14em] uppercase text-white/70 hover:text-[#F5C518] transition-colors">
                        LinkedIn ↗
                      </a>
                    </div>
                  </div>
                </motion.article>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Path Section - HORIZONTAL SCROLL ON MOBILE, WRAPPING GRID ON DESKTOP */}
      <section id="path" className="bg-[#0A0A0A] text-white py-24 overflow-hidden">
        <div className="max-w-[1160px] mx-auto px-6">
          <motion.div {...fadeUpParams} className="max-w-[720px] mb-16">
            <p className="font-mono text-xs tracking-[0.16em] uppercase text-[#F5C518] mb-[18px]">
              Interest form to live course
            </p>
            <h2 className="font-display font-extrabold text-[clamp(32px,4.6vw,54px)] leading-[0.98] tracking-[-0.03em] m-0">
              From application to your first cohort
            </h2>
            <p className="text-white/60 text-[18px] mt-4">
              Every facilitator goes through the same path. You are never doing any of it alone.
            </p>
          </motion.div>

          <div className="flex overflow-x-auto snap-x snap-mandatory pb-8 md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 hide-scrollbar md:pb-0 md:overflow-visible">
            {[
              { title: "Submit the interest form", desc: "Ten minutes. Tell us who you are, what you want to teach, and who you want to teach it to." },
              { title: "Discovery call", desc: "A 30 minute call to understand your expertise, your availability, and the learners you want to reach." },
              { title: "Agree on scope", desc: "We confirm your course scope, delivery format, teaching schedule, and how you get paid." },
              { title: "Virtual training", desc: "A live session on the Rubikcon teaching method and how to structure a lesson that holds attention." },
              { title: "Build curriculum", desc: "Draft your modules and assessments. Our team works with you through it." },
              { title: "Quality review", desc: "We review your curriculum against the Rubikcon standard for clarity, practical value, and learner outcomes." },
              { title: "Upload & go live", desc: "Your course goes onto the platform with your facilitator profile, and we open enrolment." },
              { title: "Build community", desc: "We help you set up your learner community, bring your first cohort in, and support you as it grows." },
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="relative pt-4 border-t border-white/20 shrink-0 w-[280px] snap-start md:w-auto"
              >
                <div className="absolute top-[-5px] left-0 w-2.5 h-2.5 bg-[#F5C518]" />
                <div className="font-mono text-[12px] tracking-[0.1em] text-[#F5C518] mb-3">STEP {i + 1}</div>
                <h3 className="font-display font-extrabold text-[22px] leading-[1.1] mb-2">{step.title}</h3>
                <p className="text-white/60 text-[15px]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Apply Section */}
      <section id="apply" className="py-24">
        <div className="max-w-[1160px] mx-auto px-6">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-16 items-start">
            <motion.div {...fadeUpParams}>
              <p className="font-mono text-xs tracking-[0.16em] uppercase text-white/60 mb-[18px]">
                Before you start
              </p>
              <h2 className="font-display font-extrabold text-[clamp(30px,4.2vw,46px)] leading-[0.98] tracking-[-0.03em] m-0">
                What the interest form asks
              </h2>
              <p className="text-white/60 mt-[18px] mb-[30px] text-[17px]">
                Have these ready and the form takes about ten minutes.
              </p>
              
              {/* Masonry-style Grid for Checklist */}
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 border-t border-white/10 pt-4">
                {[
                  "Full name, email address, and WhatsApp number",
                  "Country and city",
                  "LinkedIn profile or portfolio link",
                  "Current role and organisation",
                  "Years of experience in your field",
                  "Area of expertise (e.g. AI, product, data, design)",
                  "Proposed course title and a one line description",
                  "Who the course is for and what they'll achieve",
                  "Any teaching, training, or speaking experience",
                  "Preferred format: live cohort, self paced, or both",
                  "Hours you can commit each week",
                  "Languages you can teach in",
                  "Existing community or audience size"
                ].map((item, i) => (
                  <div key={i} className="py-2 pl-6 relative text-[15px] text-white/90">
                    <div className="absolute left-0 top-4 w-3 h-[2px] bg-[#E8B800]" />
                    {item}
                  </div>
                ))}
                <div className="py-2 pl-6 relative text-[15px] text-white/90">
                  <div className="absolute left-0 top-4 w-3 h-[2px] bg-[#E8B800]" />
                  A two minute intro video link <span className="text-white/60 text-[13px] block mt-0.5">(optional but it helps)</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              {...fadeUpParams} 
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-[#0A0A0A] text-white p-9 sticky top-32"
            >
              <h3 className="font-display font-extrabold text-[28px] leading-[1.1] mb-2.5">
                Apply to teach
              </h3>
              <p className="text-white/65 text-[15px] mb-8">
                Start here. We review every application and reply within three days. Our application process is hosted on Google Forms.
              </p>

              <a 
                href="https://forms.gle/goPqzT4ZCVCCgxT8A" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-center py-4 px-6 bg-[#F5C518] text-[#0A0A0A] font-bold text-lg hover:bg-[#E8B800] transition-colors rounded-full"
              >
                Open Application Form
              </a>
              <p className="text-[13px] text-white/50 mt-3.5 text-center">
                We reply within three days. If it is a fit, we book your discovery call straight away.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Guest/Partner Section */}
      <section className="pb-24 pt-0">
        <div className="max-w-[1160px] mx-auto px-6 space-y-5">
          <motion.div {...fadeUpParams} className="bg-white/[0.03] border border-white/10 p-9 rounded-3xl">
            <h3 className="font-display font-extrabold text-[26px] leading-[1.1] mb-3">Guest facilitators</h3>
            <p className="text-white/60 text-[16px] m-0">
              Each cohort may include guest facilitators: industry experts, founders, researchers, and technology leaders who bring specialised knowledge to selected sessions. If you would rather start with a single guest session than a full course, say so in the form.
            </p>
          </motion.div>
          <motion.div {...fadeUpParams} transition={{ delay: 0.1 }} className="bg-white/[0.03] border border-white/10 p-9 rounded-3xl">
            <h3 className="font-display font-extrabold text-[26px] leading-[1.1] mb-3">Partner with our facilitators</h3>
            <p className="text-white/60 text-[16px] m-0">
              Bringing Rubikcon Nexus Academy to your organisation? We collaborate on corporate training, funded learning programmes, university partnerships, workshops, speaking engagements, and technology capacity building across Africa. <a href="/contact" className="font-bold border-b-2 border-[#F5C518] text-white hover:text-[#F5C518] transition-colors">Contact us</a>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-[#F5C518] text-[#0A0A0A] text-center py-24">
        <motion.div {...fadeUpParams} className="max-w-[1160px] mx-auto px-6">
          <h2 className="font-display font-extrabold text-[clamp(32px,5.4vw,64px)] leading-[0.98] tracking-[-0.03em] max-w-[840px] mx-auto m-0">
            You have spent years learning this. Get paid to pass it on.
          </h2>
          <p className="max-w-[520px] mx-auto mt-5 mb-8 text-[18px]">
            Applications are reviewed weekly. The next facilitator cohort starts as soon as you do.
          </p>
          <a 
            href="https://forms.gle/goPqzT4ZCVCCgxT8A" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-[#0A0A0A] text-[#F5C518] py-4 px-7 font-bold border-2 border-[#0A0A0A] hover:bg-black transition-colors rounded-full text-base"
          >
            Apply to teach
          </a>
        </motion.div>
      </section>

      <AcademyFooter />

      <style>{`
        @keyframes slide {
          to { transform: translateX(-50%); }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
