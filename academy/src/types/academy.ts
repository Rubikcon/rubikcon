export type WeekProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE'

// ─── Course Management ────────────────────────────────────────────────────────

export type CourseStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'
export type WeekDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export type FacilitatorSummary = {
  id: string
  name: string
  title: string
  organization: string
  email: string
  linkedinUrl: string
  photoUrl: string | null
  bio: string | null
}

export type AdminCourse = {
  id: string
  title: string
  slug: string
  tagline: string | null
  status: CourseStatus
  published: boolean
  isPaid: boolean
  contentUnit: string
  weekCount: number
  facilitators: FacilitatorSummary[]
  createdBy: { id: string; name: string | null; email: string } | null
  approvalNotes: string | null
  submittedAt: string | null
  approvedAt: string | null
  createdAt: string
  updatedAt: string
}

export type AdminModule = {
  id: string
  title: string
  description: string | null
  position: number
  courseId: string
}

export type AdminCourseDetail = {
  id: string
  title: string
  slug: string
  tagline: string | null
  description: string
  level: string | null
  estimatedDuration: string | null
  phaseLabel: string | null
  heroImage: string | null
  introVideoUrl: string | null
  overviewSlideUrl: string | null
  contentUnit: string
  status: CourseStatus
  published: boolean
  isPaid: boolean
  approvalNotes: string | null
  submittedAt: string | null
  approvedAt: string | null
  createdAt: string
  updatedAt: string
  createdBy: { id: string; name: string | null; email: string } | null
  courseFacilitators: Array<{ id: string; facilitator: FacilitatorSummary }>
  modules: AdminModule[]
  weeks: AdminWeek[]
  approvals: Array<{
    id: string
    action: 'APPROVED' | 'REJECTED'
    notes: string | null
    createdAt: string
    reviewer: { id: string; name: string | null; email: string }
  }>
}

export type AdminWeek = {
  id: string
  number: number
  title: string
  slug: string
  durationLabel: string
  difficulty: WeekDifficulty
  hook: string
  whatToExpect: string
  summary: string
  estimatedCompletionMinutes: number
  videoTitle: string | null
  videoUrl: string | null
  moduleId: string | null
  lessonContent: string | null
  published: boolean
  topics: Array<{ id: string; title: string; position: number }>
  objectives: Array<{ id: string; body: string; position: number }>
  images: Array<{ id: string; url: string; alt: string | null; caption: string | null; position: number }>
  videos: Array<{ id: string; title: string; url: string; description: string | null; position: number }>
  quiz: AdminQuiz | null
  assignments: AdminAssignment[]
}

export type AdminQuiz = {
  id: string
  title: string
  passMark: number
  attemptLimit: number
  questions: Array<{
    id: string
    prompt: string
    explanation: string
    position: number
    options: Array<{ id: string; label: string; isCorrect: boolean; position: number }>
  }>
}

export type AdminAssignment = {
  id: string
  title: string
  instructions: string
  deadline: string
  allowTextSubmission: boolean
  allowFileUpload: boolean
  position: number
  choices: Array<{ id: string; title: string; description: string; position: number }>
}

export type AdminLesson = {
  id: string
  title: string
  content: string
  duration: number
  position: number
  moduleId: string
  videos: Array<{ id: string; title: string; url: string; description: string | null; position: number }>
  module: { id: string; title: string; description: string | null; course: { id: string; title: string; slug: string } }
}

export type ReadingType =
  | 'ARTICLE'
  | 'COURSE'
  | 'DOCUMENTATION'
  | 'WHITEPAPER'
  | 'VIDEO'
  | 'INTERACTIVE'

export type CourseWeekSummary = {
  id: string
  number: number
  slug: string
  title: string
  durationLabel: string
  estimatedCompletionMinutes: number
  moduleId: string | null
  module: { id: string; title: string; description: string | null } | null
  progress: {
    status: WeekProgressStatus
    quizSubmitted: boolean
    assignmentSubmitted: boolean
    completedAt: string | null
  }
}

export type CourseSummary = {
  id: string
  slug: string
  title: string
  tagline: string | null
  description: string
  level: string | null
  estimatedDuration: string | null
  phaseLabel: string | null
  heroImage: string | null
  introVideoUrl: string | null
  overviewSlideUrl: string | null
  contentUnit: string
  enrolled: boolean
  facilitators: Array<{ id: string; name: string; title: string; organization: string; photoUrl: string | null }>
  progressPercent: number
  completedCount: number
  totalWeeks: number
  modules: Array<{ id: string; title: string; description: string | null; position: number }>
  weeks: CourseWeekSummary[]
}

export type WeekVideo = {
  id: string
  title: string
  url: string
  description: string | null
  position: number
}

