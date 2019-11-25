import React from 'react';
import PropTypes from 'prop-types';
import { Box, Container } from '@material-ui/core';
import { dateDiff, localStorage } from './Utilities';
import Post from './Post';
import AppToolbar from './AppToolbar';
import PostBox from './PostBox';

class Homepage extends React.PureComponent {

  componentDidMount() {
    const { state, history } = this.props;

    if (state.username === '' || state.loginTime === '' || dateDiff(state.loginTime) > 30) {
      localStorage.clear();
      history.push('/signin');
    }
  }

  render() {
    const { state } = this.props;
    return (
      <div>
        <AppToolbar profilePic={state.profilePic} username={state.username} />
        <Container>
          <h1 id="welcome">
            Welcome.
            {localStorage.getItem('user')}
          </h1>
          <PostBox username={state.username} />
        </Container>
      </div>
    );
  }
}

Homepage.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
};
export default Homepage;
