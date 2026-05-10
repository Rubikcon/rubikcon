import { motion } from 'framer-motion'
import type { CourseWizardStep } from './types/CourseWizardTypes'

interface WizardProgressBarProps {
  currentStep: CourseWizardStep
  totalSteps: number
}

export default function WizardProgressBar({ currentStep, totalSteps }: WizardProgressBarProps) {
  const progressPct = (currentStep / totalSteps) * 100

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-black/40 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-white">
            Step {currentStep} of {totalSteps}
          </h2>
          <span className="text-xs text-white/40">
            {Math.round(progressPct)}%
          </span>
        </div>

        {/* Progress bar background */}
        <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
          {/* Animated progress fill */}
          <motion.div
            className="h-full bg-[#F5C518] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 mt-4">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const stepNum = (i + 1) as CourseWizardStep
            const isActive = stepNum === currentStep
            const isComplete = stepNum < currentStep
            const stepLabels = ['Course', 'Modules', 'Lessons']

            return (
              <div key={stepNum} className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full border transition-all ${
                  isActive
                    ? 'bg-[#F5C518] border-[#F5C518] text-black font-semibold'
                    : isComplete
                    ? 'bg-green-500/20 border-green-500 text-green-400'
                    : 'bg-white/5 border-white/20 text-white/40'
                }`}>
                  {isComplete ? '✓' : stepNum}
                </div>
                <span className={`text-xs font-medium transition-colors ${
                  isActive || isComplete
                    ? 'text-white'
                    : 'text-white/40'
                }`}>
                  {stepLabels[i]}
                </span>
                {i < totalSteps - 1 && (
                  <div className={`flex-1 h-px transition-colors ${
                    isComplete ? 'bg-green-500/20' : 'bg-white/10'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