export type WeekDetail = {
  id: string
  slug: string
  number: number
  title: string
  durationLabel: string
  difficulty: string
  hook: string
  whatToExpect: string
  summary: string
  estimatedCompletionMinutes: number
  videos: WeekVideo[]
  module: { id: string; title: string; description: string | null } | null
  course: {
    id: string
    slug: string
    title: string
    tagline: string | null
    phaseLabel: string | null
    contentUnit: string
  }
  navigation: {
    previous: {
      id: string
      slug: string
      title: string
      number: number
    } | null
    next: {
      id: string
      slug: string
      title: string
      number: number
    } | null
  }
  heroSlides: Array<{
    id: string
    title: string
    subtitle?: string
    headline?: string
    body?: string
    facilitatorNames?: string[]
    items?: string[]
    difficulty?: string
    estimatedCompletionMinutes?: number
  }>
  lessonDetails: {
    title: string
    facilitators: Array<{
      id: string
      name: string
      title: string
      organization: string
      emailMasked: string
      emailMailto: string
      linkedinUrl: string
      photoUrl: string | null
      bio: string | null
    }>
    topics: string[]
    objectives: string[]
    whatToExpect: string
    summary: string
  }
  resources: {
    slideDeck: {
      id: string
      title: string
      url: string
      slideCount: number
      lastUpdatedAt: string
      viewerType: 'MODAL' | 'EXTERNAL'
      sections: string[]
    } | null
    glossary: Array<{
      id: string
      term: string
      definition: string
      example: string | null
      position: number
      saved: boolean
    }>
    readings: Array<{
      id: string
      title: string
      source: string
      url: string
      description: string
      type: ReadingType
      position: number
      read: boolean
    }>
  }
  assignment: {
    quiz: {
      id: string
      title: string
      passMark: number
      attemptLimit: number
      unlockGranted: boolean
      submitted: boolean
      latestAttempt: {
        id: string
        score: number
        percentage: number
        submittedAt: string
        status: string
      } | null
      questions: Array<{
        id: string
        prompt: string
        explanation: string | null
        position: number
        options: Array<{
          id: string
          label: string
          position: number
          isCorrect?: boolean
          isSelected: boolean
        }>
      }>
    } | null
    tasks: Array<{
      id: string
      title: string
      instructions: string
      deadline: string
      allowTextSubmission: boolean
      allowFileUpload: boolean
      position: number
      status: 'NOT_STARTED' | 'SUBMITTED' | 'REVIEWED' | 'DRAFT'
      choices: Array<{
        id: string
        title: string
        description: string
        position: number
      }>
      latestSubmission: {
        id: string
        choiceId: string | null
        textResponse: string | null
        attachmentName: string | null
        attachmentUrl: string | null
        attachmentMimeType: string | null
        attachmentSizeBytes: number | null
        status: 'SUBMITTED' | 'REVIEWED' | 'DRAFT'
        submittedAt: string
        reviewedAt: string | null
        feedback: Array<{
          id: string
          feedback: string
          rating: number | null
          createdAt: string
          reviewerName: string
        }>
      } | null
    }>
  }
  progress: {
    status: WeekProgressStatus
    quizSubmitted: boolean
    assignmentSubmitted: boolean
    completedAt: string | null
  }
}

export type DashboardData = {
  courses: Array<{
    id: string
    slug: string
    title: string
    phaseLabel: string | null
    contentUnit: string
    progressPercent: number
    weeks: Array<CourseWeekSummary & {
      latestQuizAttempt: {
        score: number
        percentage: number
        submittedAt: string
      } | null
    }>
  }>
  assignmentSubmissionCount: number
}

export type AdminLearnerProgress = Array<{
  id: string
  status: WeekProgressStatus
  quizSubmitted: boolean
  assignmentSubmitted: boolean
  completedAt: string | null
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
  week: {
    id: string
    slug: string
    number: number
    title: string
  }
}>

export type AdminSubmission = Array<{
  id: string
  textResponse: string | null
  status: 'SUBMITTED' | 'REVIEWED' | 'DRAFT'
  submittedAt: string
  reviewedAt: string | null
  attachmentName: string | null
  attachmentUrl: string | null
  user: {
    id: string
    name: string | null
    email: string
  }
  assignment: {
    id: string
    title: string
    week: {
      id: string
      slug: string
      number: number
      title: string
    }
  }
  choice: {
    id: string
    title: string
    description: string
    position: number
  } | null
  feedback: Array<{
    id: string
    feedback: string
    rating: number | null
    createdAt: string
    reviewer: {
      id: string
      name: string | null
      email: string
    }
  }>
}>
