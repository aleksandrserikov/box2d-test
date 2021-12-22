import * as React from 'react'
import routes from './routes'
import { Route, Switch, matchPath  } from 'react-router-dom'
import Page404 from './Page404'

function App(props) {
  return (
        <Switch>
          {
              routes.map(({ path, exact, component: C }) => (
              <Route key={path} path={path} exact={exact} render={(props) => {
                  const activeRoute = routes.find((route) => matchPath(props.match.path, route)) || {};
                  const componentContext = {
                      prefetched: props.staticContext,
                      fetchList: activeRoute.fetchList
                  }
                  return (<C context = { componentContext } />)
              }} />
          ))}
          <Route path='*' status={404}>
            <Page404 />
          </Route>
        </Switch>
  );
}

export default App;
