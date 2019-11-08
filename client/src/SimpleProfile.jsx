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
import { dateDiff, localStorage } from './Utilities';
import Post from './Post';

const styles = (theme) => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    // marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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
  const {
    children, value, index, ...other
  } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      <Box p={3}>{children}</Box>
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

class SimpleProfile extends React.Component {
  constructor(props) {
    super(props);
    this.getProfile = this.getProfile.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.generatePosts = this.generatePosts.bind(this);
    this.state = {
      username: '', email: '', friends: [], profilePic: '', index: 0, reactPosts: [],
    };
  }

  componentDidMount() {
    const username = localStorage.getItem('user');
    const loginTime = localStorage.getItem('login');
    const { history } = this.props;
    if (username === null || loginTime === null || dateDiff(loginTime) > 30) {
      localStorage.clear();
      history.push('/signin');
    } else {
      this.getProfile(username);
      this.render();
    }
  }

  async getProfile(username) {
    const resp = await fetch(`http://localhost:8080/user/${username}`);
    if (resp.ok) {
      const data = await resp.json();
      this.setState({
        username,
        email: data.email,
        friends: data.friends,
        profilePic: data.profilePicture,
      }, () => this.generatePosts());
    }
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
      username, email, password, friends, profilePic, index, reactPosts,
    } = this.state;
    let comp = null;
    try {
      // eslint-disable-next-line import/no-dynamic-require,global-require
      const src = require(`${profilePic}`);
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
          // eslint-disable-next-line import/no-dynamic-require,global-require
          id="profile-pic"
          style={{ fontSize: '48px' }}
        >
          {username.charAt(0)}
        </Avatar>
      );
    }
    return (
      <div>
        <AppToolbar />
        <Tabs
          value={index}
          onChange={this.handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Account Information" />
          <Tab label="My Posts" />
          <Tab label="My Friends" />
        </Tabs>
        <TabPanel value={index} index={0}>
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
                {localStorage.getItem('user')}
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
        <TabPanel value={index} index={1}>
          <Container>
            <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="space-between" id="myPosts">
              {reactPosts.map((comp) => comp)}
            </Box>
          </Container>
        </TabPanel>
        <TabPanel value={index} index={2}>
          {/* <FriendTable bProfilePage={false} /> */}
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
  }).isRequired,
};

export default withStyles(styles)(SimpleProfile);
