import React from 'react';
import './App.css';
import {
  Route, BrowserRouter as Router, Switch,
} from 'react-router-dom';
import SignIn from './SignIn';
import SignUp from './SignUp';
import SimpleProfile from './SimpleProfile';
import ImageUpload from './ImageUpload';
import Homepage from './Homepage';
import FriendSearch from './FriendSearch';

function App() {
  return (
    <Router>
      <Switch>
        <Route component={Homepage} exact path="/" />
        <Route component={Homepage} path="/home" />
        <Route component={ImageUpload} path="/imageupload" />
        <Route component={SignIn} path="/signin" />
        <Route component={SignUp} path="/signup" />
        <Route component={SimpleProfile} path="/profile/:username" />
        <Route component={FriendSearch} path="/search/:username/:searchTerm" />
      </Switch>
    </Router>
  );
}

export default App;
