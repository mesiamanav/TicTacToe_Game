import React from 'react';
import ReactDOM from 'react-dom';
// import './index.css';
import Game from './Game/Game';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter, Switch, Route, withRouter } from 'react-router-dom';

ReactDOM.render((
  <BrowserRouter>
    <App />
  </BrowserRouter>
), document.getElementById('root'));

// this component will be rendered by our <___Router>
function App() {
  const gameWrapper = withRouter(({ match }) => (<Game symbol={ match.params.symbol } />));
  return (
    <main>
      <Switch>
        <Route path='/join/:symbol' component={gameWrapper}/>
      </Switch>
    </main>
  );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
