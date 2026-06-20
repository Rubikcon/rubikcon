import { lazy, Suspense } from 'react'
import { Route, Switch } from 'wouter'

// ─── Eagerly-loaded routes (small, frequently visited) ────────────────────
import LandingPage from './pages/LandingPage'

// ─── Lazy routes (split into their own chunks, loaded on demand) ──────────
// Initial bundle drops by ~250KB since admin/lesson pages only download
// when actually visited.
const LoginPage = lazy(() => import('./pages/LoginPage'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const CoursesPage = lazy(() => import('./pages/CoursesPage'))
const CoursePage = lazy(() => import('./pages/CoursePage'))
const LessonPage = lazy(() => import('./pages/LessonPage'))
const AdminAcademyPage = lazy(() => import('./pages/AdminAcademyPage'))
const CourseBuilderWizard = lazy(() =>
  import('./pages/CourseBuilderWizard').then(m => ({ default: m.CourseBuilderWizard }))
)
const LessonEditorPage = lazy(() => import('./pages/LessonEditorPage'))
const WeekEditorPage = lazy(() => import('./pages/WeekEditorPage'))
const SuperAdminPage = lazy(() => import('./pages/SuperAdminPage'))
const SuperAdminCourseDetailPage = lazy(() => import('./pages/SuperAdminCourseDetailPage'))
const FacilitatorsPage = lazy(() => import('./pages/FacilitatorsPage'))

function RouteFallback() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border border-white/20 border-t-[#F5C518] mx-auto mb-3" />
        <p className="text-white/40 text-sm">Loading…</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/onboarding" component={OnboardingPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/admin" component={AdminAcademyPage} />
        <Route path="/admin/academy" component={AdminAcademyPage} />
        <Route path="/admin/courses/:courseId" component={CourseBuilderWizard} />
        <Route path="/admin/courses/:courseId/lessons/:lessonId" component={LessonEditorPage} />
        <Route path="/admin/courses/:courseId/weeks/:weekId" component={WeekEditorPage} />
        <Route path="/admin/superadmin" component={SuperAdminPage} />
        <Route path="/admin/superadmin/courses/:courseId" component={SuperAdminCourseDetailPage} />
        <Route path="/facilitators" component={FacilitatorsPage} />
        <Route path="/courses" component={CoursesPage} />
        <Route path="/course" component={CoursePage} />
        <Route path="/course/:slug" component={CoursePage} />
        <Route path="/course/:slug/week/:weekSlug" component={LessonPage} />
      </Switch>
    </Suspense>
  )
}
