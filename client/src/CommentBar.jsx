import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import ListSubheader from '@material-ui/core/ListSubheader';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FolderIcon from '@material-ui/icons/Folder';
import DeleteIcon from '@material-ui/icons/Delete';
import TextField from '@material-ui/core/TextField';
import SendIcon from '@material-ui/icons/Send';
import moment from 'moment';
import Comment from './Comment';
import NewCommentField from './NewCommentField';

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    maxWidth: 752,
  },
  demo: {
    backgroundColor: theme.palette.background.paper,
    maxHeight: 'calc(100vh - 185px)',
    overflow: 'auto',
  },
  title: {
    margin: theme.spacing(4, 0, 2),
  },
});

class CommentBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmitComment = this.handleSubmitComment.bind(this);
    this.getProfilePic = this.getProfilePic.bind(this);
    this.getProfileAvatar = this.getProfileAvatar.bind(this);
  }

  handleSubmitComment(commentText) {
    const { addComment, postID } = this.props;
    addComment(commentText);
  }

  async getProfilePic(username) {
    const resp = await fetch(`http://localhost:8080/user/${username}`);
    if (resp.ok) {
      const data = await resp.json();
      return data.profilePicture;
    }
    return '';
  }

  getProfileAvatar(profilePic, username) {
    const { classes } = this.props;
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

  render() {
    const {
      classes, addComment, comments, username, postID,
    } = this.props;

    return (
      <Grid container alignItems="center">
        <Grid item xs={12}>
          <div className={classes.demo}>
            <List dense={false}>
              {comments.map((comment) => (
                <Comment
                  username={comment.username}
                  text={comment.comment}
                  timestamp={comment.timestamp}
                  id={comment.uid}
                  key={comment.uid}
                />
              ))}
            </List>
          </div>
        </Grid>
        <NewCommentField postID={postID} addComment={this.handleSubmitComment} />
      </Grid>
    );
  }
}

export default withStyles(styles)(CommentBar);
