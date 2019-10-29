import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { dateDiff, localStorage } from './Utilities';

const styles = (theme) => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    marginTop: theme.spacing(8),
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
});

class SimpleProfile extends React.Component {
  constructor(props) {
    super(props);
    this.getProfile = this.getProfile.bind(this);
    this.state = {
      username: '', email: '', friends: [], profile_pic: '',
    };
  }

  componentDidMount() {
    const username = localStorage.getItem('user');
    const loginTime = localStorage.getItem('login');
    if (username === null || loginTime === null || dateDiff(loginTime) > 30) {
      localStorage.clear();
      this.props.history.push('/signin');
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
        username, email: data.email, friends: data.friends, profile_pic: data.profile_picture,
      });
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <Container component="main">
        <CssBaseline />
        <div className={classes.paper}>
          {this.state.profile_pic
            && <Avatar alt={this.state.username} className={classes.avatar} src={this.state.profile_pic} />}
          {this.state.profile_pic == null && <Avatar className={classes.avatar}>{this.state.username.charAt(0)}</Avatar>}
          <Typography component="h1" variant="h5">
            {localStorage.getItem('user')}
          </Typography>
          <form className={classes.form} noValidate onSubmit={this.signup}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container justify="center" spacing={1}>
                  <Grid item xs={6}>
                    <TextField
                      autoComplete="username"
                      disabled
                      fullWidth
                      id="username"
                      label="Username"
                      name="username"
                      value={this.state.username}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      autoComplete="email"
                      disabled
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      value={this.state.email}
                      // onChange={this.handleChange}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </form>
        </div>
        <Box mt={5} />
      </Container>
    );
  }
}

export default withStyles(styles)(SimpleProfile);
