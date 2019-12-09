import React from 'react';
import { Box } from '@material-ui/core';
import PropTypes from 'prop-types';
import Post from './Post';
import { API_URL } from './Utilities';

export default class PostBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { reactPosts: [] };
    this.deletePost = this.deletePost.bind(this);
    this.generatePosts = this.generatePosts.bind(this);
  }

  async componentDidMount() {
    this.generatePosts();
  }

  async generatePosts() {
    const { loggedIn, username, bHome } = this.props;
    const compList = [];
    const token = window.sessionStorage.getItem('token');
    const resp = await fetch(`${API_URL}/posts/${username}/0`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (resp.ok) {
      const postData = await resp.json();
      postData.forEach((post) => {
        const comp = (
          <Post
            post={post}
            key={post.uid}
            username={loggedIn}
            deletePost={this.deletePost}
          />
        );
        return bHome ? compList.push(comp) : (post.username === username && compList.push(comp));
      });
      this.setState({ reactPosts: compList });
    } else if (await resp.text() === 'Token expired') {
      window.sessionStorage.clear();
      window.location.replace('/signin');
    }
    this.render();
  }

  async deletePost(ID) {
    const { reactPosts } = this.state;
    const filteredComp = reactPosts.filter((reactPost) => reactPost.key !== ID);
    this.setState({ reactPosts: filteredComp });
  }

  render() {
    const { reactPosts } = this.state;
    return (
      <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="space-between">
        {reactPosts.map((comp) => comp)}
      </Box>
    );
  }
}

PostBox.propTypes = {
  username: PropTypes.string.isRequired,
  bHome: PropTypes.bool.isRequired,
};
