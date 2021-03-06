import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import FavoriteIcon from '@material-ui/icons/Favorite';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ChatBubbleIcon from '@material-ui/icons/ChatBubble';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import moment from 'moment';
import { InputBase } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Chips from 'react-chips';
import CommentBar from './CommentBar';
import EditMenu from './EditMenu';
import { API_URL } from './Utilities';

const styles = (theme) => ({
  card: {
    width: '345px',
    marginBottom: '10px',
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
    backgroundPosition: 'top',
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  avatar: {
    backgroundColor: theme.palette.secondary.main,
  },
  favorite: {
    color: 'red',
  },
  iconCount: {
    marginLeft: '5px',
  },
  menuItem: {
    height: '30px',
  },
});

class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      liked: props.post.likes.indexOf(props.username) !== -1,
      numLikes: props.post.likes.length,
      numComments: props.post.comments.length,
      comments: props.post.comments,
      isPostEditOpen: false,
      PostEditAnchorEl: null,
      isCommentsOpen: false,
      caption: props.post.caption,
      chips: props.post.tagged,
      users: [],
    };
    this.handleLikeClick = this.handleLikeClick.bind(this);
    this.getProfilePic = this.getProfilePic.bind(this);
    this.handlePostEditOpen = this.handlePostEditOpen.bind(this);
    this.handlePostEditClose = this.handlePostEditClose.bind(this);
    this.handleSaveCaption = this.handleSaveCaption.bind(this);
    this.handleEditPost = this.handleEditPost.bind(this);
    this.handleDeletePost = this.handleDeletePost.bind(this);
    this.handleCommentsOpen = this.handleCommentsOpen.bind(this);
    this.handleCommentsClose = this.handleCommentsClose.bind(this);
    this.getProfileAvatar = this.getProfileAvatar.bind(this);
    this.handlePostComment = this.handlePostComment.bind(this);
    this.handleEditComment = this.handleEditComment.bind(this);
    this.handleDeleteComment = this.handleDeleteComment.bind(this);
    this.onChipChange = this.onChipChange.bind(this);
    this.eventHandler = this.eventHandler.bind(this);
  }

  componentDidMount() {
    this.getProfilePic();
    this.getUsers();
    const { socket } = this.props;
    socket.addEventListener('message', this.eventHandler);
  }

  async onChipChange(newChips) {
    const { chips } = this.state;
    const { post } = this.props;
    const token = window.sessionStorage.getItem('token');
    const added = newChips.length > chips.length;
    const changedUser = added ? newChips.filter(
      (x) => !chips.includes(x),
    ) : chips.filter((x) => !newChips.includes(x));
    const resp = await fetch(`${API_URL}/${added ? 'addTag' : 'removeTag'}/${post.uid}/${changedUser}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (resp.ok) {
      this.setState({ chips: newChips });
    }
  }

  async getUsers() {
    const token = window.sessionStorage.getItem('token');
    const resp = await fetch(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (resp.ok) {
      const users = await resp.json();
      this.setState({ users });
    }
  }

  async getProfilePic() {
    const { post } = this.props;
    const { username } = post;
    const token = window.sessionStorage.getItem('token');
    const resp = await fetch(`${API_URL}/user/${username}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (resp.ok) {
      const data = await resp.json();
      this.setState({
        profilePic: data.profilePicture,
      });
    } else if (await resp.text() === 'Token expired') {
      window.sessionStorage.clear();
      window.location.replace('/signin');
    }
  }

  getProfileAvatar() {
    const { profilePic } = this.state;
    const { post, classes } = this.props;
    let avatar = null;
    try {
      window.atob(profilePic);
      if (profilePic !== '') {
        avatar = (
          <Avatar
            className={classes.avatar}
            src={`data:image/jpeg;base64,${profilePic}`}
            id="profile-pic"
            style={{ border: 0, objectFit: 'cover' }}
          />
        );
      } else {
        throw new Error('No image to upload');
      }
    } catch (e) {
      avatar = (
        <Avatar
          className={classes.avatar}
          id="profile-pic"
        >
          {post.username.charAt(0)}
        </Avatar>
      );
    }
    return avatar;
  }

  eventHandler(event) {
    const { numLikes, numComments } = this.state;
    const { post } = this.props;
    const data = JSON.parse(event.data);
    if (data.type === 'like' && data.data.postid === post.uid) {
      this.setState({ liked: true, numLikes: numLikes + 1 });
    } else if (data.type === 'unlike' && data.data.postid === post.uid) {
      this.setState({ liked: false, numLikes: numLikes - 1 });
    } else if (data.type === 'addComment' && data.data.postid === post.uid) {
      this.setState({ numComments: numComments + 1 });
    } else if (data.type === 'updatePost' && data.data.postid === post.uid) {
      this.setState({ caption: data.data.caption });
    }
  }

  async handleLikeClick() {
    const { liked } = this.state;
    const { post, username } = this.props;
    const token = window.sessionStorage.getItem('token');
    if (liked) {
      const resp = await fetch(`${API_URL}/unlike/${post.uid}/${username}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Origin': '*',
            Authorization: `Bearer ${token}`,
          },
          mode: 'cors',
        });
      if (resp.ok) {
        // this.setState({ liked: false, numLikes: numLikes - 1 });
      } else if (await resp.text() === 'Token expired') {
        window.sessionStorage.clear();
        window.location.replace('/signin');
      }
    } else {
      const resp = await fetch(`${API_URL}/like/${post.uid}/${username}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Origin': '*',
            Authorization: `Bearer ${token}`,
          },
          mode: 'cors',
        });
      if (resp.ok) {
        // this.setState({ liked: true, numLikes: numLikes + 1 });
      } else if (await resp.text() === 'Token expired') {
        window.sessionStorage.clear();
        window.location.replace('/signin');
      }
    }
  }

  async handleSaveCaption() {
    const { caption } = this.state;
    const { post } = this.props;
    const token = window.sessionStorage.getItem('token');
    if (caption !== post.caption) {
      const resp = await fetch(`${API_URL}/updatePost/${post.uid}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Origin': '*',
            Authorization: `Bearer ${token}`,
          },
          mode: 'cors',
          body: JSON.stringify({ caption }),
        });
      if (!resp.ok) {
        this.setState({ caption: post.caption });
      } else if (await resp.text() === 'Token expired') {
        window.sessionStorage.clear();
        window.location.replace('/signin');
      }
    }
    document.getElementById(`post-save-${post.uid}`).style.display = 'none';
    document.getElementById(`post-caption-${post.uid}`).disabled = true;
    document.getElementById(`post-caption-${post.uid}`).style.color = 'black';
  }

  async handlePostComment(commentText) {
    const { post, username } = this.props;
    const token = window.sessionStorage.getItem('token');
    const resp = await fetch(`${API_URL}/addComment/${post.uid}/${username}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Origin': '*',
          Authorization: `Bearer ${token}`,

        },
        mode: 'cors',
        body: JSON.stringify({ comment: commentText }),
      });
    if (resp.ok) {
      document.getElementById(`newComment-${post.uid}`).value = '';
    } else if (await resp.text() === 'Token expired') {
      window.sessionStorage.clear();
      window.location.replace('/signin');
    }
  }

  async handleEditComment(commentText, commentID) {
    const { post } = this.props;
    const { comments } = this.state;
    const token = window.sessionStorage.getItem('token');
    const curCommentText = comments.filter((comment) => comment.uid === commentID)[0].comment;
    if (commentText !== curCommentText) {
      const resp = await fetch(`${API_URL}/editComment/${post.uid}/${commentID}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Origin': '*',
            Authorization: `Bearer ${token}`,
          },
          mode: 'cors',
          body: JSON.stringify({ comment: commentText }),
        });
      if (resp.ok) {
        const updatedComments = comments.map(
          (curComment) => {
            if (curComment.uid === commentID) {
              const curCom = curComment;
              curCom.comment = commentText;
            } return curComment;
          },
        );
        this.setState({ comments: updatedComments });
        return commentText;
      } if (await resp.text() === 'Token expired') {
        window.sessionStorage.clear();
        window.location.replace('/signin');
      }
    }
    return curCommentText;
  }

  async handleDeleteComment(commentID) {
    const { post } = this.props;
    const token = window.sessionStorage.getItem('token');
    const resp = await fetch(`${API_URL}/comment/${post.uid}/${commentID}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Origin': '*',
          Authorization: `Bearer ${token}`,
        },
        mode: 'cors',
      });
    if (resp.ok) {
      const { comments, numComments } = this.state;
      const updatedComments = comments.filter((comment) => comment.uid !== commentID);
      this.setState({ comments: updatedComments, numComments: numComments - 1 });
    } else if (await resp.text() === 'Token expired') {
      window.sessionStorage.clear();
      window.location.replace('/signin');
    }
  }

  handleEditPost() {
    const { post } = this.props;
    const captionElement = document.getElementById(`post-caption-${post.uid}`);
    captionElement.disabled = false;
    captionElement.variant = 'outlined';
    captionElement.style.color = 'blue';
    document.getElementById(`post-save-${post.uid}`).style.display = 'block';

    this.setState({ isPostEditOpen: false });
  }

  async handleDeletePost() {
    const { post, deletePost } = this.props;
    const token = window.sessionStorage.getItem('token');
    await fetch(`${API_URL}/post/${post.uid}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Origin': '*',
          Authorization: `Bearer ${token}`,
        },
        mode: 'cors',
      });
    this.setState({ isPostEditOpen: false });
    deletePost(post.uid);
  }

  handlePostEditOpen(event) {
    this.setState({ PostEditAnchorEl: event.currentTarget, isPostEditOpen: true });
  }

  handlePostEditClose() {
    this.setState({ PostEditAnchorEl: null, isPostEditOpen: false });
  }

  handleCommentsOpen() {
    this.setState({ isCommentsOpen: true });
  }

  handleCommentsClose() {
    this.setState({ isCommentsOpen: false });
  }

  render() {
    const {
      liked, numLikes, numComments, comments, chips, users,
    } = this.state;
    const { classes, post, username } = this.props;
    const {
      PostEditAnchorEl, isPostEditOpen, isCommentsOpen, caption,
    } = this.state;
    const renderHeader = username === post.username
      ? (
        <CardHeader
          avatar={this.getProfileAvatar()}
          action={(
            <IconButton aria-label="settings" onClick={this.handlePostEditOpen}>
              <MoreVertIcon />
            </IconButton>
          )}
          title={post.username}
          subheader={moment.unix(post.timestamp).format('M/D/YY [at] h:mm a')}
        />
      )
      : (
        <CardHeader
          avatar={this.getProfileAvatar()}
          title={post.username}
          subheader={moment.unix(post.timestamp).format('M/D/YY [at] h:mm a')}
        />
      );

    const renderComments = (
      <Dialog
        open={isCommentsOpen}
        onClose={this.handleCommentsClose}
        aria-labelledby="form-dialog-title"
        fullWidth
        maxWidth="md"
      >
        <DialogContent style={{ padding: '8px 12px' }}>
          <Grid container spacing={2}>
            <Grid item xs={7}>
              <img
                src={`data:image/jpeg;base64,${post.picture}`}
                style={{ maxHeight: 'calc(100vh - 130px)', maxWidth: '100%' }}
                alt="post-pic"
              />
            </Grid>
            <Grid item xs={5}>
              <CommentBar
                comments={comments}
                postID={post.uid}
                username={username}
                addComment={this.handlePostComment}
                editComment={this.handleEditComment}
                deleteComment={this.handleDeleteComment}
              />
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    );

    return (
      <Card className={classes.card} id={post.uid}>
        {renderHeader}
        <CardMedia
          className={classes.media}
          image={`data:image/jpeg;base64,${post.picture}`}
        />
        <CardContent>
          <Grid container style={{ marginBottom: '10px' }}>
            <Grid item xs={11}>
              <InputBase
                id={`post-caption-${post.uid}`}
                multiline
                value={caption}
                onChange={(e) => this.setState({ caption: e.target.value })}
                disabled
                style={{ width: '100%', color: 'black' }}
              />
            </Grid>
            <Grid item xs={1}>
              <SaveIcon
                id={`post-save-${post.uid}`}
                style={{ display: 'none' }}
                onClick={this.handleSaveCaption}
              />
            </Grid>
          </Grid>
          <Chips
            value={chips}
            onChange={this.onChipChange}
            suggestions={users}
            placeholder={chips.length === 0 ? 'Tag post here' : ''}
            fromSuggestionsOnly
          />
        </CardContent>
        <CardActions disableSpacing>
          <IconButton
            className={liked ? classes.favorite : ''}
            onClick={this.handleLikeClick}
          >
            <FavoriteIcon />
            <Typography className={classes.iconCount}>
              {numLikes}
            </Typography>
          </IconButton>
          <IconButton
            onClick={this.handleCommentsOpen}
          >
            <ChatBubbleIcon />
            <Typography className={classes.iconCount}>
              {numComments}
            </Typography>
          </IconButton>
        </CardActions>
        <EditMenu
          bPost
          deleteAction={this.handleDeletePost}
          editAction={this.handleEditPost}
          anchor={PostEditAnchorEl}
          status={isPostEditOpen}
          close={this.handlePostEditClose}
        />
        {renderComments}
      </Card>

    );
  }
}

Post.defaultProps = {
  post: PropTypes.shape({
    author: '',
  }),
};

Post.propTypes = {
  classes: PropTypes.shape({
    avatar: PropTypes.string.isRequired,
    expand: PropTypes.string.isRequired,
    expandOpen: PropTypes.any,
    media: PropTypes.string.isRequired,
    card: PropTypes.string.isRequired,
    favorite: PropTypes.string.isRequired,
    iconCount: PropTypes.string.isRequired,
    menuItem: PropTypes.string.isRequired,
  }).isRequired,
  post: PropTypes.shape({
    uid: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    likes: PropTypes.array.isRequired,
    timestamp: PropTypes.number.isRequired,
    picture: PropTypes.string.isRequired,
    caption: PropTypes.string.isRequired,
    comments: PropTypes.array.isRequired,
    tagged: PropTypes.array.isRequired,
  }),
  username: PropTypes.string.isRequired,
  deletePost: PropTypes.func.isRequired,
};

export default withStyles(styles)(Post);
