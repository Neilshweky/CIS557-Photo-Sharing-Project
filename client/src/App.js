import React from 'react';
import './App.css';
import UserMessage from './AppHome';
import SignIn from './SignIn'
import SignUp from './SignUp'
import ShowProfile from './ShowProfile'
import Dashboard from './ProfilePage'
import { Route, Link, BrowserRouter as Router, Switch } from 'react-router-dom'

class App extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path="/" component={App}>
            <Route path="/signin" component={SignIn} />
            <Route path="/signup" component={SignUp} />
            <Route path="/home" component={UserMessage} />
            {/* <Route path="/addPost(/:username)" component={AddPost}></Route> */}
            {/* <Route component={LoggedIn}> */}
            <Route path="/profile" component={Dashboard} />
            {/* <Route path="/users/:id" component={Users} /> */}
            {/* <Route component={Notfound} /> */}
            {/* </Route> */}
          </Route>
        </Switch >
        {/* </div> */}
      </Router >
    )
  }
}

export default App
