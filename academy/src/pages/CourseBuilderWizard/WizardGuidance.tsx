interface WizardGuidanceProps {
  currentStep: 1 | 2 | 3
  isCurrentStepValid: boolean
  /** Short one-line nudge: what the user needs to do to unlock the next step. */
  nextStepHint?: string
}

export default function WizardGuidance({
  currentStep,
  isCurrentStepValid,
  nextStepHint,
}: WizardGuidanceProps) {
  const stepInfo = {
    1: 'Basic Info',
    2: 'Add Modules',
    3: 'Add Lessons',
  }

  const stepDescription = {
    1: 'Course title, slug, description',
    2: 'Group your content into modules',
    3: 'Add lessons to your modules',
  }

  return (
    <div className="space-y-3">
      {[1, 2, 3].map(step => {
        const isCurrent = step === currentStep
        const isPast = step < currentStep && isCurrentStepValid
        return (
          <div
            key={step}
            className={`rounded-lg border px-4 py-3 transition-colors ${
              isCurrent
                ? 'border-[#F5C518]/30 bg-[#F5C518]/5'
                : isPast
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-white/10 bg-white/[0.02]'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 ${
                isCurrent
                  ? 'bg-[#F5C518]/20 text-[#F5C518]'
                  : isPast
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/10 text-white/50'
              }`}>
                {isPast ? '✓' : step}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isCurrent ? 'text-white' : 'text-white/70'}`}>
                  {stepInfo[step as 1 | 2 | 3]}
                </p>
                <p className="text-xs text-white/40 mt-0.5">
                  {stepDescription[step as 1 | 2 | 3]}
                </p>
                {/* Inline hint, shown only on the active step that's still incomplete */}
                {isCurrent && !isCurrentStepValid && nextStepHint && (
                  <p className="text-[11px] text-[#F5C518]/80 mt-2 leading-snug">
                    {nextStepHint}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
