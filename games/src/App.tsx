import { Route, Switch } from 'wouter'
import GameListPage from './pages/GameListPage'
import PlayPage from './pages/PlayPage'

export default function App() {
  return (
    <Switch>
      <Route path="/" component={GameListPage} />
      <Route path="/play/:id" component={PlayPage} />
    </Switch>
  )
}
