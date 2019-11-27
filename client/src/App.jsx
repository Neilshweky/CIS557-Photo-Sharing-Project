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

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '', email: '', profilePic: '', posts: [], followees: [], followers: [], loginTime: '', dataLoaded: false,
    };
    this.updateState = this.updateState.bind(this);
    this.populateState = this.populateState.bind(this);
  }

  async componentDidMount() {
    this.populateState();
  }

  async populateState() {
    const username = localStorage.getItem('user');
    if (username != null) {
      const resp = await fetch(`http://localhost:8080/user/${username}`);
      if (resp.ok) {
        const loginTime = localStorage.getItem('login');
        const data = await resp.json();
        this.setState({
          username,
          email: data.email,
          profilePic: data.profilePicture,
          posts: data.posts,
          followees: data.followees,
          followers: data.followers,
          loginTime,
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
      dataLoaded, username, profilePic, posts, loginTime, email, followers, followees,
    } = this.state;
    return (
      dataLoaded && (
        <Router>
          <Switch>
            <Route render={(props) => <Homepage {...props} username={username} profilePic={profilePic} posts={posts} loginTime={loginTime} updateState={this.updateState} />} exact path="/" />
            <Route render={(props) => <Homepage {...props} username={username} profilePic={profilePic} posts={posts} loginTime={loginTime} updateState={this.updateState} />} exact path="/home" />
            <Route render={(props) => <ImageUpload {...props} username={username} loginTime={loginTime} profilePic={profilePic} updateState={this.updateState} />} exact path="/imageupload" />
            <Route render={(props) => <SignIn {...props} username={username} loginTime={loginTime} updateState={this.updateState} />} exact path="/signin" />
            <Route render={(props) => <SignUp {...props} username={username} loginTime={loginTime} updateState={this.updateState} />} exact path="/signup" />
            <Route render={(props) => <SimpleProfile {...props} username={username} profilePic={profilePic} email={email} followees={followees} followers={followers} loginTime={loginTime} updateState={this.updateState} />} exact path="/profile/:username" />
            <Route render={(props) => <FriendSearch {...props} username={username} loginTime={loginTime} profilePic={profilePic} updateState={this.updateState} />} exact path="/search/:username/:searchTerm" />
          </Switch>
        </Router>
      )
    );
  }
}

export default App;
