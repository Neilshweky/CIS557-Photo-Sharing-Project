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
import { API_URL, openWebSocketConnection, WEBSOCKET_URI } from './Utilities';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '', profilePic: '', numFollowees: 0, numFollowers: 0, numMyPosts: 0, dataLoaded: false, socket: null,
    };
    this.updateState = this.updateState.bind(this);
    this.populateState = this.populateState.bind(this);
  }

  async componentDidMount() {
    this.populateState();
    const newSocket = new WebSocket(`${WEBSOCKET_URI}`, window.sessionStorage.getItem('token'));
    openWebSocketConnection(newSocket);
    this.setState({ socket: newSocket });
    // sesrver connection is idle after 55 seconds on heroku
    // pink every 50 seconds
    setInterval(() => {
      newSocket.send(JSON.stringify({ type: 'open' }));
    }, 50000);
  }

  async populateState() {
    const token = window.sessionStorage.getItem('token');
    if (token !== null) {
      const resp = await fetch(`${API_URL}/user/`,
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
          numMyPosts: data.numMyPosts,
        });
      }
    }
  }

  updateState(key, value) {
    this.setState({ [key]: value });
    if (key === 'username') {
      this.populateState();
    }
  }

  render() {
    const {
      username, profilePic, numFollowees, numFollowers, numMyPosts, socket,
    } = this.state;
    return (
      socket !== null && (
        <Router>
          <Switch>
            <PrivateRoute component={(props) => <Homepage {...props} username={username} profilePic={profilePic} updateState={this.updateState} numMyPosts={numMyPosts} socket={socket} />} exact path="/home" />
            <PrivateRoute component={(props) => <Homepage {...props} username={username} profilePic={profilePic} updateState={this.updateState} socket={socket} />} exact path="/" />
            <PrivateRoute component={(props) => <ImageUpload {...props} username={username} profilePic={profilePic} updateState={this.updateState} numMyPosts={numMyPosts} />} exact path="/imageupload" />
            <Route render={(props) => <SignIn {...props} username={username} updateState={this.updateState} />} exact path="/signin" />
            <Route render={(props) => <SignUp {...props} username={username} updateState={this.updateState} />} exact path="/signup" />
            <PrivateRoute component={(props) => <SimpleProfile {...props} username={username} profilePic={profilePic} updateState={this.updateState} numFollowees={numFollowees} numFollowers={numFollowers} numMyPosts={numMyPosts} socket={socket} />} exact path="/profile/:username" />
            <PrivateRoute component={(props) => <FriendSearch {...props} username={username} profilePic={profilePic} updateState={this.updateState} numFollowees={numFollowees} numFollowers={numFollowers} />} exact path="/search/:username/:searchTerm" />
          </Switch>
        </Router>
      )
    );
  }
}

export default App;
