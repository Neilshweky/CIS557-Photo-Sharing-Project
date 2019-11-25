import React from 'react';
import PropTypes from 'prop-types';
import { Box, Container } from '@material-ui/core';
import { dateDiff, localStorage } from './Utilities';
import Post from './Post';
import AppToolbar from './AppToolbar';

class Homepage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { reactPosts: [] };
    this.generatePosts = this.generatePosts.bind(this);
  }

  componentDidMount() {
    const { state, history } = this.props;

    if (state.username === '' || state.loginTime === '' || dateDiff(state.loginTime) > 30) {
      localStorage.clear();
      history.push('/signin');
    }
    this.generatePosts();
  }

  async generatePosts() {
    const { state } = this.props;
    const compList = [];
    const resp = await fetch(`http://localhost:8080/posts/${state.username}/0`);
    if (resp.ok) {
      const postData = await resp.json();
      postData.forEach((post) => {
        compList.push(<Post post={post} key={post.uid} username={state.username} />);
      });
      this.setState({ reactPosts: compList });
    }
  }

  render() {
    const { reactPosts } = this.state;
    const { state } = this.props;
    return (
      <div>
        <AppToolbar profilePic={state.profilePic} username={state.username} />
        <Container>
          <h1 id="welcome">
            Welcome.
            {localStorage.getItem('user')}
          </h1>
          <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="space-between">
            {reactPosts.map((comp) => comp)}
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
