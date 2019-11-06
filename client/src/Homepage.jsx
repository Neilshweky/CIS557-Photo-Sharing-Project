import React from 'react';
import PropTypes from 'prop-types';
import { Box, Container } from '@material-ui/core';
import { dateDiff, localStorage } from './Utilities';
import Post from './Post';
import AppToolbar from './AppToolbar';

class Homepage extends React.Component {
  componentDidMount() {
    const username = localStorage.getItem('user');
    const loginTime = localStorage.getItem('login');

    if (username === null || loginTime === null || dateDiff(loginTime) > 30) {
      localStorage.clear();
      const { history } = this.props;
      history.push('/signin');
    }
  }

  render() {
    return (
      <div>
        <AppToolbar />
        <Container>
          <h1 id="welcome">
            Welcome.
            {localStorage.getItem('user')}
          </h1>
          <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="space-between">
            <Post author="Sarah" post={{ author: 'Sarah' }} />
            <Post author="Sarah" post={{ author: 'Neil' }} />
            <Post author="Sarah" post={{ author: 'Hannah' }} />
            <Post author="Sarah" post={{ author: 'Carlos' }} />
          </Box>
        </Container>
      </div>
    );
  }
}

Homepage.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
};
export default Homepage;
