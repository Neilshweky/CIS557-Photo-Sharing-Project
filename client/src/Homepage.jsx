import React from 'react';
import PropTypes from 'prop-types';
import { Box, Container } from '@material-ui/core';
import { dateDiff, localStorage } from './Utilities';
import Post from './Post';
import AppToolbar from './AppToolbar';

class Homepage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: '', reactPosts: [] };
    this.generatePosts = this.generatePosts.bind(this);
  }

  componentDidMount() {
    const username = localStorage.getItem('user');
    const loginTime = localStorage.getItem('login');

    if (username === null || loginTime === null || dateDiff(loginTime) > 30) {
      localStorage.clear();
      const { history } = this.props;
      history.push('/signin');
    }
    this.setState({ username }, () => this.generatePosts());
    this.render();
  }

  async generatePosts() {
    const { username } = this.state;
    this.render();
    const compList = [];
    const resp = await fetch(`http://localhost:8080/posts/${username}/0`);
    if (resp.ok) {
      const postData = await resp.json();
      postData.forEach((post) => {
        compList.push(<Post post={post} key={post.uid} />);
      });
      this.setState({ reactPosts: compList });
    }
  }

  render() {
    const { reactPosts } = this.state;
    return (
      <div>
        <AppToolbar />
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
