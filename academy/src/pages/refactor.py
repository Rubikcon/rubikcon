import re

file_path = 'CoursePage.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add Lock to imports
if 'Lock' not in content:
    content = content.replace("Users } from 'lucide-react'", "Users, Lock } from 'lucide-react'")

# Find the start of the enrolled view
marker = "//  Enrolled: show full course with progress sidebar "
start_idx = content.find(marker)
if start_idx == -1:
    print("Error: Could not find marker")
    exit(1)

new_enrolled_view = """//  Enrolled: show full course with progress sidebar 
  const isFacilitatorPreview = course.viewerMode === 'facilitator-preview'

  // Determine which module to expand by default
  const defaultExpandedModuleId = useMemo(() => {
    if (!course) return null
    if (continueWeek && continueWeek.moduleId) return continueWeek.moduleId
    return course.modules[0]?.id || null
  }, [course, continueWeek])

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: prev[moduleId] !== undefined ? !prev[moduleId] : moduleId !== defaultExpandedModuleId
    }))
  }

  const isModuleExpanded = (moduleId: string) => {
    if (expandedModules[moduleId] !== undefined) return expandedModules[moduleId]
    return moduleId === defaultExpandedModuleId
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      <AcademyNavbar solid />
      
      {/* 1. Header Banner */}
      <header className="pt-28 pb-10 px-4 md:px-6 border-b border-white/10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#F5C518]/10 via-[#0A0A0A] to-[#0A0A0A]">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <p className="text-xs font-mono uppercase tracking-widest text-[#F5C518] mb-3">
              {course.level || 'Programme'}{course.estimatedDuration ? ` • ${course.estimatedDuration}` : ''}
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
              {course.title}
            </h1>
            
            {/* Contextual Description */}
            {course.description && (
              <p className="text-white/60 text-sm md:text-base max-w-2xl leading-relaxed line-clamp-2 mb-6">
                {course.description}
              </p>
            )}

            <div className="flex items-center gap-4 max-w-md">
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#F5C518] to-[#E8B800] rounded-full"
                  style={{ width: `${course.progressPercent}%` }}
                />
              </div>
              <span className="text-sm font-bold text-white shrink-0">{course.progressPercent}%</span>
            </div>
            <p className="text-xs text-white/40 mt-2">
              {course.completedCount} of {course.totalWeeks} {unit.toLowerCase()}{course.totalWeeks !== 1 ? 's' : ''} complete
            </p>
          </div>
          
          <div className="shrink-0 flex flex-col items-start md:items-end">
            {continueWeek && (
              <a
                href={`/course/${course.slug}/week/${continueWeek.slug}`}
                className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-bold px-8 py-3.5 rounded-full hover:bg-[#E8B800] transition-colors whitespace-nowrap mb-2"
              >
                {course.progressPercent === 100 
                  ? 'Review Course' 
                  : course.progressPercent > 0 
                    ? 'Continue Learning' 
                    : 'Start Learning'}
                <ArrowRight size={16} />
              </a>
            )}
            {continueWeek && course.progressPercent < 100 && (
              <p className="text-xs text-white/50 pl-2 md:pl-0 mt-2 md:mt-3">
                Up next: <span className="text-white/80 font-medium">{learnerUnit} {continueWeek.number}</span>
              </p>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Content Grid */}
      <main className="flex-1 px-4 md:px-6 py-10 md:py-12">
        <div className="max-w-[1100px] mx-auto grid lg:grid-cols-[1fr_320px] gap-10 items-start">
          
          {/* Left Column: Curriculum */}
          <section className="min-w-0 order-2 lg:order-1">
            <h2 className="text-xl font-display font-extrabold text-white mb-6">Course Curriculum</h2>
            
            <div className="space-y-4">
              {weekGroups.map((group, gi) => {
                const moduleId = group.module?.id ?? `unassigned-${gi}`
                const isExpanded = isModuleExpanded(moduleId)
                const moduleWeeks = group.weeks
                const completedCount = moduleWeeks.filter(w => w.progress.status === 'COMPLETE').length
                const totalMin = moduleWeeks.reduce((s, w) => s + w.estimatedCompletionMinutes, 0)
                const allDone = completedCount === moduleWeeks.length && moduleWeeks.length > 0
                
                return (
                  <div key={moduleId} className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden transition-colors hover:border-white/20">
                    <button
                      onClick={() => toggleModule(moduleId)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 focus:outline-none focus:bg-white/[0.04]"
                      aria-expanded={isExpanded}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`text-[10px] font-mono uppercase tracking-[0.15em] ${allDone ? 'text-[#F5C518]' : 'text-white/40'}`}>
                            {learnerUnit} {gi + 1}
                          </span>
                          {allDone && <span className="text-[10px] font-bold text-[#F5C518] uppercase tracking-wider bg-[#F5C518]/10 px-2 py-0.5 rounded">Complete</span>}
                        </div>
                        <h3 className="text-base font-semibold text-white leading-snug pr-4">
                          {group.module?.title ?? 'Additional Lessons'}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                          <span className="flex items-center gap-1.5"><BookOpen size={12} /> {moduleWeeks.length} lessons</span>
                          {totalMin > 0 && <span className="flex items-center gap-1.5"><Clock3 size={12} /> {totalMin >= 60 ? `${Math.round(totalMin / 60)}h` : `${totalMin}m`}</span>}
                          <span>{completedCount}/{moduleWeeks.length} done</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-white/40 transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                        <ChevronDown size={20} />
                      </div>
                    </button>
                    
                    {/* Lessons List (Progressive Disclosure) */}
                    {isExpanded && (
                      <div className="border-t border-white/5 bg-black/20">
                        {moduleWeeks.map((week, wi) => {
                          const isComplete = week.progress.status === 'COMPLETE'
                          const isCurrent = week.id === continueWeek?.id
                          const isLocked = !isComplete && !isCurrent && week.progress.status === 'LOCKED'
                          
                          return (
                            <a
                              key={week.id}
                              href={isLocked ? '#' : `/course/${course.slug}/week/${week.slug}`}
                              className={`flex items-center gap-4 p-4 border-b border-white/5 last:border-b-0 transition-colors ${
                                isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/[0.04]'
                              }`}
                              aria-disabled={isLocked}
                              tabIndex={isLocked ? -1 : 0}
                            >
                              <div className="shrink-0">
                                {isComplete ? (
                                  <CheckCircle2 size={18} className="text-[#F5C518]" />
                                ) : isCurrent ? (
                                  <PlayCircle size={18} className="text-[#F5C518]" />
                                ) : isLocked ? (
                                  <Lock size={18} className="text-white/20" />
                                ) : (
                                  <div className="w-[18px] h-[18px] rounded-full border-2 border-white/20" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${isCurrent ? 'text-[#F5C518]' : 'text-white'}`}>
                                  <span className="text-white/40 font-normal mr-2">{wi + 1}.</span>
                                  {week.title}
                                </p>
                              </div>
                              {week.durationLabel && (
                                <span className="shrink-0 text-xs text-white/30">{week.durationLabel}</span>
                              )}
                            </a>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* Right Column: Resources Sidebar */}
          <aside className="order-1 lg:order-2 space-y-6">
            
            {isFacilitatorPreview && (
              <PreviewBanner text="You are viewing this course as a facilitator. Progress tracking is disabled." />
            )}

            {/* Certificate Highlight */}
            <div className="rounded-2xl border border-[#F5C518]/20 bg-[#F5C518]/[0.05] p-5">
              <div className="w-10 h-10 rounded-xl bg-[#F5C518]/15 border border-[#F5C518]/30 flex items-center justify-center mb-3">
                <Award size={20} className="text-[#F5C518]" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">Certificate of Completion</h3>
              <p className="text-xs text-white/60 leading-relaxed mb-4">
                Finish all lessons, assignments, and quizzes to unlock your certificate and showcase it on LinkedIn.
              </p>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-2">
                <div className="h-full bg-[#F5C518]" style={{ width: `${course.progressPercent}%` }} />
              </div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#F5C518] text-right">
                {course.progressPercent}% Earned
              </p>
            </div>

            {/* Course Overview Slides */}
            {course.overviewSlideUrl && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <BookOpen size={16} className="text-[#F5C518]" />
                  Course Slides
                </h3>
                <div className="mb-3 rounded-lg overflow-hidden border border-white/10">
                  <EmbedFrame
                    src={getSlideEmbedUrl(course.overviewSlideUrl)}
                    fallbackUrl={course.overviewSlideUrl}
                    title="Course overview slides"
                  />
                </div>
                <a
                  href={course.overviewSlideUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#F5C518] hover:text-[#E8B800] transition-colors"
                >
                  Open in full screen <ArrowRight size={12} />
                </a>
              </div>
            )}

            {/* Facilitators */}
            {course.facilitators.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Users size={16} className="text-[#F5C518]" />
                  Facilitators
                </h3>
                <div className="space-y-4">
                  {course.facilitators.map(f => (
                    <div key={f.id} className="flex items-center gap-3">
                      {facilitatorPhotoUrl(f) ? (
                        <img src={facilitatorPhotoUrl(f)!} alt={f.name} className="w-10 h-10 rounded-full object-cover bg-white/10 shrink-0 border border-white/10" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                          <Users size={16} className="text-white/40" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{f.name}</p>
                        <p className="text-xs text-white/50 truncate">{f.title || f.organization}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

        </div>
      </main>
    </div>
  )
}
"""

final_content = content[:start_idx] + new_enrolled_view

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(final_content)
