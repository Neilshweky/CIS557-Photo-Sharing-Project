/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import './App.css';
import {
  Route, BrowserRouter as Router, Switch,
} from 'react-router-dom';
// import { createStore } from 'redux';
// import { Provider } from 'react-redux';
// import photoApp from './reducers/reducers';
// import { addUser, setMajorFilter } from '../actions/actions';
import SignIn from './SignIn';
import SignUp from './SignUp';
import SimpleProfile from './SimpleProfile';
import ImageUpload from './ImageUpload';
import Homepage from './Homepage';
import FriendSearch from './FriendSearch';

async function getLoggedInUserInfo() {
  const username = sessionStorage.getItem('user');
  const resp = await fetch(`http://localhost:8080/user/${username}`);
  if (resp.ok) {
    const data = await resp.json();
    return data;
  }
  return {};
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '', email: '', profilePic: '', posts: [], followees: [], followers: [], users: [], loginTime: '', dataLoaded: false,
    };
    this.updateState = this.updateState.bind(this);
  }

  async componentDidMount() {
    const username = localStorage.getItem('user');
    if (username != null) {
      const resp = await fetch(`http://localhost:8080/user/${username}`);
      if (resp.ok) {
        const loginTime = localStorage.getItem('login');
        const data = await resp.json();
        this.setState({ username, email: data.email, profilePic: data.profilePicture, posts: data.posts, followees: data.followees, followers: data.followers, loginTime })
      }
    }
    this.setState({ dataLoaded: true });
  }

  updateState(key, value) {
    this.setState({ [key]: value });
  }

  render() {
    const { dataLoaded } = this.state;
    return (
      dataLoaded && (
        <Router>
          <Switch>
            <Route render={(props) => <Homepage {...props} state={this.state} updateState={this.updateState} />} exact path="/" />
            <Route render={(props) => <Homepage {...props} state={this.state} updateState={this.updateState} />} exact path="/home" />
            <Route render={(props) => <ImageUpload {...props} state={this.state} updateState={this.updateState} />} exact path="/imageupload" />
            <Route render={(props) => <SignIn {...props} state={this.state} updateState={this.updateState} />} exact path="/signin" />
            <Route render={(props) => <SignUp {...props} state={this.state} updateState={this.updateState} />} exact path="/signup" />
            <Route render={(props) => <SimpleProfile {...props} state={this.state} updateState={this.updateState} />} exact path="/profile/:username" />
            <Route render={(props) => <FriendSearch {...props} state={this.state} updateState={this.updateState} />} exact path="/:username/:searchTerm" />
          </Switch>
        </Router>
      )
    );
  }
}

export default App;
