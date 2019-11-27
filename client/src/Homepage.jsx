import React from 'react';
import PropTypes from 'prop-types';
import { Container } from '@material-ui/core';
import { dateDiff, localStorage } from './Utilities';
import AppToolbar from './AppToolbar';
import PostBox from './PostBox';

class Homepage extends React.PureComponent {
  componentDidMount() {
    const { username, loginTime, history } = this.props;

    if (username === '' || loginTime === '' || dateDiff(loginTime) > 30) {
      localStorage.clear();
      history.push('/signin');
    }
  }

  render() {
    const { username, profilePic, updateState } = this.props;
    return (
      <div>
        <AppToolbar profilePic={profilePic} username={username} updateState={updateState} />
        <Container>
          <h1 id="welcome">
            Welcome.
            {localStorage.getItem('user')}
          </h1>
          <PostBox username={username} bHome />
        </Container>
      </div>
    );
  }
}

Homepage.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
  username: PropTypes.string.isRequired,
  loginTime: PropTypes.string.isRequired,
  updateState: PropTypes.func.isRequired,
  profilePic: PropTypes.string.isRequired,
};
export default Homepage;
