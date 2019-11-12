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
    margin: theme.spacing(3,
      0,
      2),
  },
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
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
  value: PropTypes.string.isRequired,
};

class SimpleProfile extends React.Component {
  constructor(props) {
    super(props);
    this.getProfile = this.getProfile.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.generatePosts = this.generatePosts.bind(this);
    this.getFolloweesData = this.getFolloweesData.bind(this);
    this.state = {
      username: '', email: '', followees: [], followers: [], profilePicture: '', index: 0, reactPosts: [], followeeData: [], dataLoaded: false, bLoggedInUser: true,
    };
  }

  componentDidMount() {
    const username = localStorage.getItem('user');
    const loginTime = localStorage.getItem('login');
    const { history, match } = this.props;
    if (username === null || loginTime === null || dateDiff(loginTime) > 30) {
      localStorage.clear();
      history.push('/signin');
    } else {
      this.getProfile(match.params.username);
    }
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;
    if (match.params.username !== prevProps.match.params.username) {
      this.getProfile(match.params.username);
    }
  }

  async getProfile(username) {
    const loggedInUser = localStorage.getItem('user');
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

  async generatePosts() {
    const { username } = this.state;
    const compList = [];
    const resp = await fetch(`http://localhost:8080/posts/${username}/0`);
    if (resp.ok) {
      const postData = await resp.json();
      const myPostData = postData.filter((post) => post.username === username);
      myPostData.forEach((post) => {
        compList.push(<Post post={post} key={post.uid} />);
      });
      this.setState({ reactPosts: compList });
    }
  }

  handleTabChange(e, newValue) {
    this.setState({ index: newValue });
  }

  render() {
    const { classes } = this.props;
    const {
      username, email, password, profilePicture, followers,
      followees, index, reactPosts, followeeData, dataLoaded, bLoggedInUser,
    } = this.state;
    let comp = null;
    try {
      // eslint-disable-next-line import/no-dynamic-require,global-require
      const src = require(`${profilePicture}`);
      comp = (
        <Avatar
          className={classes.avatar}
          src={src}
          id="profile-pic"
        />
      );
    } catch (e) {
      comp = (
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
      dataLoaded && (
        <div>
          <AppToolbar />
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
                  {comp}
                </div>
                <Typography component="h1" variant="h5">
                  {username}
                </Typography>
                <Grid container spacing={2} style={{ textAlign: 'center', marginTop: '20px' }}>
                  <Grid item xs={12}>
                    <Grid container justify="center" spacing={1}>
                      <Grid item xs={4} alignItems="center">
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
              <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="space-between" id="myPosts">
                {reactPosts.map((reactComp) => reactComp)}
              </Box>
            </Container>
          </TabPanel>
          <TabPanel value={index} index={2}>
            {dataLoaded && <FriendTable bProfilePage data={followeeData} bLoggedInUser />}
          </TabPanel>
          <TabPanel value={index} index={3}>
            <Container>
              <div className={classes.paper}>
                <div id="photo-avatar">
                  <input type="file" id="upload-profile-pic" hidden />
                  <label htmlFor="upload-profile-pic">
                    {comp}
                    <div className="overlay">
                      <PhotoCameraIcon id="upload-new" style={{ fontSize: '48px' }} />
                    </div>
                  </label>
                </div>
                <Typography component="h1" variant="h5">
                  {username}
                </Typography>
                <form className={classes.form} noValidate onSubmit={this.signup}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Grid container justify="center" spacing={1}>
                        <Grid item xs={6}>
                          <TextField
                            autoComplete="email"
                            disabled
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            value={email}
                            // onChange={this.handleChange}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            autoComplete="password"
                            disabled
                            fullWidth
                            id="password"
                            label="Password"
                            name="password"
                            value={password}
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
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
      )
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
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      username: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

export default withStyles(styles)(SimpleProfile);
