import React from 'react';
import './App.css';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import SignIn from './SignIn';
import SignUp from './SignUp';
import Dashboard from './ProfilePage';
import AppHome from './AppHome';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={AppHome}>
          <Route path="/signin" component={SignIn} />
          <Route path="/signup" component={SignUp} />
          <Route path="/home" component={AppHome} />
          {/* <Route path="/addPost(/:username)" component={AddPost}></Route> */}
          {/* <Route component={LoggedIn}> */}
          <Route path="/profile" component={Dashboard} />
          {/* <Route path="/users/:id" component={Users} /> */}
          {/* <Route component={Notfound} /> */}
          {/* </Route> */}
        </Route>
      </Switch>
      {/* </div> */}
    </Router>
  );
}

export default App;
