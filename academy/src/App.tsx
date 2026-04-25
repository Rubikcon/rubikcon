import { Route, Switch } from 'wouter'
import LandingPage from './pages/LandingPage'
import CoursePage from './pages/CoursePage'
import LessonPage from './pages/LessonPage'

export default function App() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/course" component={CoursePage} />
      <Route path="/lesson/:id" component={LessonPage} />
    </Switch>
  )
}
