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
import { Link } from '@material-ui/core';
import moment from 'moment';

const styles = (theme) => ({
  avatar: {
    backgroundColor: theme.palette.secondary.main,
  },
});

class Comment extends React.Component {
  constructor(props) {
    super(props);
    this.state = { profilePic: '' };
    this.getProfilePic = this.getProfilePic.bind(this);
    this.getProfileAvatar = this.getProfileAvatar.bind(this);
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

  render() {
    const {
      username, timestamp, text, id,
    } = this.props;
    return (
      <div>
        <ListItem key={id}>
          <ListItemAvatar>
            {this.getProfileAvatar()}
          </ListItemAvatar>
          <ListItemText secondary={moment.unix(timestamp).format('M/D/YY [at] h:mm a')}>
            <Link href={`/profile/${username}`}>{username}</Link>
            <Typography variant="inherit">{` ${text}`}</Typography>
          </ListItemText>
          <ListItemSecondaryAction>
            <IconButton edge="end" aria-label="delete">
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      </div>
    );
  }
}

export default withStyles(styles)(Comment);
