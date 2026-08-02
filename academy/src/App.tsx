import { lazy, Suspense } from 'react'
import { Route, Switch } from 'wouter'
import ScrollToTopButton from './components/ScrollToTopButton'

// ─── Eagerly-loaded routes (small, frequently visited) ────────────────────
import LandingPage from './pages/LandingPage'

// ─── Lazy routes (split into their own chunks, loaded on demand) ──────────
// Initial bundle drops by ~250KB since admin/lesson pages only download
// when actually visited.
const LoginPage = lazy(() => import('./pages/LoginPage'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const CoursePage = lazy(() => import('./pages/CoursePage'))
const CoursesListPage = lazy(() => import('./pages/CoursesListPage'))
const LessonPage = lazy(() => import('./pages/LessonPage'))
const SharedVideoPage = lazy(() => import('./pages/SharedVideoPage'))
const AdminAcademyPage = lazy(() => import('./pages/AdminAcademyPage'))
const CourseBuilderWizard = lazy(() =>
  import('./pages/CourseBuilderWizard').then(m => ({ default: m.CourseBuilderWizard }))
)
const LessonEditorPage = lazy(() => import('./pages/LessonEditorPage'))
const WeekEditorPage = lazy(() => import('./pages/WeekEditorPage'))
const SuperAdminPage = lazy(() => import('./pages/SuperAdminPage'))
const SuperAdminCourseDetailPage = lazy(() => import('./pages/SuperAdminCourseDetailPage'))
const FacilitatorsPage = lazy(() => import('./pages/FacilitatorsPage'))
const FacilitatorApplyPage = lazy(() => import('./pages/FacilitatorApplyPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

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
    <>
      <Suspense fallback={<RouteFallback />}>
        <Switch>
          {/* ─── Public pages ───────────────────────────────────────────── */}
          <Route path="/" component={LandingPage} />
          <Route path="/courses" component={CoursesListPage} />
          <Route path="/course" component={CoursePage} />
          <Route path="/course/:slug" component={CoursePage} />
          <Route path="/course/:slug/week/:weekSlug" component={LessonPage} />
          <Route path="/share/course/:courseSlug/week/:weekSlug/video/:videoId" component={SharedVideoPage} />
          <Route path="/facilitators" component={FacilitatorsPage} />
          <Route path="/facilitator/apply" component={FacilitatorApplyPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/contact" component={ContactPage} />

          {/* ─── Auth ───────────────────────────────────────────────────── */}
          <Route path="/login" component={LoginPage} />
          <Route path="/onboarding" component={OnboardingPage} />

          {/* ─── Learner ────────────────────────────────────────────────── */}
          <Route path="/dashboard" component={DashboardPage} />

          {/* ─── Facilitator admin ──────────────────────────────────────── */}
          <Route path="/admin" component={AdminAcademyPage} />
          <Route path="/admin/academy" component={AdminAcademyPage} />
          <Route path="/admin/courses/:courseId" component={CourseBuilderWizard} />
          <Route path="/admin/courses/:courseId/lessons/:lessonId" component={LessonEditorPage} />
          <Route path="/admin/courses/:courseId/weeks/:weekId" component={WeekEditorPage} />

          {/* ─── Super admin ────────────────────────────────────────────── */}
          <Route path="/admin/superadmin" component={SuperAdminPage} />
          <Route path="/admin/superadmin/courses/:courseId" component={SuperAdminCourseDetailPage} />

          {/* ─── 404 catch-all ──────────────────────────────────────────── */}
          <Route component={NotFoundPage} />
        </Switch>
      </Suspense>

      {/* Global floating UI — rendered above all page content */}
      <ScrollToTopButton />
    </>
  )
}
