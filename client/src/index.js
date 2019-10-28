//https://codeburst.io/getting-started-with-react-router-5c978f70df91

import * as serviceWorker from './serviceWorker';
import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { Route, Link, BrowserRouter as Router, Switch } from 'react-router-dom'
import App from './App'
import SignIn from './SignIn'
import SignUp from './SignUp'
import ShowProfile from './ShowProfile'
const routing = (
  <Router>
    <div>
      <ul>
        <li>
          <Link to="/">Home Page</Link>
        </li>
        <li>
          <Link to="/signin">Sign In</Link>
        </li>
        <li>
          <Link to="/signup">Sign Up</Link>
        </li>
        <li>
          <Link to="/showprofile">Show Profile</Link>
        </li>
      </ul>
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/signin" component={SignIn} />
        <Route path="/signup" component={SignUp} />
        {/* <Route path="/addPost(/:username)" component={AddPost}></Route> */}
        <Route path="/showprofile" component={ShowProfile} ></Route>
        {/* <Route path="/users/:id" component={Users} /> */}
        {/* <Route component={Notfound} /> */}
      </Switch>
    </div>
  </Router>
)
ReactDOM.render(routing, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
