import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import HourglassFullIcon from '@material-ui/icons/HourglassFull';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import { Link } from '@material-ui/core';
import { API_URL } from './Utilities';

const styles = (theme) => ({
  root: {
    width: '100%',
    overflowX: 'auto',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  avatarCell: {
    width: '40px',
  },
});

class SimpleTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { curUser: props.username, data: props.data, bRequest: props.bRequest };
    this.unfollow = this.unfollow.bind(this);
    this.follow = this.follow.bind(this);
    this.getIcon = this.getIcon.bind(this);
  }

  async unfollow(toUnfollowIndex) {
    const { curUser, data } = this.state;
    const { bProfilePage } = this.props;
    const unfollowed = data[toUnfollowIndex].username;
    if (bProfilePage) {
      data.splice(toUnfollowIndex, 1);
    } else {
      data[toUnfollowIndex].following = false;
    }
    this.setState({ data });

    const token = window.sessionStorage.getItem('token');
    const resp = await fetch(`${API_URL}/unfollow/${curUser}/${unfollowed}`,
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
      if (bProfilePage) {
        data.splice(toUnfollowIndex, 1);
      } else {
        data[toUnfollowIndex].following = false;
      }
      this.setState({ data });
    } else if (await resp.text() === 'Token expired') {
      window.sessionStorage.clear();
      window.location.replace('/signin');
    }
  }

  async acceptRequest(requesterIndex) {
    const { curUser, data } = this.state;
    const token = window.sessionStorage.getItem('token');
    const resp = await fetch(`${API_URL}/accept/${curUser}/${data[requesterIndex].username}`,
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
      data.splice(requesterIndex, 1);
      this.setState({ data });
    } else if (await resp.text() === 'Token expired') {
      window.sessionStorage.clear();
      window.location.replace('/signin');
    }
  }

  async follow(toFollowIndex) {
    const { curUser, data, bRequest } = this.state;
    if (bRequest) {
      this.acceptRequest(toFollowIndex);
    } else {
      data[toFollowIndex].following = true;
      this.setState({ data });
      const token = window.sessionStorage.getItem('token');
      const resp = await fetch(`${API_URL}/follow/${curUser}/${data[toFollowIndex].username}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Origin': '*',
            Authorization: `Bearer ${token}`,
          },
          mode: 'cors',
        });
      const text = await resp.text();
      console.log(text);
      console.log(text.indexOf('request'))
      if (resp.ok) {
        if (text.indexOf('request') > -1) {
          data[toFollowIndex].following = 'wait';
        } else {
          data[toFollowIndex].following = true;
        }
        this.setState({ data });
      } else if (text === 'Token expired') {
        window.sessionStorage.clear();
        window.location.replace('/signin');
      }
    }
  }

  getIcon(folStatus, index) {
    const { bMinuses } = this.props;
    if (folStatus === 'wait') {
      return (<IconButton edge="end" aria-label="waiting">
        <HourglassFullIcon />
      </IconButton>)
    } else if (bMinuses || folStatus) {
      return (
        <IconButton edge="end" aria-label="delete" onClick={() => this.unfollow(index)}>
          <DeleteOutlinedIcon />
        </IconButton>)
    } else {
      return (<IconButton edge="end" aria-label="add" onClick={() => this.follow(index)}>
        <AddCircleOutlineOutlinedIcon />
      </IconButton>)
    }
  }

  render() {
    const {
      classes, data, bLoggedInUser,
    } = this.props;
    function getAvatar(username, profilePicture) {
      let avatar = null;
      try {
        window.atob(profilePicture);
        if (profilePicture !== '') {
          avatar = (
            <Avatar
              className={classes.avatar}
              src={`data:image/jpeg;base64,${profilePicture}`}
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

    return (
      <Paper className={classes.root}>
        <Table aria-label="simple table">
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={row.username}>
                <TableCell>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        {getAvatar(row.username, row.profilePicture)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText>
                      <Link href={`/profile/${row.username}`}>{row.username}</Link>
                    </ListItemText>
                  </ListItem>
                </TableCell>
                {bLoggedInUser && (
                  <TableCell align="right">
                    {this.getIcon(row.following, i)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  }
}

SimpleTable.defaultProps = {
  bMinuses: false,
  bProfilePage: false,
  bRequest: false,
};

SimpleTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      username: PropTypes.string.isRequired,
      profilePicture: PropTypes.string,
      curFollowing: PropTypes.string,
    }),
  ).isRequired,
  bMinuses: PropTypes.bool,
  bProfilePage: PropTypes.bool,
  bRequest: PropTypes.bool,
  bLoggedInUser: PropTypes.bool.isRequired,
  classes: PropTypes.shape({
    root: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    avatarCell: PropTypes.string.isRequired,
  }).isRequired,
  username: PropTypes.string.isRequired,
};

export default withStyles(styles)(SimpleTable);
