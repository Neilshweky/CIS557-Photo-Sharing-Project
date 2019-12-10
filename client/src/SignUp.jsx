import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import PropTypes from 'prop-types';
import { API_URL } from './Utilities';

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

class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      email: '',
      isLoaded: false,
    };
    this.signup = this.signup.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  async componentDidMount() {
    const { history } = this.props;
    const token = window.sessionStorage.getItem('token');
    if (token !== null) {
      // Your axios call here
      const resp = await fetch(`${API_URL}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (resp.ok) {
        history.push('/home');
      } else if (await resp.text() === 'Token expired') {
        window.sessionStorage.clear();
      }
    } else {
      this.setState({ isLoaded: true });
    }
  }

  async signup(e) {
    // e.preventDefault should always be the first thing in the function
    e.preventDefault();
    const resp = await fetch(`${API_URL}/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Origin': '*',
        },
        mode: 'cors',
        body: JSON.stringify(this.state),
      });
    const { username } = this.state;
    const { history, updateState } = this.props;
    if (resp.ok) {
      const data = await resp.json();
      window.sessionStorage.setItem('token', data.token);
      updateState('username', username);
      history.push('/home');
    } else {
      document.getElementById('signup-status').innerHTML = await resp.text();
    }
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  render() {
    const { classes } = this.props;
    const { isLoaded } = this.state;
    return (isLoaded && (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <div id="signup-status" />
          <form className={classes.form} noValidate onSubmit={this.signup}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  autoComplete="username"
                  autoFocus
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  onChange={this.handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  autoComplete="email"
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  onChange={this.handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  autoComplete="current-password"
                  fullWidth
                  id="password"
                  label="Password"
                  name="password"
                  onChange={this.handleChange}
                  required
                  type="password"
                  variant="outlined"
                />
              </Grid>
            </Grid>
            <Button
              className={classes.submit}
              id="signupButton"
              color="primary"
              fullWidth
              type="submit"
              variant="contained"
            >
              Sign Up
            </Button>
            <Grid container justify="flex-end">
              <Grid item>
                <Link href="/signin" variant="body2" id="signinlink">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
        <Box mt={5} />
      </Container>
    ));
  }
}

SignUp.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  classes: PropTypes.shape({
    paper: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    form: PropTypes.string.isRequired,
    submit: PropTypes.string.isRequired,
  }).isRequired,
  updateState: PropTypes.func.isRequired,
};

export default withStyles(styles)(SignUp);
