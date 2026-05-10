/**
 * Type definitions for Course Builder Wizard
 * Defines all data structures used in the step-by-step course creation flow
 */

// ─── Step Types ────────────────────────────────────────────────────────────

export type CourseWizardStep = 1 | 2 | 3

export type StepCompletionStatus = {
  step1: boolean
  step2: boolean
  step3: boolean
}

// ─── Course Form Data ──────────────────────────────────────────────────────

export type CourseFormData = {
  // Basic info
  title: string
  slug: string
  tagline: string
  description: string

  // Configuration
  level: string
  estimatedDuration: string
  contentUnit: string
  isPaid: boolean

  // Media
  introVideoUrl: string
}

// ─── Module Form Data ─────────────────────────────────────────────────────

export type ModuleFormData = {
  id?: string
  title: string
  description: string
  introVideoUrl: string
  position?: number
}

// ─── Lesson Video ─────────────────────────────────────────────────────────

export type LessonVideoData = {
  id?: string
  title: string
  url: string
  description?: string
}

// ─── Lesson Facilitator ────────────────────────────────────────────────────

export type LessonFacilitatorData = {
  id: string
  name: string
  email: string
}

// ─── Lesson Form Data ─────────────────────────────────────────────────────

export type LessonFormData = {
  id?: string
  title: string
  content: string
  duration: number
  moduleId: string
  videos: LessonVideoData[]
  facilitators: LessonFacilitatorData[]
}

// ─── Wizard State ─────────────────────────────────────────────────────────

export type WizardState = {
  // Navigation
  currentStep: CourseWizardStep
  stepCompletionStatus: StepCompletionStatus

  // Form data
  courseData: CourseFormData
  modules: ModuleFormData[]
  lessons: Record<string, LessonFormData[]> // moduleId -> lessons array

  // UI state
  savingStep?: CourseWizardStep
  error?: string | null
}

// ─── Facilitator (for system users) ───────────────────────────────────────

export type FacilitatorOption = {
  id: string
  name: string
  email: string
  title?: string
}

// ─── API Response Types ────────────────────────────────────────────────────

export type CreatedModule = {
  id: string
  title: string
  description: string | null
  introVideoUrl: string | null
  position: number
  courseId: string
  createdAt: string
  updatedAt: string
}

export type CreatedLesson = {
  id: string
  title: string
  content: string
  duration: number
  moduleId: string
  createdAt: string
  updatedAt: string
}
