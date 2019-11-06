import React from 'react';
import './App.css';
import {
  Link, Route, BrowserRouter as Router, Switch,
} from 'react-router-dom';
import SignIn from './SignIn';
import SignUp from './SignUp';
import SimpleProfile from './SimpleProfile';
import AppHome from './AppHome';
import { localStorage } from './Utilities';

function App() {
  return (
    <Router>
      <Switch>
        <Route component={AppHome} exact path="/" />
        <Route component={SignIn} path="/signin" />
        <Route component={SignUp} path="/signup" />
        <Route component={AppHome} path="/home" />
        <Route component={SimpleProfile} path="/profile" />
      </Switch>
      <ul>
        <li>
          <Link to="/">Home (Upload)</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
        <li id="logout" onClick={() => localStorage.clear()}>
          <Link to="/signin">Logout</Link>
        </li>
      </ul>
      {/* </div> */}
    </Router>
  );
}

export default App;
