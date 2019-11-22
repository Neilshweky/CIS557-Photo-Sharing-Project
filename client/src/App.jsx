import React from 'react';
import './App.css';
import {
  Route, BrowserRouter as Router, Switch,
} from 'react-router-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
// import { rootReducer } from '../reducers/reducers';
// import { addUser, setMajorFilter } from '../actions/actions';
import SignIn from './SignIn';
import SignUp from './SignUp';
import SimpleProfile from './SimpleProfile';
import ImageUpload from './ImageUpload';
import Homepage from './Homepage';
import FriendSearch from './FriendSearch';

// const store = createStore(rootReducer);

function App() {
  return (
    // <Provider store={store}>
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
    // </Provider>
  );
}

export default App;
