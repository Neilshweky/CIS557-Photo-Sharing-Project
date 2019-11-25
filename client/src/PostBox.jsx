import React from 'react';
import Post from './Post';
import { Box } from '@material-ui/core';

export default class PostBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { reactPosts: [] };
    this.deletePost = this.deletePost.bind(this);
    this.generatePosts = this.generatePosts.bind(this);
  }

  componentDidMount() {
    this.generatePosts();
  }

  async generatePosts() {
    const { username } = this.props;
    const compList = [];
    const resp = await fetch(`http://localhost:8080/posts/${username}/0`);
    if (resp.ok) {
      const postData = await resp.json();
      postData.forEach((post) => {
        compList.push(<Post post={post} key={post.uid} username={username} deletePost={this.deletePost} />);
      });
      this.setState({ reactPosts: compList });
    }
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
