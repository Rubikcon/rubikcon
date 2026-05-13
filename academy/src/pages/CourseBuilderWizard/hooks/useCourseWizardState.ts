/**
 * Custom hook for managing Course Builder Wizard state
 * Handles form data persistence via sessionStorage and step navigation
 */

import { useState, useCallback, useEffect } from 'react'
import type {
  CourseFormData,
  CourseWizardStep,
  LessonFormData,
  LessonVideoData,
  LessonFacilitatorData,
  ModuleFormData,
  StepCompletionStatus,
  WizardState,
} from '../types/CourseWizardTypes'

const SESSION_KEY_PREFIX = 'wizard-'

function getInitialWizardState(courseId: string): WizardState {
  return {
    currentStep: 1,
    stepCompletionStatus: { step1: false, step2: false, step3: false },
    courseData: {
      title: '',
      slug: '',
      tagline: '',
      description: '',
      level: '',
      estimatedDuration: '',
      contentUnit: '',
      isPaid: false,
      introVideoUrl: '',
      overviewSlideUrl: '',
      heroImage: '',
    },
    modules: [],
    lessons: {},
    error: null,
  }
}

function getSessionKey(courseId: string): string {
  return `${SESSION_KEY_PREFIX}${courseId}`
}

export function useCourseWizardState(courseId: string) {
  const [state, setState] = useState<WizardState>(() => {
    // Try to restore from sessionStorage
    try {
      const key = getSessionKey(courseId)
      const saved = sessionStorage.getItem(key)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (err) {
      console.error('Failed to restore wizard state from sessionStorage:', err)
    }
    return getInitialWizardState(courseId)
  })

  // Persist state to sessionStorage whenever it changes
  useEffect(() => {
    try {
      const key = getSessionKey(courseId)
      sessionStorage.setItem(key, JSON.stringify(state))
    } catch (err) {
      console.error('Failed to persist wizard state to sessionStorage:', err)
    }
  }, [state, courseId])

  // ─── Course Data ──────────────────────────────────────────────────────

  const updateCourseData = useCallback(
    (updates: Partial<CourseFormData>) => {
      setState(prev => ({
        ...prev,
        courseData: { ...prev.courseData, ...updates },
      }))
    },
    []
  )

  const setCourseData = useCallback((data: CourseFormData) => {
    setState(prev => ({ ...prev, courseData: data }))
  }, [])

  // ─── Module Management ────────────────────────────────────────────────

  const addModule = useCallback((module: Omit<ModuleFormData, 'id'>) => {
    setState(prev => {
      const newModule: ModuleFormData = {
        id: `temp-${Date.now()}`,
        ...module,
        position: prev.modules.length,
      }
      return {
        ...prev,
        modules: [...prev.modules, newModule],
      }
    })
  }, [])

  const updateModule = useCallback((moduleId: string, updates: Partial<ModuleFormData>) => {
    setState(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId ? { ...m, ...updates } : m
      ),
    }))
  }, [])

  const deleteModule = useCallback((moduleId: string) => {
    setState(prev => {
      const newLessons = { ...prev.lessons }
      delete newLessons[moduleId]
      return {
        ...prev,
        modules: prev.modules.filter(m => m.id !== moduleId),
        lessons: newLessons,
      }
    })
  }, [])

  const setModules = useCallback((modules: ModuleFormData[]) => {
    setState(prev => ({ ...prev, modules }))
  }, [])

  // ─── Lesson Management ────────────────────────────────────────────────

  const addLesson = useCallback(
    (moduleId: string, lesson: Partial<LessonFormData> & { title: string; duration: number }) => {
      setState(prev => {
        const newLesson: LessonFormData = {
          id: lesson.id ?? `temp-${Date.now()}`,
          moduleId,
          title: lesson.title,
          content: lesson.content ?? '',
          duration: lesson.duration,
          videos: lesson.videos ?? [],
          facilitators: lesson.facilitators ?? [],
          slug: lesson.slug,
          hasDetails: lesson.hasDetails ?? false,
        }
        const moduleLessons = prev.lessons[moduleId] || []
        return {
          ...prev,
          lessons: {
            ...prev.lessons,
            [moduleId]: [...moduleLessons, newLesson],
          },
        }
      })
    },
    []
  )

  const updateLesson = useCallback(
    (moduleId: string, lessonId: string, updates: Partial<LessonFormData>) => {
      setState(prev => {
        const moduleLessons = prev.lessons[moduleId] || []
        return {
          ...prev,
          lessons: {
            ...prev.lessons,
            [moduleId]: moduleLessons.map(l =>
              l.id === lessonId ? { ...l, ...updates } : l
            ),
          },
        }
      })
    },
    []
  )

  const setLessons = useCallback((lessons: Record<string, LessonFormData[]>) => {
    setState(prev => ({ ...prev, lessons }))
  }, [])

  const deleteLesson = useCallback((moduleId: string, lessonId: string) => {
    setState(prev => {
      const moduleLessons = prev.lessons[moduleId] || []
      return {
        ...prev,
        lessons: {
          ...prev.lessons,
          [moduleId]: moduleLessons.filter(l => l.id !== lessonId),
        },
      }
    })
  }, [])

  const addLessonVideo = useCallback(
    (moduleId: string, lessonId: string, video: LessonVideoData) => {
      setState(prev => {
        const moduleLessons = prev.lessons[moduleId] || []
        return {
          ...prev,
          lessons: {
            ...prev.lessons,
            [moduleId]: moduleLessons.map(l =>
              l.id === lessonId
                ? { ...l, videos: [...l.videos, { id: `temp-${Date.now()}`, ...video }] }
                : l
            ),
          },
        }
      })
    },
    []
  )

  const removeLessonVideo = useCallback(
    (moduleId: string, lessonId: string, videoId: string) => {
      setState(prev => {
        const moduleLessons = prev.lessons[moduleId] || []
        return {
          ...prev,
          lessons: {
            ...prev.lessons,
            [moduleId]: moduleLessons.map(l =>
              l.id === lessonId
                ? { ...l, videos: l.videos.filter(v => v.id !== videoId) }
                : l
            ),
          },
        }
      })
    },
    []
  )

  const addLessonFacilitator = useCallback(
    (moduleId: string, lessonId: string, facilitator: LessonFacilitatorData) => {
      setState(prev => {
        const moduleLessons = prev.lessons[moduleId] || []
        return {
          ...prev,
          lessons: {
            ...prev.lessons,
            [moduleId]: moduleLessons.map(l =>
              l.id === lessonId
                ? {
                    ...l,
                    facilitators: l.facilitators.some(f => f.id === facilitator.id)
                      ? l.facilitators
                      : [...l.facilitators, facilitator],
                  }
                : l
            ),
          },
        }
      })
    },
    []
  )

  const removeLessonFacilitator = useCallback(
    (moduleId: string, lessonId: string, facilitatorId: string) => {
      setState(prev => {
        const moduleLessons = prev.lessons[moduleId] || []
        return {
          ...prev,
          lessons: {
            ...prev.lessons,
            [moduleId]: moduleLessons.map(l =>
              l.id === lessonId
                ? { ...l, facilitators: l.facilitators.filter(f => f.id !== facilitatorId) }
                : l
            ),
          },
        }
      })
    },
    []
  )

  // ─── Step Navigation ──────────────────────────────────────────────────

  const setCurrentStep = useCallback((step: CourseWizardStep) => {
    setState(prev => ({ ...prev, currentStep: step }))
  }, [])

  const markStepComplete = useCallback((step: CourseWizardStep) => {
    setState(prev => {
      const stepKey = `step${step}` as keyof StepCompletionStatus
      return {
        ...prev,
        stepCompletionStatus: {
          ...prev.stepCompletionStatus,
          [stepKey]: true,
        },
      }
    })
  }, [])

  // ─── Error Handling ───────────────────────────────────────────────────

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const setSavingStep = useCallback((step?: CourseWizardStep) => {
    setState(prev => ({ ...prev, savingStep: step }))
  }, [])

  // ─── Validation Helpers ───────────────────────────────────────────────

  const isStep1Valid = useCallback(() => {
    const { title, slug, description } = state.courseData
    return title.trim().length >= 3 && slug.trim().length > 0 && description.trim().length >= 20
  }, [state.courseData])

  const isStep2Valid = useCallback(() => {
    return state.modules.length >= 1
  }, [state.modules])

  const isStep3Valid = useCallback(() => {
    // At least one module with at least one lesson
    return state.modules.some(m => {
      const lessons = state.lessons[m.id!] || []
      return lessons.length >= 1
    })
  }, [state.modules, state.lessons])

  // ─── Reset & Clear ────────────────────────────────────────────────────

  const clearSessionStorage = useCallback(() => {
    try {
      const key = getSessionKey(courseId)
      sessionStorage.removeItem(key)
    } catch (err) {
      console.error('Failed to clear wizard state from sessionStorage:', err)
    }
  }, [courseId])

  const reset = useCallback(() => {
    setState(getInitialWizardState(courseId))
    clearSessionStorage()
  }, [courseId, clearSessionStorage])

  return {
    // State
    state,
    courseData: state.courseData,
    modules: state.modules,
    lessons: state.lessons,
    currentStep: state.currentStep,
    error: state.error,
    isSaving: state.savingStep !== undefined,
    savingStep: state.savingStep,
    stepCompletionStatus: state.stepCompletionStatus,

    // Course data updates
    updateCourseData,
    setCourseData,

    // Module management
    addModule,
    updateModule,
    deleteModule,
    setModules,

    // Lesson management
    addLesson,
    updateLesson,
    deleteLesson,
    setLessons,
    addLessonVideo,
    removeLessonVideo,
    addLessonFacilitator,
    removeLessonFacilitator,

    // Step navigation
    setCurrentStep,
    markStepComplete,

    // Error handling
    setError,
    setSavingStep,

    // Validation
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,

    // Reset
    reset,
    clearSessionStorage,
  }
}

export type UseWizardState = ReturnType<typeof useCourseWizardState>
