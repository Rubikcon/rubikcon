import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiRequest } from '../../lib/api'
import { useCourseWizardState } from './hooks/useCourseWizardState'
import WizardProgressBar from './WizardProgressBar'
import Step1_CourseInfo from './steps/Step1_CourseInfo'
import Step2_ModuleManagement from './steps/Step2_ModuleManagement'
import Step3_LessonManagement from './steps/Step3_LessonManagement'
import CompletionModal from './modals/CompletionModal'
import type { AdminCourseDetail } from '../../types/academy'

const TOTAL_STEPS = 3

interface CourseBuilderWizardProps {
  params?: {
    courseId: string
  }
}

export default function CourseBuilderWizard({ params }: CourseBuilderWizardProps) {
  const actualCourseId = params?.courseId ?? ''

  if (!actualCourseId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-[#0a0e27] to-black">
        <div className="text-center">
          <p className="text-red-400 text-lg">Course ID not found. Please go back and select a course.</p>
        </div>
      </div>
    )
  }

  const wizard = useCourseWizardState(actualCourseId)
  const [initializing, setInitializing] = useState(true)
  const [showCompletion, setShowCompletion] = useState(false)

  // Load course data on mount
  useEffect(() => {
    async function loadCourse() {
      try {
        const response = await apiRequest<AdminCourseDetail>(`/academy/admin/courses/${actualCourseId}`, {
          method: 'GET',
        })
        const course = response as AdminCourseDetail

        // Populate wizard state with existing course data
        wizard.setCourseData({
          title: course.title,
          slug: course.slug,
          tagline: course.tagline || '',
          description: course.description,
          level: course.level || '',
          estimatedDuration: course.estimatedDuration || '',
          contentUnit: course.contentUnit,
          isPaid: course.isPaid,
          introVideoUrl: course.introVideoUrl || '',
        })

        // Populate modules
        if (course.modules && course.modules.length > 0) {
          wizard.setModules(
            course.modules.map(m => ({
              id: m.id,
              title: m.title,
              description: m.description || '',
              introVideoUrl: '', // Will be loaded separately if needed
              position: m.position,
            }))
          )
        }

        setInitializing(false)
      } catch (err) {
        console.error('Failed to load course:', err)
        wizard.setError(
          err instanceof Error ? err.message : 'Failed to load course data'
        )
        setInitializing(false)
      }
    }

    loadCourse()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualCourseId])

  const handleStepChange = (newStep: typeof wizard.currentStep) => {
    // Validate current step before allowing move
    if (newStep > wizard.currentStep) {
      // Moving forward - validate current step
      if (wizard.currentStep === 1 && !wizard.isStep1Valid()) {
        wizard.setError('Please fill in all required fields in the course info')
        return
      }
      if (wizard.currentStep === 2 && !wizard.isStep2Valid()) {
        wizard.setError('Please create at least one module before continuing')
        return
      }
      if (wizard.currentStep === 3 && !wizard.isStep3Valid()) {
        wizard.setError('Please create at least one lesson before finishing')
        return
      }

      // Mark step as complete
      wizard.markStepComplete(wizard.currentStep as any)
    }

    // Clear error when changing steps
    wizard.setError(null)
    wizard.setCurrentStep(newStep)
  }

  const handleFinish = () => {
    // Validate step 3
    if (!wizard.isStep3Valid()) {
      wizard.setError('Please create at least one lesson before finishing')
      return
    }

    // Mark step 3 as complete
    wizard.markStepComplete(3)

    // Show completion modal
    setShowCompletion(true)
  }

  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border border-white/20 border-t-[#F5C518] mx-auto mb-4" />
          <p className="text-white/60">Loading course...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0e27] to-black">
      {/* Progress bar */}
      <WizardProgressBar currentStep={wizard.currentStep} totalSteps={TOTAL_STEPS} />

      {/* Main content */}
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Error banner */}
          {wizard.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100 flex items-center justify-between"
            >
              <span>{wizard.error}</span>
              <button
                onClick={() => wizard.setError(null)}
                className="text-red-100/60 hover:text-red-100 transition-colors"
              >
                ✕
              </button>
            </motion.div>
          )}

          {/* Step content with animations */}
          <AnimatePresence mode="wait">
            {wizard.currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
              >
                <Step1_CourseInfo
                  wizard={wizard}
                  courseId={actualCourseId}
                  onNext={() => handleStepChange(2)}
                />
              </motion.div>
            )}

            {wizard.currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
              >
                <Step2_ModuleManagement
                  wizard={wizard}
                  courseId={actualCourseId}
                  onBack={() => handleStepChange(1)}
                  onNext={() => handleStepChange(3)}
                />
              </motion.div>
            )}

            {wizard.currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
              >
                <Step3_LessonManagement
                  wizard={wizard}
                  courseId={actualCourseId}
                  onBack={() => handleStepChange(2)}
                  onFinish={handleFinish}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Completion modal */}
      {showCompletion && (
        <CompletionModal
          course={wizard.courseData}
          modules={wizard.modules}
          lessons={wizard.lessons}
          onClose={() => setShowCompletion(false)}
          onViewCourse={() => {
            wizard.clearSessionStorage()
            window.location.href = `/courses/${wizard.courseData.slug}`
          }}
          onCreateAnother={() => {
            wizard.reset()
            wizard.setCurrentStep(1)
            setShowCompletion(false)
          }}
        />
      )}
    </div>
  )
}
