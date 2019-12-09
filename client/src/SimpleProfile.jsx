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
import PostBox from './PostBox';
import { API_URL } from './Utilities';

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
    this.getFolloweeSuggestions = this.getFolloweeSuggestions.bind(this);
    this.getFolloweesData = this.getFolloweesData.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.updateProfilePic = this.updateProfilePic.bind(this);
    this.state = {
      profUsername: '', email: '', password: '', curPassword: '', passwordCheck: '', followees: [], followers: [], profilePicture: '', newProfilePicture: '', index: 0, followeeData: [], dataLoaded: false, bLoggedInUser: true, picUpdate: false, numMyPosts: 0,
    };
  }

  componentDidMount() {
    const { match } = this.props;
    this.getProfile(match.params.username);
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;
    const { picUpdate } = this.state;
    if (match.params.username !== prevProps.match.params.username || picUpdate) {
      this.getProfile(match.params.username);
    }
  }

  async getProfile(profUsername) {
    this.setState({ dataLoaded: false });
    const { username } = this.props;
    const token = window.sessionStorage.getItem('token');
    const resp = await fetch(`${API_URL}/user/${profUsername}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (resp.ok) {
      const data = await resp.json();
      this.setState({
        profUsername,
        email: data.email,
        followers: data.followers,
        followees: data.followees,
        profilePicture: data.profilePicture,
        bLoggedInUser: profUsername === username,
        numMyPosts: data.numMyPosts,
      }, async () => {
        await this.getFolloweesData();
        this.setState({ dataLoaded: true, index: 0 });
      });
    } else if (await resp.text() === 'Token expired') {
      window.sessionStorage.clear();
      window.location.replace('/signin');
    }
  }

  async getFolloweeSuggestions() {
    const { username } = this.props;
    const resp = await fetch(`${API_URL}/followersuggestions/${username}`);
    if (resp.ok) {
      return resp.json();
    }
  }

  async getFolloweesData() {
    const { followees } = this.state;
    const followeeData = [];
    const promises = [];
    const token = window.sessionStorage.getItem('token');
    const callbackFn = async (followee) => {
      const resp = await fetch(`${API_URL}/user/${followee}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (resp.ok) {
        const data = await resp.json();
        followeeData.push({ username: followee, profilePicture: data.profilePicture });
      } else if (await resp.text() === 'Token expired') {
        window.sessionStorage.clear();
        window.location.replace('/signin');
      }
    };
    for (let index = 0; index < followees.length; index += 1) {
      promises.push(callbackFn(followees[index], index, followees));
    }
    await Promise.all(promises);
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
    const token = window.sessionStorage.getItem('token');
    if (newPassword === newPassConfirm) {
      if (email !== newEmail) {
        const respEmail = await fetch(`${API_URL}/user`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Origin': '*',
              Authorization: `Bearer ${token}`,
            },
            mode: 'cors',
            body: JSON.stringify({ username, email: newEmail }),
          });
        if (await respEmail.text() === 'Token expired') {
          window.sessionStorage.clear();
          window.location.replace('/signin');
        } else if (!respEmail.ok) {
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
        const respPass = await fetch(`${API_URL}/user`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Origin': '*',
              Authorization: `Bearer ${token}`,
            },
            mode: 'cors',
            body: JSON.stringify({ username, oldPassword: currentPassword, newPassword }),
          });
        if (await respPass.text() === 'Token expired') {
          window.sessionStorage.clear();
          window.location.replace('/signin');
        } else if (!respPass.ok) {
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
    const { profilePicture } = this.state;
    const { updateState, username } = this.props;
    const photoStatus = document.getElementById('photo-status');
    photoStatus.innerHTML = '';
    document.getElementById('email-status').innerHTML = '';
    document.getElementById('password-status').innerHTML = '';
    const newImage = e.target.files[0];
    const reader = new FileReader();
    const token = window.sessionStorage.getItem('token');
    reader.onload = (readerEvt) => {
      const binaryString = readerEvt.target.result;
      this.setState({
        newProfilePicture: btoa(binaryString),
      }, async () => {
        const { newProfilePicture } = this.state;
        if (profilePicture !== newProfilePicture) {
          const respPic = await fetch(`${API_URL}/user`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Origin': '*',
                Authorization: `Bearer ${token}`,
              },
              mode: 'cors',
              body: JSON.stringify({ username, profilePicture: newProfilePicture }),
            });
          if (await respPic.text() === 'Token expired') {
            window.sessionStorage.clear();
            window.location.replace('/signin');
          } else if (!respPic.ok) {
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

  handleTabChange(e, newValue) {
    this.setState({ index: newValue });
  }

  render() {
    const {
      classes, profilePic, username, updateState, history,
    } = this.props;
    const {
      profUsername, email, password, curPassword, passwordCheck,
      profilePicture, followers, followees, index,
      followeeData, dataLoaded, bLoggedInUser, numMyPosts,
    } = this.state;
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
          style={{ fontSize: '48px' }}
        >
          {profUsername.charAt(0)}
        </Avatar>
      );
    }
    return (
      <div>
        <AppToolbar
          profilePic={profilePic}
          username={username}
          updateState={updateState}
          history={history}
        />
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
                {profUsername}
              </Typography>
              <Grid container spacing={2} style={{ textAlign: 'center', marginTop: '20px' }}>
                <Grid item xs={12}>
                  <Grid container justify="center" alignItems="center" spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="h4" style={{ fontWeight: 'bold' }}>
                        {numMyPosts}
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
            {dataLoaded && <PostBox bHome={false} username={profUsername} loggedIn={username} />}
          </Container>
        </TabPanel>
        <TabPanel value={index} index={2}>
          {dataLoaded && (
            <Grid container spacing={2}>
              <Grid item xs={bLoggedInUser ? 6 : 12}>
                {bLoggedInUser && (
                  <Typography variant="h6" style={{ textAlign: 'center' }}>
                    Who do I follow?
                  </Typography>
                )}
                <FriendTable
                  bMinuses
                  bProfilePage
                  data={followeeData}
                  bLoggedInUser={bLoggedInUser}
                  username={username}
                />
              </Grid>
              {bLoggedInUser && (
                <Grid item xs={6}>
                  <Typography variant="h6" style={{ textAlign: 'center' }}>
                    You may know
                  </Typography>
                  <FriendTable
                    bMinuses={false}
                    bProfilePage
                    data={() => this.getFolloweeSuggestions()}
                    bLoggedInUser={bLoggedInUser}
                    username={username}
                  />
                </Grid>
              )}
            </Grid>

          )}
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
                {dataLoaded && (
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
                        defaultValue={email}
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
                )}
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
  username: PropTypes.string.isRequired,
  updateState: PropTypes.func.isRequired,
  profilePic: PropTypes.string.isRequired,
};

export default withStyles(styles)(SimpleProfile);
