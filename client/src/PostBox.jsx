// https://medium.com/better-programming/infinite-scroll-with-react-hooks-and-context-api-b622b4f9c43f

import React from 'react';
import { Box } from '@material-ui/core';
import PropTypes from 'prop-types';
import Post from './Post';
import { API_URL } from './Utilities';

export default class PostBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { reactPosts: [], numSeen: 0 };
    this.deletePost = this.deletePost.bind(this);
    this.generatePosts = this.generatePosts.bind(this);
  }

  async componentDidMount() {
    this.generatePosts();
    const list = document.getElementById('post-box');
    // list has auto height
    window.addEventListener('scroll', () => {
      if ((list.clientHeight + list.offsetTop) - (window.scrollY + window.innerHeight) < 2) {
        this.generatePosts();
      }
    });
    if (list.clientHeight <= window.innerHeight && list.clientHeight) {
      this.generatePosts();
    }
  }

  async generatePosts() {
    const { loggedIn, username, bHome, socket } = this.props;
    const { numSeen, reactPosts } = this.state;
    const compList = [];
    const token = window.sessionStorage.getItem('token');
    const resp = await fetch(`${API_URL}/posts/${username}/${numSeen}`, {
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
            socket={socket}
          />
        );
        return bHome ? compList.push(comp) : (post.username === username && compList.push(comp));
      });
      this.setState({ reactPosts: reactPosts.concat(compList), numSeen: numSeen + 10 });
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
      <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="space-between" id="post-box">
        {reactPosts.map((comp) => comp)}
      </Box>
    );
  }
}

PostBox.propTypes = {
  username: PropTypes.string.isRequired,
  bHome: PropTypes.bool.isRequired,
  loggedIn: PropTypes.string.isRequired,
};
