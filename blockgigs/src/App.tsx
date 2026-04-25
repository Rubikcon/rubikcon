import { Route, Switch } from 'wouter'
import GigsListPage from './pages/GigsListPage'
import GigDetailPage from './pages/GigDetailPage'
import FreelancerPage from './pages/FreelancerPage'

export default function App() {
  return (
    <Switch>
      <Route path="/" component={GigsListPage} />
      <Route path="/gig/:id" component={GigDetailPage} />
      <Route path="/freelancer/:id" component={FreelancerPage} />
    </Switch>
  )
}
