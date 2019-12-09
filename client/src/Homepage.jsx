import React from 'react';
import PropTypes from 'prop-types';
import { Container } from '@material-ui/core';
import AppToolbar from './AppToolbar';
import PostBox from './PostBox';

class Homepage extends React.PureComponent {
  render() {
    const {
      username, profilePic, updateState, history,
    } = this.props;
    return (
      <div>
        <AppToolbar
          profilePic={profilePic}
          username={username}
          updateState={updateState}
          history={history}
        />
        <Container>
          <h1 id="welcome">
            Welcome.
            {username}
          </h1>
          <PostBox username={username} loggedIn={username} bHome />
        </Container>
      </div>
    );
  }
}

Homepage.defaultProps = {
  profilePic: '',
}

Homepage.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
  username: PropTypes.string.isRequired,
  updateState: PropTypes.func.isRequired,
  profilePic: PropTypes.string,
};
export default Homepage;
