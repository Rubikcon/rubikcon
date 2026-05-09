import { Route, Switch } from 'wouter'
import LandingPage from './pages/LandingPage'
import CoursePage from './pages/CoursePage'
import LessonPage from './pages/LessonPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AdminAcademyPage from './pages/AdminAcademyPage'
import CourseBuilderPage from './pages/CourseBuilderPage'
import SuperAdminPage from './pages/SuperAdminPage'
import SuperAdminCourseDetailPage from './pages/SuperAdminCourseDetailPage'
import CoursesPage from './pages/CoursesPage'
import OnboardingPage from './pages/OnboardingPage'

export default function App() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/admin" component={AdminAcademyPage} />
      <Route path="/admin/academy" component={AdminAcademyPage} />
      <Route path="/admin/courses/:courseId" component={CourseBuilderPage} />
      <Route path="/admin/superadmin" component={SuperAdminPage} />
      <Route path="/admin/superadmin/courses/:courseId" component={SuperAdminCourseDetailPage} />
      <Route path="/courses" component={CoursesPage} />
      <Route path="/course" component={CoursePage} />
      <Route path="/course/:slug" component={CoursePage} />
      <Route path="/course/:slug/week/:weekSlug" component={LessonPage} />
    </Switch>
  )
}
