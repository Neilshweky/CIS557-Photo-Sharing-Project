/* eslint-disable react/jsx-props-no-spreading */
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
import PrivateRoute from './PrivateRoute';
import { API_URL } from './Utilities';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '', profilePic: '', numFollowees: 0, numFollowers: 0, numPosts: 0, dataLoaded: false,
    };
    this.updateState = this.updateState.bind(this);
    this.populateState = this.populateState.bind(this);
  }

  async componentDidMount() {
    this.populateState();
  }

  async populateState() {
    const username = localStorage.getItem('user');
    const token = window.sessionStorage.getItem('token');
    if (token !== null) {
      const resp = await fetch(`${API_URL}/user/${username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      if (resp.ok) {
        const data = await resp.json();
        this.setState({
          username: data.username,
          profilePic: data.profilePicture,
          numPosts: data.posts.length,
        });
      }
    }
    this.setState({ dataLoaded: true });
  }

  updateState(key, value) {
    this.setState({ [key]: value });
    if (key === 'username') {
      this.populateState();
    }
  }

  render() {
    const {
      dataLoaded, username, profilePic, numFollowees, numFollowers, numPosts,
    } = this.state;
    return (
      dataLoaded && (
        <Router>
          <Switch>
            <PrivateRoute component={(props) => <Homepage {...props} username={username} profilePic={profilePic} updateState={this.updateState} numPosts={numPosts} />} exact path="/home" />
            <PrivateRoute component={(props) => <Homepage {...props} username={username} profilePic={profilePic} updateState={this.updateState} />} exact path="/" />
            <PrivateRoute component={(props) => <ImageUpload {...props} username={username} profilePic={profilePic} updateState={this.updateState} numPosts={numPosts} />} exact path="/imageupload" />
            <Route render={(props) => <SignIn {...props} username={username} updateState={this.updateState} />} exact path="/signin" />
            <Route render={(props) => <SignUp {...props} username={username} updateState={this.updateState} />} exact path="/signup" />
            <PrivateRoute component={(props) => <SimpleProfile {...props} username={username} profilePic={profilePic} updateState={this.updateState} numFollowees={numFollowees} numFollowers={numFollowers} numPosts={numPosts} />} exact path="/profile/:username" />
            <PrivateRoute component={(props) => <FriendSearch {...props} username={username} profilePic={profilePic} updateState={this.updateState} numFollowees={numFollowees} numFollowers={numFollowers} />} exact path="/search/:username/:searchTerm" />
          </Switch>
        </Router>
      )
    );
  }
}

export default App;
