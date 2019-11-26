import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { Container } from '@material-ui/core';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import './SimpleProfile.css';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppToolbar from './AppToolbar';
import FriendTable from './FriendTable';
import { dateDiff, localStorage, asyncForEach } from './Utilities';
import Post from './Post';
import PostBox from './PostBox';

const styles = (theme) => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  skinnyPaper: {
    maxWidth: 800,
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
    width: '150px',
    height: '150px',

  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: `${theme.spacing(2)}px auto ${theme.spacing(2)}px`,
    display: 'block',
  },
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  label: {
    backgroundColor: 'white',
  },
});

function TabPanel(props) {
  const { children, value, index } = props;
  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      <Box p={3}>{children}</Box>
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node.isRequired,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

class SimpleProfile extends React.Component {
  constructor(props) {
    super(props);
    this.getProfile = this.getProfile.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.generatePosts = this.generatePosts.bind(this);
    this.getFolloweesData = this.getFolloweesData.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.updateProfilePic = this.updateProfilePic.bind(this);
    this.state = {
      username: '', email: '', password: '', curPassword: '', passwordCheck: '', followees: [], followers: [], profilePicture: '', newProfilePicture: '', index: 0, reactPosts: [], followeeData: [], dataLoaded: false, bLoggedInUser: true, picUpdate: false,
    };
  }

  componentDidMount() {
    const { state, history, match } = this.props;
    if (state.username === '' || state.loginTime === '' || dateDiff(state.loginTime) > 30) {
      localStorage.clear();
      history.push('/signin');
    } else {
      this.getProfile(match.params.username);
      this.setState({})
    }
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;
    const { picUpdate } = this.state;
    if (match.params.username !== prevProps.match.params.username || picUpdate) {
      this.getProfile(match.params.username);
    }
  }

  async getProfile(username) {
    const { state } = this.props;
    const loggedInUser = state.username;
    const resp = await fetch(`http://localhost:8080/user/${username}`);
    if (resp.ok) {
      const data = await resp.json();
      this.setState({
        username,
        email: data.email,
        followers: data.followers,
        followees: data.followees,
        profilePicture: data.profilePicture,
        bLoggedInUser: username === loggedInUser,
      }, async () => {
        await this.generatePosts();
        await this.getFolloweesData();
        this.setState({ dataLoaded: true });
      });
    }
  }

  getFolloweesData() {
    const { followees } = this.state;
    const followeeData = [];
    asyncForEach(followees, async (followee) => {
      const resp = await fetch(`http://localhost:8080/user/${followee}`);
      if (resp.ok) {
        const data = await resp.json();
        followeeData.push({ username: followee, profilePicture: data.profilePicture });
      }
    });
    this.setState({ followeeData });
  }

  async updateProfile(e) {
    e.preventDefault();
    const { email, username } = this.state;
    const { updateState } = this.props;
    const emailStatus = document.getElementById('email-status');
    emailStatus.innerHTML = '';
    const passwordStatus = document.getElementById('password-status');
    passwordStatus.innerHTML = '';
    document.getElementById('photo-status').innerHTML = '';
    const newEmail = e.target.email.value;
    const currentPassword = e.target.curPassword.value;
    const newPassword = e.target.password.value;
    const newPassConfirm = e.target.passwordCheck.value;
    if (newPassword === newPassConfirm) {
      if (email !== newEmail) {
        const respEmail = await fetch('http://localhost:8080/user',
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Origin': '*',
            },
            mode: 'cors',
            body: JSON.stringify({ username, email: newEmail }),
          });
        if (!respEmail.ok) {
          emailStatus.innerHTML = respEmail.text();
        } else {
          updateState('email', newEmail);
          emailStatus.innerHTML = 'Email update Successful';
        }
      } else {
        emailStatus.innerHTML = 'No changes to make to email';
      }
      if (newPassword !== '') {
        this.setState({ password: '', curPassword: '', passwordCheck: '' });
        const respPass = await fetch('http://localhost:8080/user',
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Origin': '*',
            },
            mode: 'cors',
            body: JSON.stringify({ username, oldPassword: currentPassword, newPassword }),
          });
        if (!respPass.ok) {
          passwordStatus.innerHTML = await respPass.text();
        } else {
          passwordStatus.innerHTML = 'Password update Successful';
        }
      }
    } else {
      passwordStatus.innerHTML = 'Update failed. Passwords do not match.';
    }
  }

  async updateProfilePic(e) {
    e.preventDefault();
    const { username, profilePicture } = this.state;
    const { updateState } = this.props;
    const photoStatus = document.getElementById('photo-status');
    photoStatus.innerHTML = '';
    document.getElementById('email-status').innerHTML = '';
    document.getElementById('password-status').innerHTML = '';
    const newImage = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (readerEvt) => {
      const binaryString = readerEvt.target.result;
      this.setState({
        newProfilePicture: btoa(binaryString),
      }, async () => {
        const { newProfilePicture } = this.state;
        if (profilePicture !== newProfilePicture) {
          const respPic = await fetch('http://localhost:8080/user',
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Origin': '*',
              },
              mode: 'cors',
              body: JSON.stringify({ username, profilePicture: newProfilePicture }),
            });
          if (!respPic.ok) {
            photoStatus.innerHTML = respPic.text();
          } else {
            updateState('profilePic', newProfilePicture);
            this.setState({ picUpdate: true });
            // this.setState({ profilePicture: newProfilePicture }, () => this.render());
          }
        } else {
          photoStatus.innerHTML = 'No changes to make to picture';
        }
      });
    };
    reader.readAsBinaryString(newImage);
  }

  async generatePosts() {
    const { username } = this.state;
    const { state } = this.props;
    const compList = [];
    const resp = await fetch(`http://localhost:8080/posts/${username}/0`);
    if (resp.ok) {
      const postData = await resp.json();
      const myPostData = postData.filter((post) => post.username === username);
      myPostData.forEach((post) => {
        compList.push(<Post post={post} key={post.uid} username={state.username} />);
      });
      this.setState({ reactPosts: compList });
    }
  }

  handleTabChange(e, newValue) {
    this.setState({ index: newValue });
  }

  render() {
    const { classes, state, updateState } = this.props;
    const {
      username, email, password, curPassword, passwordCheck, profilePicture, followers,
      followees, index, reactPosts, followeeData, dataLoaded, bLoggedInUser,
    } = this.state;
    let avatar = null;
    try {
      const actualPic = bLoggedInUser ? state.profilePic : profilePicture;
      window.atob(actualPic);
      if (actualPic !== '') {
        avatar = (
          <Avatar
            className={classes.avatar}
            src={`data:image/jpeg;base64,${actualPic}`}
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
          style={{ fontSize: '48px' }}
        >
          {username.charAt(0)}
        </Avatar>
      );
    }

    return (
      <div>
        <AppToolbar profilePic={state.profilePic} username={state.username} updateState={updateState} />
        <Tabs
          value={index}
          onChange={this.handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Profile Information" />
          <Tab label="My Posts" />
          <Tab label="Who Do I Follow?" />
          {bLoggedInUser && <Tab label="Account Settings" />}
        </Tabs>
        <TabPanel value={index} index={0}>
          <Container>
            <div className={classes.paper}>
              <div id="photo-avatar">
                {avatar}
              </div>
              <Typography component="h1" variant="h5">
                {username}
              </Typography>
              <Grid container spacing={2} style={{ textAlign: 'center', marginTop: '20px' }}>
                <Grid item xs={12}>
                  <Grid container justify="center" alignItems="center" spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="h4" style={{ fontWeight: 'bold' }}>
                        {reactPosts.length}
                      </Typography>
                      <Typography variant="h5">
                        Posts
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="h4" style={{ fontWeight: 'bold' }}>
                        {followers.length}
                      </Typography>
                      <Typography variant="h5">
                        Followers
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="h4" style={{ fontWeight: 'bold' }}>
                        {followees.length}
                      </Typography>
                      <Typography variant="h5">
                        Following
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </div>
          </Container>
        </TabPanel>
        <TabPanel value={index} index={1}>
          <Container>
            <PostBox username={state.username} />
          </Container>
        </TabPanel>
        <TabPanel value={index} index={2}>
          {dataLoaded && <FriendTable bProfilePage data={followeeData} bLoggedInUser />}
        </TabPanel>
        <TabPanel value={index} index={3}>
          <Container>
            <div className={classes.paper}>
              <div id="photo-status" />
              <div id="photo-avatar">
                <input type="file" id="upload-profile-pic" hidden onChange={this.updateProfilePic} />
                <label htmlFor="upload-profile-pic">
                  {avatar}
                  <div className="overlay">
                    <PhotoCameraIcon id="upload-new" style={{ fontSize: '48px' }} />
                  </div>
                </label>
              </div>
              <Typography component="h1" variant="h5">
                {username}
              </Typography>
              <div id="email-status" style={{ marginTop: '20px' }} />
              <div id="password-status" />
              <form className={classes.form} noValidate onSubmit={this.updateProfile}>
                <Grid container justify="center" aligntems="center" spacing={2}>
                  <Grid item xs={3} />
                  <Grid item xs={6}>
                    <TextField
                      InputLabelProps={{
                        classes: {
                          root: classes.label,
                        },
                      }}
                      autoComplete="email"
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      defaultValue={state.email}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={3} />
                  <Grid item xs={4}>
                    <TextField
                      InputLabelProps={{
                        classes: {
                          root: classes.label,
                        },
                      }}
                      autoComplete="password"
                      fullWidth
                      id="curPassword"
                      type="password"
                      label="Current Password"
                      name="curPassword"
                      variant="outlined"
                      value={curPassword}
                      onChange={(e) => this.setState({ curPassword: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      InputLabelProps={{
                        classes: {
                          root: classes.label,
                        },
                      }}
                      autoComplete="password"
                      fullWidth
                      id="password"
                      type="password"
                      label="New Password"
                      name="password"
                      variant="outlined"
                      value={password}
                      onChange={(e) => this.setState({ password: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      InputLabelProps={{
                        classes: {
                          root: classes.label,
                        },
                      }}
                      autoComplete="password"
                      fullWidth
                      id="passwordCheck"
                      type="password"
                      label="Re-enter Password"
                      name="passwordCheck"
                      variant="outlined"
                      value={passwordCheck}
                      onChange={(e) => this.setState({ passwordCheck: e.target.value })}
                    />
                  </Grid>
                </Grid>
                <Button
                  className={classes.submit}
                  id="loginsubmit"
                  color="primary"
                  type="submit"
                  variant="contained"
                >
                  Update
                  </Button>
              </form>
            </div>
          </Container>
        </TabPanel>
        <CssBaseline />
        <Box mt={5} />
      </div>
    );
  }
}

SimpleProfile.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  classes: PropTypes.shape({
    paper: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    form: PropTypes.string.isRequired,
    submit: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      username: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

export default withStyles(styles)(SimpleProfile);
