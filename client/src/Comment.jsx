import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import { Link, InputBase } from '@material-ui/core';
import moment from 'moment';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import SaveIcon from '@material-ui/icons/Save';
import PropTypes from 'prop-types';
import EditMenu from './EditMenu';


const styles = (theme) => ({
  avatar: {
    backgroundColor: theme.palette.secondary.main,
  },
});

class Comment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profilePic: '', CommentEditAnchorEl: null, isCommentEditOpen: false, commentText: props.text, bEditMode: false,
    };
    this.getProfilePic = this.getProfilePic.bind(this);
    this.getProfileAvatar = this.getProfileAvatar.bind(this);
    this.handleCommentEditOpen = this.handleCommentEditOpen.bind(this);
    this.handleCommentEditClose = this.handleCommentEditClose.bind(this);
    this.handleEditComment = this.handleEditComment.bind(this);
    this.handleSubmitEdit = this.handleSubmitEdit.bind(this);
  }

  async componentDidMount() {
    await this.getProfilePic();
  }

  async getProfilePic() {
    const { username } = this.props;
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
    const { classes, username } = this.props;
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
          {username.charAt(0)}
        </Avatar>
      );
    }
    return avatar;
  }

  handleEditComment() {
    this.setState({ isCommentEditOpen: false, bEditMode: true });

    const { id } = this.props;
    document.getElementById(`comment-${id}`).disabled = false;
    document.getElementById(`comment-${id}`).style.color = 'blue';
  }

  handleSubmitEdit() {
    const { editComment, id } = this.props;
    const { commentText } = this.state;
    editComment(commentText, id);
    this.setState({ bEditMode: false });
    document.getElementById(`comment-${id}`).disabled = true;
    document.getElementById(`comment-${id}`).style.color = 'black';
  }

  handleCommentEditOpen(event) {
    this.setState({ CommentEditAnchorEl: event.currentTarget, isCommentEditOpen: true });
  }

  handleCommentEditClose() {
    this.setState({ CommentEditAnchorEl: null, isCommentEditOpen: false });
  }

  render() {
    const {
      username, timestamp, id, bLoggedIn, deleteComment,
    } = this.props;
    const {
      CommentEditAnchorEl, isCommentEditOpen, bEditMode, commentText,
    } = this.state;
    return (
      <div>
        <ListItem key={id}>
          <ListItemAvatar>
            {this.getProfileAvatar()}
          </ListItemAvatar>
          <ListItemText secondary={moment.unix(timestamp).format('M/D/YY [at] h:mm a')}>
            <Link href={`/profile/${username}`}>{username}</Link>
            <InputBase
              id={`comment-${id}`}
              multiline
              rowsMax="2"
              value={commentText}
              onChange={(e) => this.setState({ commentText: e.target.value })}
              disabled
              style={{ width: '90%', color: 'black' }}
            />
          </ListItemText>
          <EditMenu
            bPost={false}
            deleteAction={() => deleteComment(id)}
            editAction={this.handleEditComment}
            anchor={CommentEditAnchorEl}
            status={isCommentEditOpen}
            close={this.handleCommentEditClose}
          />
          {bLoggedIn && (
            <ListItemSecondaryAction>
              {bEditMode
                ? (
                  <IconButton edge="end" onClick={this.handleSubmitEdit}>
                    <SaveIcon />
                  </IconButton>
                )
                : (
                  <IconButton edge="end" onClick={this.handleCommentEditOpen}>
                    <MoreVertIcon />
                  </IconButton>
                )}
            </ListItemSecondaryAction>
          )}
        </ListItem>
      </div>
    );
  }
}

Comment.propTypes = {
  classes: PropTypes.shape({
    avatar: PropTypes.string.isRequired,
  }).isRequired,
  text: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  timestamp: PropTypes.number.isRequired,
  editComment: PropTypes.func.isRequired,
  deleteComment: PropTypes.func.isRequired,
  bLoggedIn: PropTypes.bool.isRequired,

};

export default withStyles(styles)(Comment);
