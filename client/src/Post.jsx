import React from 'react';
import { Img } from 'react-image';
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
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';
import moment from 'moment';
import { InputBase } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import SendIcon from '@material-ui/icons/Send';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Paper from '@material-ui/core/Paper';
import CommentBar from './CommentBar';
import { localStorage } from './Utilities';

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
    height: '28px',
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
  }

  componentDidMount() {
    this.getProfilePic();
  }


  async getProfilePic() {
    const { post } = this.props;
    const { username } = post;
    const resp = await fetch(`http://localhost:8080/user/${username}`);
    if (resp.ok) {
      const data = await resp.json();
      this.setState({
        profilePic: data.profilePicture,
      });
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

  async handleLikeClick() {
    const { liked, numLikes } = this.state;
    const { post, username } = this.props;
    if (liked) {
      const resp = await fetch(`http://localhost:8080/unlike/${post.uid}/${username}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Origin': '*',
          },
          mode: 'cors',
        });
      if (resp.ok) {
        this.setState({ liked: false, numLikes: numLikes - 1 });
      }
    } else {
      const resp = await fetch(`http://localhost:8080/like/${post.uid}/${username}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Origin': '*',
          },
          mode: 'cors',
        });
      if (resp.ok) {
        this.setState({ liked: true, numLikes: numLikes + 1 });
      }
    }
  }

  async handleSaveCaption() {
    const { caption } = this.state;
    const { post } = this.props;
    if (caption !== post.caption) {
      await fetch(`http://localhost:8080/updatePost/${post.uid}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Origin': '*',
          },
          mode: 'cors',
          body: JSON.stringify({ caption }),
        });
    }
    document.getElementById(`post-save-${post.uid}`).style.display = 'none';
    document.getElementById(`post-caption-${post.uid}`).disabled = true;
  }

  async handlePostComment(commentText) {
    const { post, username } = this.props;
    const resp = await fetch(`http://localhost:8080/addComment/${post.uid}/${username}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Origin': '*',
        },
        mode: 'cors',
        body: JSON.stringify({ comment: commentText }),
      });
    if (resp.ok) {
      const data = await resp.json();
      const { numComments, comments } = this.state;
      document.getElementById(`newComment-${post.uid}`).value = '';
      this.setState({ numComments: numComments + 1, comments: comments.concat([data]) });
    }
  }

  handleEditPost() {
    const { post } = this.props;
    document.getElementById(`post-caption-${post.uid}`).disabled = false;
    document.getElementById(`post-save-${post.uid}`).style.display = 'block';
    this.setState({ isPostEditOpen: false });
  }

  async handleDeletePost() {
    const { post } = this.props;
    await fetch(`http://localhost:8080/post/${post.uid}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Origin': '*',
        },
        mode: 'cors',
      });
    this.setState({ isPostEditOpen: false });
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
      liked, numLikes, numComments, comments,
    } = this.state;
    const { classes, post, username } = this.props;
    const {
      PostEditAnchorEl, isPostEditOpen, isCommentsOpen, caption,
    } = this.state;
    const renderPostEditMenu = (
      <Menu
        anchorEl={PostEditAnchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        id="post-edit-menu"
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isPostEditOpen}
        getContentAnchorEl={null}
        onClose={this.handlePostEditClose}
      >
        <MenuItem
          onClick={this.handleEditPost}
          className={classes.menuItem}
        >
          <p>Edit Post</p>
        </MenuItem>
        <MenuItem
          className={classes.menuItem}
          onClick={this.handleDeletePost}
        >
          <p>Delete Post</p>
        </MenuItem>
      </Menu>
    );
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
              <CommentBar comments={comments} postID={post.uid} username={username} addComment={this.handlePostComment} />
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
          <Grid container>
            <Grid item xs={11}>
              <InputBase
                id={`post-caption-${post.uid}`}
                multiline
                rowsMax="2"
                value={caption}
                onChange={(e) => this.setState({ caption: e.target.value })}
                disabled
                style={{ width: '100%', height: '19px' }}
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
        {renderPostEditMenu}
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
  }),
};

export default withStyles(styles)(Post);
